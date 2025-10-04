import React, { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const AdvancedSearch = ({ onResults, initialQuery = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Search filters state
  const [filters, setFilters] = useState({
    q: initialQuery,
    country: '',
    region: '',
    favorite: '',
    hasItinerary: '',
    minBudget: '',
    maxBudget: '',
    dateFrom: '',
    dateTo: '',
    sort: '-createdAt'
  });

  // Available options
  const regions = [
    'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'
  ];

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: '-title', label: 'Title Z-A' },
    { value: '-updatedAt', label: 'Recently Updated' },
    { value: 'country.name', label: 'Country A-Z' },
    { value: '-budget.totalEstimated', label: 'Highest Budget' },
    { value: 'budget.totalEstimated', label: 'Lowest Budget' }
  ];

// Execute search when filters change (debounced)
  useEffect(() => {
    // Only search if there are actual filters or if q has content
    const hasContent = filters.q?.trim() || 
      Object.entries(filters).some(([key, value]) => 
        key !== 'q' && key !== 'sort' && value && value !== ''
      );

    const timeout = setTimeout(async () => {
      if (!hasContent) {
        if (onResults) {
          onResults({ trips: [], pagination: null, query: filters });
        }
        return;
      }

      try {
        setLoading(true);
        const cleanFilters = Object.entries(filters)
          .reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) acc[key] = value;
            return acc;
          }, {});

        const response = await tripsAPI.advancedSearch(cleanFilters);
        if (onResults) {
          onResults({
            trips: response.data.data.trips,
            pagination: response.data.data.pagination,
            query: filters,
          });
        }
      } catch (error) {
        console.error('Search error:', error);
        if (onResults) {
          onResults({ trips: [], pagination: null, query: filters, error: error.message || 'Search failed' });
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters, onResults]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      country: '',
      region: '',
      favorite: '',
      hasItinerary: '',
      minBudget: '',
      maxBudget: '',
      dateFrom: '',
      dateTo: '',
      sort: '-createdAt'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== '-createdAt'
  );

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search trips by title, notes, or country..."
            className="input-field"
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`btn-secondary flex items-center gap-2 ${
            hasActiveFilters ? 'ring-2 ring-primary-500' : ''
          }`}
        >
          <span>Filters</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {hasActiveFilters && (
            <span className="bg-primary-500 text-white rounded-full w-2 h-2" />
          )}
        </button>
        {loading && (
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Advanced filters panel */}
      {isOpen && (
        <div className="card p-4 space-y-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-secondary-900 dark:text-secondary-100">
              Advanced Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Country
              </label>
              <input
                type="text"
                placeholder="e.g., Japan, France"
                className="input-field"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
              />
            </div>

            {/* Region Filter */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Region
              </label>
              <select
                className="input-field"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">All regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Favorite Filter */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Favorites
              </label>
              <select
                className="input-field"
                value={filters.favorite}
                onChange={(e) => handleFilterChange('favorite', e.target.value)}
              >
                <option value="">All trips</option>
                <option value="true">Favorites only</option>
              </select>
            </div>

            {/* Has Itinerary Filter */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Itinerary
              </label>
              <select
                className="input-field"
                value={filters.hasItinerary}
                onChange={(e) => handleFilterChange('hasItinerary', e.target.value)}
              >
                <option value="">All trips</option>
                <option value="true">With itinerary</option>
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Min Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0"
                className="input-field"
                value={filters.minBudget}
                onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                Max Budget ($)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="No limit"
                className="input-field"
                value={filters.maxBudget}
                onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                className="input-field"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                className="input-field"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <label className="block text-xs text-secondary-600 dark:text-secondary-300 mb-2">
              Sort by
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('sort', option.value)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    filters.sort === option.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700">
              <p className="text-xs text-secondary-600 dark:text-secondary-300 mb-2">
                Active filters:
              </p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(filters).map(([key, value]) => {
                  if (value && value !== '' && value !== '-createdAt') {
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                      >
                        {key === 'q' ? 'Search' : key}: {value}
                        <button
                          onClick={() => handleFilterChange(key, '')}
                          className="hover:text-primary-900 dark:hover:text-primary-100"
                        >
                          ×
                        </button>
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
