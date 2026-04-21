// ============================================
// EquiRed - App Global (Lógica compartida)
// ============================================

const API_BASE = 'api';

// ---- Estado global ----
let currentUser = null;

// ---- Inicialización ----
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initNavbar();
    initAnimations();
});

// ---- Verificar sesión ----
async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/auth.php?action=session`);
        const data = await res.json();
        if (data.success) {
            currentUser = data.data;
            updateNavbarAuth(true);
        } else {
            currentUser = null;
            updateNavbarAuth(false);
        }
    } catch (e) {
        currentUser = null;
        updateNavbarAuth(false);
    }
}

// ---- Navbar ----
function initNavbar() {
    // Scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        });
    }

    // Mobile toggle
    const toggle = document.querySelector('.navbar__mobile-toggle');
    const links = document.querySelector('.navbar__links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            links.classList.toggle('active');
        });
    }

    // Active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

// ---- Actualizar navbar según auth ----
function updateNavbarAuth(isLoggedIn) {
    const authContainer = document.querySelector('.navbar__auth');
    if (!authContainer) return;

    if (isLoggedIn && currentUser) {
        const initials = getInitials(currentUser.nombre);
        authContainer.innerHTML = `
            <div class="navbar__user">
                <div class="navbar__user-avatar">${initials}</div>
                <span>${currentUser.nombre.split(' ')[0]}</span>
            </div>
            <button class="btn btn--ghost btn--sm" onclick="logout()" id="btn-logout">Salir</button>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="login.html" class="btn btn--ghost btn--sm" id="btn-login-nav">Ingresar</a>
            <a href="registro.html" class="btn btn--primary btn--sm" id="btn-register-nav">Registrarse</a>
        `;
    }
}

// ---- Logout ----
async function logout() {
    try {
        await fetch(`${API_BASE}/auth.php?action=logout`, { method: 'POST' });
    } catch (e) {}
    currentUser = null;
    updateNavbarAuth(false);
    window.location.href = 'index.html';
}

// ---- Animaciones de entrada ----
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
        observer.observe(el);
    });
}

// ---- Utilidades ----
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff/3600)} horas`;
    if (diff < 604800) return `Hace ${Math.floor(diff/86400)} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount);
}

// ---- Toast notifications ----
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <span class="toast__icon">${icons[type] || icons.info}</span>
        <span class="toast__message">${message}</span>
        <button class="toast__close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}

// ---- Fetch helper ----
async function apiFetch(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: 'Error de conexión con el servidor.' };
    }
}
