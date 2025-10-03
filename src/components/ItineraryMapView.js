import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import ExpenseModal from './ExpenseModal';
import PlaceSearch from './PlaceSearch';
import DroppableDay from './DroppableDay';
import DraggablePlace from './DraggablePlace';
import useTrip from '../hooks/useTrip';

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

const ItineraryMapView = ({ tripData: initialTripData, onUpdateTrip }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [budget, setBudget] = useState(3750.00);
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      description: 'SFO to LIH',
      amount: 273.00,
      category: 'flights',
      date: '2024-03-07',
      icon: '✈️'
    }
  ]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food'
  });

  // Use trip management hook
  const {
    tripData,
    loading: tripLoading,
    error: tripError,
    addPlaceToDay,
    removePlaceFromDay,
    reorderPlacesInDay,
    movePlaceBetweenDays,
    addDay,
    removeDay,
    saveTrip
  } = useTrip(initialTripData);

  // Drag and drop state
  const [activePlace, setActivePlace] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mock trip data if none provided
  const defaultTripData = {
    _id: '1',
    title: 'Oahu Adventure',
    location: 'Honolulu, Hawaii',
    startDate: '2024-03-08',
    endDate: '2024-03-15',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
    days: [
      {
        day: 1,
        date: 'Monday, March 8',
        places: [
          {
            _id: 'p1',
            name: "Haupia Hut",
            description: 'Local Hawaiian dessert shop',
            address: "Honolulu, HI",
            lat: 21.3099,
            lng: -157.8581,
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            type: 'restaurant'
          },
          {
            _id: 'p2',
            name: "Waikiki Beach",
            description: 'World famous beach destination',
            address: "Waikiki, HI",
            lat: 21.2767,
            lng: -157.8278,
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
            type: 'beach'
          }
        ]
      },
      {
        day: 2,
        date: 'Tuesday, March 9',
        places: [
          {
            _id: 'p3',
            name: "Diamond Head",
            description: 'Iconic volcanic crater and hiking trail',
            address: "Honolulu, HI",
            lat: 21.2619,
            lng: -157.8055,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            type: 'attraction'
          }
        ]
      }
    ]
  };

  const trip = tripData || defaultTripData;

  const currentDayPlaces = useMemo(() => {
    const currentDay = trip.days?.find(d => d.day === selectedDay);
    return currentDay?.places || [];
  }, [trip, selectedDay]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = budget - totalExpenses;

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        id: Date.now(),
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0],
        icon: getCategoryIcon(newExpense.category)
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ description: '', amount: '', category: 'food' });
      setShowExpenseForm(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      flights: '✈️',
      accommodation: '🏨',
      food: '🍽️',
      transport: '🚗',
      activities: '🎯',
      shopping: '🛍️',
      other: '💳'
    };
    return icons[category] || '💳';
  };

  // State for recommended places
  const [recommendedPlaces, setRecommendedPlaces] = useState([
    {
      _id: 'r1',
      name: 'Haupia Hut',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop'
    },
    {
      _id: 'r2',
      name: 'Waikiki Beach',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop'
    }
  ]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Load recommended places based on current trip location
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!tripData || !currentDayPlaces.length) return;
      
      try {
        setLoadingRecommendations(true);
        // Use the first place of current day as reference point
        const referencePlace = currentDayPlaces[0];
        const { placesAPI } = require('../services/api');
        
        const response = await placesAPI.search({
          lat: referencePlace.lat,
          lng: referencePlace.lng,
          radius: 10000, // 10km radius
          limit: 6
        });
        
        if (response.data && response.data.data) {
          const places = response.data.data
            .filter(place => place.name && place.lat && place.lng)
            .slice(0, 4)
            .map(place => ({
              _id: place.providerId,
              name: place.name,
              image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop', // Default image
              lat: place.lat,
              lng: place.lng,
              address: place.address,
              type: place.type
            }));
          setRecommendedPlaces(places);
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        // Keep default recommendations on error
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [tripData, selectedDay, currentDayPlaces]);

  // Handle drag events
  const handleDragStart = (event) => {
    const { active } = event;
    const { data } = active;
    
    if (data.current && data.current.type === 'place') {
      setActivePlace(data.current.place);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActivePlace(null);
    
    if (!over) return;
    
    const activeData = active.data.current;
    const overData = over.data.current;
    
    if (!activeData || activeData.type !== 'place') return;
    
    const activePlaceId = activeData.place._id;
    const activeDayNumber = activeData.dayNumber;
    const activeIndex = activeData.index;
    
    // Moving within the same day (reordering)
    if (overData && overData.type === 'place' && overData.dayNumber === activeDayNumber) {
      const overIndex = overData.index;
      if (activeIndex !== overIndex) {
        reorderPlacesInDay(activeDayNumber, activeIndex, overIndex);
      }
    }
    // Moving to a different day
    else if (overData && overData.type === 'day' && overData.dayNumber !== activeDayNumber) {
      movePlaceBetweenDays(activePlaceId, activeDayNumber, overData.dayNumber);
    }
    // Moving to a different day via another place
    else if (overData && overData.type === 'place' && overData.dayNumber !== activeDayNumber) {
      movePlaceBetweenDays(activePlaceId, activeDayNumber, overData.dayNumber);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <button className="text-gray-400 hover:text-gray-600">
              ←
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{trip.title}</h1>
              <p className="text-sm text-gray-500">{trip.location}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => {
                if (tripData && tripData._id !== '1') {
                  // Save existing trip
                  saveTrip().then(() => {
                    alert('Trip saved successfully!');
                  }).catch((error) => {
                    alert('Failed to save trip: ' + error.message);
                  });
                } else {
                  // This is a demo, show planning instructions
                  alert('This is a demo. To create a real trip, sign up for an account!');
                }
              }}
              disabled={tripLoading}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {tripLoading ? 'Saving...' : (tripData && tripData._id !== '1' ? 'Save Trip' : 'Start planning')}
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Get the app →
            </button>
          </div>

          {/* Undo/Redo buttons */}
          <div className="flex items-center space-x-2 text-sm">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <span>↶</span>
              <span>Undo</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800">
              <span>↷</span>
              <span>Redo</span>
            </button>
            <div className="flex space-x-1 ml-auto">
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">•••</button>
            </div>
          </div>
        </div>

        {/* Location Search */}
        <div className="p-4 border-b border-gray-100">
          <PlaceSearch 
            placeholder="Search for places to add..."
            onPlaceSelect={(place) => {
              console.log('Place selected:', place);
            }}
            onAddPlace={(place) => {
              addPlaceToDay(place, selectedDay);
              // Show a brief success message
              const dayName = tripData?.days?.find(d => d.day === selectedDay)?.date || `Day ${selectedDay}`;
              alert(`Added ${place.name} to ${dayName}!`);
            }}
          />
        </div>

        {/* Recommended Places */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Recommended places</h3>
            {loadingRecommendations && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            )}
          </div>
          <div className="flex space-x-3">
            {recommendedPlaces.map((place) => (
              <div key={place._id} className="flex-1 relative group cursor-pointer">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button 
                  onClick={() => {
                    addPlaceToDay(place, selectedDay);
                    const dayName = tripData?.days?.find(d => d.day === selectedDay)?.date || `Day ${selectedDay}`;
                    alert(`Added ${place.name} to ${dayName}!`);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-white hover:bg-orange-50 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  title={`Add ${place.name} to your itinerary`}
                >
                  <span className="text-xs font-bold text-orange-600">+</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg p-2">
                  <p className="text-white text-xs font-medium truncate">{place.name}</p>
                  {place.type && (
                    <p className="text-white text-xs opacity-75 capitalize">{place.type}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {recommendedPlaces.length === 0 && !loadingRecommendations && (
            <div className="text-center text-gray-500 text-sm py-4">
              Add some places to see recommendations
            </div>
          )}
        </div>

        {/* Day Navigation with Drag and Drop */}
        <div className="p-4 border-b border-gray-100">
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-2">💡 Drag and drop places to reorder them or move between days</p>
          </div>
          {tripData?.days?.map((day) => (
            <DroppableDay
              key={day.day}
              day={day}
              isSelected={selectedDay === day.day}
              onDaySelect={setSelectedDay}
              onRemovePlace={removePlaceFromDay}
              onAddDay={addDay}
              onRemoveDay={removeDay}
              canRemoveDay={tripData.days.length > 1}
            />
          ))}
        </div>

        {/* Budget Section */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <button className="flex items-center space-x-2 text-gray-700">
              <span className="text-sm">▼</span>
              <span className="font-medium">Budgeting</span>
            </button>
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="px-3 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Add expense
            </button>
          </div>

          {/* Budget Display */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">${budget.toFixed(2)}</span>
              <span className="text-sm text-gray-500">Budget: $5000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(totalExpenses / budget) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <button className="text-gray-600 hover:text-gray-800">✏ Edit budget</button>
              <button className="text-gray-600 hover:text-gray-800">📊 Debt summary</button>
              <button className="text-gray-600 hover:text-gray-800">⚙ Settings</button>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Expenses</span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Sort Date ↑
              </button>
            </div>
            
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{expense.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-500">Mar 7 • Flights</p>
                  </div>
                </div>
                <span className="font-medium text-gray-900">${expense.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Breakdown */}
        <div className="p-4">
          <div className="flex space-x-2">
            <button className="text-xs text-gray-600 hover:text-gray-800 underline">📈 View breakdown</button>
            <button className="text-xs text-gray-600 hover:text-gray-800 underline">👥 Add tripmate</button>
            <button className="text-xs text-gray-600 hover:text-gray-800 underline">⚙ Settings</button>
          </div>
        </div>
      </div>

      {/* Right Map Section */}
      <div className="flex-1 relative">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50">
            📤 Export
          </button>
          <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50">
            ☰
          </button>
        </div>

        {/* Map Container */}
        <MapContainer
          center={currentDayPlaces.length > 0 ? [currentDayPlaces[0].lat, currentDayPlaces[0].lng] : [21.3099, -157.8581]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Markers for current day places */}
          {currentDayPlaces.map((place, index) => (
            <Marker
              key={place._id}
              position={[place.lat, place.lng]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{place.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{place.description}</p>
                  {place.image && (
                    <img 
                      src={place.image} 
                      alt={place.name}
                      className="w-full h-20 object-cover rounded mt-2"
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Route line between places */}
          {currentDayPlaces.length > 1 && (
            <Polyline
              positions={currentDayPlaces.map(place => [place.lat, place.lng])}
              pathOptions={{ color: '#FF6B35', weight: 3, opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>
      
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onAddExpense={(expense) => setExpenses([...expenses, expense])}
      />
      
      {/* Drag overlay shows the currently dragged item */}
      <DragOverlay>
        {activePlace ? (
          <DraggablePlace 
            place={activePlace} 
            index={0}
            dayNumber={0}
            isDragging={true} 
            onRemove={() => {}} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ItineraryMapView;