/**
 * Auth JavaScript - Gestione Login e Registrazione
 * MIGRATO PER USARE API
 */

document.addEventListener('DOMContentLoaded', async () => {
    initLoginForm();
    initRegisterForm();
    checkUrlParams();
});

/**
 * Gestione form login
 */
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');

        hideMessage(errorDiv);

        if (!email || !password) {
            showMessage(errorDiv, 'Compila tutti i campi');
            return;
        }

        try {
            // Tentativo login con API
            const result = await window.userManager.login(email, password);

            if (result.success) {
                showMessage(errorDiv, 'Login effettuato! Reindirizzamento...');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage(errorDiv, result.message);
            }
        } catch (error) {
            showMessage(errorDiv, error.message || 'Errore durante il login');
        }
    });
}

/**
 * Gestione form registrazione
 */
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const cognome = document.getElementById('cognome').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');

        // Nascondi messaggi precedenti
        hideMessage(errorDiv);
        hideMessage(successDiv);

        // Validazione
        if (!nome || !cognome || !email || !password || !confirmPassword) {
            showMessage(errorDiv, 'Compila tutti i campi');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(errorDiv, 'Le password non corrispondono');
            return;
        }

        // Validazione password
        if (!isValidPassword(password)) {
            showMessage(errorDiv, 'La password non soddisfa i requisiti minimi');
            return;
        }

        // Registrazione con API
        const result = await window.userManager.register({
            nome,
            cognome,
            email,
            password,
            telefono: ''
        });

        if (result.success) {
            successDiv.textContent = 'Registrazione completata! Reindirizzamento...';
            successDiv.classList.add('show');

            setTimeout(() => {
                window.location.href = 'login.html?registered=1';
            }, 1500);
        } else {
            showMessage(errorDiv, result.message);
        }
    });
}

/**
 * Controlla parametri URL
 */
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === '1') {
        const successMessage = document.querySelector('.form-success');
        if (successMessage) {
            successMessage.textContent = 'Registrazione completata! Ora puoi accedere.';
            successMessage.classList.add('show');
        }
    }
}

/**
 * Toggle visibilità password
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Verifica forza password
 */
function checkPasswordStrength(password) {
    const reqLength = document.getElementById('req-length');
    const reqNumber = document.getElementById('req-number');
    const reqLetter = document.getElementById('req-letter');
    const submitBtn = document.getElementById('submit-btn');

    // Lunghezza minima
    updateRequirement(reqLength, password.length >= 8);

    // Numero
    updateRequirement(reqNumber, /\d/.test(password));

    // Lettera
    updateRequirement(reqLetter, /[a-zA-Z]/.test(password));

    // Abilita/disabilita pulsante
    if (submitBtn) {
        submitBtn.disabled = !isValidPassword(password);
    }
}

function updateRequirement(element, isValid) {
    if (isValid) {
        element.classList.add('valid');
        element.querySelector('i').classList.remove('fa-circle');
        element.querySelector('i').classList.add('fa-check-circle');
    } else {
        element.classList.remove('valid');
        element.querySelector('i').classList.add('fa-circle');
        element.querySelector('i').classList.remove('fa-check-circle');
    }
}

function isValidPassword(password) {
    return password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);
}

/**
 * Mostra/nascondi messaggi
 */
function showMessage(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function hideMessage(element) {
    element.textContent = '';
    element.classList.remove('show');
}

// Esporta funzioni globali
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkPasswordStrength = checkPasswordStrength;
