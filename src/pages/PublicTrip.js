import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PublicTrip = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const base = (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_FORCE_API_URL)
          ? '/api'
          : (process.env.REACT_APP_API_URL || '/api');
        const resp = await axios.get(`${base}/public/trips/${encodeURIComponent(token)}`);
        setTrip(resp.data.data);
      } catch (e) {
        setMessage(e?.response?.data?.message || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading public trip…</div>;
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-secondary-700">{message || 'Trip not found or link disabled.'}</div>
        <Link to="/login" className="btn-secondary mt-4 inline-block">Back</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{trip.title}</h1>
        <Link to="/login" className="btn-secondary">Open App</Link>
      </div>
      {trip.country?.name && (
        <div className="text-secondary-700">Country: {trip.country.name}</div>
      )}
      {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
        <div className="card p-4">
          <div className="font-medium mb-2">Itinerary</div>
          <ul className="space-y-1">
            {trip.itinerary.sort((a,b)=>(a.day||1)-(b.day||1) || (a.order||0)-(b.order||0)).map((i, idx) => (
              <li key={idx} className="border-b border-secondary-200 py-2">
                <div className="font-medium">{i.title}{i.day ? ` • Day ${i.day}` : ''}{typeof i.cost==='number' ? ` • $${i.cost}` : ''}</div>
                <div className="text-xs text-secondary-600">{i.location || ''} {i.startTime ? `• ${i.startTime}` : ''}{i.endTime?`-${i.endTime}`:''}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {trip.budget?.totalEstimated > 0 && (
        <div className="card p-4">
          <div className="font-medium">Budget</div>
          <div className="text-secondary-700">Estimated: ${trip.budget.totalEstimated.toLocaleString()} {trip.budget.currency || 'USD'}</div>
        </div>
      )}
    </div>
  );
};

export default PublicTrip;
