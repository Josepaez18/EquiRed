// ============================================
// EquiRed - Statsig Analytics & Logging
// ============================================
// Integración con Statsig para monitoreo de
// funcionamiento y análisis de uso.
// Documentación: https://docs.statsig.com/client/js-client
// ============================================

const STATSIG_CLIENT_KEY = 'client-REPLACE_WITH_YOUR_KEY';

let statsigClient = null;

// ---- Inicialización de Statsig ----
async function initStatsig() {
    try {
        if (typeof window.Statsig === 'undefined') {
            console.warn('[Statsig] SDK no cargado aún.');
            return;
        }

        const { StatsigClient } = window.Statsig;

        // Identificar al usuario si hay sesión activa
        const userObj = currentUser
            ? {
                userID: String(currentUser.id),
                custom: {
                    nombre: currentUser.nombre,
                    email: currentUser.email,
                    tipo_poblacion: currentUser.tipo_poblacion || 'no_especificado'
                }
            }
            : { userID: 'anonymous_' + getAnonymousId() };

        statsigClient = new StatsigClient(STATSIG_CLIENT_KEY, userObj);
        await statsigClient.initializeAsync();

        // Registrar vista de página automáticamente
        logPageView();

        // Escuchar clics en elementos importantes
        initClickTracking();

        console.log('[Statsig] ✅ Inicializado correctamente');
    } catch (error) {
        console.warn('[Statsig] Error al inicializar:', error);
    }
}

// ---- Generar ID anónimo persistente ----
function getAnonymousId() {
    let anonId = localStorage.getItem('equired_anon_id');
    if (!anonId) {
        anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('equired_anon_id', anonId);
    }
    return anonId;
}

// ---- Registrar vista de página ----
function logPageView() {
    if (!statsigClient) return;

    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    statsigClient.logEvent('page_view', pageName, {
        url: window.location.href,
        referrer: document.referrer || 'direct',
        title: document.title,
        timestamp: new Date().toISOString()
    });
}

// ---- Registrar evento personalizado ----
function logStatsigEvent(eventName, value = null, metadata = {}) {
    if (!statsigClient) return;

    statsigClient.logEvent(eventName, value, {
        ...metadata,
        page: window.location.pathname.split('/').pop() || 'index.html',
        timestamp: new Date().toISOString()
    });
}

// ---- Actualizar usuario en Statsig (al login) ----
async function updateStatsigUser(user) {
    if (!statsigClient) return;

    try {
        await statsigClient.updateUserAsync({
            userID: String(user.id),
            custom: {
                nombre: user.nombre,
                email: user.email,
                tipo_poblacion: user.tipo_poblacion || 'no_especificado'
            }
        });
    } catch (error) {
        console.warn('[Statsig] Error al actualizar usuario:', error);
    }
}

// ---- Tracking automático de clics en elementos clave ----
function initClickTracking() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[id]');
        if (!target) return;

        const id = target.id;

        // Botones de navegación
        if (id.startsWith('nav-') || id.startsWith('btn-')) {
            logStatsigEvent('button_click', id, {
                text: target.textContent.trim().substring(0, 50),
                tag: target.tagName
            });
        }

        // CTA principal
        if (id === 'cta-register') {
            logStatsigEvent('cta_click', 'registro', {
                section: 'landing_cta'
            });
        }

        // Feature cards
        if (id.startsWith('feature-')) {
            logStatsigEvent('feature_interest', id.replace('feature-', ''), {
                section: 'features'
            });
        }
    });
}

// ---- Iniciar después de que el DOM y la sesión estén listos ----
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que checkSession termine (definida en app.js)
    // para tener datos del usuario disponibles
    setTimeout(() => {
        initStatsig();
    }, 1500);
});
