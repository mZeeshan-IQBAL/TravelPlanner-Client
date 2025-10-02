import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound = () => (
  <Layout>
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🧭</div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-2 dark:text-secondary-100">Page not found</h1>
      <p className="text-secondary-600 mb-6 dark:text-secondary-300">The page you are looking for doesn’t exist or has been moved.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  </Layout>
);

export default NotFound;