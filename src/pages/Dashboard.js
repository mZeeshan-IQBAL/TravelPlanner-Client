import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatisticsChart from '../components/StatisticsChart';
import CalendarView from '../components/CalendarView';
import { tripsAPI } from '../services/api';


const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('statistics'); // 'statistics' | 'calendar'

  useEffect(() => {
    // Initialize view from URL param on first render
    const v = searchParams.get('view');
    if (v === 'calendar' || v === 'statistics') {
      setView(v);
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load both stats and trips concurrently
        const [statsResp, tripsResp] = await Promise.all([
          tripsAPI.getStats(),
          tripsAPI.getAll({ limit: 50 }) // Get more trips for calendar view
        ]);
        
        setStats(statsResp.data.data);
        setTrips(tripsResp.data.data.trips);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setMessage(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [searchParams]);

  const handleDateSelect = (date, dayTrips) => {
    console.log('Selected date:', date, 'trips:', dayTrips);
    // Could open a modal or navigate to a filtered view
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="py-16">
            <LoadingSpinner size="lg" message="Loading dashboard..." />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Dashboard
          </h1>
          
          {/* View Toggle */}
          <div className="flex items-center bg-secondary-100 dark:bg-secondary-800 rounded-lg p-1">
            <button
              onClick={() => { setView('statistics'); setSearchParams({ view: 'statistics' }); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'statistics'
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => { setView('calendar'); setSearchParams({ view: 'calendar' }); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-secondary-100 shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-200'
              }`}
            >
              📅 Calendar
            </button>
          </div>
        </div>
        
        {message && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200">{message}</p>
          </div>
        )}
        
        {/* View Content */}
        {view === 'statistics' ? (
          <StatisticsChart stats={stats} loading={loading} />
        ) : (
          <CalendarView trips={trips} onDateSelect={handleDateSelect} />
        )}

        {/* Recent Trips (quick access) */}
        {Array.isArray(trips) && trips.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-3">Recent Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.slice(0, 3).map((t) => (
                <div key={t._id} className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-secondary-900 dark:text-secondary-100">{t.title}</div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-300">{t.country?.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/trip/${t._id}`} className="btn-secondary text-sm">Details</a>
                    <a href={`/planner/${t._id}`} className="btn-primary text-sm">Open Planner</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">✈️</div>
            <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              Plan New Trip
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
              Start planning your next adventure
            </p>
            <a href="/search" className="btn-primary inline-block">
              Start Planning
            </a>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              Manage Trips
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
              View and edit your existing trips
            </p>
            <a href="/my-trips" className="btn-secondary inline-block">
              View Trips
            </a>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">
              Profile Settings
            </h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-300 mb-4">
              Update your profile and preferences
            </p>
            <a href="/profile" className="btn-secondary inline-block">
              View Profile
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;