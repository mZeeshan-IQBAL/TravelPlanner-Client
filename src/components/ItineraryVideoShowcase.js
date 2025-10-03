import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ItineraryVideoShowcase = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const videoRef = React.useRef(null);

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoError = (e) => {
    console.error('Video error:', e);
    console.error('Error details:', e.target.error);
    setVideoError(true);
    setIsLoading(false);
    // Delay showing fallback to avoid flash
    setTimeout(() => setShowFallback(true), 1000);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
    setIsLoading(false);
    setVideoError(false);
    setShowFallback(false);
  };

  const handleCanPlay = () => {
    console.log('Video can play');
    setIsLoading(false);
    setVideoError(false);
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.error('Play failed:', e);
        setVideoError(true);
      });
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-900 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
            Your itinerary and your map in one view
          </h2>
          <p className="text-xl md:text-2xl text-secondary-600 max-w-4xl mx-auto leading-relaxed">
            No more switching between different apps, tabs, and tools to keep track of your travel plans.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 lg:p-12 shadow-2xl">
            {/* Video Frame */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {!showFallback ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-auto"
                    controls
                    poster="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop"
                    onPlay={handleVideoPlay}
                    onError={handleVideoError}
                    onLoadedData={handleVideoLoad}
                    onCanPlay={handleCanPlay}
                    preload="metadata"
                  >
                    <source 
                      src="https://res.cloudinary.com/dwtieckqh/video/upload/v1759491780/Screen_Recording_2025-10-03_163613_lvdfzg.mp4" 
                      type="video/mp4"
                    />
                    <p>Your browser does not support the video tag. 
                      <a href="https://res.cloudinary.com/dwtieckqh/video/upload/v1759491780/Screen_Recording_2025-10-03_163613_lvdfzg.mp4" target="_blank" rel="noopener noreferrer">
                        Download the video instead
                      </a>
                    </p>
                  </video>
                  
                  {/* Loading overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading video...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback content if video fails to load */
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Video Demo Unavailable
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try our interactive demo instead
                  </p>
                  <Link
                    to="/itinerary-demo"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Try Live Demo →
                  </Link>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-orange-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute top-1/2 -right-6 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
          </div>
        </div>

        {/* Feature highlights below video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Interactive Map
            </h3>
            <p className="text-secondary-600 text-sm">
              See all your destinations plotted with routes and detailed information
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Day-by-Day Planning
            </h3>
            <p className="text-secondary-600 text-sm">
              Organize your trip by days with easy navigation and real-time updates
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Budget Tracking
            </h3>
            <p className="text-secondary-600 text-sm">
              Monitor expenses and manage your budget all in one integrated view
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/itinerary-demo"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Try Live Demo
            </Link>
            <Link
              to="/register"
              className="text-secondary-600 hover:text-secondary-900 px-6 py-4 text-lg font-medium transition-colors flex items-center"
            >
              Get Started Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryVideoShowcase;