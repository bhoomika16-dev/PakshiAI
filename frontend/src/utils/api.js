import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const api = axios.create({
    baseURL: baseUrl,
    timeout: 120000, // 120s timeout for heavy ML processing
});

console.log("[PakshiAI] Initialized API client with effective baseURL:", baseUrl || "(Netlify Proxy / Relative)");
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
