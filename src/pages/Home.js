import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Home = () => {
  const { user } = useAuth();

  return (
    <Layout>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
            Plan Your Perfect Adventure
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Discover amazing countries, check real-time weather conditions, and save your dream destinations with beautiful imagery
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4">
            <Link
              to="/search"
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center justify-center">
                🔍 Start Exploring
              </span>
            </Link>
            <Link
              to="/my-trips"
              className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary-50 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center justify-center">
                🧳 View My Trips
              </span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌍</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              Explore Countries
            </h3>
            <p className="text-secondary-600 leading-relaxed">
              Search and discover detailed information about countries worldwide including population, capital, and cultural insights
            </p>
          </div>

          <div className="card p-8 text-center animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌤️</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              Real-time Weather
            </h3>
            <p className="text-secondary-600 leading-relaxed">
              Get current weather conditions and detailed 5-day forecasts for any destination you're planning to visit
            </p>
          </div>

          <div className="card p-8 text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📸</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-3">
              Stunning Imagery
            </h3>
            <p className="text-secondary-600 leading-relaxed">
              Discover beautiful, high-quality photos of destinations from professional photographers around the world
            </p>
          </div>
        </div>

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

        {/* Call to Action for new users */}
        {(!user?.searchHistory || user.searchHistory.length === 0) && (
          <div className="mt-20">
            <div className="card p-12 text-center bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">
                Ready for Your First Adventure?
              </h3>
              <p className="text-secondary-600 mb-6 max-w-md mx-auto">
                Start by searching for a country you've always wanted to visit. Get weather info, see beautiful photos, and save it to your trip collection.
              </p>
              <Link
                to="/search"
                className="inline-flex items-center bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
              >
                <span className="mr-2">🔍</span>
                Search Your First Country
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;