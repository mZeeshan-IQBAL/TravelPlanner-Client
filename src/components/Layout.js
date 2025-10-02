import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 dark:text-secondary-100">
      {/* Navigation */}
      <nav className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and brand */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">✈️</span>
              </div>
              <h1 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                Travel Planner
              </h1>
            </Link>
            
            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-secondary-800 dark:text-primary-300 dark:border-secondary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/search') 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-secondary-800 dark:text-primary-300 dark:border-secondary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Search Countries
              </Link>
              <Link
                to="/my-trips"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/my-trips') 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-secondary-800 dark:text-primary-300 dark:border-secondary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                My Trips
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-secondary-800 dark:text-primary-300 dark:border-secondary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/profile') 
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 dark:bg-secondary-800 dark:text-primary-300 dark:border-secondary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Profile
              </Link>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="hidden sm:block">
                <span className="text-sm text-secondary-600 dark:text-secondary-300">
                  Welcome, <span className="font-medium text-secondary-900 dark:text-secondary-100">{user?.username}!</span>
                </span>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-secondary-500 hover:text-secondary-700 p-2 rounded-md dark:text-secondary-300 dark:hover:text-secondary-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              <button
                onClick={logout}
                className="bg-secondary-100 text-secondary-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile navigation menu */}
          <div className="md:hidden border-t border-secondary-200 py-2 dark:border-secondary-800">
            <div className="flex flex-col space-y-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/search') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Search Countries
              </Link>
              <Link
                to="/my-trips"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/my-trips') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                My Trips
              </Link>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/dashboard') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive('/profile') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:text-primary-300 dark:hover:bg-secondary-800'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-secondary-200 py-8 mt-16 dark:bg-secondary-900 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✈️</span>
              </div>
              <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Travel Planner</span>
            </div>
            <p className="text-secondary-600 text-sm dark:text-secondary-300">
              Discover amazing destinations around the world with real-time weather and beautiful imagery.
            </p>
            <p className="text-secondary-500 text-xs mt-4 dark:text-secondary-400">
              Built with ❤️ using the MERN stack • Weather by OpenWeatherMap • Images by Unsplash
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
