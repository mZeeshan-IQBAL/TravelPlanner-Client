// Public config loader for the client. Fetches non-sensitive runtime config from the server.
// Falls back to build-time env vars for local/dev usage.

let cachedConfig = null;
let inflightPromise = null;

const FALLBACK_CONFIG = {
  cloudinaryCloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || null,
  cloudinaryUploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || null,
};

const API_BASE = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

async function fetchJSON(url) {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error(`Failed to load public config: ${res.status}`);
  return res.json();
}

export async function loadPublicConfig() {
  if (cachedConfig) return cachedConfig;
  if (inflightPromise) return inflightPromise;

  inflightPromise = (async () => {
    try {
      // Prefer absolute API base to avoid CRA 404 on relative path
      let data;
      try {
        data = await fetchJSON(`${API_BASE}/public-config`);
      } catch (e1) {
        // Fallback to relative path (useful if a proxy is configured)
        data = await fetchJSON('/api/public-config');
      }

      cachedConfig = {
        cloudinaryCloudName: data.cloudinaryCloudName ?? FALLBACK_CONFIG.cloudinaryCloudName,
        cloudinaryUploadPreset: data.cloudinaryUploadPreset ?? FALLBACK_CONFIG.cloudinaryUploadPreset,
      };
      return cachedConfig;
    } catch (err) {
      // Quietly fall back to build-time env to avoid noisy console during dev
      cachedConfig = FALLBACK_CONFIG;
      return cachedConfig;
    } finally {
      inflightPromise = null;
    }
  })();

  return inflightPromise;
}

export function getCachedPublicConfig() {
  return cachedConfig || null;
}

export async function getPublicConfig() {
  return cachedConfig ? cachedConfig : loadPublicConfig();
}
