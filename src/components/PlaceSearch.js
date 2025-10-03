import React, { useState, useEffect, useRef } from 'react';
import { placesAPI } from '../services/api';

const PlaceSearch = ({ onPlaceSelect, onAddPlace, placeholder = "Enter a location" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeout = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(() => {
      searchPlaces(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const searchPlaces = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await placesAPI.search({ q: searchQuery });
      if (response.data && response.data.data) {
        setResults(response.data.data.slice(0, 8)); // Limit to 8 results
        setShowResults(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('Place search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handlePlaceSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handlePlaceSelect = (place) => {
    setQuery(place.name);
    setShowResults(false);
    setSelectedIndex(-1);
    
    // Call the callback functions
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const handleAddPlace = (place) => {
    if (onAddPlace) {
      onAddPlace(place);
    }
    handlePlaceSelect(place);
  };

  const getPlaceIcon = (type) => {
    const iconMap = {
      restaurant: '🍽️',
      lodging: '🏨',
      tourist_attraction: '🎯',
      museum: '🏛️',
      park: '🌳',
      beach: '🏖️',
      shopping_mall: '🛍️',
      hospital: '🏥',
      bank: '🏦',
      gas_station: '⛽',
      default: '📍'
    };
    return iconMap[type] || iconMap.default;
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') {
      return address.length > 50 ? address.substring(0, 50) + '...' : address;
    }
    return '';
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        
        <div className="absolute right-3 top-3 flex space-x-1">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          ) : (
            <>
              <button 
                className="p-1 hover:bg-orange-100 rounded text-orange-600 hover:text-orange-700 transition-colors" 
                title="Auto-fill suggestions"
                onClick={() => {
                  const suggestions = ['restaurants near me', 'tourist attractions', 'hotels', 'museums', 'parks'];
                  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                  setQuery(randomSuggestion);
                  searchPlaces(randomSuggestion);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {results.map((place, index) => (
            <div
              key={place.providerId || index}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                selectedIndex === index ? 'bg-orange-50 border-orange-200' : ''
              }`}
              onClick={() => handlePlaceSelect(place)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlaceIcon(place.type)}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {place.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatAddress(place.address)}
                      </p>
                      {place.category && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {place.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {onAddPlace && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddPlace(place);
                    }}
                    className="ml-2 w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                    title="Add to itinerary"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && !isLoading && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          <p className="text-sm">No places found for "{query}"</p>
          <p className="text-xs mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;