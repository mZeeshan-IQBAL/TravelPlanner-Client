import { useState, useCallback } from 'react';
import { tripsAPI } from '../services/api';

const useTrip = (initialTripData = null) => {
  const [tripData, setTripData] = useState(initialTripData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a place to a specific day
  const addPlaceToDay = useCallback((place, dayNumber) => {
    setTripData(prevTrip => {
      if (!prevTrip) return prevTrip;

      const updatedDays = prevTrip.days.map(day => {
        if (day.day === dayNumber) {
          const newPlace = {
            _id: place.providerId || `temp-${Date.now()}`,
            name: place.name,
            description: place.description || '',
            address: place.address,
            lat: place.lat,
            lng: place.lng,
            type: place.type || place.category,
            addedAt: new Date().toISOString()
          };
          
          return {
            ...day,
            places: [...(day.places || []), newPlace]
          };
        }
        return day;
      });

      return {
        ...prevTrip,
        days: updatedDays
      };
    });

    // If this is a real trip (has an ID), save to backend
    if (tripData && tripData._id && tripData._id !== '1') {
      // TODO: Save to backend
      console.log('Saving trip to backend...');
    }
  }, [tripData]);

  // Remove a place from a day
  const removePlaceFromDay = useCallback((placeId, dayNumber) => {
    setTripData(prevTrip => {
      if (!prevTrip) return prevTrip;

      const updatedDays = prevTrip.days.map(day => {
        if (day.day === dayNumber) {
          return {
            ...day,
            places: day.places.filter(place => place._id !== placeId)
          };
        }
        return day;
      });

      return {
        ...prevTrip,
        days: updatedDays
      };
    });
  }, []);

  // Reorder places within a day
  const reorderPlacesInDay = useCallback((dayNumber, startIndex, endIndex) => {
    setTripData(prevTrip => {
      if (!prevTrip) return prevTrip;

      const updatedDays = prevTrip.days.map(day => {
        if (day.day === dayNumber) {
          const reorderedPlaces = Array.from(day.places);
          const [removed] = reorderedPlaces.splice(startIndex, 1);
          reorderedPlaces.splice(endIndex, 0, removed);

          return {
            ...day,
            places: reorderedPlaces
          };
        }
        return day;
      });

      return {
        ...prevTrip,
        days: updatedDays
      };
    });
  }, []);

  // Move a place from one day to another
  const movePlaceBetweenDays = useCallback((placeId, fromDay, toDay) => {
    setTripData(prevTrip => {
      if (!prevTrip) return prevTrip;

      let placeToMove = null;
      const updatedDays = prevTrip.days.map(day => {
        if (day.day === fromDay) {
          const place = day.places.find(p => p._id === placeId);
          if (place) {
            placeToMove = place;
            return {
              ...day,
              places: day.places.filter(p => p._id !== placeId)
            };
          }
        }
        return day;
      });

      if (placeToMove) {
        const finalUpdatedDays = updatedDays.map(day => {
          if (day.day === toDay) {
            return {
              ...day,
              places: [...day.places, placeToMove]
            };
          }
          return day;
        });

        return {
          ...prevTrip,
          days: finalUpdatedDays
        };
      }

      return prevTrip;
    });
  }, []);

  // Add a new day to the trip
  const addDay = useCallback(() => {
    setTripData(prevTrip => {
      if (!prevTrip) return prevTrip;

      const nextDayNumber = Math.max(...prevTrip.days.map(d => d.day)) + 1;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + nextDayNumber - 1);

      const newDay = {
        day: nextDayNumber,
        date: nextDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        places: []
      };

      return {
        ...prevTrip,
        days: [...prevTrip.days, newDay]
      };
    });
  }, []);

  // Remove a day from the trip
  const removeDay = useCallback((dayNumber) => {
    setTripData(prevTrip => {
      if (!prevTrip || prevTrip.days.length <= 1) return prevTrip;

      const updatedDays = prevTrip.days
        .filter(day => day.day !== dayNumber)
        .map((day, index) => ({
          ...day,
          day: index + 1 // Renumber days
        }));

      return {
        ...prevTrip,
        days: updatedDays
      };
    });
  }, []);

  // Save trip to backend
  const saveTrip = useCallback(async () => {
    if (!tripData) return;

    try {
      setLoading(true);
      setError(null);

      let savedTrip;
      if (tripData._id && tripData._id !== '1') {
        // Update existing trip
        const response = await tripsAPI.update(tripData._id, tripData);
        savedTrip = response.data.data;
      } else {
        // Create new trip
        const response = await tripsAPI.create(tripData);
        savedTrip = response.data.data;
      }

      setTripData(savedTrip);
      return savedTrip;
    } catch (err) {
      setError(err.message || 'Failed to save trip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tripData]);

  // Load trip from backend
  const loadTrip = useCallback(async (tripId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await tripsAPI.getById(tripId);
      const trip = response.data.data;
      
      setTripData(trip);
      return trip;
    } catch (err) {
      setError(err.message || 'Failed to load trip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new trip
  const createTrip = useCallback(async (tripInfo) => {
    try {
      setLoading(true);
      setError(null);

      const newTrip = {
        title: tripInfo.title || 'My Trip',
        location: tripInfo.location || '',
        startDate: tripInfo.startDate || new Date().toISOString().split('T')[0],
        endDate: tripInfo.endDate || new Date().toISOString().split('T')[0],
        days: tripInfo.days || [
          {
            day: 1,
            date: new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            places: []
          }
        ]
      };

      const response = await tripsAPI.create(newTrip);
      const savedTrip = response.data.data;
      
      setTripData(savedTrip);
      return savedTrip;
    } catch (err) {
      setError(err.message || 'Failed to create trip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tripData,
    loading,
    error,
    addPlaceToDay,
    removePlaceFromDay,
    reorderPlacesInDay,
    movePlaceBetweenDays,
    addDay,
    removeDay,
    saveTrip,
    loadTrip,
    createTrip,
    setTripData
  };
};

export default useTrip;