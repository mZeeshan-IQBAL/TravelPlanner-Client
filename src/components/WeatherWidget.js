import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';

const WeatherWidget = ({ city, coordinates, compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city || coordinates) {
      fetchWeather();
    }
  }, [city, coordinates]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (coordinates && coordinates.lat && coordinates.lon) {
        response = await weatherAPI.getByCoordinates(coordinates.lat, coordinates.lon);
      } else if (city) {
        response = await weatherAPI.getCurrent(city);
      } else {
        throw new Error('No location provided');
      }

      setWeather(response.data.data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon) => {
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    return iconUrl;
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 text-white ${compact ? 'w-48' : 'w-full'}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-400 rounded-lg p-4 text-white ${compact ? 'w-48' : 'w-full'}`}>
        <div className="text-center">
          <p className="text-sm">Weather unavailable</p>
          <p className="text-xs opacity-75">{error}</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const getBackgroundGradient = () => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 19;
    
    if (weather.main.toLowerCase().includes('rain')) {
      return 'from-gray-600 to-gray-800';
    } else if (weather.main.toLowerCase().includes('cloud')) {
      return isNight ? 'from-gray-700 to-gray-900' : 'from-gray-400 to-gray-600';
    } else if (weather.main.toLowerCase().includes('snow')) {
      return 'from-blue-200 to-blue-400';
    } else {
      return isNight ? 'from-purple-600 to-purple-900' : 'from-blue-400 to-blue-600';
    }
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-lg p-3 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{weather.city}</p>
            <p className="text-xs opacity-75 capitalize">{weather.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <img
                src={getWeatherIcon(weather.icon)}
                alt={weather.description}
                className="w-8 h-8"
              />
              <span className="text-lg font-bold">{weather.temperature}°</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{weather.city}</h3>
          {weather.country && (
            <p className="text-sm opacity-75">{weather.country}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center">
            <img
              src={getWeatherIcon(weather.icon)}
              alt={weather.description}
              className="w-12 h-12"
            />
            <span className="text-3xl font-bold ml-2">{weather.temperature}°C</span>
          </div>
          <p className="text-sm capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <span className="opacity-75">Feels like:</span>
          <span className="ml-2 font-medium">{weather.feelsLike}°C</span>
        </div>
        <div className="flex items-center">
          <span className="opacity-75">Humidity:</span>
          <span className="ml-2 font-medium">{weather.humidity}%</span>
        </div>
        <div className="flex items-center">
          <span className="opacity-75">Wind:</span>
          <span className="ml-2 font-medium">{weather.windSpeed} m/s</span>
        </div>
        <div className="flex items-center">
          <span className="opacity-75">Pressure:</span>
          <span className="ml-2 font-medium">{weather.pressure} hPa</span>
        </div>
      </div>

      {weather.visibility && (
        <div className="mt-4 text-sm">
          <span className="opacity-75">Visibility: </span>
          <span className="font-medium">{weather.visibility} km</span>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 text-xs opacity-75">
        {weather.sunrise && (
          <span>🌅 {new Date(weather.sunrise).toLocaleTimeString()}</span>
        )}
        {weather.sunset && (
          <span>🌅 {new Date(weather.sunset).toLocaleTimeString()}</span>
        )}
      </div>

      <button
        onClick={fetchWeather}
        className="mt-3 text-xs bg-white/20 hover:bg-white/30 rounded px-3 py-1 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
};

export default WeatherWidget;