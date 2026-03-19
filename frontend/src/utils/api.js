import axios from 'axios';

const RAILWAY_URL = 'https://pakshiai-backend-production.up.railway.app';
const envUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// FORCE RAILWAY Migration: If the environment is still pointing to Render, we override it to Railway for stability.
export const baseUrl = (envUrl.includes('render') || !envUrl) ? RAILWAY_URL : envUrl;

if (envUrl.includes('render')) {
    console.warn("[PakshiAI] ⚠️ Stale Render URL detected in environment. Hard-syncing to Railway Production...");
}
const api = axios.create({
    baseURL: baseUrl,
    timeout: 120000, // 120s timeout for heavy ML processing
});

console.log("[PakshiAI] Initialized API client with effective baseURL:", baseUrl || "(Netlify Proxy / Relative)");

// Automated Diagnostic Heartbeat
const checkCommunication = async () => {
    try {
        const response = await api.get('/api/cors-test');
        console.log("[PakshiAI] ✅ Cloud communication synchronized:", response.data.message);
    } catch (err) {
        console.error("[PakshiAI] ❌ Cloud communication blocked by CORS or Network error.");
        console.info("[PakshiAI] Fix: Try deleting VITE_API_BASE_URL from Netlify settings to use the built-in Proxy.");
    }
};
checkCommunication();

if (!baseUrl) {
    console.info("[PakshiAI] Using Netlify Proxy (30s limit). If analysis takes >30s, set VITE_API_BASE_URL to your Render URL.");
} else {
    console.info("[PakshiAI] Using Direct Cloud API (120s limit). Ensure CORS is configured for your domain.");
}


export const uploadAudio = async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata.latitude) formData.append('latitude', String(metadata.latitude));
    if (metadata.longitude) formData.append('longitude', String(metadata.longitude));
    if (metadata.habitat) formData.append('habitat', metadata.habitat);
    if (metadata.segment_start !== undefined) formData.append('segment_start', String(metadata.segment_start));
    if (metadata.segment_end !== undefined) formData.append('segment_end', String(metadata.segment_end));

    try {
        const response = await api.post('/api/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

export const getStats = async () => {
    const response = await api.get('/api/stats');
    return response.data;
};

export default api;
