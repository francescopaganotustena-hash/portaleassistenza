/**
 * Dashboard JavaScript - Gestione dashboard e ticket
 */

let allTickets = [];
let filteredTickets = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica login
    if (!window.userManager.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    await loadUserInfo();
    await loadTickets();
    initEventListeners();
});

/**
 * Carica informazioni utente
 */
async function loadUserInfo() {
    const user = window.userManager.getCurrentUser();
    if (!user) return;

    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (userAvatar && user.nome) {
        userAvatar.textContent = user.nome.charAt(0).toUpperCase();
    }
    if (userName && user.nome) {
        userName.textContent = `${user.nome} ${user.cognome || ''}`;
    }
    if (userEmail && user.email) {
        userEmail.textContent = user.email;
    }
}

/**
 * Carica ticket dell'utente
 */
async function loadTickets() {
    const user = window.userManager.getCurrentUser();
    if (!user) return;

    try {
        // Usa API asincrona
        allTickets = await window.ticketManager.getTickets();

        // Se è un array, usalo direttamente, altrimenti gestisci come oggetto
        if (Array.isArray(allTickets)) {
            filteredTickets = allTickets;
        } else if (allTickets && allTickets.tickets) {
            filteredTickets = allTickets.tickets;
        } else {
            filteredTickets = [];
        }

        updateStats();
        renderTickets();
    } catch (error) {
        console.error('Errore caricamento ticket:', error);
        filteredTickets = [];
        renderTickets();
    }
}

/**
 * Aggiorna statistiche
 */
function updateStats() {
    const totali = filteredTickets.length;
    const aperti = filteredTickets.filter(t => t.stato === 'apertura' || t.stato === 'aperto').length;
    const inLavorazione = filteredTickets.filter(t => t.stato === 'in-lavorazione' || t.stato === 'in_lavorazione').length;
    const risolti = filteredTickets.filter(t => t.stato === 'risolto').length;

    document.getElementById('stat-totali').textContent = totali;
    document.getElementById('stat-aperti').textContent = aperti;
    document.getElementById('stat-in-lavorazione').textContent = inLavorazione;
    document.getElementById('stat-risolti').textContent = risolti;
}

/**
 * Renderizza lista ticket
 */
function renderTickets() {
    const listContainer = document.getElementById('ticket-list');
    if (!listContainer) return;

    if (filteredTickets.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>Nessun ticket trovato</h3>
                <p>Crea un nuovo ticket per ricevere assistenza</p>
                <a href="index.html#ticket" class="btn">
                    <i class="fas fa-plus"></i> Nuovo Ticket
                </a>
            </div>
        `;
        return;
    }

    // Ordina per data decrescente
    const sortedTickets = [...filteredTickets].sort((a, b) => {
        const dateA = new Date(a.data_creazione || a.dataCreazione);
        const dateB = new Date(b.data_creazione || b.dataCreazione);
        return dateB - dateA;
    });

    listContainer.innerHTML = sortedTickets.map(ticket => {
        const date = new Date(ticket.data_creazione || ticket.dataCreazione);
        const dataFormattata = date.toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const statoLabel = {
            'apertura': 'Aperto',
            'aperto': 'Aperto',
            'in-lavorazione': 'In Lavorazione',
            'in_lavorazione': 'In Lavorazione',
            'risolto': 'Risolto',
            'chiuso': 'Chiuso'
        };

        return `
            <div class="ticket-item" onclick="viewTicket('${ticket.id}')">
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-badge ${ticket.stato}">${statoLabel[ticket.stato] || ticket.stato}</span>
                </div>
                <h3 class="ticket-title">${escapeHtml(ticket.oggetto || ticket.title)}</h3>
                <div class="ticket-meta">
                    <span><i class="fas fa-tag"></i> ${getCategoryLabel(ticket.categoria || ticket.category)}</span>
                    <span><i class="fas fa-calendar"></i> ${dataFormattata}</span>
                    <span><i class="fas fa-exclamation-circle"></i> ${getPriorityLabel(ticket.priorita || ticket.priority)}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filtra ticket
 */
function filterTickets() {
    const searchQuery = document.getElementById('search-tickets').value.toLowerCase();
    const stateFilter = document.getElementById('filter-state').value;
    const categoryFilter = document.getElementById('filter-category').value;

    // Ricarica tutti i ticket dal Manager
    const user = window.userManager.getCurrentUser();
    if (!user) return;

    window.ticketManager.getTickets().then(tickets => {
        let ticketsData = Array.isArray(tickets) ? tickets : (tickets?.tickets || []);

        filteredTickets = ticketsData.filter(ticket => {
            // Filtro ricerca
            if (searchQuery) {
                const searchMatch =
                    (ticket.oggetto || '').toLowerCase().includes(searchQuery) ||
                    (ticket.id || '').toLowerCase().includes(searchQuery) ||
                    (ticket.descrizione || ticket.messaggio || '').toLowerCase().includes(searchQuery);
                if (!searchMatch) return false;
            }

            // Filtro stato
            if (stateFilter !== 'tutti' && ticket.stato !== stateFilter) {
                return false;
            }

            // Filtro categoria
            if (categoryFilter !== 'tutte' && ticket.categoria !== categoryFilter) {
                return false;
            }

            return true;
        });

        updateStats();
        renderTickets();
    });
}

/**
 * Visualizza dettagli ticket
 */
function viewTicket(ticketId) {
    window.location.href = `ticket-dettaglio.html?id=${ticketId}`;
}

/**
 * Inizializza event listeners
 */
function initEventListeners() {
    // Chiudi dropdown utente al click fuori
    document.addEventListener('click', (e) => {
        const userInfo = document.querySelector('.dashboard-user-info');
        const dropdown = document.getElementById('user-dropdown');
        if (userInfo && !userInfo.contains(e.target) && dropdown) {
            dropdown.classList.remove('show');
        }
    });
}

/**
 * Toggle dropdown utente
 */
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

/**
 * Toggle sidebar mobile
 */
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
};

/**
 * Logout
 */
window.logout = async function() {
    await window.userManager.logout();
    window.location.href = 'index.html';
};

/**
 * Funzioni helper
 */
function getCategoryLabel(categoria) {
    const labels = {
        'tecnico': 'Problema Tecnico',
        'fatturazione': 'Fatturazione',
        'account': 'Problema Account',
        'ordine': 'Stato Ordine',
        'altro': 'Altro'
    };
    return labels[categoria] || categoria || 'Altro';
}

function getPriorityLabel(priorita) {
    const labels = {
        'bassa': 'Bassa',
        'media': 'Media',
        'alta': 'Alta'
    };
    return labels[priorita] || priorita || 'Media';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
