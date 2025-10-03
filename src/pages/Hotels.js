import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import HotelCard from '../components/HotelCard';
import HotelDetailsModal from '../components/HotelDetailsModal';
import HotelComparisonModal from '../components/HotelComparisonModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { hotelsAPI } from '../services/api';

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    }
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const Hotels = () => {
  const [searchForm, setSearchForm] = useState({
    destination: '',
    cityCode: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    rooms: 1
  });

  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [offers, setOffers] = useState({});
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonHotels, setComparisonHotels] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    starRating: 0,
    amenities: [],
    maxDistance: 10,
    sortBy: 'relevance' // relevance, price, distance, rating
  });

  // Set default dates (today + 1 day to today + 2 days)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    setSearchForm(prev => ({
      ...prev,
      checkInDate: tomorrow.toISOString().split('T')[0],
      checkOutDate: dayAfter.toISOString().split('T')[0]
    }));
  }, []);

  // Debounced city search
  const searchCities = useMemo(() => 
    debounce(async (keyword) => {
      if (keyword.length < 2) {
        setCitySuggestions([]);
        return;
      }

      try {
        const response = await hotelsAPI.searchCities(keyword);
        setCitySuggestions(response.data.cities || []);
      } catch (err) {
        console.error('City search error:', err);
        setCitySuggestions([]);
      }
    }, 300),
    [] // Empty dependency array since debounce creates the function once
  );

  const handleDestinationChange = (value) => {
    setSearchForm(prev => ({ ...prev, destination: value, cityCode: '' }));
    setShowSuggestions(true);
    searchCities(value);
  };

  const handleCitySelect = (city) => {
    setSearchForm(prev => ({
      ...prev,
      destination: city.detailedName || city.name,
      cityCode: city.iataCode
    }));
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleFormChange = (field, value) => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    if (!searchForm.cityCode || !searchForm.checkInDate || !searchForm.checkOutDate) {
      setError('Please fill in all required fields');
      return;
    }

    setSearching(true);
    setError(null);
    setHotels([]);

    try {
      const searchParams = {
        cityCode: searchForm.cityCode,
        checkInDate: searchForm.checkInDate,
        checkOutDate: searchForm.checkOutDate,
        adults: searchForm.adults,
        rooms: searchForm.rooms
      };

      const response = await hotelsAPI.searchHotels(searchParams);
      const hotelData = response.data.hotels || [];
      setHotels(hotelData);
      setFilteredHotels(hotelData);

      if (response.data.source === 'sample_data') {
        setError('Using sample data - Amadeus API unavailable');
      }
    } catch (err) {
      console.error('Hotel search error:', err);
      setError('Failed to search hotels. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Filter and sort hotels
  const applyFiltersAndSort = useCallback((hotelsToFilter, currentFilters) => {
    let filtered = [...hotelsToFilter];

    // Filter by distance
    if (currentFilters.maxDistance < 50) {
      filtered = filtered.filter(hotel => 
        !hotel.distance || hotel.distance.value <= currentFilters.maxDistance
      );
    }

    // Filter by star rating
    if (currentFilters.starRating > 0) {
      // Since we don't have actual star ratings, we'll use relevance as a proxy
      const minRelevance = currentFilters.starRating * 2; // 1-5 stars -> 2-10 relevance
      filtered = filtered.filter(hotel => 
        hotel.relevance && hotel.relevance >= minRelevance
      );
    }

    // Get hotel prices for filtering
    const getHotelPrice = (hotelId) => {
      const hotelOffers = offers[hotelId] || [];
      if (hotelOffers.length === 0) return null;
      const allPrices = hotelOffers.flatMap(offer => offer.offers || []).map(o => parseFloat(o.price?.total || 0));
      return allPrices.length > 0 ? Math.min(...allPrices) : null;
    };

    // Filter by price range (only if hotel has offers)
    filtered = filtered.filter(hotel => {
      const price = getHotelPrice(hotel.id);
      if (price === null) return true; // Include hotels without price data
      return price >= currentFilters.priceRange[0] && price <= currentFilters.priceRange[1];
    });

    // Sort hotels
    switch (currentFilters.sortBy) {
      case 'price':
        filtered.sort((a, b) => {
          const priceA = getHotelPrice(a.id) || 999999;
          const priceB = getHotelPrice(b.id) || 999999;
          return priceA - priceB;
        });
        break;
      case 'distance':
        filtered.sort((a, b) => {
          const distA = a.distance?.value || 999;
          const distB = b.distance?.value || 999;
          return distA - distB;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        break;
      case 'relevance':
      default:
        filtered.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        break;
    }

    return filtered;
  }, [offers]);

  // Apply filters whenever hotels, offers, or filters change
  React.useEffect(() => {
    const filtered = applyFiltersAndSort(hotels, filters);
    setFilteredHotels(filtered);
  }, [hotels, offers, filters, applyFiltersAndSort]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      starRating: 0,
      amenities: [],
      maxDistance: 10,
      sortBy: 'relevance'
    });
  };

  const handleGetOffers = async (hotelId) => {
    try {
      const offerParams = {
        hotelIds: hotelId,
        checkInDate: searchForm.checkInDate,
        checkOutDate: searchForm.checkOutDate,
        adults: searchForm.adults,
        rooms: searchForm.rooms
      };

      const response = await hotelsAPI.getOffers(offerParams);
      setOffers(prev => ({
        ...prev,
        [hotelId]: response.data.offers || []
      }));
    } catch (err) {
      console.error('Get offers error:', err);
      setError('Failed to get hotel offers');
    }
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedHotel(null);
  };

  const toggleHotelComparison = (hotel) => {
    setComparisonHotels(prev => {
      const isAlreadySelected = prev.find(h => h.id === hotel.id);
      if (isAlreadySelected) {
        return prev.filter(h => h.id !== hotel.id);
      } else if (prev.length < 3) {
        return [...prev, hotel];
      }
      return prev; // Don't add if already at max (3 hotels)
    });
  };


  const isHotelInComparison = (hotelId) => {
    return comparisonHotels.some(h => h.id === hotelId);
  };

  return (
    <Layout>
      {/* Hero Section - Full Screen with Background */}
      <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat opacity-20"></div>
        </div>

        {/* Palm Tree Silhouettes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 bottom-0 w-32 h-64 bg-gradient-to-t from-black/40 to-transparent transform -rotate-12 opacity-60"></div>
          <div className="absolute right-0 bottom-0 w-40 h-72 bg-gradient-to-t from-black/40 to-transparent transform rotate-6 opacity-60"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Title - exact match */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Search for hotel and Airbnb stays in one place
            </h1>
            
            {/* Subtitle - exact match */}
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience a better hotel search that helps you find the perfect lodging, with
              <br className="hidden md:block" />
              your preferences as the highest priority.
            </p>

            {/* Search Form Container - Wanderlog Style */}
            <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Where Field */}
                <div className="md:col-span-1 relative">
                  <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Where
                    </label>
                    <input
                      type="text"
                      value={searchForm.destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      placeholder="Search destinations"
                      className="w-full text-lg font-medium text-gray-900 placeholder-gray-400 border-0 bg-transparent focus:ring-0 focus:outline-none p-0"
                    />
                    
                    {/* City Suggestions */}
                    {showSuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {citySuggestions.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => handleCitySelect(city)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="font-medium text-gray-900">
                              {city.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {city.address?.countryName || city.detailedName}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* When Field */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-0">
                    {/* Check-in */}
                    <div className="p-4 rounded-l-xl hover:bg-gray-50 transition-colors border-r border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        When
                      </label>
                      <input
                        type="date"
                        value={searchForm.checkInDate}
                        onChange={(e) => handleFormChange('checkInDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full text-lg font-medium text-gray-900 border-0 bg-transparent focus:ring-0 focus:outline-none p-0"
                      />
                    </div>
                    
                    {/* Check-out */}
                    <div className="p-4 rounded-r-xl hover:bg-gray-50 transition-colors">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        &nbsp;
                      </label>
                      <input
                        type="date"
                        value={searchForm.checkOutDate}
                        onChange={(e) => handleFormChange('checkOutDate', e.target.value)}
                        min={searchForm.checkInDate}
                        className="w-full text-lg font-medium text-gray-900 border-0 bg-transparent focus:ring-0 focus:outline-none p-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Travelers Field */}
                <div className="md:col-span-1 flex items-center">
                  <div className="p-4 rounded-xl hover:bg-gray-50 transition-colors flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Travelers
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🏠</span>
                      <span className="text-lg font-medium text-gray-900">{searchForm.adults}</span>
                      <span className="text-2xl">👥</span>
                      <span className="text-lg font-medium text-gray-900">2</span>
                      <select
                        value={searchForm.adults}
                        onChange={(e) => handleFormChange('adults', parseInt(e.target.value))}
                        className="ml-2 border-0 bg-transparent focus:ring-0 focus:outline-none p-0 text-lg font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Search Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searching ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>
            
            {/* Already booked section */}
            <div className="mt-8 text-center">
              <p className="text-white/80 text-sm">
                Already booked? <span className="text-white font-medium hover:underline cursor-pointer">Manage your bookings</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  ⚠️ {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {searching ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" message="Searching for hotels..." />
          </div>
        ) : hotels.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                  {filteredHotels.length !== hotels.length ? (
                    <>{filteredHotels.length} of {hotels.length} hotel{hotels.length !== 1 ? 's' : ''}</>
                  ) : (
                    <>Found {hotels.length} hotel{hotels.length !== 1 ? 's' : ''}</>
                  )}
                </h2>
                <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                  {searchForm.destination} • {searchForm.checkInDate} to {searchForm.checkOutDate}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    showFilters
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-700 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Filters
                </button>
                {comparisonHotels.length > 0 && (
                  <button
                    onClick={() => setShowComparison(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Compare ({comparisonHotels.length})
                  </button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 mb-6 border border-secondary-200 dark:border-secondary-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                      className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-300 dark:bg-secondary-800 dark:text-secondary-100"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="distance">Distance</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.starRating}
                      onChange={(e) => handleFilterChange({ starRating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-300 dark:bg-secondary-800 dark:text-secondary-100"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={1}>1+ Stars</option>
                      <option value={2}>2+ Stars</option>
                      <option value={3}>3+ Stars</option>
                      <option value={4}>4+ Stars</option>
                      <option value={5}>5 Stars</option>
                    </select>
                  </div>

                  {/* Max Distance */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Distance from Center
                    </label>
                    <select
                      value={filters.maxDistance}
                      onChange={(e) => handleFilterChange({ maxDistance: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-300 dark:bg-secondary-800 dark:text-secondary-100"
                    >
                      <option value={1}>Within 1 KM</option>
                      <option value={2}>Within 2 KM</option>
                      <option value={5}>Within 5 KM</option>
                      <option value={10}>Within 10 KM</option>
                      <option value={20}>Within 20 KM</option>
                      <option value={50}>Any Distance</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Price Range (EUR)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => handleFilterChange({ 
                          priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] 
                        })}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-300 dark:bg-secondary-800 dark:text-secondary-100"
                      />
                      <span className="text-secondary-500">-</span>
                      <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange({ 
                          priceRange: [filters.priceRange[0], parseInt(e.target.value) || 1000] 
                        })}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-300 dark:bg-secondary-800 dark:text-secondary-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <div className="text-sm text-secondary-600 dark:text-secondary-300">
                    {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} match your criteria
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  offers={offers[hotel.id] || []}
                  onSelectHotel={handleSelectHotel}
                  onGetOffers={handleGetOffers}
                  onToggleComparison={toggleHotelComparison}
                  isInComparison={isHotelInComparison(hotel.id)}
                  canAddToComparison={comparisonHotels.length < 3}
                  searchParams={searchForm}
                />
              ))}
            </div>
          </div>
        ) : !searching && searchForm.destination && (
          <div className="text-center py-20">
            <div className="text-secondary-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              No hotels found
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300">
              Try adjusting your search criteria or selecting a different destination.
            </p>
          </div>
        )}
        </div>
      </div>

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        hotel={selectedHotel}
        offers={selectedHotel ? offers[selectedHotel.id] || [] : []}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        onGetOffers={handleGetOffers}
        searchParams={searchForm}
      />

      {/* Hotel Comparison Modal */}
      <HotelComparisonModal
        hotels={comparisonHotels}
        offers={offers}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        searchParams={searchForm}
      />
    </Layout>
  );
};

export default Hotels;
