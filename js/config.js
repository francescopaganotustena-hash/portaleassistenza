/**
 * Configurazione Frontend
 */

// Configurazione API
const API_CONFIG = {
    // Per sviluppo locale
    // BASE_URL: 'http://localhost:8000/api',

    // Per rete aziendale (IP: 10.0.0.103)
    BASE_URL: 'http://10.0.0.103:8000/api',
    
    // Timeout richieste
    TIMEOUT: 30000,
    
    // Abilita/disabilita uso API (true = API, false = localStorage)
    USE_API: true
};

// Inizializza API client
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    if (API_CONFIG.USE_API) {
        window.apiClient = new APIClient();
        window.apiClient.baseURL = API_CONFIG.BASE_URL;
    }
}

// Utility per gestione errori
function showError(message, elementId = 'error-message') {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    } else {
        alert(message);
    }
}

function hideError(elementId = 'error-message') {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

function showMessage(element, text) {
    element.textContent = text;
    element.classList.add('show');
}

function hideMessage(element) {
    if (element) {
        element.classList.remove('show');
    }
}

// Validazione password
function isValidPassword(password) {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return minLength && hasNumber && hasLetter;
}

// Formattazione date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formattazione numeri
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num);
}

// Gestione caricamento
function showLoading(element) {
    if (element) {
        element.style.display = 'flex';
    }
}

function hideLoading(element) {
    if (element) {
        element.style.display = 'none';
    }
}

// Fetch con timeout
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = API_CONFIG.TIMEOUT } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}
