// ============================================
// EquiRed - Empleos (Jobs)
// ============================================

let searchTimeout;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initEmpleos();
    }, 300);
});

function initEmpleos() {
    // Mostrar tab de publicar si es empresa
    if (currentUser && currentUser.tipo_usuario === 'empresa') {
        const tabPublish = document.getElementById('tab-publish');
        if (tabPublish) tabPublish.style.display = '';
    }

    // Formulario de publicar empleo
    const publishForm = document.getElementById('publish-job-form');
    if (publishForm) {
        publishForm.addEventListener('submit', publishJob);
    }

    searchJobs();
}

// ---- Tabs ----
function switchTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Mostrar contenido
    document.getElementById('tab-content-search').style.display = tab === 'search' ? '' : 'none';
    document.getElementById('tab-content-my-apps').style.display = tab === 'my-apps' ? '' : 'none';
    document.getElementById('tab-content-publish').style.display = tab === 'publish' ? '' : 'none';

    if (tab === 'my-apps') {
        loadApplications();
    }
}

// ---- Buscar empleos ----
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchJobs, 300);
}

async function searchJobs() {
    const search = document.getElementById('search-input')?.value || '';
    const tipo = document.getElementById('filter-tipo')?.value || '';
    const container = document.getElementById('jobs-container');
    const empty = document.getElementById('jobs-empty');
    const loading = document.getElementById('jobs-loading');

    if (loading) loading.style.display = '';
    if (empty) empty.style.display = 'none';

    let url = `${API_BASE}/empleos.php?search=${encodeURIComponent(search)}`;
    if (tipo) url += `&tipo=${encodeURIComponent(tipo)}`;

    const data = await apiFetch(url);

    if (loading) loading.style.display = 'none';

    if (data.success) {
        const jobs = data.data;
        if (jobs.length === 0) {
            container.innerHTML = '';
            if (empty) empty.style.display = '';
        } else {
            container.innerHTML = jobs.map(renderJobCard).join('');
            if (empty) empty.style.display = 'none';
        }
    } else {
        showToast('Error al cargar empleos.', 'error');
    }
}

// ---- Renderizar tarjeta de empleo ----
function renderJobCard(job) {
    const date = new Date(job.fecha_publicacion);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    return `
        <div class="job-card" id="job-card-${job.id}">
            <div class="job-card__header">
                <div class="job-card__company-icon">🏢</div>
                <span class="job-card__type">${job.tipo_contrato}</span>
            </div>
            <h3 class="job-card__title">${job.titulo}</h3>
            <p class="job-card__company">${job.empresa_nombre}</p>
            <p class="job-card__desc">${job.descripcion}</p>
            <div class="job-card__meta">
                ${job.ubicacion ? `<span class="job-card__meta-item">📍 ${job.ubicacion}</span>` : ''}
                <span class="job-card__meta-item">📅 ${dateStr}</span>
            </div>
            <div class="job-card__footer">
                <span class="job-card__salary">${job.salario || 'A convenir'}</span>
                <button class="btn btn--primary btn--sm" onclick="openApplyModal(${job.id}, '${job.titulo.replace(/'/g, "\\'")}', '${job.empresa_nombre.replace(/'/g, "\\'")}', '${(job.requisitos || '').replace(/'/g, "\\'")}')" id="btn-apply-${job.id}">
                    Postularse
                </button>
            </div>
        </div>
    `;
}

// ---- Modal de postulación ----
function openApplyModal(jobId, title, company, requisitos) {
    if (!currentUser) {
        showToast('Inicia sesión para postularte.', 'warning');
        return;
    }

    document.getElementById('modal-job-title').textContent = `Postularse: ${title}`;
    document.getElementById('apply-job-id').value = jobId;
    document.getElementById('modal-job-details').innerHTML = `
        <p style="color: var(--gray-500); font-size: var(--font-sm); margin-bottom: var(--space-2);">
            <strong>Empresa:</strong> ${company}
        </p>
        ${requisitos ? `<p style="color: var(--gray-500); font-size: var(--font-sm);"><strong>Requisitos:</strong> ${requisitos}</p>` : ''}
    `;
    document.getElementById('apply-message').value = '';
    document.getElementById('apply-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('apply-modal').classList.remove('active');
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// ---- Enviar postulación ----
async function submitApplication(e) {
    e.preventDefault();

    const jobId = document.getElementById('apply-job-id').value;
    const mensaje = document.getElementById('apply-message').value.trim();
    const btn = document.getElementById('btn-submit-application');

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const data = await apiFetch(`${API_BASE}/empleos.php?action=apply`, {
        method: 'POST',
        body: JSON.stringify({ empleo_id: parseInt(jobId), mensaje })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        closeModal();
    } else {
        showToast(data.error || 'Error al postularse.', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Enviar postulación';
}

// ---- Mis postulaciones ----
async function loadApplications() {
    if (!currentUser) {
        document.getElementById('apps-empty').style.display = '';
        document.getElementById('applications-container').innerHTML = `
            <div class="empty-state">
                <div class="empty-state__icon">🔒</div>
                <h3 class="empty-state__title">Inicia sesión</h3>
                <p class="empty-state__desc">Necesitas una cuenta para ver tus postulaciones.</p>
                <a href="login.html" class="btn btn--primary btn--sm">Ingresar</a>
            </div>
        `;
        return;
    }

    const container = document.getElementById('applications-container');
    container.innerHTML = '<div class="loading-spinner"></div>';

    const data = await apiFetch(`${API_BASE}/empleos.php?action=applications`);

    if (data.success) {
        const apps = data.data;
        if (apps.length === 0) {
            container.innerHTML = '';
            document.getElementById('apps-empty').style.display = '';
        } else {
            document.getElementById('apps-empty').style.display = 'none';
            container.innerHTML = apps.map(app => {
                const statusColors = {
                    'pendiente': 'warning',
                    'aceptada': 'success',
                    'rechazada': 'error'
                };
                const statusLabels = {
                    'pendiente': '⏳ Pendiente',
                    'aceptada': '✅ Aceptada',
                    'rechazada': '❌ Rechazada'
                };
                return `
                    <div class="history-item">
                        <div class="history-item__icon">💼</div>
                        <div class="history-item__info">
                            <div class="history-item__title">${app.empleo_titulo}</div>
                            <div class="history-item__subtitle">${app.empresa_nombre} · ${timeAgo(app.fecha_postulacion)}</div>
                        </div>
                        <span class="badge badge--${statusColors[app.estado]}">${statusLabels[app.estado]}</span>
                    </div>
                `;
            }).join('');
        }
    } else {
        showToast('Error al cargar postulaciones.', 'error');
    }
}

// ---- Publicar empleo (empresas) ----
async function publishJob(e) {
    e.preventDefault();

    const titulo = document.getElementById('job-titulo').value.trim();
    const descripcion = document.getElementById('job-descripcion').value.trim();
    const ubicacion = document.getElementById('job-ubicacion').value.trim();
    const tipo_contrato = document.getElementById('job-contrato').value;
    const salario = document.getElementById('job-salario').value.trim();
    const requisitos = document.getElementById('job-requisitos').value.trim();
    const btn = document.getElementById('btn-publish-job');

    if (!titulo || !descripcion) {
        showToast('El título y la descripción son obligatorios.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Publicando...';

    const data = await apiFetch(`${API_BASE}/empleos.php?action=create`, {
        method: 'POST',
        body: JSON.stringify({ titulo, descripcion, ubicacion, tipo_contrato, salario, requisitos })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        document.getElementById('publish-job-form').reset();
        switchTab('search');
        searchJobs();
    } else {
        showToast(data.error || 'Error al publicar empleo.', 'error');
    }

    btn.disabled = false;
    btn.textContent = 'Publicar empleo';
}
