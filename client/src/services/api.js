import axios from 'axios';

const API_BASE_URL =
    import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const meetingApi = {
    getHealth: () => api.get('/health'),
    getMeetings: () => api.get('/meetings'),
    getMeeting: (id) => api.get(`/meetings/${id}`),
    createMeeting: (data) => api.post('/meetings', data),
    updateMeeting: (id, data) => api.patch(`/meetings/${id}`, data),
    deleteMeeting: (id) => api.delete(`/meetings/${id}`),
    processDemo: (id) => api.post(`/meetings/${id}/process-demo`),
    analyzeMeeting: (title, audioFile) => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('audio', audioFile);

        return api.post('/meetings/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    exportMeeting: (id) => api.get(`/meetings/${id}/export`),
};

export default api;
