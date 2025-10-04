// Public config loader for the client. Fetches non-sensitive runtime config from the server.
// Falls back to build-time env vars for local/dev usage.

let cachedConfig = null;
let inflightPromise = null;

const FALLBACK_CONFIG = {
  cloudinaryCloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || null,
  cloudinaryUploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || null,
};

export async function loadPublicConfig() {
  if (cachedConfig) return cachedConfig;
  if (inflightPromise) return inflightPromise;

  inflightPromise = (async () => {
    try {
      const res = await fetch('/api/public-config', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`Failed to load public config: ${res.status}`);
      const data = await res.json();
      // expected keys: { cloudinaryCloudName, cloudinaryUploadPreset, ... }
      cachedConfig = {
        cloudinaryCloudName: data.cloudinaryCloudName ?? FALLBACK_CONFIG.cloudinaryCloudName,
        cloudinaryUploadPreset: data.cloudinaryUploadPreset ?? FALLBACK_CONFIG.cloudinaryUploadPreset,
      };
      return cachedConfig;
    } catch (err) {
      console.error('Public config load failed, falling back to build-time env:', err);
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
