import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ExpenseModal from './ExpenseModal';

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

const ItineraryMapView = ({ tripData, onUpdateTrip }) => {
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

  const recommendedPlaces = [
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
  ];

  return (
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
            <button className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              Start planning
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

        {/* Location Input */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a location"
              className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <div className="absolute right-3 top-3 flex space-x-1">
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Recommended Places */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recommended places</h3>
          <div className="flex space-x-3">
            {recommendedPlaces.map((place) => (
              <div key={place._id} className="flex-1 relative group cursor-pointer">
                <img 
                  src={place.image} 
                  alt={place.name}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold">+</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg p-2">
                  <p className="text-white text-xs font-medium">{place.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day Navigation */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <button 
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              onClick={() => setSelectedDay(1)}
            >
              <span className="text-sm">▶</span>
              <span className="font-medium">Monday, March 8</span>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">•••</button>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <button 
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              onClick={() => setSelectedDay(2)}
            >
              <span className="text-sm">▶</span>
              <span className="font-medium">Tuesday, March 9</span>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">•••</button>
          </div>
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

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onAddExpense={(expense) => setExpenses([...expenses, expense])}
      />
    </div>
  );
};

export default ItineraryMapView;