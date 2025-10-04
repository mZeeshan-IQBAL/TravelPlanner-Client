import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const save = async () => {
    try {
      await usersAPI.updateMe({ username });
      await loadUser();
      setMessage('✅ Profile updated');
    } catch (e) {
      setMessage(e.message || 'Failed to update');
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await usersAPI.uploadAvatar(file);
      await loadUser();
      setMessage('✅ Avatar updated');
    } catch (e) {
      setMessage(e.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Profile</h1>
        {message && <div className="mb-4 text-sm text-secondary-700 dark:text-secondary-300">{message}</div>}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4">
            {(() => {
              const rawUrl = user?.avatar?.url || user?.avatar?.thumbnailUrl || user?.avatarUrl;
              const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
              const serverOrigin = apiBase.replace(/\/api$/, '');
              const finalUrl = rawUrl
                ? (rawUrl.startsWith('http') ? rawUrl : `${serverOrigin}${rawUrl}`)
                : 'https://www.gravatar.com/avatar/?d=mp';
              return (
                <img
                  src={finalUrl}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover border border-secondary-200 dark:border-secondary-700"
                  onError={(e) => { e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp'; }}
                />
              );
            })()}
            <div>
              <label className="btn-secondary inline-block cursor-pointer">
                {uploading ? 'Uploading...' : 'Upload Avatar'}
                <input type="file" className="hidden" onChange={onAvatarChange} accept="image/*" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-secondary-700 dark:text-secondary-300 mb-1">Username</label>
            <input className="input-field" value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={save}>Save</button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;