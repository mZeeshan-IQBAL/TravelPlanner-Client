import React from 'react';

// Simple Chart Component (we'll implement a basic bar chart)
const BarChart = ({ data, title, color = '#3B82F6' }) => {
  if (!data || data.length === 0) {
    return <div className="text-secondary-500 text-sm">No data available</div>;
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-secondary-600 dark:text-secondary-300 truncate">
              {item.label}
            </div>
            <div className="flex-1 bg-secondary-100 dark:bg-secondary-700 rounded-full h-2 relative">
              <div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: color,
                  width: `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
            <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100 min-w-[2rem]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({ data, title, centerLabel }) => {
  if (!data || data.length === 0) {
    return <div className="text-secondary-500 text-sm">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
  
  let cumulativePercentage = 0;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{title}</h4>
      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="8"
            />
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage * 2.51} ${(100 - percentage) * 2.51}`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          {centerLabel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
                {centerLabel}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-secondary-600 dark:text-secondary-300">
                {item.label}: {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Statistics Component
const StatisticsChart = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded mb-3" />
            <div className="space-y-2">
              <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded" />
              <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
              <div className="h-2 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-secondary-500">
        <p>No statistics available</p>
      </div>
    );
  }

  const { overview, recentTrips, topRegions } = stats;

  // Prepare data for charts
  const overviewData = [
    { label: 'Total Trips', value: overview?.totalTrips || 0 },
    { label: 'Favorites', value: overview?.favoriteTrips || 0 },
    { label: 'Countries', value: overview?.uniqueCountries || 0 },
    { label: 'Itinerary Items', value: overview?.totalItineraryItems || 0 },
  ];

  const regionData = topRegions?.map(region => ({
    label: region._id || 'Unknown',
    value: region.count
  })) || [];


  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-secondary-600 dark:text-secondary-300">Total Trips</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {overview?.totalTrips || 0}
              </p>
            </div>
            <div className="text-3xl">🧳</div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-secondary-600 dark:text-secondary-300">Countries</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {overview?.uniqueCountries || 0}
              </p>
            </div>
            <div className="text-3xl">🌍</div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-secondary-600 dark:text-secondary-300">Favorites</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {overview?.favoriteTrips || 0}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-secondary-600 dark:text-secondary-300">Total Budget</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                ${(overview?.totalBudget || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <BarChart
            data={overviewData}
            title="Trip Overview"
            color="#3B82F6"
          />
        </div>
        
        {regionData.length > 0 && (
          <div className="card p-6">
            <DonutChart
              data={regionData}
              title="Most Visited Regions"
              centerLabel={regionData.length}
            />
          </div>
        )}
        
        {recentTrips && recentTrips.length > 0 && (
          <div className="card p-6 lg:col-span-2">
            <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-4">
              Recent Trips
            </h4>
            <div className="space-y-3">
              {recentTrips.map((trip, index) => (
                <div
                  key={trip._id || index}
                  className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900 dark:text-secondary-100">
                      {trip.title}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-300">
                      {trip.country?.name} • Updated {new Date(trip.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {trip.isFavorite && (
                    <div className="text-yellow-500 text-xl">⭐</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsChart;