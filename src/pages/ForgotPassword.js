import React, { useState } from 'react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
      setMessage('If that account exists, a reset link has been sent. Check server logs in dev.');
    } catch (e) {
      setMessage(e.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Forgot Password</h1>
        {message && <div className="mb-4 text-sm text-secondary-700 dark:text-secondary-300">{message}</div>}
        <form className="card p-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm text-secondary-700 dark:text-secondary-300 mb-1">Email</label>
            <input className="input-field" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
      </div>
    </Layout>
  );
};

export default ForgotPassword;