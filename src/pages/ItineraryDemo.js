import React from 'react';
import ItineraryMapView from '../components/ItineraryMapView';

const ItineraryDemo = () => {
  // Sample trip data for demonstration
  const sampleTripData = {
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
          },
          {
            _id: 'p4',
            name: "Ala Moana Beach Park",
            description: 'Beautiful local beach with great sunset views',
            address: "Honolulu, HI",
            lat: 21.2906,
            lng: -157.8431,
            image: 'https://images.unsplash.com/photo-1580168673625-71a8e2b7b999?w=400&h=300&fit=crop',
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
          },
          {
            _id: 'p5',
            name: "Manoa Falls",
            description: 'Scenic waterfall hike through lush rainforest',
            address: "Honolulu, HI",
            lat: 21.3314,
            lng: -157.7992,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            type: 'nature'
          }
        ]
      }
    ]
  };

  const handleTripUpdate = (updatedTrip) => {
    console.log('Trip updated:', updatedTrip);
    // Handle trip updates here
  };

  return (
    <div>
      <ItineraryMapView 
        tripData={sampleTripData}
        onUpdateTrip={handleTripUpdate}
      />
    </div>
  );
};

export default ItineraryDemo;