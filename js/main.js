/**
 * Portale Assistenza Studio81 SRL - Main JavaScript
 * Funzionalità: Hamburger menu, Header shadow, Smooth scroll, Form handling
 */

document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initHeaderShadow();
    initSmoothScroll();
    initAuthNavigation();
    initTicketForm();
    initCheckTicketForm();
    checkUrlParams();
});

/**
 * Controlla URL params per azioni
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === '1') {
        // Mostra messaggio di benvenuto
        const successMessage = document.querySelector('.form-success');
        if (successMessage) {
            successMessage.textContent = 'Registrazione completata! Ora puoi accedere.';
            successMessage.classList.add('show');
        }
    }
}

/**
 * Hamburger Menu - Toggle navigazione mobile
 */
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');

        // Aggiorna aria-label
        const isActive = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-label', isActive ? 'Chiudi menu' : 'Apri menu');
    });

    // Chiudi menu al click su un link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-label', 'Apri menu');
        });
    });

    // Chiudi menu al click fuori
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-label', 'Apri menu');
        }
    });
}

/**
 * Header Shadow - Aggiunge ombra allo scroll
 */
function initHeaderShadow() {
    const header = document.querySelector('.header');
    if (!header) return;

    const toggleShadow = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Toggle iniziale e allo scroll
    window.addEventListener('scroll', toggleShadow, { passive: true });
    toggleShadow();
}

/**
 * Smooth Scroll - Scroll fluido per anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Gestione navigazione autenticazione
 */
function initAuthNavigation() {
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navLinks = document.getElementById('nav-links');

    if (!navLogin || !navRegister) return;

    // Check if storage is available
    try {
        const test = localStorage.getItem('test');
        localStorage.removeItem('test');
    } catch (e) {
        return;
    }

    const user = window.userManager?.getCurrentUser();

    if (user) {
        // Utente loggato - mostra dashboard
        navLogin.innerHTML = '';
        navRegister.innerHTML = '';

        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = `<a href="dashboard.html" class="nav-dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;

        const userLink = document.createElement('li');
        userLink.innerHTML = `<a href="profilo.html" class="nav-user"><i class="fas fa-user"></i> ${user.nome || 'Profilo'}</a>`;

        navLinks.insertBefore(dashboardLink, navLogin);
        navLinks.insertBefore(userLink, navLogin);
    } else {
        // Utente non loggato
        navLogin.innerHTML = '<a href="login.html" class="btn-login"><i class="fas fa-sign-in-alt"></i> Accedi</a>';
        navRegister.innerHTML = '<a href="registrazione.html" class="btn-register"><i class="fas fa-user-plus"></i> Registrati</a>';
    }
}

/**
 * Gestione invio ticket
 */
async function initTicketForm() {
    const form = document.getElementById('ticket-form');
    const successMessage = document.getElementById('success-message');
    const ticketNumber = document.getElementById('ticket-number');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = window.userManager?.getCurrentUser();

        // Se utente loggato, salva ticket via API
        if (user && window.ticketManager) {
            // Gestione allegato
            let allegato = null;
            const fileInput = document.getElementById('allegato');
            if (fileInput && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                try {
                    // Upload file
                    const formData = new FormData();
                    formData.append('file', file);

                    const uploadResponse = await fetch(`${window.apiClient.baseURL}/upload/file`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${window.apiClient.getToken()}`
                        },
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Errore upload file');
                    }

                    allegato = await uploadResponse.json();
                } catch (uploadError) {
                    console.error('Errore upload:', uploadError);
                    alert('Errore durante l\'upload del file. Il ticket verrà creato senza allegato.');
                }
            }

            const ticketData = {
                oggetto: document.getElementById('oggetto').value.trim(),
                descrizione: document.getElementById('messaggio').value.trim(),
                categoria: document.getElementById('categoria').value,
                priorita: document.getElementById('priorita').value,
                nome: document.getElementById('nome').value.trim(),
                cognome: document.getElementById('cognome').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                allegato: allegato ? JSON.stringify(allegato) : null
            };

            try {
                const result = await window.ticketManager.createTicket(ticketData);

                if (result.success) {
                    // Mostra messaggio successo
                    if (ticketNumber) {
                        ticketNumber.textContent = result.ticket.id || result.ticket.ticket_id;
                    }

                    form.style.display = 'none';
                    if (successMessage) {
                        successMessage.style.display = 'block';
                        successMessage.classList.add('fade-in');
                    }

                    // Scroll al messaggio
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Aggiorna pulsante
                    const newTicketBtn = successMessage.querySelector('button');
                    if (newTicketBtn) {
                        newTicketBtn.onclick = () => window.location.href = 'dashboard.html';
                        newTicketBtn.innerHTML = '<i class="fas fa-list"></i> Vai ai tuoi ticket';
                    }
                    return;
                } else {
                    console.error('Errore creazione ticket:', result.message);
                }
            } catch (error) {
                console.error('Errore API:', error);
            }
        }

        // Se utente non loggato o errore, comportamento di fallback
        const ticketId = generateTicketId();

        if (ticketNumber) {
            ticketNumber.textContent = ticketId;
        }

        form.style.display = 'none';
        if (successMessage) {
            successMessage.style.display = 'block';
            successMessage.classList.add('fade-in');
        }

        // Scroll al messaggio
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/**
 * Genera ID ticket
 */
function generateTicketId() {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    const year = new Date().getFullYear();
    return `TKT-${year}-${randomNum}`;
}

/**
 * Gestione verifica stato ticket
 */
function initCheckTicketForm() {
    const form = document.getElementById('check-ticket-form');
    const resultDiv = document.getElementById('ticket-status-result');
    const statusTicketId = document.getElementById('status-ticket-id');
    const statusBadge = document.getElementById('status-badge');
    const statusSubject = document.getElementById('status-subject');
    const statusDate = document.getElementById('status-date');
    const statusUpdate = document.getElementById('status-update');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ticketNumber = document.getElementById('ticket-number-check').value.trim();

        if (!ticketNumber) {
            alert('Inserisci il numero del ticket');
            return;
        }

        // Verifica se utente loggato e cerca ticket via API
        const user = window.userManager?.getCurrentUser();
        let ticket = null;

        if (user && window.ticketManager) {
            try {
                ticket = await window.ticketManager.getTicket(ticketNumber);
            } catch (error) {
                console.error('Errore ricerca ticket:', error);
            }
        }

        if (ticket) {
            // Ticket trovato - usa dati reali
            const date = new Date(ticket.data_creazione || ticket.dataCreazione);
            const update = new Date(ticket.ultimo_aggiornamento || ticket.ultimoAggiornamento || ticket.data_creazione);

            if (statusTicketId) statusTicketId.textContent = ticket.id;
            if (statusSubject) statusSubject.textContent = ticket.oggetto || ticket.title;
            if (statusDate) statusDate.textContent = date.toLocaleDateString('it-IT');
            if (statusUpdate) statusUpdate.textContent = update.toLocaleString('it-IT');

            if (statusBadge) {
                statusBadge.className = `status-badge ${ticket.stato}`;
                const statusLabels = {
                    'apertura': 'Aperto',
                    'aperto': 'Aperto',
                    'in-lavorazione': 'In Lavorazione',
                    'in_lavorazione': 'In Lavorazione',
                    'risolto': 'Risolto',
                    'chiuso': 'Chiuso'
                };
                statusBadge.textContent = statusLabels[ticket.stato] || ticket.stato;
            }
        } else {
            // Simulazione verifica ticket (da sostituire con chiamata API reale)
            const mockStatuses = ['apertura', 'in-lavorazione', 'risolto'];
            const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

            // Dati simulati
            const mockData = {
                ticketId: ticketNumber,
                status: randomStatus,
                subject: 'Problema con il servizio',
                date: new Date().toLocaleDateString('it-IT'),
                update: new Date().toLocaleString('it-IT')
            };

            // Visualizza risultato
            if (statusTicketId) statusTicketId.textContent = mockData.ticketId;
            if (statusSubject) statusSubject.textContent = mockData.subject;
            if (statusDate) statusDate.textContent = mockData.date;
            if (statusUpdate) statusUpdate.textContent = mockData.update;

            if (statusBadge) {
                statusBadge.className = `status-badge ${mockData.status}`;
                const statusLabels = {
                    'apertura': 'Aperto',
                    'in-lavorazione': 'In Lavorazione',
                    'risolto': 'Risolto'
                };
                statusBadge.textContent = statusLabels[mockData.status];
            }
        }

        resultDiv.style.display = 'block';
        resultDiv.classList.add('fade-in');

        // Scroll al risultato
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/**
 * Reset form ticket (per inviare un altro ticket)
 */
function resetForm() {
    const form = document.getElementById('ticket-form');
    const successMessage = document.getElementById('success-message');

    if (form) {
        form.reset();
        form.style.display = 'block';
    }

    if (successMessage) {
        successMessage.style.display = 'none';
    }

    // Scroll all'inizio del form
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Esporta funzione globale per il pulsante "Invia un altro ticket"
window.resetForm = resetForm;
