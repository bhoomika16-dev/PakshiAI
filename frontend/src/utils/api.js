import axios from 'axios';

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const api = axios.create({
    baseURL: baseUrl,
    timeout: 60000, // 60s timeout for heavy ML processing
});

console.log("[PakshiAI] Initialized API client with baseURL:", baseUrl || "(Relative)");
if (!baseUrl) {
    console.warn("[PakshiAI] WARNING: No VITE_API_BASE_URL found. API calls will fail in production unless environment variables are set and the app is redeployed.");
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
