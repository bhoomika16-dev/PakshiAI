import axios from 'axios';

const api = axios.create({
    baseURL: '',  // Empty string — all /api calls go through Vite proxy to backend
});

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
