/**
 * Storage Manager - Gestione dati con API Backend
 * MIGRATO DA localStorage A API
 */

// Usa API client se disponibile, altrimenti fallback a localStorage
const USE_API = typeof window.apiClient !== 'undefined';

/**
 * UserManager - Gestione utenti (API o localStorage)
 */
class UserManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    async register(userData) {
        try {
            if (USE_API) {
                const result = await window.apiClient.register(userData);
                return { success: true, user: result };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                USERS: 'portal_assistenza_users',
                CURRENT_USER: 'portal_assistenza_current_user'
            };
            
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            
            if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
                return { success: false, message: 'Email già registrata' };
            }
            
            const newUser = {
                id: 'user_' + Date.now(),
                ...userData,
                email: userData.email.toLowerCase(),
                telefono: '',
                dataRegistrazione: new Date().toISOString(),
                ultimoAccesso: null,
                password: this._hashPassword(userData.password)
            };
            
            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            this._saveCurrentUser(this._sanitizeUser(newUser));
            
            return { success: true, user: this._sanitizeUser(newUser) };
        } catch (error) {
            return { success: false, message: error.message || 'Errore registrazione' };
        }
    }

    async login(email, password) {
        try {
            if (USE_API) {
                const result = await window.apiClient.login(email, password);
                // Salva token e utente
                const userResponse = await window.apiClient.getMe();
                this._saveCurrentUser(userResponse);
                return { success: true, user: userResponse };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                USERS: 'portal_assistenza_users',
                CURRENT_USER: 'portal_assistenza_current_user'
            };
            
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            
            if (!user || user.password !== this._hashPassword(password)) {
                return { success: false, message: 'Email o password non corretti' };
            }
            
            user.ultimoAccesso = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            this._saveCurrentUser(this._sanitizeUser(user));
            
            return { success: true, user: this._sanitizeUser(user) };
        } catch (error) {
            return { success: false, message: error.message || 'Errore login' };
        }
    }

    async logout() {
        try {
            if (USE_API) {
                await window.apiClient.logout();
            }
        } catch (error) {
            console.error('Errore logout:', error);
        }
        
        localStorage.removeItem('portal_assistenza_current_user');
        localStorage.removeItem('token');
    }

    getCurrentUser() {
        const user = localStorage.getItem('portal_assistenza_current_user');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    _saveCurrentUser(user) {
        localStorage.setItem('portal_assistenza_current_user', JSON.stringify(user));
    }

    _hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'hash_' + Math.abs(hash).toString(16);
    }

    _sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }

    async updateProfile(data) {
        try {
            if (USE_API) {
                const result = await window.apiClient.updateUserProfile(data);
                this._saveCurrentUser(result);
                return { success: true, user: result };
            }
            
            // Fallback localStorage
            const user = this.getCurrentUser();
            if (!user) {
                return { success: false, message: 'Utente non loggato' };
            }
            
            if (data.nome) user.nome = data.nome;
            if (data.cognome) user.cognome = data.cognome;
            if (data.telefono !== undefined) user.telefono = data.telefono;
            
            this._saveCurrentUser(user);
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.message || 'Errore aggiornamento' };
        }
    }

    async changePassword(oldPassword, newPassword) {
        try {
            if (USE_API) {
                // Aggiorna profilo con nuova password
                return await this.updateProfile({ password: newPassword });
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                USERS: 'portal_assistenza_users',
                CURRENT_USER: 'portal_assistenza_current_user'
            };
            
            const user = this.getCurrentUser();
            if (!user) {
                return { success: false, message: 'Utente non loggato' };
            }
            
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
            const userIndex = users.findIndex(u => u.id === user.id);
            
            if (userIndex === -1) {
                return { success: false, message: 'Utente non trovato' };
            }
            
            if (users[userIndex].password !== this._hashPassword(oldPassword)) {
                return { success: false, message: 'Password attuale non corretta' };
            }
            
            users[userIndex].password = this._hashPassword(newPassword);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            
            user.password = users[userIndex].password;
            this._saveCurrentUser(user);
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Errore cambio password' };
        }
    }
}

/**
 * TicketManager - Gestione ticket (API o localStorage)
 */
class TicketManager {
    constructor() {
        this.currentUser = null;
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    async createTicket(ticketData) {
        try {
            if (USE_API && this.currentUser) {
                const result = await window.apiClient.createTicket(ticketData);
                return { success: true, ticket: result };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            
            const newTicket = {
                id: 'TKT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000),
                userId: this.currentUser?.id,
                oggetto: ticketData.oggetto,
                messaggio: ticketData.descrizione,
                categoria: ticketData.categoria,
                priorita: ticketData.priorita,
                stato: 'apertura',
                dataCreazione: new Date().toISOString(),
                ultimoAggiornamento: new Date().toISOString(),
                allegato: ticketData.allegato || null,
                messaggi: [{
                    id: Date.now(),
                    autore: 'utente',
                    messaggio: ticketData.descrizione,
                    data: new Date().toISOString()
                }]
            };
            
            tickets.push(newTicket);
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
            
            return { success: true, ticket: newTicket };
        } catch (error) {
            return { success: false, message: error.message || 'Errore creazione ticket' };
        }
    }

    async getTickets(filters = {}) {
        try {
            if (USE_API) {
                return await window.apiClient.getTickets(filters);
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            
            if (!this.currentUser) {
                return tickets;
            }
            
            return tickets.filter(t => t.userId === this.currentUser.id);
        } catch (error) {
            console.error('Errore getTickets:', error);
            return [];
        }
    }

    async getTicket(ticketId) {
        try {
            if (USE_API) {
                return await window.apiClient.getTicket(ticketId);
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            return tickets.find(t => t.id === ticketId) || null;
        } catch (error) {
            console.error('Errore getTicket:', error);
            return null;
        }
    }

    async updateTicket(ticketId, ticketData) {
        try {
            if (USE_API) {
                const result = await window.apiClient.updateTicket(ticketId, ticketData);
                return { success: true, ticket: result };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            const ticketIndex = tickets.findIndex(t => t.id === ticketId);
            
            if (ticketIndex === -1) {
                return { success: false, message: 'Ticket non trovato' };
            }
            
            Object.assign(tickets[ticketIndex], ticketData);
            tickets[ticketIndex].ultimoAggiornamento = new Date().toISOString();
            
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
            
            return { success: true, ticket: tickets[ticketIndex] };
        } catch (error) {
            return { success: false, message: error.message || 'Errore aggiornamento' };
        }
    }

    async updateTicketStatus(ticketId, nuovoStato) {
        try {
            if (USE_API) {
                const result = await window.apiClient.updateTicketStatus(ticketId, nuovoStato);
                return { success: true, ticket: result };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            const ticketIndex = tickets.findIndex(t => t.id === ticketId);
            
            if (ticketIndex === -1) {
                return { success: false, message: 'Ticket non trovato' };
            }
            
            tickets[ticketIndex].stato = nuovoStato;
            tickets[ticketIndex].ultimoAggiornamento = new Date().toISOString();
            
            if (nuovoStato === 'risolto') {
                tickets[ticketIndex].dataChiusura = new Date().toISOString();
            }
            
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
            
            return { success: true, ticket: tickets[ticketIndex] };
        } catch (error) {
            return { success: false, message: error.message || 'Errore aggiornamento stato' };
        }
    }

    async deleteTicket(ticketId) {
        try {
            if (USE_API) {
                await window.apiClient.deleteTicket(ticketId);
                return { success: true };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            let tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            tickets = tickets.filter(t => t.id !== ticketId);
            
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message || 'Errore eliminazione' };
        }
    }

    async addMessage(ticketId, contenuto) {
        try {
            if (USE_API) {
                const result = await window.apiClient.addMessage(ticketId, contenuto);
                return { success: true, message: result };
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            const ticketIndex = tickets.findIndex(t => t.id === ticketId);
            
            if (ticketIndex === -1) {
                return { success: false, message: 'Ticket non trovato' };
            }
            
            const newMessage = {
                id: Date.now(),
                autore: 'utente',
                messaggio: contenuto,
                data: new Date().toISOString()
            };
            
            tickets[ticketIndex].messaggi.push(newMessage);
            tickets[ticketIndex].ultimoAggiornamento = new Date().toISOString();
            
            localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
            
            return { success: true, message: newMessage };
        } catch (error) {
            return { success: false, message: error.message || 'Errore aggiunta messaggio' };
        }
    }

    async getMessages(ticketId) {
        try {
            if (USE_API) {
                return await window.apiClient.getMessages(ticketId);
            }
            
            // Fallback localStorage
            const ticket = await this.getTicket(ticketId);
            return ticket ? ticket.messaggi || [] : [];
        } catch (error) {
            console.error('Errore getMessages:', error);
            return [];
        }
    }

    getStats() {
        try {
            if (USE_API && this.currentUser) {
                return window.apiClient.getTicketStats();
            }
            
            // Fallback localStorage
            const STORAGE_KEYS = {
                TICKETS: 'portal_assistenza_tickets'
            };
            
            const tickets = JSON.parse(localStorage.getItem(STORAGE_KEYS.TICKETS) || '[]');
            
            if (!this.currentUser) {
                return { totali: 0, aperti: 0, in_lavorazione: 0, risolti: 0 };
            }
            
            const userTickets = tickets.filter(t => t.userId === this.currentUser.id);
            
            return {
                totali: userTickets.length,
                aperti: userTickets.filter(t => t.stato === 'apertura').length,
                in_lavorazione: userTickets.filter(t => t.stato === 'in-lavorazione').length,
                risolti: userTickets.filter(t => t.stato === 'risolto').length
            };
        } catch (error) {
            console.error('Errore getStats:', error);
            return { totali: 0, aperti: 0, in_lavorazione: 0, risolti: 0 };
        }
    }
}

// Esporta istanze globali
window.userManager = new UserManager();
window.ticketManager = new TicketManager();