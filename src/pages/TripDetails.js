import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ExpenseTracker from '../components/ExpenseTracker';
import { tripsAPI } from '../services/api';
import MapView from '../components/TripMapView';
import { getSocket, joinTripRoom, leaveTripRoom } from '../services/socket';

const formatDateInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for editing notes/dates
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Itinerary form state
  const [itTitle, setItTitle] = useState('');
  const [itLocation, setItLocation] = useState('');
  const [itDay, setItDay] = useState('');
  const [itStart, setItStart] = useState('');
  const [itEnd, setItEnd] = useState('');
  const [itNotes, setItNotes] = useState('');
  const [itLat, setItLat] = useState('');
  const [itLng, setItLng] = useState('');
  const [itineraryCost, setItineraryCost] = useState('');

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const resp = await tripsAPI.getById(id);
      const t = resp.data.data;
      setTrip(t);
      // Initialize form fields
      setNotes(t?.notes || '');
      setStartDate(formatDateInput(t?.plannedDates?.startDate));
      setEndDate(formatDateInput(t?.plannedDates?.endDate));
    } catch (err) {
      setMessage(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrip(); /* eslint-disable-next-line */ }, [id]);

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

  // Initialize tab from URL param
  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && ['overview','itinerary','budget','map'].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const toggleFavorite = async () => {
    try {
      const resp = await tripsAPI.toggleFavorite(id);
      const fav = resp.data.data.isFavorite;
      setTrip((t) => ({ ...t, isFavorite: fav }));
    } catch (err) {
      setMessage(err.message || 'Failed to update favorite');
    }
  };

  const deleteTrip = async () => {
    try {
      await tripsAPI.delete(id);
      navigate('/my-trips');
    } catch (err) {
      setMessage(err.message || 'Failed to delete trip');
    }
  };

  const saveEdits = async () => {
    // Basic validation
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setMessage('Start date must be before end date.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        notes,
        plannedDates: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      };
      const resp = await tripsAPI.update(id, payload);
      const updated = resp.data.data;
      setTrip(updated);
      setMessage('✅ Trip updated');
    } catch (err) {
      setMessage(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleBudgetUpdate = async (newBudget) => {
    try {
      const payload = { budget: newBudget };
      const resp = await tripsAPI.update(id, payload);
      const updated = resp.data.data;
      setTrip(updated);
      setMessage('✅ Budget updated');
    } catch (err) {
      setMessage(err.message || 'Failed to update budget');
    }
  };

  const duplicateTrip = async () => {
    try {
      const resp = await tripsAPI.duplicate(id);
      const newTripId = resp.data.data._id;
      navigate(`/trip/${newTripId}`);
    } catch (err) {
      setMessage(err.message || 'Failed to duplicate trip');
    }
  };

  const exportTrip = async () => {
    try {
      const resp = await tripsAPI.export(id);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(resp.data, null, 2)]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage('✅ Trip exported successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to export trip');
    }
  };

  const addItineraryItem = async () => {
    if (!itTitle.trim()) {
      setMessage('Itinerary item title is required');
      return;
    }
    try {
      const payload = {
        title: itTitle.trim(),
        location: itLocation.trim() || undefined,
        day: itDay ? parseInt(itDay, 10) : undefined,
        startTime: itStart || undefined,
        endTime: itEnd || undefined,
        notes: itNotes || undefined,
        lat: itLat ? parseFloat(itLat) : undefined,
        lng: itLng ? parseFloat(itLng) : undefined,
        cost: itineraryCost ? parseFloat(itineraryCost) : undefined,
      };
      const resp = await tripsAPI.addItinerary(id, payload);
      setTrip(resp.data.data);
      setItTitle(''); setItLocation(''); setItDay(''); setItStart(''); setItEnd(''); setItNotes(''); setItLat(''); setItLng(''); setItineraryCost('');
      setMessage('✅ Itinerary item added');
    } catch (err) {
      setMessage(err.message || 'Failed to add itinerary item');
    }
  };

  const deleteItineraryItem = async (itemId) => {
    try {
      const resp = await tripsAPI.deleteItinerary(id, itemId);
      setTrip(resp.data.data);
    } catch (err) {
      setMessage(err.message || 'Failed to delete itinerary item');
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(trip.itinerary || []);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // optimistic update
    setTrip((t) => ({ ...t, itinerary: reordered }));
    try {
      await tripsAPI.reorderItinerary(id, reordered.map((i) => i._id));
    } catch (e) {
      // ignore; state already updated; could refetch
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-16"><LoadingSpinner message="Loading trip..." /></div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-secondary-700">Trip not found.</div>
          <Link to="/my-trips" className="btn-secondary mt-4 inline-block">Back to My Trips</Link>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '🏠' },
    { id: 'itinerary', name: 'Itinerary', icon: '📋' },
    { id: 'budget', name: 'Budget & Expenses', icon: '💰' },
    { id: 'map', name: 'Map', icon: '🗺️' }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">{trip.title}</h1>
          <div className="flex gap-2">
            <Link className="btn-secondary" to={`/planner/${trip._id}`}>Open Planner</Link>
            <button className="btn-secondary" onClick={toggleFavorite}>{trip.isFavorite ? '★ Favorite' : '☆ Favorite'}</button>
            <button className="btn-secondary" onClick={duplicateTrip}>Duplicate</button>
            <button className="btn-secondary" onClick={async ()=>{
              try{const resp=await tripsAPI.enablePublic(trip._id); const token=resp.data.data.token; const publicUrl=`${window.location.origin}/public/${token}`; await navigator.clipboard?.writeText(publicUrl); setMessage(`✅ Public link copied to clipboard`);}catch(e){setMessage(e.message||'Failed to create public link');}}
            }>Share Public Link</button>
            <button className="btn-secondary" onClick={exportTrip}>Export JSON</button>
            <button className="btn-secondary" onClick={async ()=>{
              try{const blob=(await tripsAPI.exportPdf(trip._id)).data; const url=window.URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${trip.title.replace(/[^a-zA-Z0-9]/g,'_')}.pdf`; a.click(); window.URL.revokeObjectURL(url);}catch(e){setMessage(e.message||'Failed to export PDF');}
            }}>Export PDF</button>
            <button className="btn-secondary" onClick={async ()=>{
              try{const blob=(await tripsAPI.exportXlsx(trip._id)).data; const url=window.URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${trip.title.replace(/[^a-zA-Z0-9]/g,'_')}.xlsx`; a.click(); window.URL.revokeObjectURL(url);}catch(e){setMessage(e.message||'Failed to export Excel');}
            }}>Export Excel</button>
            <button className="btn-secondary" onClick={deleteTrip}>Delete</button>
            <Link to="/my-trips" className="nav-link">Back</Link>
          </div>
        </div>

        {message && <div className="mb-4 text-sm text-secondary-700 dark:text-secondary-300">{message}</div>
}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {trip.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {trip.images.slice(0,4).map((img, i) => (
                    <img key={i} src={img.url} alt={img.altDescription || trip.country?.name} className="rounded-md object-cover h-40 w-full" />
                  ))}
                </div>
              )}
              <div className="card p-4">
                <div className="font-semibold text-secondary-900 mb-2">Country</div>
                <div className="text-sm text-secondary-700 dark:text-secondary-200">{trip.country?.name} {trip.country?.capital ? `• Capital: ${trip.country.capital}` : ''}</div>
                <div className="text-sm text-secondary-700 dark:text-secondary-200">Region: {trip.country?.region} {trip.country?.subregion ? `• ${trip.country.subregion}` : ''}</div>
                {trip.country?.languages?.length > 0 && (
                  <div className="text-sm text-secondary-700 dark:text-secondary-200">Languages: {trip.country.languages.join(', ')}</div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {trip.weather?.current && (
                <div className="weather-card">
                  <div className="font-medium">Current Weather</div>
                  <div className="text-sm text-secondary-700 dark:text-secondary-200">{trip.weather.current.description} • {trip.weather.current.temperature}°C</div>
                </div>
              )}
              <div className="card p-4 space-y-3">
                <div className="font-medium">Notes & Plan</div>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">Start Date</label>
                    <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">End Date</label>
                    <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary" onClick={saveEdits} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                  {trip.notes && <span className="text-xs text-secondary-500 dark:text-secondary-400 self-center">Last note length: {trip.notes.length}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="card p-4 space-y-3">
            <div className="font-medium">Itinerary</div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input className="input-field" placeholder="Title" value={itTitle} onChange={(e)=>setItTitle(e.target.value)} />
              <input className="input-field" placeholder="Location" value={itLocation} onChange={(e)=>setItLocation(e.target.value)} />
              <input className="input-field" type="number" min="1" placeholder="Day" value={itDay} onChange={(e)=>setItDay(e.target.value)} />
              <input className="input-field" type="time" placeholder="Start" value={itStart} onChange={(e)=>setItStart(e.target.value)} />
              <input className="input-field" type="time" placeholder="End" value={itEnd} onChange={(e)=>setItEnd(e.target.value)} />
              <input className="input-field" type="number" min="0" step="0.01" placeholder="Cost" value={itineraryCost || ''} onChange={(e)=>setItineraryCost(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <input className="input-field" type="number" step="0.000001" placeholder="Lat" value={itLat || ''} onChange={(e)=>setItLat(e.target.value)} />
              <input className="input-field" type="number" step="0.000001" placeholder="Lng" value={itLng || ''} onChange={(e)=>setItLng(e.target.value)} />
              <textarea className="input-field md:col-span-2" rows={2} placeholder="Notes (optional)" value={itNotes} onChange={(e)=>setItNotes(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={addItineraryItem}>Add Item</button>
            </div>
            {trip.itinerary?.length > 0 && (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="itinerary">
                  {(provided) => (
                    <ul className="mt-3 space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                      {trip.itinerary.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(p) => (
                            <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="flex items-center justify-between border border-secondary-200 dark:border-secondary-700 rounded-md px-3 py-2">
                              <div>
                                <div className="font-medium text-secondary-900 dark:text-secondary-100">{item.title}{item.day ? ` • Day ${item.day}` : ''}{typeof item.cost === 'number' ? ` • $${item.cost}` : ''}</div>
                                <div className="text-xs text-secondary-600 dark:text-secondary-300">{item.location || ''} {item.startTime ? `• ${item.startTime}` : ''}{item.endTime ? `-${item.endTime}` : ''} {typeof item.lat==='number' && typeof item.lng==='number' ? `• (${item.lat.toFixed?.(3)}, ${item.lng.toFixed?.(3)})` : ''}</div>
                                {item.notes && <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{item.notes}</div>}
                              </div>
                              <button className="btn-secondary" onClick={() => deleteItineraryItem(item._id)}>Delete</button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        )}

        {activeTab === 'budget' && (
          <ExpenseTracker trip={trip} onUpdateBudget={handleBudgetUpdate} />
        )}

        {activeTab === 'map' && (
          <div className="card p-4">
            <div className="font-medium mb-2">Map</div>
            <MapView markers={(trip.itinerary || []).map(i => ({ lat: i.lat, lng: i.lng, title: i.title }))} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TripDetails;
