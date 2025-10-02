import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { tripsAPI, placesAPI, directionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getSocket, joinTripRoom, leaveTripRoom } from '../services/socket';

const fitToMarkers = (map, points) => {
  if (!map || !points?.length) return;
  const bounds = points.reduce((b, p) => b.extend([p.lat, p.lng]), L.latLngBounds([points[0].lat, points[0].lng]));
  map.fitBounds(bounds, { padding: [40, 40] });
};

const Planner = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeDay, setActiveDay] = useState(1); // day index (1-based)
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchDebounce = useRef();
  const [routeSummary, setRouteSummary] = useState({ distanceKm: 0, durationMin: 0, geometry: null });
  const [showDupModal, setShowDupModal] = useState(false);
  const [dupDestDay, setDupDestDay] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renumberAfterDelete, setRenumberAfterDelete] = useState(true);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const resp = await tripsAPI.getById(id);
      setTrip(resp.data.data);
      // Default day selection
      const maxDay = Math.max(1, ...(resp.data.data.itinerary || []).map(i => i.day || 1));
      setActiveDay(Math.min(1, maxDay) || 1);
    } catch (e) {
      setMessage(e.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrip(); /* eslint-disable-line */ }, [id]);

  // Realtime updates
  useEffect(() => {
    const s = getSocket();
    if (!s || !id) return;
    joinTripRoom(id);
    const handler = (payload) => {
      if (payload?.tripId === String(id)) {
        fetchTrip();
      }
    };
    s.on('trip:update', handler);
    return () => {
      try { s.off('trip:update', handler); leaveTripRoom(id); } catch (_) {}
    };
  }, [id]);

  const days = useMemo(() => {
    // If plannedDates exist, derive days from date range; otherwise from itinerary day numbers
    const its = trip?.itinerary || [];
    const dayNums = new Set(its.map(i => i.day || 1));
    let max = 1;
    dayNums.forEach(d => { max = Math.max(max, d || 1); });
    // Fallback to 3 days when nothing defined
    return Array.from({ length: Math.max(max, 3) }, (_, i) => i + 1);
  }, [trip]);

  const itemsForActiveDay = useMemo(() => {
    const its = (trip?.itinerary || []).filter(i => (i.day || 1) === activeDay);
    return its.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [trip, activeDay]);

  // Fetch route for current day's points
  useEffect(() => {
    const pts = (itemsForActiveDay || []).filter(i => typeof i.lat === 'number' && typeof i.lng === 'number');
    if (pts.length < 2) { setRouteSummary({ distanceKm: 0, durationMin: 0, geometry: null }); return; }
    (async () => {
      try {
        const resp = await directionsAPI.getRoute(pts.map(p => ({ lat: p.lat, lng: p.lng })));
        setRouteSummary(resp.data.data || { distanceKm: 0, durationMin: 0, geometry: null });
      } catch (_) {
        setRouteSummary({ distanceKm: 0, durationMin: 0, geometry: null });
      }
    })();
  }, [itemsForActiveDay]);

  const addPlaceToDay = async (place) => {
    try {
      const payload = {
        title: place.name,
        location: place.address,
        day: activeDay,
        lat: place.lat,
        lng: place.lng,
      };
      const resp = await tripsAPI.addItinerary(id, payload);
      setTrip(resp.data.data);
      setPlaceResults([]);
      setPlaceQuery('');
    } catch (e) {
      setMessage(e.message || 'Failed to add place');
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(itemsForActiveDay);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Optimistic: rebuild the full itinerary with updated orders for the active day
    const full = Array.from(trip.itinerary || []);
    const others = full.filter(i => (i.day || 1) !== activeDay);
    const updated = [
      ...others,
      ...reordered.map((item, idx) => ({ ...item, order: idx }))
    ];
    setTrip((t) => ({ ...t, itinerary: updated }));

    try {
      await tripsAPI.reorderItinerary(id, reordered.map(i => i._id));
    } catch (_) {}
  };

  const searchPlaces = (q) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(async () => {
      if (!q || q.length < 2) { setPlaceResults([]); return; }
      try {
        setSearching(true);
        const center = itemsForActiveDay.find(i => typeof i.lat === 'number' && typeof i.lng === 'number');
        const resp = await placesAPI.search({ q, lat: center?.lat, lng: center?.lng, radius: 5000, limit: 8 });
        setPlaceResults(resp.data.data || []);
      } catch (e) {
        setPlaceResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading planner..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-secondary-700">Trip not found.</div>
        <Link to="/my-trips" className="btn-secondary mt-4 inline-block">Back to My Trips</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Plan: {trip.title}</h1>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => { setDupDestDay(Math.max(...days)+1); setShowDupModal(true); }}>
            Duplicate Day
          </button>
          <button className="btn-secondary" onClick={() => setShowDeleteModal(true)}>
            Delete Day
          </button>
          <Link to={`/trip/${trip._id}`} className="nav-link">Back to Trip</Link>
        </div>
      </div>

      {/* Duplicate Day Modal */}
      {showDupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDupModal(false)}>
          <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-xl p-5 w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold mb-3">Duplicate Day {activeDay}</div>
            <div className="space-y-3">
              <label className="block text-sm">Destination Day</label>
              <select className="input-field" value={dupDestDay ?? ''} onChange={(e)=> setDupDestDay(parseInt(e.target.value,10))}>
                {[...days, Math.max(...days)+1].map(d => (
                  <option key={d} value={d}>{d === Math.max(...days)+1 ? `New Day (${d})` : `Day ${d}`}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary" onClick={() => setShowDupModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={async ()=>{
                  try {
                    await tripsAPI.duplicateDay(trip._id, activeDay, dupDestDay);
                    const resp = await tripsAPI.getById(trip._id);
                    setTrip(resp.data.data);
                    setActiveDay(dupDestDay);
                    setShowDupModal(false);
                  } catch(e){ setMessage(e.message || 'Failed to duplicate'); }
                }}>Duplicate</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Day Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-xl p-5 w-full max-w-md" onClick={(e)=>e.stopPropagation()}>
            <div className="text-lg font-semibold mb-3">Delete Day {activeDay}?</div>
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-3">This will remove all items for this day.</p>
            <label className="inline-flex items-center gap-2 text-sm mb-4">
              <input type="checkbox" checked={renumberAfterDelete} onChange={(e)=>setRenumberAfterDelete(e.target.checked)} />
              Renumber following days
            </label>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={async ()=>{
                try {
                  await tripsAPI.deleteDay(trip._id, activeDay, renumberAfterDelete);
                  const resp = await tripsAPI.getById(trip._id);
                  setTrip(resp.data.data);
                  const newMax = Math.max(1, ...(resp.data.data.itinerary || []).map(i=> i.day || 1));
                  setActiveDay(Math.min(activeDay, newMax));
                  setShowDeleteModal(false);
                } catch(e){ setMessage(e.message || 'Failed to delete day'); }
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Day tabs */}
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeDay === d
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Add place bar */}
      <div className="relative">
        <input
          className="input-field"
          placeholder="Add a place (search by name or address)..."
          value={placeQuery}
          onChange={(e) => { setPlaceQuery(e.target.value); searchPlaces(e.target.value); }}
        />
        {searching && (
          <div className="absolute right-3 top-2.5 text-xs text-secondary-500">Searching...</div>
        )}
        {placeResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-md shadow-lg max-h-72 overflow-auto">
            {placeResults.map((p, idx) => (
              <button key={idx} onClick={() => addPlaceToDay(p)} className="w-full text-left px-3 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-800">
                <div className="font-medium text-secondary-900 dark:text-secondary-100">{p.name}</div>
                <div className="text-xs text-secondary-600 dark:text-secondary-300 truncate">{p.address}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timeline */}
        <div className="card p-4">
          <div className="font-medium mb-2">Day {activeDay} Timeline</div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {itemsForActiveDay.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
                      {(p) => (
                        <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="flex items-start justify-between border border-secondary-200 dark:border-secondary-700 rounded-md px-3 py-2">
                          <div>
                            <div className="font-medium text-secondary-900 dark:text-secondary-100">{item.title}</div>
                            <div className="text-xs text-secondary-600 dark:text-secondary-300">{item.location || ''}{typeof item.lat==='number' && typeof item.lng==='number' ? ` • (${item.lat.toFixed?.(3)}, ${item.lng.toFixed?.(3)})` : ''}</div>
                          </div>
                          <Link to={`/trip/${trip._id}`} className="nav-link">Open</Link>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Map Panel */}
        <div className="card p-2 overflow-hidden">
          <div className="flex items-center justify-between px-2 pt-2 mb-1">
            <div className="font-medium">Map</div>
            {routeSummary.geometry && (
              <div className="text-xs text-secondary-600 dark:text-secondary-300">
                {routeSummary.distanceKm.toFixed(1)} km • {Math.round(routeSummary.durationMin)} min
              </div>
            )}
          </div>
          <div className="h-[420px]">
            <LeafletMap
              points={itemsForActiveDay.filter(i => typeof i.lat==='number' && typeof i.lng==='number')}
              routeGeoJson={routeSummary.geometry}
            />
          </div>
        </div>
      </div>

      {message && <div className="text-sm text-secondary-700 dark:text-secondary-300">{message}</div>}
    </div>
  );
};

const LeafletMap = ({ points, routeGeoJson }) => {
  const [mapRef, setMapRef] = useState(null);
  useEffect(() => {
    if (mapRef) fitToMarkers(mapRef, points);
  }, [mapRef, points]);

  // Convert GeoJSON LineString to Leaflet latlngs
  const routeLatLngs = useMemo(() => {
    if (!routeGeoJson?.coordinates?.length) return null;
    return routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [routeGeoJson]);

  return (
    <MapContainer whenCreated={setMapRef} center={[points[0]?.lat || 0, points[0]?.lng || 0]} zoom={points.length ? 12 : 2} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {points.map((p, idx) => (
        <Marker key={idx} position={[p.lat, p.lng]}>
          <Popup>
            <div className="text-sm">
              <div className="font-medium">{p.title || p.name}</div>
              {p.location && <div className="text-xs text-secondary-600">{p.location}</div>}
            </div>
          </Popup>
        </Marker>
      ))}
      {routeLatLngs && (
        <Polyline positions={routeLatLngs} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }} />
      )}
    </MapContainer>
  );
};

export default Planner;
