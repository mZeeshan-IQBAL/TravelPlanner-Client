import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { tripsAPI, placesAPI, directionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 sticky top-18 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/trip/${trip._id}`} 
                className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 dark:text-secondary-400 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Trip</span>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
                  🗺️ {trip.title}
                </h1>
                <p className="text-secondary-600 dark:text-secondary-400">Interactive Trip Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-wanderlog-blue/10 hover:bg-wanderlog-blue/20 text-wanderlog-blue rounded-xl transition-colors font-medium"
                onClick={() => { setDupDestDay(Math.max(...days)+1); setShowDupModal(true); }}
              >
                <span>📋</span>
                <span>Duplicate Day</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors font-medium"
                onClick={() => setShowDeleteModal(true)}
              >
                <span>🗑️</span>
                <span>Delete Day</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Day Selection */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
              📅 Trip Days
            </h2>
            <span className="text-sm text-secondary-500 dark:text-secondary-400">
              Currently planning: Day {activeDay}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDay(d)}
                className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeDay === d
                    ? 'bg-gradient-to-r from-primary-500 to-wanderlog-orange text-white shadow-lg transform scale-105'
                    : 'bg-secondary-100 hover:bg-primary-50 text-secondary-700 hover:text-primary-600 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300'
                }`}
              >
                Day {d}
                {activeDay === d && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-wanderlog-green rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Add Place Search */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">🔍</span>
            <div>
              <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                Add Places to Day {activeDay}
              </h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Search for attractions, restaurants, hotels, and more
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-secondary-200 dark:border-secondary-600 rounded-xl focus:border-primary-500 focus:ring-0 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400"
              placeholder="Search places, attractions, restaurants..."
              value={placeQuery}
              onChange={(e) => { setPlaceQuery(e.target.value); searchPlaces(e.target.value); }}
            />
            {searching && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {placeResults.length > 0 && (
              <div className="absolute z-20 mt-2 w-full bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-600 max-h-80 overflow-auto">
                {placeResults.map((p, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => addPlaceToDay(p)} 
                    className="group w-full text-left px-6 py-4 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-secondary-100 dark:border-secondary-700 last:border-b-0"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                        <span className="text-xl">📍</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-secondary-900 dark:text-secondary-100 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                          {p.name}
                        </div>
                        <div className="text-sm text-secondary-600 dark:text-secondary-400 mt-1 line-clamp-2">
                          {p.address}
                        </div>
                      </div>
                      <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Planning Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Timeline - Takes 2/5 of the width */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-secondary-100 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📅</span>
                    <div>
                      <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                        Day {activeDay} Itinerary
                      </h3>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        Drag to reorder • {itemsForActiveDay.length} {itemsForActiveDay.length === 1 ? 'place' : 'places'}
                      </p>
                    </div>
                  </div>
                  {routeSummary.geometry && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {routeSummary.distanceKm.toFixed(1)} km
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">
                        {Math.round(routeSummary.durationMin)} min travel
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {itemsForActiveDay.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🗺️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                      No places added yet
                    </h4>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Search and add places to start planning your day
                    </p>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="timeline">
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                          {itemsForActiveDay.map((item, index) => (
                            <Draggable key={item._id} draggableId={item._id} index={index}>
                              {(dragProvided, snapshot) => (
                                <div 
                                  ref={dragProvided.innerRef} 
                                  {...dragProvided.draggableProps} 
                                  className={`group bg-secondary-50 dark:bg-secondary-700 rounded-xl p-4 border-2 transition-all duration-200 ${
                                    snapshot.isDragging 
                                      ? 'border-primary-300 shadow-lg scale-102' 
                                      : 'border-transparent hover:border-primary-200 hover:shadow-soft'
                                  }`}
                                >
                                  <div className="flex items-start space-x-4">
                                    <div 
                                      {...dragProvided.dragHandleProps}
                                      className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center cursor-grab group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors"
                                    >
                                      <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                                        {item.title}
                                      </h4>
                                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                                        {item.location || 'No address'}
                                      </p>
                                      {typeof item.lat === 'number' && typeof item.lng === 'number' && (
                                        <div className="flex items-center space-x-2 text-xs text-secondary-500 dark:text-secondary-400">
                                          <span>📍</span>
                                          <span>{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Link 
                                        to={`/trip/${trip._id}`} 
                                        className="px-3 py-1 bg-secondary-100 hover:bg-primary-50 text-secondary-700 hover:text-primary-600 dark:bg-secondary-600 dark:text-secondary-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300 rounded-lg text-sm font-medium transition-colors"
                                      >
                                        View
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>
          </div>

          {/* Map Panel - Takes 3/5 of the width */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-secondary-100 dark:border-secondary-700">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                      Interactive Map
                    </h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Visualize your day's route and locations
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="h-[600px]">
                <LeafletMap
                  points={itemsForActiveDay.filter(i => typeof i.lat==='number' && typeof i.lng==='number')}
                  routeGeoJson={routeSummary.geometry}
                />
              </div>
            </div>
          </div>
        </div>

        {message && <div className="text-sm text-secondary-700 dark:text-secondary-300">{message}</div>}
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
    </div>
  );
};

// Component to handle map fitting logic
const MapFitter = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && points?.length) {
      fitToMarkers(map, points);
    }
  }, [map, points]);
  
  return null;
};

const LeafletMap = ({ points, routeGeoJson }) => {
  // Convert GeoJSON LineString to Leaflet latlngs
  const routeLatLngs = useMemo(() => {
    if (!routeGeoJson?.coordinates?.length) return null;
    return routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [routeGeoJson]);

  // Default center and zoom
  const defaultCenter = points?.length > 0 ? [points[0].lat, points[0].lng] : [51.505, -0.09];
  const defaultZoom = points?.length > 0 ? 12 : 2;

  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <MapFitter points={points} />
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
