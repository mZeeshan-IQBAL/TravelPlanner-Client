import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesShowcase = () => {
  return (
    <div className="bg-secondary-50 dark:bg-secondary-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4 leading-tight">
            Features to replace all your other tools
          </h2>
          <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need for seamless trip planning in one beautiful, collaborative platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Feature 1: Add places from guides */}
          <div className="text-center">
            <div className="mb-6">
              {/* Mock travel guide card */}
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
                <div className="space-y-2">
                  <div className="h-2 bg-secondary-200 rounded"></div>
                  <div className="h-2 bg-secondary-200 rounded w-3/4"></div>
                  <div className="h-2 bg-secondary-200 rounded w-1/2"></div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-secondary-100">
                  <div className="flex-1">
                    <div className="h-3 bg-secondary-300 rounded w-24 mb-1"></div>
                    <div className="h-2 bg-secondary-200 rounded w-16"></div>
                  </div>
                  <button className="bg-secondary-800 text-white px-4 py-2 rounded-lg text-xs font-medium">
                    Add to plan
                  </button>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Add places from guides with 1 click
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              We crawled the web so you don't have to. Easily add mentioned places to your plan.
            </p>
          </div>

          {/* Feature 2: Expense tracking */}
          <div className="text-center">
            <div className="mb-6">
              {/* Mock expense tracking interface */}
              <div className="bg-white rounded-2xl p-4 shadow-soft max-w-sm mx-auto mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 bg-teal-400 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">N</div>
                    <div className="w-6 h-6 bg-blue-400 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">O</div>
                    <div className="w-6 h-6 bg-teal-500 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">H</div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white text-xs text-white font-bold flex items-center justify-center">P</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="bg-secondary-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 ml-3">
                        <div className="h-2 bg-secondary-300 rounded w-20 mb-1"></div>
                        <div className="text-xs text-secondary-500">Liked by Peter</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3">
                    <div className="text-xs text-secondary-500 mb-1">Added by Harry</div>
                    <div className="h-2 bg-secondary-300 rounded w-24 mb-1"></div>
                    <div className="h-1 bg-secondary-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Expense tracking and splitting
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              Keep track of your budget and split the cost between your tripmates.
            </p>
          </div>

          {/* Feature 3: Collaboration */}
          <div className="text-center">
            <div className="mb-6">
              {/* Mock collaboration interface */}
              <div className="bg-white rounded-2xl p-4 shadow-soft max-w-sm mx-auto mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-secondary-600">Connect</span>
                  </div>
                  <span className="text-xs text-secondary-600">Forward</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-secondary-50 rounded-lg p-3 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-secondary-300 rounded-full"></div>
                    <div className="w-8 h-8 bg-secondary-300 rounded-full"></div>
                    <div className="w-8 h-8 bg-secondary-300 rounded-full"></div>
                  </div>
                  <div className="bg-secondary-50 rounded-lg p-3 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-secondary-400 rounded-full"></div>
                    <div className="h-2 bg-secondary-300 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-secondary-900 mb-3">
              Collaborate with friends in real time
            </h3>
            <p className="text-secondary-600 text-sm leading-relaxed">
              Plan along with your friends with live syncing and collaborative editing.
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