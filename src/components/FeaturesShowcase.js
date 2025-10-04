import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesShowcase = () => {
  return (
    <div className="bg-secondary-50 dark:bg-secondary-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 leading-tight">
            Everything you need to plan smarter trips
          </h2>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto leading-relaxed">
            Powerful features to discover destinations, manage budgets, and collaborate with friends — all in one place.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Feature 1: Add places from guides */}
          <div className="text-center">
            <div className="mb-6">
              {/* Guide preview card */}
              <div className="bg-white rounded-2xl p-4 shadow-soft max-w-sm mx-auto mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded-full text-green-700 font-medium">
                    TRIPADVISOR
                  </span>
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700 font-medium">
                    LONELY PLANET
                  </span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded-full text-purple-700 font-medium">
                    POPULAR BLOGS
                  </span>
                </div>
                <div className="text-left">
                  <h4 className="text-base font-semibold text-secondary-900 mb-2">Tokyo weekend highlights</h4>
                  <ul className="text-sm text-secondary-700 list-disc pl-5 space-y-1">
                    <li>teamLab Planets – immersive digital art</li>
                    <li>Tsukiji Outer Market – street food crawl</li>
                    <li>Sensō-ji Temple – Asakusa old town</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-secondary-100">
                  <div className="flex-1">
                    <div className="text-xs text-secondary-600">From Lonely Planet</div>
                    <div className="text-xs text-secondary-500">Saved by 1.2k travelers</div>
                  </div>
                  <button className="bg-secondary-800 text-white px-4 py-2 rounded-lg text-xs font-medium">
                    Add to plan
                  </button>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Save places from any guide
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              Found a great recommendation? Add it straight to your trip in one click.
            </p>
          </div>

          {/* Feature 2: Expense tracking */}
          <div className="text-center">
            <div className="mb-6">
              {/* Expense tracking preview */}
              <div className="bg-white rounded-2xl p-4 shadow-soft max-w-sm mx-auto mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 bg-teal-400 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">N</div>
                    <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">O</div>
                    <div className="w-6 h-6 bg-teal-500 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">H</div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">P</div>
                  </div>
                </div>
                <div className="text-left space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>🏨 Hotel (2 nights)</span>
                    <span className="font-medium">$320</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🍜 Food</span>
                    <span className="font-medium">$90</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🚇 Transport</span>
                    <span className="font-medium">$45</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between font-semibold text-secondary-900">
                    <span>Total</span>
                    <span>$455</span>
                  </div>
                  <div className="text-xs text-secondary-500">Split between 4 people • $113.75 each</div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Track budgets with ease
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              Set a budget, log expenses, and split costs with friends without the spreadsheets.
            </p>
          </div>

          {/* Feature 3: Collaboration */}
          <div className="text-center">
            <div className="mb-6">
              {/* Collaboration preview */}
              <div className="bg-white rounded-2xl p-4 shadow-soft max-w-sm mx-auto mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-secondary-600">Connected</span>
                  </div>
                  <span className="text-xs text-secondary-600">Live</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-secondary-300 rounded-full flex items-center justify-center text-xs">A</div>
                    <div className="w-8 h-8 bg-secondary-300 rounded-full flex items-center justify-center text-xs">L</div>
                    <div className="w-8 h-8 bg-secondary-300 rounded-full flex items-center justify-center text-xs">S</div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="font-medium text-secondary-900">Savannah</div>
                    <div className="text-secondary-600">Added “Louvre at 10:00” to Day 2</div>
                  </div>
                  <div className="text-xs text-secondary-500">Lucas is editing the itinerary…</div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Plan together in real time
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              Share trips and edit together—everyone stays in sync on every change.
            </p>
          </div>

        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            to="/search"
            className="bg-wanderlog-orange hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start planning
          </Link>
          <Link
            to="/register"
            className="ml-6 text-secondary-600 hover:text-secondary-900 px-6 py-4 text-lg font-medium transition-colors flex items-center inline-flex"
          >
            Get the app
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesShowcase;