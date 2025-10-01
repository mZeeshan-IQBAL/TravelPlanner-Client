import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { tripsAPI } from '../services/api';

const formatDateInput = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state for editing notes/dates
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const resp = await tripsAPI.getById(id);
      const t = resp.data.data;
      setTrip(t);
      // Initialize form fields
      setNotes(t?.notes || '');
      setStartDate(formatDateInput(t?.plannedDates?.startDate));
      setEndDate(formatDateInput(t?.plannedDates?.endDate));
    } catch (err) {
      setMessage(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrip(); /* eslint-disable-next-line */ }, [id]);

  const toggleFavorite = async () => {
    try {
      const resp = await tripsAPI.toggleFavorite(id);
      const fav = resp.data.data.isFavorite;
      setTrip((t) => ({ ...t, isFavorite: fav }));
    } catch (err) {
      setMessage(err.message || 'Failed to update favorite');
    }
  };

  const deleteTrip = async () => {
    try {
      await tripsAPI.delete(id);
      navigate('/my-trips');
    } catch (err) {
      setMessage(err.message || 'Failed to delete trip');
    }
  };

  const saveEdits = async () => {
    // Basic validation
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setMessage('Start date must be before end date.');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        notes,
        plannedDates: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
      };
      const resp = await tripsAPI.update(id, payload);
      const updated = resp.data.data;
      setTrip(updated);
      setMessage('✅ Trip updated');
    } catch (err) {
      setMessage(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-16"><LoadingSpinner message="Loading trip..." /></div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-secondary-700">Trip not found.</div>
          <Link to="/my-trips" className="btn-secondary mt-4 inline-block">Back to My Trips</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">{trip.title}</h1>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={toggleFavorite}>{trip.isFavorite ? '★ Favorite' : '☆ Favorite'}</button>
            <button className="btn-secondary" onClick={deleteTrip}>Delete</button>
            <Link to="/my-trips" className="nav-link">Back</Link>
          </div>
        </div>

        {message && <div className="mb-4 text-sm text-secondary-700">{message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {trip.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {trip.images.slice(0,4).map((img, i) => (
                  <img key={i} src={img.url} alt={img.altDescription || trip.country?.name} className="rounded-md object-cover h-40 w-full" />
                ))}
              </div>
            )}
            <div className="card p-4">
              <div className="font-semibold text-secondary-900 mb-2">Country</div>
              <div className="text-sm text-secondary-700">{trip.country?.name} {trip.country?.capital ? `• Capital: ${trip.country.capital}` : ''}</div>
              <div className="text-sm text-secondary-700">Region: {trip.country?.region} {trip.country?.subregion ? `• ${trip.country.subregion}` : ''}</div>
              {trip.country?.languages?.length > 0 && (
                <div className="text-sm text-secondary-700">Languages: {trip.country.languages.join(', ')}</div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {trip.weather?.current && (
              <div className="weather-card">
                <div className="font-medium">Current Weather</div>
                <div className="text-sm text-secondary-700">{trip.weather.current.description} • {trip.weather.current.temperature}°C</div>
              </div>
            )}
            <div className="card p-4 space-y-3">
              <div className="font-medium">Notes & Plan</div>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Add your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-secondary-600 mb-1">Start Date</label>
                  <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-secondary-600 mb-1">End Date</label>
                  <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={saveEdits} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                {trip.notes && <span className="text-xs text-secondary-500 self-center">Last note length: {trip.notes.length}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TripDetails;
