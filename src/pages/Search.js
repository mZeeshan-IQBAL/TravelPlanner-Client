import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import AdvancedSearch from '../components/AdvancedSearch';
import { countriesAPI, imagesAPI, weatherAPI, tripsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery();
  const initialQ = query.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // selected country
  const [weather, setWeather] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const { user, addToSearchHistory } = useAuth();

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  const doSearch = async (term) => {
    if (!term || term.trim().length < 2) return;
    setLoading(true);
    setMessage('');
    setSelected(null);
    setWeather(null);
    setPhotos([]);
    try {
      console.log('Searching for:', term.trim(), 'User:', user ? 'authenticated' : 'guest');
      
      // Use public search for guests, private search for authenticated users
      const resp = user 
        ? await countriesAPI.search(term.trim())
        : await countriesAPI.publicSearch(term.trim());
      
      console.log('Search response:', resp.data);
      
      const countries = resp.data.data || [];
      setResults(countries);
      
      if (countries.length === 0) {
        setMessage(`No countries found matching "${term.trim()}". Try a different spelling or country name.`);
      } else {
        setMessage('');
      }
      
      // Only add to search history for authenticated users
      if (user) {
        addToSearchHistory(term.trim()).catch(() => {});
      }
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
      
      // Better error messages based on error type
      if (err.status === 404) {
        setMessage(`No countries found matching "${term.trim()}". Please check your spelling and try again.`);
      } else if (err.status === 401) {
        setMessage('Please log in to search for countries.');
      } else if (err.status >= 500) {
        setMessage('Our search service is temporarily unavailable. Please try again in a moment.');
      } else {
        setMessage(err.message || `Unable to search for "${term.trim()}". Please check your internet connection and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (country) => {
    setSelected(country);
    setWeather(null);
    setPhotos([]);
    setMessage('');
    
    // Only load weather and photos for authenticated users
    if (user) {
      try {
        if (country.capital && country.capital !== 'N/A') {
          const w = await weatherAPI.getCurrent(country.capital);
          setWeather(w.data.data);
        }
      } catch (err) {
        setWeather(null);
      }
      try {
        const img = await imagesAPI.getCountryImages(country.name, 6);
        setPhotos(img.data.data.images || []);
      } catch (err) {
        setPhotos([]);
      }
    }
  };

  const saveTrip = async (country) => {
    try {
      const payload = {
        title: `${country.name} Trip`,
        country: {
          name: country.name,
          capital: country.capital,
          population: country.population,
          currency: country.currencies?.[0]?.name || country.currencies?.[0]?.code,
          flag: country.flag || country.flagUrl,
          region: country.region,
          subregion: country.subregion,
          languages: country.languages || [],
          timezones: country.timezones || [],
        },
        weather: weather
          ? {
              current: {
                temperature: weather.temperature,
                description: weather.description,
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                icon: weather.icon,
              },
            }
          : undefined,
        images: photos?.slice(0, 4).map((p) => ({
          url: p.url || p.small,
          altDescription: p.altDescription,
          photographer: p.photographer?.name,
          photographerUrl: p.photographer?.profileUrl,
        })),
      };
      await tripsAPI.create(payload);
      setMessage('✅ Trip saved successfully. Check My Trips!');
    } catch (err) {
      setMessage(err.message || 'Failed to save trip.');
    }
  };

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  return (
    <Layout>
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-wanderlog-orange via-primary-500 to-wanderlog-blue py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Search destinations, explore countries, and plan unforgettable trips
          </p>
          
          {/* Modern Search Bar */}
          <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl p-2 max-w-2xl mx-auto border border-secondary-100 dark:border-secondary-700">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && canSearch && !loading && doSearch(q)}
                  placeholder="Where do you want to go? (e.g., France, Japan, Brazil)"
className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:outline-none focus:ring-0 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 bg-transparent"
                />
              </div>
              <button
                className={`px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 ${
                  canSearch && !loading
                    ? 'bg-gradient-to-r from-primary-500 to-wanderlog-orange text-white hover:from-primary-600 hover:to-wanderlog-orange shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                }`}
                disabled={!canSearch || loading}
                onClick={() => doSearch(q)}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  '🚀 Explore'
                )}
              </button>
            </div>
          </div>
          
          {message && (
            <div className={`mt-4 p-4 rounded-xl text-sm font-medium ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}>
              <div className="flex items-start space-x-2">
                <span className="mt-0.5">
                  {message.includes('✅') ? '✅' : '⚠️'}
                </span>
                <div>
                  <div className="font-medium">{message}</div>
                  {message.includes('log in') && (
                    <div className="mt-2 text-xs opacity-90">
                      <Link to="/login" className="underline hover:no-underline">
                        Click here to log in
                      </Link>
                      {' or '}
                      <Link to="/register" className="underline hover:no-underline">
                        create an account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Notice */}
        {!user && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Enhanced Search with Account
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  <p className="mb-2">
                    You can search countries without an account, but{' '}
                    <Link to="/register" className="font-medium underline hover:no-underline">
                      creating a free account
                    </Link>
                    {' '}gives you access to:
                  </p>
                  <ul className="text-xs space-y-1 ml-4">
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                      Save trips and build your travel collection
                    </li>
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                      Weather information and photo galleries
                    </li>
                    <li className="flex items-center">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                      Search history and personalized suggestions
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              Search Results
            </h2>
            {results.length > 0 && (
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {results.length} destinations found
              </span>
            )}
          </div>
          <Link 
            to="/my-trips" 
            className="flex items-center space-x-2 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 px-4 py-2 rounded-xl border border-secondary-200 dark:border-secondary-600 transition-all duration-200 text-secondary-700 dark:text-secondary-300"
          >
            <span>✈️</span>
            <span>My Trips</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Advanced Trip Search */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
            Advanced Trip Search
          </h2>
          <AdvancedSearch
            initialQuery={initialQ}
            onResults={({ trips, pagination, query, error }) => {
              // For now, just log. You can display results in a separate section.
              if (error) {
                console.warn('Advanced search error:', error);
              }
              // You could set local state to show these results
            }}
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-medium text-secondary-600 dark:text-secondary-400">Searching amazing destinations...</p>
          </div>
        ) : results.length === 0 && q.length >= 2 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌍</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
              No destinations found for "{q}"
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {message && message.includes('found') 
                ? 'The search returned no results. This might be because:'
                : 'Try a different approach:'}
            </p>
            
            <div className="max-w-md mx-auto text-left bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h4 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-3">💡 Search Tips:</h4>
              <ul className="text-sm text-secondary-600 dark:text-secondary-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  Try the country's common name (e.g., "USA" instead of "United States")
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  Check spelling - try "France", "Germany", "Japan", "Brazil"
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">•</span>
                  Use single country names rather than cities or regions
                </li>
              </ul>
            </div>
            
            <div className="mt-8">
              <p className="text-secondary-500 text-sm mb-4">Try these popular destinations:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['France', 'Japan', 'Italy', 'Spain', 'Thailand', 'Australia'].map((country) => (
                  <button
                    key={country}
                    onClick={() => {
                      setQ(country);
                      doSearch(country);
                    }}
                    className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {results.map((c, idx) => (
              <div key={idx} className="group bg-white dark:bg-secondary-800 rounded-3xl shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-1 border border-secondary-100 dark:border-secondary-700 overflow-hidden">
                {/* Country Header */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                          {c.name}
                        </h3>
                        <span className="text-3xl">{c.flag || c.flagUrl || '🌍'}</span>
                      </div>
                      <div className="space-y-2 text-secondary-600 dark:text-secondary-400">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">📍</span>
                          <span>{c.region}{c.subregion ? ` • ${c.subregion}` : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">🏢</span>
                          <span>Capital: {c.capital || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">👥</span>
                          <span>Population: {c.population?.toLocaleString?.() || c.population || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        selected?.name === c.name
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'bg-secondary-100 hover:bg-primary-50 text-secondary-700 hover:text-primary-600 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-primary-900/20 dark:hover:text-primary-300'
                      }`}
                      onClick={() => selected?.name === c.name ? setSelected(null) : loadDetails(c)}
                    >
                      {selected?.name === c.name ? '⬆️ Hide Details' : '🔍 View Details'}
                    </button>
                  </div>
                  
                  {/* Expanded Details */}
                  {selected?.name === c.name && (
                    <div className="space-y-6 pt-6 border-t border-secondary-100 dark:border-secondary-700 animate-slide-up">
                      {/* Weather Info - Only for authenticated users */}
                      {user && weather && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white dark:bg-secondary-800 rounded-xl flex items-center justify-center shadow-soft">
                              <span className="text-2xl">🌤️</span>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                                Weather in {weather.city}
                              </h4>
                              <p className="text-secondary-600 dark:text-secondary-300">
                                {weather.description} • {weather.temperature}°C
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                                <span>💧 {weather.humidity}% humidity</span>
                                <span>💨 {weather.windSpeed} km/h</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Account Prompt for Weather - Only for guests */}
                      {!user && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">🌤️</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                                Weather & Photos Available
                              </h4>
                              <p className="text-secondary-600 dark:text-secondary-300 mb-3">
                                Sign up to see current weather in {c.capital} and beautiful photos of {c.name}
                              </p>
                              <Link
                                to="/register"
                                className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                              >
                                Create free account →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Photo Gallery - Only for authenticated users */}
                      {user && photos?.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-secondary-900 dark:text-secondary-100 mb-4">
                            📸 Destination Photos
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            {photos.slice(0, 6).map((p, index) => (
                              <div key={p.id || index} className="aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-shadow duration-200">
                                <img 
                                  src={p.small || p.thumb || p.url} 
                                  alt={p.altDescription || `${c.name} photo ${index + 1}`} 
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                                />
                              </div>
                            ))}
                          </div>
                          {photos[0]?.photographer && (
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                              Photos by {photos[0].photographer.name}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        {user ? (
                          <>
                            <button 
                              className="flex-1 bg-gradient-to-r from-primary-500 to-wanderlog-orange text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-wanderlog-orange transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-lg"
                              onClick={() => saveTrip(c)}
                            >
                              <span className="flex items-center justify-center space-x-2">
                                <span>💾</span>
                                <span>Save to My Trips</span>
                              </span>
                            </button>
                            {photos?.[0]?.htmlUrl && (
                              <a 
                                href={photos[0].htmlUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-6 py-4 rounded-xl font-bold hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-all duration-200 border-2 border-secondary-200 dark:border-secondary-600 hover:border-primary-300 dark:hover:border-primary-600"
                              >
                                <span className="flex items-center justify-center space-x-2">
                                  <span>🖼️</span>
                                  <span>View More Photos</span>
                                </span>
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <Link
                              to="/register" 
                              className="flex-1 bg-gradient-to-r from-primary-500 to-wanderlog-orange text-white px-6 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-wanderlog-orange transition-all duration-200 transform hover:scale-105 shadow-soft hover:shadow-lg"
                            >
                              <span className="flex items-center justify-center space-x-2">
                                <span>🚀</span>
                                <span>Sign Up to Save Trips</span>
                              </span>
                            </Link>
                            <a 
                              href={c.maps?.googleMaps || `https://www.google.com/maps/search/${encodeURIComponent(c.name)}`}
                              target="_blank" 
                              rel="noreferrer"
                              className="flex-1 bg-white dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 px-6 py-4 rounded-xl font-bold hover:bg-secondary-50 dark:hover:bg-secondary-600 transition-all duration-200 border-2 border-secondary-200 dark:border-secondary-600 hover:border-primary-300 dark:hover:border-primary-600"
                            >
                              <span className="flex items-center justify-center space-x-2">
                                <span>🗺️</span>
                                <span>View on Maps</span>
                              </span>
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
