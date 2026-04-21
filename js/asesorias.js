// ============================================
// EquiRed - Asesorías
// ============================================

let selectedType = '';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initAsesorias();
    }, 300);
});

function initAsesorias() {
    loadMyAsesorias();
}

// ---- Seleccionar tipo de asesoría ----
function selectType(tipo) {
    selectedType = tipo;

    // Actualizar UI
    document.querySelectorAll('.asesoria-type-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`type-${tipo}`).classList.add('active');

    // Mostrar profesionales
    const section = document.getElementById('profesionales-section');
    section.style.display = '';

    const titles = {
        'psicologica': 'Psicólogos/as disponibles',
        'juridica': 'Abogados/as disponibles'
    };
    const descs = {
        'psicologica': 'Profesionales especializados en apoyo emocional y salud mental.',
        'juridica': 'Especialistas en derechos humanos y protección legal.'
    };

    document.getElementById('profesionales-title').textContent = titles[tipo];
    document.getElementById('profesionales-desc').textContent = descs[tipo];

    loadProfesionales(tipo);
}

// ---- Cargar profesionales ----
async function loadProfesionales(tipo) {
    const container = document.getElementById('profesionales-container');
    container.innerHTML = '<div class="loading-spinner"></div>';

    const data = await apiFetch(`${API_BASE}/asesorias.php?action=profesionales&tipo=${tipo}`);

    if (data.success) {
        const profs = data.data;
        if (profs.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state__icon">👤</div>
                    <h3 class="empty-state__title">No hay profesionales disponibles</h3>
                    <p class="empty-state__desc">Aún no se han registrado profesionales de este tipo.</p>
                </div>
            `;
        } else {
            container.innerHTML = profs.map(renderProfesionalCard).join('');
        }
    } else {
        showToast('Error al cargar profesionales.', 'error');
    }
}

// ---- Renderizar tarjeta de profesional ----
function renderProfesionalCard(prof) {
    const initials = getInitials(prof.nombre);
    return `
        <div class="profesional-card" id="prof-card-${prof.id}">
            <div class="profesional-card__avatar">${initials}</div>
            <h3 class="profesional-card__name">${prof.nombre}</h3>
            <p class="profesional-card__bio">${prof.bio || 'Profesional comprometido/a con la inclusión social.'}</p>
            <p class="profesional-card__stats">✅ ${prof.asesorias_completadas} asesorías completadas</p>
            <button class="btn btn--primary btn--sm btn--full" onclick="openAsesoriaModal(${prof.id}, '${prof.nombre.replace(/'/g, "\\'")}')" id="btn-request-${prof.id}">
                Solicitar asesoría
            </button>
        </div>
    `;
}

// ---- Modal de solicitud ----
function openAsesoriaModal(profId, profName) {
    if (!currentUser) {
        showToast('Inicia sesión para solicitar una asesoría.', 'warning');
        return;
    }

    const tipoLabels = {
        'psicologica': 'Psicológica',
        'juridica': 'Jurídica'
    };

    document.getElementById('modal-asesoria-title').textContent = `Solicitar Asesoría ${tipoLabels[selectedType]}`;
    document.getElementById('asesoria-profesional-id').value = profId;
    document.getElementById('asesoria-tipo').value = selectedType;
    document.getElementById('modal-profesional-info').innerHTML = `
        <p style="color: var(--gray-500); font-size: var(--font-sm);">
            <strong>Profesional:</strong> ${profName}
        </p>
        <p style="color: var(--gray-500); font-size: var(--font-sm);">
            <strong>Tipo:</strong> ${tipoLabels[selectedType]}
        </p>
    `;
    document.getElementById('asesoria-descripcion').value = '';
    document.getElementById('asesoria-modal').classList.add('active');
}

function closeAsesoriaModal() {
    document.getElementById('asesoria-modal').classList.remove('active');
}

// Cerrar al click fuera
document.addEventListener('click', (e) => {
    if (e.target.id === 'asesoria-modal') {
        closeAsesoriaModal();
    }
});

// ---- Enviar solicitud ----
async function submitAsesoria(e) {
    e.preventDefault();

    const profesionalId = document.getElementById('asesoria-profesional-id').value;
    const tipo = document.getElementById('asesoria-tipo').value;
    const descripcion = document.getElementById('asesoria-descripcion').value.trim();
    const btn = document.getElementById('btn-submit-asesoria');

    if (!descripcion) {
        showToast('Describe tu situación para que el profesional pueda ayudarte.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = await apiFetch(`${API_BASE}/asesorias.php?action=request`, {
        method: 'POST',
        body: JSON.stringify({
            profesional_id: parseInt(profesionalId),
            tipo,
            descripcion
        })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        closeAsesoriaModal();
        loadMyAsesorias();
    } else {
        showToast(data.error || 'Error al solicitar asesoría.', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Solicitar asesoría';
}

// ---- Cargar historial de asesorías ----
async function loadMyAsesorias() {
    if (!currentUser) {
        document.getElementById('asesorias-login-prompt').style.display = '';
        return;
    }

    document.getElementById('asesorias-login-prompt').style.display = 'none';
    const container = document.getElementById('asesorias-list');
    const empty = document.getElementById('asesorias-empty');

    const data = await apiFetch(`${API_BASE}/asesorias.php`);

    if (data.success) {
        const asesorias = data.data;
        if (asesorias.length === 0) {
            container.innerHTML = '';
            empty.style.display = '';
        } else {
            empty.style.display = 'none';
            container.innerHTML = asesorias.map(a => {
                const statusColors = {
                    'pendiente': 'warning',
                    'aceptada': 'primary',
                    'completada': 'success',
                    'cancelada': 'error'
                };
                const statusLabels = {
                    'pendiente': '⏳ Pendiente',
                    'aceptada': '✅ Aceptada',
                    'completada': '🎉 Completada',
                    'cancelada': '❌ Cancelada'
                };
                const tipoIcons = {
                    'psicologica': '🧠',
                    'juridica': '⚖️'
                };
                const tipoLabels = {
                    'psicologica': 'Psicológica',
                    'juridica': 'Jurídica'
                };

                const profName = a.profesional_nombre || a.solicitante_nombre || 'Por asignar';
                const isProfessional = currentUser.tipo_usuario === 'profesional';

                let actionHTML = '';
                if (isProfessional && a.estado === 'pendiente') {
                    actionHTML = `
                        <div style="display: flex; gap: var(--space-2); margin-top: var(--space-2);">
                            <button class="btn btn--success btn--sm" onclick="updateAsesoriaStatus(${a.id}, 'aceptada')">Aceptar</button>
                            <button class="btn btn--danger btn--sm" onclick="updateAsesoriaStatus(${a.id}, 'cancelada')">Rechazar</button>
                        </div>
                    `;
                } else if (isProfessional && a.estado === 'aceptada') {
                    actionHTML = `
                        <button class="btn btn--success btn--sm" onclick="updateAsesoriaStatus(${a.id}, 'completada')" style="margin-top: var(--space-2);">
                            Marcar completada
                        </button>
                    `;
                }

                return `
                    <div class="history-item" style="flex-wrap: wrap;">
                        <div class="history-item__icon">${tipoIcons[a.tipo]}</div>
                        <div class="history-item__info" style="flex: 1;">
                            <div class="history-item__title">Asesoría ${tipoLabels[a.tipo]} — ${profName}</div>
                            <div class="history-item__subtitle">${a.descripcion.substring(0, 80)}${a.descripcion.length > 80 ? '...' : ''}</div>
                            <div class="history-item__subtitle">${timeAgo(a.fecha_solicitud)}</div>
                            ${actionHTML}
                        </div>
                        <span class="badge badge--${statusColors[a.estado]}">${statusLabels[a.estado]}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

// ---- Actualizar estado (profesionales) ----
async function updateAsesoriaStatus(id, estado) {
    const data = await apiFetch(`${API_BASE}/asesorias.php?action=update`, {
        method: 'POST',
        body: JSON.stringify({ id, estado })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        loadMyAsesorias();
    } else {
        showToast(data.error || 'Error al actualizar.', 'error');
    }
}
