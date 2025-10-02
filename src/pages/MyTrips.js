import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { tripsAPI } from '../services/api';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const resp = await tripsAPI.getAll({ limit: 50, sort: '-createdAt' });
      setTrips(resp.data.data.trips || []);
    } catch (err) {
      setMessage(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const toggleFavorite = async (id) => {
    try {
      const resp = await tripsAPI.toggleFavorite(id);
      const fav = resp.data.data.isFavorite;
      setTrips((ts) => ts.map((t) => t._id === id ? { ...t, isFavorite: fav } : t));
    } catch (err) {
      setMessage(err.message || 'Failed to update favorite');
    }
  };

  const deleteTrip = async (id) => {
    try {
      await tripsAPI.delete(id);
      setTrips((ts) => ts.filter((t) => t._id !== id));
    } catch (err) {
      setMessage(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-16"><LoadingSpinner message="Loading your trips..." /></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">My Trips</h1>
          <Link to="/search" className="nav-link">+ New Trip</Link>
        </div>

        {message && <div className="mb-4 text-sm text-secondary-700">{message}</div>}

        {trips.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🧳</div>
            <div className="text-secondary-700">No trips yet. Start by searching countries and saving a trip.</div>
            <Link to="/search" className="btn-primary inline-block mt-4">Search Countries</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => (
              <div key={t._id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-secondary-900">{t.title}</div>
                    <div className="text-sm text-secondary-600">{t.country?.name}</div>
                    <div className="text-xs text-secondary-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                  <button className={`px-2 py-1 rounded-md text-sm ${t.isFavorite ? 'bg-yellow-100 text-yellow-800' : 'bg-secondary-100 text-secondary-700'}`} onClick={() => toggleFavorite(t._id)}>
                    {t.isFavorite ? '★ Favorite' : '☆ Favorite'}
                  </button>
                </div>
                {t.images?.length > 0 && (
                  <img src={t.images[0].url} alt={t.images[0].altDescription || t.country?.name} className="rounded-md mt-3 h-32 w-full object-cover" />
                )}
                <div className="flex gap-2 mt-4">
                  <Link to={`/trip/${t._id}`} className="btn-secondary">Details</Link>
                  <Link to={`/planner/${t._id}`} className="btn-primary">Open Planner</Link>
                  <button className="btn-secondary" onClick={() => deleteTrip(t._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTrips;
