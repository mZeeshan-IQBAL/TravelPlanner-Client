import React, { useState, useEffect, useCallback } from 'react';
import { weatherAPI } from '../services/api';

const WeatherForecast = ({ city, coordinates, title = "5-Day Weather Forecast" }) => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (city) {
        response = await weatherAPI.getForecast(city);
      } else {
        throw new Error('Forecast by coordinates not implemented yet');
      }

      setForecast(response.data.data);
    } catch (err) {
      console.error('Weather forecast error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch weather forecast');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (city || coordinates) {
      fetchForecast();
    }
  }, [city, coordinates, fetchForecast]);

  const getWeatherIcon = (icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 30) return 'text-red-600';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-500';
    if (temp >= 0) return 'text-blue-500';
    return 'text-purple-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="text-center py-8">
          <p className="text-gray-600">Forecast unavailable</p>
          <p className="text-sm text-gray-400 mt-2">{error}</p>
          <button
            onClick={fetchForecast}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!forecast || !forecast.forecast) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {forecast.city && (
          <p className="text-sm text-gray-600">
            {forecast.city}{forecast.country && `, ${forecast.country}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {forecast.forecast.map((day, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors"
          >
            <div className="text-sm font-medium text-gray-700 mb-2">
              {formatDate(day.date)}
            </div>
            
            <div className="flex justify-center mb-3">
              <img
                src={getWeatherIcon(day.icon)}
                alt={day.description}
                className="w-12 h-12"
              />
            </div>
            
            <div className="text-xs text-gray-600 mb-2 capitalize">
              {day.description}
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={`font-semibold ${getTemperatureColor(day.temperature.max)}`}>
                {day.temperature.max}°
              </span>
              <span className="text-gray-500">
                {day.temperature.min}°
              </span>
            </div>
            
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>💧 {day.humidity}%</span>
                <span>💨 {day.windSpeed}m/s</span>
              </div>
              {day.cloudiness && (
                <div className="text-center">☁️ {day.cloudiness}%</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={fetchForecast}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Refresh Forecast
        </button>
      </div>
    </div>
  );
};

export default WeatherForecast;