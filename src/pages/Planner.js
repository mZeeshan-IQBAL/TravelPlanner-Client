import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { tripsAPI, placesAPI, directionsAPI, aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
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
  const { user, isAuthenticated, login, register } = useAuth();
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
  const [showAutoFillSuggestions, setShowAutoFillSuggestions] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPreferences, setAIPreferences] = useState({
    budgetLevel: 'medium',
    interests: []
  });

  const fetchTrip = React.useCallback(async () => {
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
  }, [id]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

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

  // Auto-fill suggestions based on common travel destinations and trip context
  const getAutoFillSuggestions = () => {
    const commonPlaces = [
      'restaurants near me',
      'tourist attractions',
      'museums',
      'parks',
      'coffee shops',
      'shopping centers',
      'hotels',
      'gas stations',
      'hospitals',
      'banks'
    ];
    
    // Add location-specific suggestions if we have existing places
    const existingPlace = itemsForActiveDay.find(i => i.location);
    if (existingPlace) {
      const locationParts = existingPlace.location.split(',');
      const city = locationParts[locationParts.length - 2]?.trim();
      if (city) {
        return [
          `restaurants in ${city}`,
          `attractions in ${city}`,
          `hotels in ${city}`,
          ...commonPlaces.slice(0, 7)
        ];
      }
    }
    
    return commonPlaces;
  };

  const handleAutoFillSelect = (suggestion) => {
    setPlaceQuery(suggestion);
    searchPlaces(suggestion);
    setShowAutoFillSuggestions(false);
  };

  // AI-powered itinerary generation
  const generateAIItinerary = async () => {
    if (!trip) return;
    
    if (!isAuthenticated) {
      setMessage('🔒 Please log in to use AI features.');
      setShowAIModal(false);
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      // Extract destination from trip title
      const destination = trip.title.includes('trip') 
        ? trip.title.replace(/\s+trip.*$/i, '').trim()
        : trip.title;
      
      // Calculate trip duration
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const response = await aiAPI.generateItinerary({
        destination,
        durationDays,
        budgetLevel: aiPreferences.budgetLevel,
        interests: aiPreferences.interests
      });
      
      if (response.data.success && response.data.data) {
        const aiItinerary = response.data.data;
        
        // Normalize AI response to support various schemas and geocode when needed
        const resolveAIItems = (it) => {
          if (!it) return [];
          // days can be an array, an object keyed by day, or the plan might be under `itinerary`
          const days = Array.isArray(it.days)
            ? it.days
            : (it.days && typeof it.days === 'object')
              ? Object.values(it.days)
              : (Array.isArray(it.itinerary) ? it.itinerary : []);

          const target = (Array.isArray(days) && days.length > 0)
            ? (days[activeDay - 1] || days[0])
            : it;

          let items = target?.items || target?.activities || target?.places || target?.stops;
          if (!Array.isArray(items)) {
            // Fallback: flatten items across all days
            items = (Array.isArray(days) ? days : []).flatMap((d) => d?.items || d?.activities || d?.places || d?.stops || []);
          }
          return Array.isArray(items) ? items : [];
        };

        const items = resolveAIItems(aiItinerary);

        if (items.length > 0) {
          // Build places list, attempting to geocode missing coordinates
          const aiPlaces = await Promise.all(items.map(async (item) => {
            let lat = Number(item?.lat);
            let lng = Number(item?.lng);

            const invalidCoords = !isFinite(lat) || !isFinite(lng) || (lat === 0 && lng === 0);
            if (invalidCoords) {
              try {
                const q = [item?.title || item?.name, destination].filter(Boolean).join(' ');
                const sr = await placesAPI.search({ q, limit: 1 });
                const m = sr?.data?.data?.[0];
                if (m?.lat && m?.lng) { lat = m.lat; lng = m.lng; }
              } catch (_) {
                // swallow geocoding errors; we'll default to 0/0
              }
            }

            return {
              title: item?.title || item?.name || 'AI Generated Place',
              location: item?.location || destination,
              day: activeDay,
              lat: isFinite(lat) ? lat : 0,
              lng: isFinite(lng) ? lng : 0,
              notes: item?.notes || item?.description || 'Generated by AI',
              startTime: item?.startTime,
              endTime: item?.endTime,
              estimatedCost: item?.cost,
              aiGenerated: true
            };
          }));

          // Add places to the trip
          let addedCount = 0;
          for (const place of aiPlaces) {
            try {
              const resp = await tripsAPI.addItinerary(id, place);
              setTrip(resp.data.data);
              addedCount++;
            } catch (err) {
              console.error('Failed to add AI place:', err);
            }
          }

          setShowAIModal(false);
          setMessage(`🪄 AI itinerary generated successfully! ${addedCount} places added to Day ${activeDay}.`);
        } else {
          setShowAIModal(false);
          setMessage('⚠️ AI generated an itinerary but no places were found for the current day.');
        }
      } else {
        throw new Error('AI service returned invalid data');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to use AI features';
      } else if (error.response?.status === 500) {
        errorMessage = 'AI service is currently unavailable. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`❌ Failed to generate AI itinerary: ${errorMessage}`);
      setShowAIModal(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Enhanced auto-fill with AI suggestions
  const getAIEnhancedSuggestions = async () => {
    if (!trip) return getAutoFillSuggestions();
    
    try {
      const destination = trip.title.includes('trip') 
        ? trip.title.replace(/\s+trip.*$/i, '').trim()
        : trip.title;
      
      const existingPlaces = itemsForActiveDay.map(item => item.title).join(', ');
      const interests = aiPreferences.interests.length > 0 ? aiPreferences.interests : ['general'];
      
      // For now, return enhanced static suggestions with context
      const baseSuggestions = getAutoFillSuggestions();
      const aiEnhanced = [
        `best restaurants in ${destination}`,
        `top attractions in ${destination}`,
        `hidden gems in ${destination}`,
        `${interests[0]} activities in ${destination}`,
        ...baseSuggestions.slice(0, 6)
      ];
      
      return aiEnhanced;
    } catch (error) {
      console.error('AI suggestions failed:', error);
      return getAutoFillSuggestions();
    }
  };

  // Close auto-fill suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAutoFillSuggestions && !event.target.closest('.search-container')) {
        setShowAutoFillSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAutoFillSuggestions]);

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
      <div className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 sticky top-16 z-40 -mt-1">
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
                className="flex items-center space-x-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-colors font-medium disabled:opacity-50"
                onClick={() => {
                  if (!isAuthenticated) {
                    setMessage('🔒 Please log in to use AI features. Click the login button in the top navigation.');
                    return;
                  }
                  setShowAIModal(true);
                }}
                disabled={isGeneratingAI}
                title={!isAuthenticated ? 'Login required for AI features' : 'Generate AI suggestions'}
              >
                <span>🪄</span>
                <span>{isGeneratingAI ? 'AI Working...' : !isAuthenticated ? 'AI Auto-fill (Login Required)' : 'AI Auto-fill'}</span>
              </button>
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
          
          <div className="relative search-container">
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
            
            {/* Auto-fill button */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
              {searching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
              ) : (
                <button
                  onClick={() => setShowAutoFillSuggestions(!showAutoFillSuggestions)}
                  className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  title="Show auto-fill suggestions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              )}
            </div>
            
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
            
            {/* Auto-fill Suggestions Dropdown */}
            {showAutoFillSuggestions && (
              <div className="absolute z-15 mt-2 w-full bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-600 max-h-80 overflow-auto">
                <div className="p-4 border-b border-secondary-100 dark:border-secondary-700">
                  <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 text-sm flex items-center">
                    <span className="mr-2">⚡</span>
                    Quick Search Suggestions
                  </h4>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    Click to auto-fill your search
                  </p>
                </div>
                <div className="p-2">
                  {trip ? (
                    React.useMemo(() => {
                      const destination = trip.title.includes('trip') 
                        ? trip.title.replace(/\s+trip.*$/i, '').trim()
                        : trip.title;
                      const interests = aiPreferences.interests.length > 0 ? aiPreferences.interests : ['general'];
                      const baseSuggestions = getAutoFillSuggestions();
                      
                      return [
                        `best restaurants in ${destination}`,
                        `top attractions in ${destination}`,
                        `hidden gems in ${destination}`,
                        `${interests[0]} activities in ${destination}`,
                        ...baseSuggestions.slice(0, 6)
                      ];
                    }, [trip.title, aiPreferences.interests]).map((suggestion, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleAutoFillSelect(suggestion)}
                        className="group w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-xl border border-transparent hover:border-primary-200 dark:hover:border-primary-700 mb-2 last:mb-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-primary-100 dark:from-purple-900/30 dark:to-primary-900/30 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-primary-200 dark:group-hover:from-purple-900/50 dark:group-hover:to-primary-900/50 transition-colors">
                            <span className="text-sm">🪄</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-secondary-900 dark:text-secondary-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 text-sm">
                              {suggestion}
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">
                              AI-enhanced suggestion
                            </div>
                          </div>
                          <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    getAutoFillSuggestions().map((suggestion, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleAutoFillSelect(suggestion)}
                      className="group w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors rounded-xl border border-transparent hover:border-primary-200 dark:hover:border-primary-700 mb-2 last:mb-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                          <span className="text-sm">🔍</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-secondary-900 dark:text-secondary-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 text-sm">
                            {suggestion}
                          </div>
                        </div>
                        <div className="text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))
                  )}
                </div>
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

        {message && (
          <div className={`p-4 rounded-xl border-l-4 ${
            message.includes('❌') 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
              : message.includes('🔒') 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200'
              : message.includes('⚠️') 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200'
              : 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
          }`}>
            <div className="text-sm font-medium">{message}</div>
            {message.includes('log in') && !isAuthenticated && (
              <div className="mt-2 flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline text-sm font-medium"
                >
                  Go to Login Page →
                </Link>
                <span className="text-secondary-400">or</span>
                <button 
                  onClick={async () => {
                    try {
                      // Demo login for testing
                      const demoCredentials = {
                        email: 'demo@example.com',
                        password: 'demo123'
                      };
                      
                      const result = await login(demoCredentials);
                      
                      if (result.success) {
                        setMessage('✅ Demo login successful! You can now use AI features.');
                      } else {
                        // Try to register demo user if login fails
                        const registerResult = await register({
                          ...demoCredentials,
                          username: 'demo_user',
                          name: 'Demo User'
                        });
                        
                        if (registerResult.success) {
                          setMessage('✅ Demo user created and logged in! You can now use AI features.');
                        } else {
                          setMessage('❌ Failed to create demo user. Please try manual login.');
                        }
                      }
                    } catch (error) {
                      setMessage('❌ Demo login failed. Please try manual login.');
                    }
                  }}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Demo Login
                </button>
              </div>
            )}
          </div>
        )}
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
      
      {/* AI Preferences Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAIModal(false)}>
          <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">🪄 AI Trip Planner</h3>
              <button 
                onClick={() => setShowAIModal(false)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Budget Level
                </label>
                <select 
                  value={aiPreferences.budgetLevel}
                  onChange={(e) => setAIPreferences(prev => ({ ...prev, budgetLevel: e.target.value }))}
                  className="w-full border border-secondary-300 dark:border-secondary-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                >
                  <option value="low">Low Budget (💰)</option>
                  <option value="medium">Medium Budget (💵)</option>
                  <option value="high">High Budget (💸)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Interests (Select multiple)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Food', 'History', 'Nature', 'Culture', 'Shopping', 'Adventure', 'Art', 'Nightlife'].map(interest => (
                    <label key={interest} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={aiPreferences.interests.includes(interest.toLowerCase())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAIPreferences(prev => ({ ...prev, interests: [...prev.interests, interest.toLowerCase()] }));
                          } else {
                            setAIPreferences(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest.toLowerCase()) }));
                          }
                        }}
                        className="rounded border-secondary-300"
                      />
                      <span className="text-sm text-secondary-700 dark:text-secondary-300">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                AI will generate personalized suggestions for Day {activeDay} of "{trip?.title}" based on your preferences.
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-secondary-600 hover:text-secondary-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={generateAIItinerary}
                disabled={isGeneratingAI}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingAI ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </span>
                ) : (
                  'Generate AI Suggestions'
                )}
              </button>
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
