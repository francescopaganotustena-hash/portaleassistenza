/**
 * API Client - Gestione chiamate API
 */

// Usa configurazione centralizzata da config.js
const API_BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : 'http://localhost:8000/api';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getToken() {
        return this.token || localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Errore API');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch(`${this.baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Errore login');
        }

        this.setToken(data.access_token);
        return data;
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    // User endpoints
    async getUserProfile() {
        return this.request('/users/me');
    }

    async updateUserProfile(userData) {
        return this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    // Ticket endpoints
    async createTicket(ticketData) {
        return this.request('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    async getTickets(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/tickets?${params}`);
    }

    async getTicket(ticketId) {
        return this.request(`/tickets/${ticketId}`);
    }

    async updateTicket(ticketId, ticketData) {
        return this.request(`/tickets/${ticketId}`, {
            method: 'PUT',
            body: JSON.stringify(ticketData)
        });
    }

    async updateTicketStatus(ticketId, nuovoStato) {
        return this.request(`/tickets/${ticketId}/status`, {
            method: 'POST',
            body: JSON.stringify({ nuovo_stato: nuovoStato })
        });
    }

    async deleteTicket(ticketId) {
        return this.request(`/tickets/${ticketId}`, {
            method: 'DELETE'
        });
    }

    async getTicketStats() {
        return this.request('/tickets/stats');
    }

    // Message endpoints
    async addMessage(ticketId, contenuto) {
        return this.request(`/tickets/${ticketId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                contenuto,
                tipo: 'utente'
            })
        });
    }

    async getMessages(ticketId) {
        return this.request(`/tickets/${ticketId}/messages`);
    }
}

// Crea istanza globale
window.apiClient = new APIClient();
