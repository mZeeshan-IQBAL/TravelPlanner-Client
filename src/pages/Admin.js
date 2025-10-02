import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const TabButton = ({ id, active, setActive, children }) => (
  <button
    onClick={() => setActive(id)}
    className={`px-3 py-2 rounded-md text-sm font-medium border ${
      active === id
        ? 'bg-primary-500 text-white border-primary-500'
        : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
    }`}
  >
    {children}
  </button>
);

const Admin = () => {
  const { user } = useAuth();
  const [active, setActive] = useState('users');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Users
  const [users, setUsers] = useState([]);
  // Trips
  const [trips, setTrips] = useState([]);
  const [tripPage, setTripPage] = useState(1);
  const [tripPagination, setTripPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  // Analytics
  const [analytics, setAnalytics] = useState(null);

  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  const loadUsers = async () => {
    try {
      const resp = await adminAPI.listUsers();
      setUsers(resp.data.data || []);
    } catch (e) { setMessage(e.message || 'Failed to load users'); }
  };

  const loadTrips = async (page = 1) => {
    try {
      const resp = await adminAPI.listTrips(page, 20);
      const data = resp.data.data || {};
      setTrips(data.trips || []);
      setTripPagination(data.pagination || { currentPage: 1, totalPages: 1, total: 0 });
    } catch (e) { setMessage(e.message || 'Failed to load trips'); }
  };

  const loadAnalytics = async () => {
    try {
      const resp = await adminAPI.getAnalytics();
      setAnalytics(resp.data.data || null);
    } catch (e) { setMessage(e.message || 'Failed to load analytics'); }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (active === 'users') await loadUsers();
      if (active === 'trips') await loadTrips(tripPage);
      if (active === 'analytics') await loadAnalytics();
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [active, tripPage]);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-secondary-700">You do not have permission to view this page.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Admin</h1>
        </div>

        <div className="flex gap-2 mb-4">
          <TabButton id="users" active={active} setActive={setActive}>Users</TabButton>
          <TabButton id="trips" active={active} setActive={setActive}>Trips</TabButton>
          <TabButton id="analytics" active={active} setActive={setActive}>Analytics</TabButton>
        </div>

        {message && (
          <div className="mb-3 text-sm text-secondary-700 dark:text-secondary-300">{message}</div>
        )}

        {loading ? (
          <div className="py-12"><LoadingSpinner message="Loading..." /></div>
        ) : (
          <>
            {active === 'users' && (
              <div className="card p-4">
                <div className="font-medium mb-3">Users</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-secondary-200 dark:border-secondary-700">
                        <th className="py-2 pr-4">Username</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-secondary-100 dark:border-secondary-800">
                          <td className="py-2 pr-4">{u.username}</td>
                          <td className="py-2 pr-4">{u.email}</td>
                          <td className="py-2 pr-4">{u.role || 'user'}</td>
                          <td className="py-2 pr-4">
                            <button
                              className="btn-secondary text-xs"
                              onClick={async () => {
                                const newRole = (u.role === 'admin') ? 'user' : 'admin';
                                try { await adminAPI.updateUserRole(u._id, newRole); await loadUsers(); } catch (e) { setMessage(e.message || 'Failed to update role'); }
                              }}
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {active === 'trips' && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">Trips</div>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-xs" disabled={tripPagination.currentPage <= 1} onClick={() => setTripPage(p => Math.max(1, p - 1))}>Prev</button>
                    <button className="btn-secondary text-xs" disabled={tripPagination.currentPage >= tripPagination.totalPages} onClick={() => setTripPage(p => p + 1)}>Next</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-secondary-200 dark:border-secondary-700">
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Country</th>
                        <th className="py-2 pr-4">Favorite</th>
                        <th className="py-2 pr-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map(t => (
                        <tr key={t._id} className="border-b border-secondary-100 dark:border-secondary-800">
                          <td className="py-2 pr-4">{t.title}</td>
                          <td className="py-2 pr-4">{t.country?.name || '—'}</td>
                          <td className="py-2 pr-4">{t.isFavorite ? '★' : '☆'}</td>
                          <td className="py-2 pr-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-xs text-secondary-600 dark:text-secondary-300 mt-2">
                  Page {tripPagination.currentPage} of {tripPagination.totalPages} • {tripPagination.total} total
                </div>
              </div>
            )}

            {active === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="font-medium mb-2">Popular Destinations</div>
                  <ul className="text-sm space-y-1">
                    {(analytics?.popularDestinations || []).map((d, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{d._id || 'Unknown'}</span>
                        <span className="text-secondary-600">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-4">
                  <div className="font-medium mb-2">Top Users (by trip count)</div>
                  <ul className="text-sm space-y-1">
                    {(analytics?.topUsers || []).map((u, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{u._id}</span>
                        <span className="text-secondary-600">{u.trips}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
