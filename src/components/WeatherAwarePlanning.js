import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../services/api';
import WeatherWidget from './WeatherWidget';
import WeatherForecast from './WeatherForecast';

const WeatherAwarePlanning = ({ destination, dates, onWeatherData }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (destination) {
      fetchWeatherData();
    }
  }, [destination, dates]);

  const fetchWeatherData = async () => {
    try {
      // Get current weather and forecast
      const [currentResponse, forecastResponse] = await Promise.all([
        weatherAPI.getCurrent(destination),
        weatherAPI.getForecast(destination),
      ]);

      const current = currentResponse.data.data;
      const forecast = forecastResponse.data.data;

      setWeatherData({ current, forecast });
      
      // Generate recommendations based on weather
      generateRecommendations(current, forecast);
      
      // Check for weather alerts
      checkWeatherAlerts(current, forecast);
      
      // Pass weather data to parent component
      if (onWeatherData) {
        onWeatherData({ current, forecast });
      }

    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    }
  };

  const generateRecommendations = (current, forecast) => {
    const recs = [];

    // Temperature-based recommendations
    const avgTemp = forecast.forecast.reduce((sum, day) => sum + day.temperature.avg, 0) / forecast.forecast.length;
    
    if (avgTemp > 25) {
      recs.push({
        type: 'clothing',
        title: 'Pack Light & Breathable Clothing',
        description: 'Light cotton fabrics, shorts, and breathable materials',
        icon: '👕',
        priority: 'medium'
      });
      recs.push({
        type: 'activity',
        title: 'Plan Indoor Activities',
        description: 'Consider museums, shopping centers, or indoor attractions during peak heat',
        icon: '🏛️',
        priority: 'low'
      });
    } else if (avgTemp < 10) {
      recs.push({
        type: 'clothing',
        title: 'Pack Warm Clothing',
        description: 'Heavy jacket, thermal wear, gloves, and warm boots',
        icon: '🧥',
        priority: 'high'
      });
    }

    // Rain-based recommendations
    const rainyDays = forecast.forecast.filter(day => 
      day.description.toLowerCase().includes('rain')
    ).length;
    
    if (rainyDays > 2) {
      recs.push({
        type: 'gear',
        title: 'Rain Gear Essential',
        description: 'Pack waterproof jacket, umbrella, and waterproof shoes',
        icon: '☔',
        priority: 'high'
      });
      recs.push({
        type: 'activity',
        title: 'Indoor Backup Plans',
        description: 'Research indoor activities and covered attractions',
        icon: '🏠',
        priority: 'medium'
      });
    }

    // Wind-based recommendations
    const windyDays = forecast.forecast.filter(day => day.windSpeed > 7).length;
    if (windyDays > 2) {
      recs.push({
        type: 'activity',
        title: 'Avoid Outdoor Heights',
        description: 'Be cautious with observation decks, bridges, or outdoor climbing',
        icon: '🌬️',
        priority: 'medium'
      });
    }

    // Humidity recommendations
    const avgHumidity = forecast.forecast.reduce((sum, day) => sum + day.humidity, 0) / forecast.forecast.length;
    if (avgHumidity > 80) {
      recs.push({
        type: 'health',
        title: 'Stay Hydrated',
        description: 'High humidity can cause dehydration. Pack extra water and electrolytes',
        icon: '💧',
        priority: 'medium'
      });
    }

    setRecommendations(recs);
  };

  const checkWeatherAlerts = (current, forecast) => {
    const weatherAlerts = [];

    // Extreme temperature alerts
    forecast.forecast.forEach((day, index) => {
      if (day.temperature.max > 35) {
        weatherAlerts.push({
          type: 'heat',
          severity: 'high',
          title: 'Extreme Heat Warning',
          message: `${day.date}: High temperature of ${day.temperature.max}°C expected`,
          day: index,
        });
      } else if (day.temperature.min < -5) {
        weatherAlerts.push({
          type: 'cold',
          severity: 'high',
          title: 'Extreme Cold Warning',
          message: `${day.date}: Low temperature of ${day.temperature.min}°C expected`,
          day: index,
        });
      }

      // Strong wind alerts
      if (day.windSpeed > 10) {
        weatherAlerts.push({
          type: 'wind',
          severity: 'medium',
          title: 'Strong Wind Advisory',
          message: `${day.date}: Wind speeds up to ${day.windSpeed} m/s expected`,
          day: index,
        });
      }
    });

    setAlerts(weatherAlerts);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-100 text-red-900';
      case 'medium': return 'border-orange-500 bg-orange-100 text-orange-900';
      default: return 'border-yellow-500 bg-yellow-100 text-yellow-900';
    }
  };

  if (!weatherData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Weather-Based Planning
        </h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Weather Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    {alert.severity === 'high' ? 'High' : 'Medium'} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget city={destination} />
        <div className="lg:col-span-1">
          <WeatherForecast city={destination} title="5-Day Forecast" />
        </div>
      </div>

      {/* Weather-Based Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">💡</span>
            Weather-Based Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                        rec.priority === 'medium' ? 'bg-orange-200 text-orange-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Days for Activities */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🌟</span>
          Best Days for Activities
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">🚶 Outdoor Walking</h4>
            <div className="space-y-1">
              {weatherData.forecast.forecast
                .filter(day => day.temperature.avg >= 15 && day.temperature.avg <= 25 && !day.description.toLowerCase().includes('rain'))
                .slice(0, 2)
                .map((day, i) => (
                  <div key={i} className="text-sm text-green-700">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}: {day.temperature.avg}°C
                  </div>
                ))
              }
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">🏛️ Indoor Activities</h4>
            <div className="space-y-1">
              {weatherData.forecast.forecast
                .filter(day => day.description.toLowerCase().includes('rain') || day.temperature.avg < 10 || day.temperature.avg > 30)
                .slice(0, 2)
                .map((day, i) => (
                  <div key={i} className="text-sm text-blue-700">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}: {day.description}
                  </div>
                ))
              }
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">📸 Photography</h4>
            <div className="space-y-1">
              {weatherData.forecast.forecast
                .filter(day => day.cloudiness < 50 && !day.description.toLowerCase().includes('rain'))
                .slice(0, 2)
                .map((day, i) => (
                  <div key={i} className="text-sm text-orange-700">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}: Clear
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAwarePlanning;