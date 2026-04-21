// ============================================
// EquiRed - Donaciones
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initDonaciones();
    }, 300);
});

function initDonaciones() {
    loadDonationStats();

    // Formulario de donación
    const form = document.getElementById('donation-form');
    if (form) {
        form.addEventListener('submit', handleDonation);
    }

    // Cargar historial si está logueado
    if (currentUser) {
        loadMyDonations();
    }
}

// ---- Seleccionar monto predefinido ----
function selectAmount(amount) {
    const input = document.getElementById('donation-amount');
    input.value = amount;

    // Resaltar botón activo
    document.querySelectorAll('.donation-amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-amount-${amount}`)?.classList.add('active');
}

// ---- Cargar estadísticas ----
async function loadDonationStats() {
    const data = await apiFetch(`${API_BASE}/donaciones.php?action=stats`);

    let stats;
    if (data.success) {
        stats = data.data;
    } else if (typeof DEMO_DATA !== 'undefined') {
        stats = DEMO_DATA.donaciones_stats;
    } else {
        return;
    }

    document.getElementById('stat-monto-total').textContent = formatCurrency(stats.total_monto);
    document.getElementById('stat-num-donaciones').textContent = stats.total_donaciones;
    document.getElementById('stat-num-donantes').textContent = stats.total_donantes;

    // Donaciones recientes
    const recentList = document.getElementById('recent-donations-list');
    if (stats.recientes && stats.recientes.length > 0) {
        recentList.innerHTML = stats.recientes.map(d => {
            const initials = getInitials(d.donante_nombre);
            return `
                <div class="recent-donation-item">
                    <div class="recent-donation-item__avatar">${initials}</div>
                    <div class="recent-donation-item__info">
                        <div class="recent-donation-item__name">${d.donante_nombre}</div>
                        <div class="recent-donation-item__msg">${d.mensaje || 'Donación solidaria'}</div>
                    </div>
                    <span class="recent-donation-item__amount">${formatCurrency(d.monto)}</span>
                </div>
            `;
        }).join('');
    } else {
        recentList.innerHTML = '<p style="color: var(--gray-400); font-size: var(--font-sm); text-align: center; padding: 1rem;">Aún no hay donaciones.</p>';
    }
}

// ---- Hacer donación ----
async function handleDonation(e) {
    e.preventDefault();

    if (!currentUser) {
        showToast('Inicia sesión para hacer una donación.', 'warning');
        return;
    }

    const monto = parseFloat(document.getElementById('donation-amount').value);
    const metodo_pago = document.getElementById('donation-method').value;
    const mensaje = document.getElementById('donation-message').value.trim();
    const btn = document.getElementById('btn-donate-submit');

    if (!monto || monto <= 0) {
        showToast('Ingresa un monto válido.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Procesando...';

    const data = await apiFetch(`${API_BASE}/donaciones.php?action=create`, {
        method: 'POST',
        body: JSON.stringify({ monto, metodo_pago, mensaje })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        document.getElementById('donation-form').reset();
        document.querySelectorAll('.donation-amount-btn').forEach(b => b.classList.remove('active'));
        
        // Recargar stats y historial
        loadDonationStats();
        loadMyDonations();
    } else {
        showToast(data.error || 'Error al procesar la donación.', 'error');
    }

    btn.disabled = false;
    btn.textContent = '💝 Donar ahora';
}

// ---- Historial de mis donaciones ----
async function loadMyDonations() {
    const container = document.getElementById('donations-history');
    const section = document.getElementById('my-donations');
    
    if (!currentUser || !container) return;

    const data = await apiFetch(`${API_BASE}/donaciones.php`);

    if (data.success && data.data.length > 0) {
        section.style.display = '';
        container.innerHTML = data.data.map(d => {
            const date = new Date(d.fecha_donacion);
            const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
            return `
                <div class="history-item">
                    <div class="history-item__icon">💝</div>
                    <div class="history-item__info">
                        <div class="history-item__title">${formatCurrency(d.monto)} — ${d.metodo_pago}</div>
                        <div class="history-item__subtitle">${d.mensaje || 'Sin mensaje'} · ${dateStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}
