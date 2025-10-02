import React, { useState } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setMessage('✅ Password reset successfully. You can now sign in.');
    } catch (e) {
      setMessage(e.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Reset Password</h1>
        {message && <div className="mb-4 text-sm text-secondary-700 dark:text-secondary-300">{message}</div>}
        <form className="card p-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-secondary-700 dark:text-secondary-300 mb-1">New Password</label>
            <input className="input-field" type="password" minLength={6} required value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Set new password'}</button>
        </form>
      </div>
    </Layout>
  );
};

export default ResetPassword;