import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 120000, // 2 minutes
});

/**
 * Injects the Kinde Access Token into every request.
 */
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const ideaApi = {
    list: () => api.get('/ideas'),
    create: (title: string, description: string) => api.post('/ideas', { title, description }),
    delete: (id: string) => api.delete(`/ideas/${id}`),
    update: (id: string, title: string, description: string) => api.patch(`/ideas/${id}`, { title, description }),
    forge: (id: string, redo = false) => api.post(`/ideas/${id}/forge${redo ? '?redo=true' : ''}`),
    stressTest: (id: string, redo = false) => api.post(`/ideas/${id}/stress-test${redo ? '?redo=true' : ''}`),
    consult: (id: string, query: string, section?: string, chatHistory?: Array<{ role: string, text: string }>) =>
        api.post(`/ideas/${id}/consult`, { query, section, chatHistory }),
    refine: (id: string, section: string, instruction: string) =>
        api.post(`/ideas/${id}/refine`, { section, instruction }),
    addSpark: (id: string, text: string, title?: string) =>
        api.post(`/ideas/${id}/sparks`, { text, title }),
    deleteSpark: (id: string, sparkId: string) =>
        api.delete(`/ideas/${id}/sparks/${sparkId}`)
};

export default api;
