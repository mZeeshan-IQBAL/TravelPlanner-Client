import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { countriesAPI, imagesAPI, weatherAPI, tripsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const useQuery = () => new URLSearchParams(useLocation().search);

const Search = () => {
  const query = useQuery();
  const initialQ = query.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // selected country
  const [weather, setWeather] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [message, setMessage] = useState('');
  const { addToSearchHistory } = useAuth();

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  const doSearch = async (term) => {
    if (!term || term.trim().length < 2) return;
    setLoading(true);
    setMessage('');
    setSelected(null);
    setWeather(null);
    setPhotos([]);
    try {
      const resp = await countriesAPI.search(term.trim());
      setResults(resp.data.data || []);
      addToSearchHistory(term.trim()).catch(() => {});
    } catch (err) {
      setResults([]);
      setMessage(err.message || 'Failed to search countries.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (country) => {
    setSelected(country);
    setWeather(null);
    setPhotos([]);
    setMessage('');
    try {
      if (country.capital && country.capital !== 'N/A') {
        const w = await weatherAPI.getCurrent(country.capital);
        setWeather(w.data.data);
      }
    } catch (err) {
      setWeather(null);
    }
    try {
      const img = await imagesAPI.getCountryImages(country.name, 6);
      setPhotos(img.data.data.images || []);
    } catch (err) {
      setPhotos([]);
    }
  };

  const saveTrip = async (country) => {
    try {
      const payload = {
        title: `${country.name} Trip`,
        country: {
          name: country.name,
          capital: country.capital,
          population: country.population,
          currency: country.currencies?.[0]?.name || country.currencies?.[0]?.code,
          flag: country.flag || country.flagUrl,
          region: country.region,
          subregion: country.subregion,
          languages: country.languages || [],
          timezones: country.timezones || [],
        },
        weather: weather
          ? {
              current: {
                temperature: weather.temperature,
                description: weather.description,
                humidity: weather.humidity,
                windSpeed: weather.windSpeed,
                icon: weather.icon,
              },
            }
          : undefined,
        images: photos?.slice(0, 4).map((p) => ({
          url: p.url || p.small,
          altDescription: p.altDescription,
          photographer: p.photographer?.name,
          photographerUrl: p.photographer?.profileUrl,
        })),
      };
      await tripsAPI.create(payload);
      setMessage('✅ Trip saved successfully. Check My Trips!');
    } catch (err) {
      setMessage(err.message || 'Failed to save trip.');
    }
  };

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-secondary-900">Search Countries</h1>
          <Link to="/my-trips" className="nav-link">My Trips →</Link>
        </div>

        {/* Search input */}
        <div className="bg-white p-4 rounded-xl shadow border border-secondary-200 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a country name (e.g., France)"
              className="input-field flex-1"
            />
            <button
              className="btn-primary"
              disabled={!canSearch || loading}
              onClick={() => doSearch(q)}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {message && <div className="mt-3 text-sm text-secondary-700">{message}</div>}
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-12"><LoadingSpinner message="Searching countries..." /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((c, idx) => (
              <div key={idx} className="country-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900">{c.name}</h3>
                    <div className="text-sm text-secondary-600">{c.region}{c.subregion ? ` • ${c.subregion}` : ''}</div>
                    <div className="text-sm text-secondary-600">Capital: {c.capital}</div>
                    <div className="text-sm text-secondary-600">Population: {c.population?.toLocaleString?.() || c.population}</div>
                  </div>
                  <button className="btn-secondary" onClick={() => loadDetails(c)}>
                    View details
                  </button>
                </div>
                {selected?.name === c.name && (
                  <div className="mt-4 space-y-4">
                    {weather && (
                      <div className="weather-card">
                        <div className="font-medium">Weather in {weather.city}</div>
                        <div className="text-sm text-secondary-700">{weather.description} • {weather.temperature}°C</div>
                      </div>
                    )}
                    {photos?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((p) => (
                          <img key={p.id} src={p.small || p.thumb || p.url} alt={p.altDescription} className="rounded-md object-cover h-24 w-full" />
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button className="btn-primary" onClick={() => saveTrip(c)}>Save Trip</button>
                      <a className="btn-secondary" href={photos?.[0]?.htmlUrl} target="_blank" rel="noreferrer">More images</a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Search;
