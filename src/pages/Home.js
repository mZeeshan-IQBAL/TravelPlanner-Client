import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FeaturesShowcase from '../components/FeaturesShowcase';
import SimpleVideoShowcase from '../components/SimpleVideoShowcase';
import TestimonialsSection from '../components/TestimonialsSection';
import FeaturedDestinations from '../components/FeaturedDestinations';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickDestinations = [
    { name: 'Paris', flag: '🇫🇷', desc: 'City of Light' },
    { name: 'Tokyo', flag: '🇯🇵', desc: 'Modern metropolis' },
    { name: 'New York', flag: '🇺🇸', desc: 'The Big Apple' },
    { name: 'London', flag: '🇬🇧', desc: 'Historic charm' },
    { name: 'Rome', flag: '🇮🇹', desc: 'Eternal City' },
    { name: 'Sydney', flag: '🇦🇺', desc: 'Harbor city' }
  ];

  return (
    <Layout>

      {/* Hero Section - Enhanced with Search */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              Plan amazing trips with{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-wanderlog-orange to-primary-600">AI-powered insights</span>
            </h1>
            
            <p className="text-lg md:text-xl text-secondary-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover destinations, create detailed itineraries, track expenses, and collaborate with friends — all in one beautiful platform.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleQuickSearch} className="relative">
                <div className="flex items-center bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-gray-200 dark:border-secondary-700 p-2 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Where do you want to go? Try 'Paris', 'Japan', 'Italy'..."
className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-l-xl focus:outline-none focus:ring-0 text-secondary-900 dark:text-secondary-100 placeholder-secondary-500 dark:placeholder-secondary-400 bg-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-wanderlog-orange to-primary-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-orange-600 hover:to-primary-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    disabled={!searchQuery.trim()}
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
            
            {/* Quick Destination Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <p className="w-full text-sm text-secondary-500 mb-4">Popular destinations:</p>
              {quickDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(dest.name)}`)}
                  className="inline-flex items-center px-4 py-2 bg-white hover:bg-secondary-50 border border-secondary-200 hover:border-primary-300 rounded-full text-sm font-medium text-secondary-700 hover:text-primary-600 transition-all duration-200 hover:shadow-md"
                >
                  <span className="mr-2">{dest.flag}</span>
                  {dest.name}
                </button>
              ))}
            </div>
            
            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              {user ? (
                <>
                  <Link
                    to="/my-trips"
                    className="bg-wanderlog-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    ✈️ My Trips
                  </Link>
                  <Link
                    to="/search"
                    className="bg-white hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900 px-8 py-4 rounded-full text-lg font-medium border-2 border-secondary-200 hover:border-primary-300 transition-all duration-200 transform hover:scale-105"
                  >
                    🔍 Discover Places
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-wanderlog-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Planning Free
                  </Link>
                  <Link
                    to="/search"
                    className="bg-white hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900 px-8 py-4 rounded-full text-lg font-medium border-2 border-secondary-200 hover:border-primary-300 transition-all duration-200 transform hover:scale-105"
                  >
                    Explore Without Account
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-secondary-500">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Free to get started
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Works offline
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Collaborate with friends
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Showcase */}
      <FeaturesShowcase />
      
      {/* Itinerary Video Showcase */}
      <SimpleVideoShowcase />

      {/* Featured Destinations Grid */}
      <FeaturedDestinations />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Recent Search History */}
        {user?.searchHistory && user.searchHistory.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                Recent Searches
              </h2>
              <p className="text-secondary-600">Quick access to your previously explored countries</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.searchHistory.slice(0, 6).map((search, index) => (
                <Link
                  key={index}
                  to={`/search?q=${encodeURIComponent(search.country)}`}
                  className="card p-6 hover:border-primary-200 transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {search.country.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-secondary-900">
                        {search.country}
                      </div>
                      <div className="text-xs text-secondary-500 mt-1">
                        {new Date(search.searchedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-primary-500">
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Call to Action */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-wanderlog-orange via-primary-500 to-wanderlog-blue rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full border-2 border-white"></div>
              <div className="absolute top-20 right-20 w-16 h-16 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✈️</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                {user ? 'Plan Your Next Adventure' : 'Join Thousands of Happy Travelers'}
              </h3>
              
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                {user 
                  ? 'Create detailed itineraries, discover hidden gems, and make memories that last a lifetime.'
                  : 'Start planning amazing trips with our AI-powered travel assistant. Free to get started, easy to use, and loved by travelers worldwide.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <>
                    <Link
                      to="/search"
                      className="bg-white text-secondary-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      🌍 Start Planning
                    </Link>
                    <Link
                      to="/my-trips"
                      className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-secondary-900 transition-all duration-200"
                    >
                      📋 My Trips
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-white text-secondary-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      🚀 Get Started Free
                    </Link>
                    <Link
                      to="/search"
                      className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white hover:text-secondary-900 transition-all duration-200"
                    >
                      👀 Try Without Account
                    </Link>
                  </>
                )}
              </div>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h4 className="font-semibold mb-2">Smart Itineraries</h4>
                  <p className="text-sm text-white/80">AI-powered suggestions for the perfect trip</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="font-semibold mb-2">Budget Tracking</h4>
                  <p className="text-sm text-white/80">Keep your spending on track effortlessly</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h4 className="font-semibold mb-2">Collaborate</h4>
                  <p className="text-sm text-white/80">Plan together with friends and family</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials and Press */}
      <TestimonialsSection />
    </Layout>
  );
};


export default Home;
