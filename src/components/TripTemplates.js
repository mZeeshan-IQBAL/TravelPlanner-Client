import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const TripTemplates = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Predefined templates
  const predefinedTemplates = [
    {
      id: 'weekend-city',
      title: 'Weekend City Break',
      description: 'Perfect for 2-3 day city exploration',
      icon: '🏙️',
      budget: { totalEstimated: 500, currency: 'USD' },
      itinerary: [
        { title: 'Arrive & Check-in', day: 1, startTime: '15:00', endTime: '17:00', notes: 'Hotel check-in and initial exploration' },
        { title: 'City Walking Tour', day: 1, startTime: '18:00', endTime: '20:00', notes: 'Explore main attractions' },
        { title: 'Local Restaurant Dinner', day: 1, startTime: '20:30', endTime: '22:00', cost: 50 },
        { title: 'Museum Visit', day: 2, startTime: '10:00', endTime: '13:00', cost: 25 },
        { title: 'Lunch at Local Café', day: 2, startTime: '13:30', endTime: '14:30', cost: 20 },
        { title: 'Shopping District', day: 2, startTime: '15:00', endTime: '17:00', cost: 100 },
        { title: 'Sunset Viewpoint', day: 2, startTime: '17:30', endTime: '18:30', notes: 'Best spot for city views' },
        { title: 'Check-out & Departure', day: 3, startTime: '11:00', endTime: '12:00' }
      ]
    },
    {
      id: 'beach-vacation',
      title: 'Beach Vacation',
      description: 'Relaxing beach getaway for 5-7 days',
      icon: '🏖️',
      budget: { totalEstimated: 1200, currency: 'USD' },
      itinerary: [
        { title: 'Airport Transfer & Check-in', day: 1, startTime: '14:00', endTime: '16:00', cost: 50 },
        { title: 'Beach Relaxation', day: 1, startTime: '16:30', endTime: '18:30', notes: 'First taste of the beach' },
        { title: 'Beachfront Dinner', day: 1, startTime: '19:00', endTime: '21:00', cost: 80 },
        { title: 'Beach Activities', day: 2, startTime: '09:00', endTime: '12:00', cost: 60, notes: 'Water sports, volleyball' },
        { title: 'Spa Treatment', day: 2, startTime: '14:00', endTime: '16:00', cost: 150 },
        { title: 'Boat Trip', day: 3, startTime: '09:00', endTime: '17:00', cost: 100, notes: 'Island hopping or coastal tour' },
        { title: 'Local Market Visit', day: 4, startTime: '10:00', endTime: '12:00', cost: 40 },
        { title: 'Beach Yoga', day: 4, startTime: '07:00', endTime: '08:00', cost: 25 },
        { title: 'Farewell Dinner', day: 5, startTime: '19:00', endTime: '21:00', cost: 120 }
      ]
    },
    {
      id: 'adventure-mountain',
      title: 'Mountain Adventure',
      description: 'Outdoor adventure for nature lovers',
      icon: '⛰️',
      budget: { totalEstimated: 800, currency: 'USD' },
      itinerary: [
        { title: 'Arrive & Gear Check', day: 1, startTime: '12:00', endTime: '14:00', cost: 100, notes: 'Rent/check hiking equipment' },
        { title: 'Easy Trail Hike', day: 1, startTime: '15:00', endTime: '17:30', notes: 'Acclimatization hike' },
        { title: 'Campfire Dinner', day: 1, startTime: '18:30', endTime: '20:00', cost: 30 },
        { title: 'Sunrise Hike', day: 2, startTime: '05:30', endTime: '09:00', notes: 'Best viewpoint for sunrise' },
        { title: 'Mountain Biking', day: 2, startTime: '14:00', endTime: '17:00', cost: 80 },
        { title: 'Rock Climbing', day: 3, startTime: '09:00', endTime: '15:00', cost: 120, notes: 'Guided climbing session' },
        { title: 'Hot Springs Visit', day: 3, startTime: '16:00', endTime: '18:00', cost: 45 },
        { title: 'Scenic Drive', day: 4, startTime: '10:00', endTime: '16:00', cost: 60, notes: 'Mountain passes and viewpoints' }
      ]
    },
    {
      id: 'cultural-heritage',
      title: 'Cultural Heritage Tour',
      description: 'Deep dive into local culture and history',
      icon: '🏛️',
      budget: { totalEstimated: 900, currency: 'USD' },
      itinerary: [
        { title: 'Historical City Center Tour', day: 1, startTime: '09:00', endTime: '13:00', cost: 40, notes: 'Guided walking tour' },
        { title: 'Traditional Lunch', day: 1, startTime: '13:30', endTime: '15:00', cost: 35 },
        { title: 'Art Museum Visit', day: 1, startTime: '15:30', endTime: '18:00', cost: 25 },
        { title: 'Cultural Performance', day: 1, startTime: '19:30', endTime: '21:30', cost: 60 },
        { title: 'Archaeological Site Visit', day: 2, startTime: '08:00', endTime: '14:00', cost: 50 },
        { title: 'Local Craft Workshop', day: 2, startTime: '15:00', endTime: '17:00', cost: 75, notes: 'Learn traditional crafts' },
        { title: 'Religious Site Tour', day: 3, startTime: '09:00', endTime: '12:00', cost: 20 },
        { title: 'Traditional Market', day: 3, startTime: '14:00', endTime: '16:00', cost: 50, notes: 'Local products and souvenirs' },
        { title: 'Cooking Class', day: 3, startTime: '17:00', endTime: '20:00', cost: 85 }
      ]
    }
  ];

  useEffect(() => {
    loadUserTemplates();
  }, []);

  const loadUserTemplates = async () => {
    try {
      // In the future, this would load user's saved templates from the server
      // For now, we'll just use predefined templates
      setTemplates(predefinedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setMessage('Failed to load templates');
      setTemplates(predefinedTemplates);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4">
          <LoadingSpinner message="Loading templates..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
            Choose a Trip Template
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">{message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                onClick={() => handleSelectTemplate(template)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.icon}</div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                          {template.title}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-300">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600 dark:text-secondary-300">
                        Duration:
                      </span>
                      <span className="font-medium text-secondary-900 dark:text-secondary-100">
                        {Math.max(...template.itinerary.map(item => item.day || 1))} days
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600 dark:text-secondary-300">
                        Activities:
                      </span>
                      <span className="font-medium text-secondary-900 dark:text-secondary-100">
                        {template.itinerary.length} items
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600 dark:text-secondary-300">
                        Est. Budget:
                      </span>
                      <span className="font-medium text-secondary-900 dark:text-secondary-100">
                        {template.budget.currency} {template.budget.totalEstimated.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      Click to use this template as a starting point for your trip
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripTemplates;