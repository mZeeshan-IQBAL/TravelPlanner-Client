import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { CollaborationIndicator, AvatarGroup } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { tripsAPI, placesAPI, directionsAPI } from '../services/api';
import { exportTripToPDF } from '../utils/pdfExport';
import L from 'leaflet';

// Custom marker icons
const createNumberedIcon = (number, color = '#FF6B35') => {
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `
      <div style="
        width: 32px; 
        height: 32px; 
        background: ${color}; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-weight: bold; 
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">${number}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const TripPlanner = ({ tripId, isCollaborative = true }) => {
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(1);
  const [collaborators, setCollaborators] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [message, setMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for demonstration
  const mockTrip = {
    _id: '1',
    title: 'Oahu trip with friends',
    description: 'Amazing island adventure',
    startDate: '2024-03-07',
    endDate: '2024-03-14',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    collaborators: [
      { _id: '1', username: 'Sarah', name: 'Sarah Johnson', avatar: { url: 'https://i.pravatar.cc/64?img=1' } },
      { _id: '2', username: 'Mike', name: 'Mike Chen', avatar: { url: 'https://i.pravatar.cc/64?img=3' } },
      { _id: '3', username: 'Alex', name: 'Alex Rivera', avatar: { url: 'https://i.pravatar.cc/64?img=5' } }
    ],
    days: [
      {
        day: 1,
        date: '2024-03-07',
        places: [
          {
            _id: 'p1',
            name: "Kāne'ohe Bay",
            description: 'Large, sheltered bay offering swimming, snorkeling & kayaking amidst its coral reefs.',
            address: "Kāne'ohe, HI",
            lat: 21.4389,
            lng: -157.8583,
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            type: 'attraction',
            order: 0
          }
        ]
      }
    ]
  };

  const mockRecommended = [
    {
      _id: 'r1',
      name: 'Hamama Falls',
      description: 'Beautiful waterfall with hiking trail',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
      rating: 4.5,
      type: 'nature'
    },
    {
      _id: 'r2',
      name: "He'eia State Park",
      description: 'Scenic state park with great views',
      image: 'https://images.unsplash.com/photo-1580168673625-71a8e2b7b999?w=300&h=200&fit=crop',
      rating: 4.3,
      type: 'park'
    },
    {
      _id: 'r3',
      name: 'Waikiki Beach',
      description: 'World famous beach destination',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
      rating: 4.8,
      type: 'beach'
    }
  ];

  useEffect(() => {
    // Simulate loading trip data
    setTimeout(() => {
      setTrip(mockTrip);
      setCollaborators(mockTrip.collaborators);
      setActiveUsers(mockTrip.collaborators.slice(0, 2)); // Mock active users
      setRecommendedPlaces(mockRecommended);
      setLoading(false);
    }, 1000);
  }, [tripId]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const currentDayPlaces = useMemo(() => {
    if (!trip) return [];
    const currentDay = trip.days?.find(d => d.day === selectedDay);
    return currentDay?.places || [];
  }, [trip, selectedDay]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(currentDayPlaces);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Update trip state
    setTrip(prev => ({
      ...prev,
      days: prev.days.map(day => 
        day.day === selectedDay 
          ? { ...day, places: updatedItems }
          : day
      )
    }));
  };

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    // Mock route optimization
    setTimeout(() => {
      setIsOptimizing(false);
    }, 2000);
  };

  const handleExportJSON = async () => {
    if (!trip) return;
    try {
      setIsExporting(true);
      const response = await tripsAPI.export(trip._id);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('✅ Trip exported as JSON successfully');
    } catch (error) {
      setMessage(`❌ Failed to export JSON: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!trip) return;
    try {
      setIsExporting(true);
      // Use server-side PDF export
      const response = await tripsAPI.exportPdf(trip._id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('✅ Trip exported as PDF successfully');
    } catch (error) {
      // Fallback to client-side PDF export if server fails
      console.warn('Server PDF export failed, using client-side fallback:', error);
      try {
        exportTripToPDF(trip);
        setMessage('✅ Trip exported as PDF successfully (client-side)');
      } catch (fallbackError) {
        setMessage(`❌ Failed to export PDF: ${fallbackError.message}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!trip) return;
    try {
      setIsExporting(true);
      const response = await tripsAPI.exportXlsx(trip._id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessage('✅ Trip exported as Excel successfully');
    } catch (error) {
      setMessage(`❌ Failed to export Excel: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-40">
        <div className="max-w-none px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="text-secondary-400 hover:text-secondary-600">
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">{trip.title}</h1>
                <p className="text-secondary-500 text-sm">📅 {trip.startDate} - {trip.endDate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Export Buttons */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? '...' : '📋 PDF'}
                </button>
                <button 
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? '...' : '💾 JSON'}
                </button>
                <button 
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? '...' : '📈 Excel'}
                </button>
              </div>
              
              <button className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
                🔗 Share
              </button>
              
              <div className="flex items-center space-x-2">
                <AvatarGroup users={collaborators} maxVisible={4} size="small" />
                <button className="w-8 h-8 bg-secondary-100 hover:bg-secondary-200 rounded-full flex items-center justify-center text-secondary-600">
                  +
                </button>
              </div>
            </div>
          </div>

          {isCollaborative && activeUsers.length > 0 && (
            <div className="mt-3">
              <CollaborationIndicator activeUsers={activeUsers} />
            </div>
          )}
          
          {message && (
            <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">{message}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Trip Timeline */}
        <div className="w-96 bg-white border-r border-secondary-200 flex flex-col">
          {/* Day Navigation */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-secondary-900">Saturday, March 7</h3>
              <button className="text-secondary-400 hover:text-secondary-600">⋯</button>
            </div>
            
            <div className="flex space-x-2 mb-4">
              <button 
                className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm font-medium"
                disabled={isOptimizing}
              >
                🪄 Auto-fill day
              </button>
              <button 
                onClick={handleOptimizeRoute}
                disabled={isOptimizing}
                className="px-3 py-1 bg-wanderlog-blue text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isOptimizing ? (
                  <span className="flex items-center space-x-1">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Optimizing...</span>
                  </span>
                ) : (
                  '🔄 Optimize route'
                )}
              </button>
            </div>

            <div className="text-sm text-secondary-500">
              1 hr 30 min, 9.5 mi
            </div>
          </div>

          {/* Places to Visit */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900">📍 Places to visit</h4>
                <button className="text-primary-500 text-sm font-medium hover:text-primary-600">
                  🔍 Browse all
                </button>
              </div>

              {/* Current Places */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="places">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                      {currentDayPlaces.map((place, index) => (
                        <Draggable key={place._id} draggableId={place._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                group relative bg-secondary-50 rounded-xl p-3 border-2 transition-all duration-200
                                ${snapshot.isDragging ? 'border-primary-300 shadow-lg' : 'border-transparent hover:border-primary-200'}
                              `}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-secondary-900 mb-1">{place.name}</h5>
                                  <p className="text-xs text-secondary-500 mb-2 line-clamp-2">{place.description}</p>
                                  {place.image && (
                                    <img 
                                      src={place.image} 
                                      alt={place.name}
                                      className="w-full h-20 object-cover rounded-lg"
                                    />
                                  )}
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

              {/* Recommended Places */}
              <div className="mt-8">
                <h4 className="font-medium text-secondary-900 mb-3">💡 Recommended places</h4>
                <div className="grid grid-cols-2 gap-3">
                  {recommendedPlaces.map((place) => (
                    <div key={place._id} className="group relative bg-white rounded-xl overflow-hidden border border-secondary-200 hover:shadow-md transition-all duration-200">
                      <img 
                        src={place.image} 
                        alt={place.name}
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-2">
                        <h6 className="font-medium text-sm text-secondary-900 truncate">{place.name}</h6>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-xs text-secondary-500">{place.rating}</span>
                        </div>
                      </div>
                      <button className="absolute top-2 right-2 w-6 h-6 bg-white hover:bg-secondary-50 rounded-full flex items-center justify-center text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1 relative">
          <MapContainer 
            center={[21.4389, -157.8583]} 
            zoom={11} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Place Markers */}
            {currentDayPlaces.map((place, index) => (
              <Marker 
                key={place._id}
                position={[place.lat, place.lng]}
                icon={createNumberedIcon(index + 1)}
              >
                <Popup>
                  <div className="text-center">
                    <h6 className="font-semibold">{place.name}</h6>
                    <p className="text-sm text-secondary-600 mt-1">{place.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Line */}
            {currentDayPlaces.length > 1 && (
              <Polyline
                positions={currentDayPlaces.map(place => [place.lat, place.lng])}
                pathOptions={{ 
                  color: '#FF6B35', 
                  weight: 3, 
                  opacity: 0.8,
                  dashArray: '5, 10'
                }}
              />
            )}
          </MapContainer>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-white rounded-xl shadow-lg p-2 space-y-2">
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-10 h-10 bg-white hover:bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-600 border border-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Export to PDF"
              >
                📤
              </button>
              <button className="w-10 h-10 bg-white hover:bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-600 border border-secondary-200" title="Add location marker">
                📍
              </button>
              <button className="w-10 h-10 bg-white hover:bg-secondary-50 rounded-lg flex items-center justify-center text-secondary-600 border border-secondary-200" title="Search places">
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;