import React, { useState, useEffect, useCallback } from 'react';
import { weatherAPI } from '../services/api';

const WeatherWidget = ({ city, coordinates, compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C'); // 'C' or 'F'
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchWeather = useCallback(async () => {
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
      setUpdatedAt(new Date());
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [city, coordinates]);

  useEffect(() => {
    if (city || coordinates) {
      fetchWeather();
    }
  }, [city, coordinates, fetchWeather]);

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

    // Safely derive a condition string
    const condition = (weather?.main || weather?.description || '').toLowerCase();

    if (condition.includes('rain')) {
      return 'from-gray-600 to-gray-800';
    } else if (condition.includes('cloud')) {
      return isNight ? 'from-gray-700 to-gray-900' : 'from-gray-400 to-gray-600';
    } else if (condition.includes('snow')) {
      return 'from-blue-200 to-blue-400';
    } else {
      return isNight ? 'from-purple-600 to-purple-900' : 'from-blue-400 to-blue-600';
    }
  };

  if (compact) {
    const temp = unit === 'C' ? weather.temperature : Math.round((weather.temperature * 9) / 5 + 32);
    return (
      <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-xl p-3 text-white shadow-lg`}> 
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{weather.city}</p>
            <p className="text-[11px] opacity-80 capitalize">{weather.description}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              <img
                src={getWeatherIcon(weather.icon)}
                alt={weather.description}
                className="w-8 h-8"
              />
              <span className="text-lg font-bold ml-1">{temp}°{unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tempMain = unit === 'C' ? weather.temperature : Math.round((weather.temperature * 9) / 5 + 32);
  const tempFeels = unit === 'C' ? weather.feelsLike : Math.round((weather.feelsLike * 9) / 5 + 32);

  return (
    <div className={`bg-gradient-to-br ${getBackgroundGradient()} rounded-2xl p-6 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{weather.city}</h3>
          {weather.country && (
            <p className="text-sm opacity-85">{weather.country}</p>
          )}
          {updatedAt && (
            <p className="text-[11px] opacity-75 mt-1">Updated {updatedAt.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end">
            <img
              src={getWeatherIcon(weather.icon)}
              alt={weather.description}
              className="w-12 h-12"
            />
            <span className="text-4xl font-extrabold ml-2">{tempMain}°{unit}</span>
          </div>
          <p className="text-sm capitalize">{weather.description}</p>
          <div className="mt-1">
            <button
              onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
              className="text-[11px] bg-white/20 hover:bg-white/30 rounded px-2 py-0.5 transition-colors"
            >
              Switch to °{unit === 'C' ? 'F' : 'C'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <span className="opacity-75">Feels like:</span>
          <span className="ml-2 font-medium">{tempFeels}°{unit}</span>
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

      <div className="flex justify-between items-center mt-4 text-xs opacity-85">
        {weather.sunrise && (
          <span>🌅 {new Date(weather.sunrise).toLocaleTimeString()}</span>
        )}
        {weather.sunset && (
          <span>🌇 {new Date(weather.sunset).toLocaleTimeString()}</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={fetchWeather}
          className="text-xs bg-white/20 hover:bg-white/30 rounded px-3 py-1 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default WeatherWidget;