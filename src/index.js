import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Ensure any prior dark-mode class is cleared (toggle removed)
try {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('theme');
} catch (_) {}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

