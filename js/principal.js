// ============================================
// EquiRed - Principal (Feed Social)
// ============================================

let currentPage = 1;
let hasMore = true;
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que checkSession termine
    setTimeout(() => {
        initFeed();
    }, 300);
});

function initFeed() {
    // Mostrar caja de publicación o prompt de login
    if (currentUser) {
        const newPostBox = document.getElementById('new-post-box');
        const loginPrompt = document.getElementById('login-prompt');
        if (newPostBox) newPostBox.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';

        const avatar = document.getElementById('new-post-avatar');
        if (avatar && currentUser.nombre) {
            avatar.textContent = getInitials(currentUser.nombre);
        }
    } else {
        const newPostBox = document.getElementById('new-post-box');
        const loginPrompt = document.getElementById('login-prompt');
        if (newPostBox) newPostBox.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }

    loadPosts();
}

// ---- Cargar publicaciones ----
async function loadPosts() {
    if (isLoading) return;
    isLoading = true;

    const data = await apiFetch(`${API_BASE}/publicaciones.php?page=${currentPage}`);
    const loading = document.getElementById('feed-loading');
    if (loading) loading.style.display = 'none';

    if (data.success) {
        const container = document.getElementById('feed-container');
        const posts = data.data.publicaciones;

        posts.forEach(post => {
            container.insertAdjacentHTML('beforeend', renderPost(post));
        });

        hasMore = data.data.has_more;
        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
        }

        if (posts.length === 0 && currentPage === 1) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">📝</div>
                    <h3 class="empty-state__title">Aún no hay publicaciones</h3>
                    <p class="empty-state__desc">¡Sé el primero en compartir algo con la comunidad!</p>
                </div>
            `;
        }
    } else if (typeof DEMO_DATA !== 'undefined' && currentPage === 1) {
        // Modo demo: mostrar publicaciones de ejemplo
        const container = document.getElementById('feed-container');
        const posts = DEMO_DATA.publicaciones;
        container.innerHTML = '';
        posts.forEach(post => {
            container.insertAdjacentHTML('beforeend', renderPost(post));
        });
        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } else {
        showToast('Error al cargar publicaciones.', 'error');
    }

    isLoading = false;
}

function loadMorePosts() {
    currentPage++;
    loadPosts();
}

// ---- Renderizar publicación ----
function renderPost(post) {
    const initials = getInitials(post.autor_nombre);
    const time = timeAgo(post.fecha_creacion);
    const likedClass = post.user_liked ? 'liked' : '';
    const likeIcon = post.user_liked ? '💜' : '🤍';

    const tipoLabels = {
        'beneficiario': 'Beneficiario',
        'empresa': 'Empresa',
        'profesional': 'Profesional',
        'donante': 'Donante'
    };

    let imageHTML = '';
    if (post.imagen_url) {
        imageHTML = `<img class="post-card__image" src="${post.imagen_url}" alt="Imagen de publicación">`;
    }

    let commentsHTML = '';
    if (post.comentarios && post.comentarios.length > 0) {
        commentsHTML = '<div class="post-card__comments">';
        post.comentarios.forEach(c => {
            const cInitials = getInitials(c.autor_nombre);
            commentsHTML += `
                <div class="comment">
                    <div class="comment__avatar">${cInitials}</div>
                    <div class="comment__body">
                        <div class="comment__author">${c.autor_nombre}</div>
                        <div class="comment__text">${c.contenido}</div>
                    </div>
                </div>
            `;
        });
        commentsHTML += '</div>';
    }

    return `
        <div class="post-card" id="post-${post.id}">
            <div class="post-card__header">
                <div class="post-card__avatar">${initials}</div>
                <div>
                    <div class="post-card__author">${post.autor_nombre}</div>
                    <div class="post-card__time">${time}</div>
                </div>
                <span class="post-card__badge">${tipoLabels[post.autor_tipo] || ''}</span>
            </div>
            <div class="post-card__content">${post.contenido}</div>
            ${imageHTML}
            <div class="post-card__stats">
                <span id="like-count-${post.id}">${post.total_likes} me gusta</span>
                <span>${post.total_comentarios} comentarios</span>
            </div>
            <div class="post-card__actions">
                <button class="post-card__action ${likedClass}" id="like-btn-${post.id}" onclick="toggleLike(${post.id})">
                    <span id="like-icon-${post.id}">${likeIcon}</span> Me gusta
                </button>
                <button class="post-card__action" onclick="toggleComments(${post.id})" id="comment-toggle-${post.id}">
                    💬 Comentar
                </button>
                <button class="post-card__action" id="share-btn-${post.id}">
                    🔗 Compartir
                </button>
            </div>
            ${commentsHTML}
            <div class="comment-form" id="comment-form-${post.id}" style="display: none;">
                <input type="text" placeholder="Escribe un comentario..." id="comment-input-${post.id}" 
                    onkeypress="if(event.key==='Enter')addComment(${post.id})">
                <button onclick="addComment(${post.id})">Enviar</button>
            </div>
        </div>
    `;
}

// ---- Crear publicación ----
async function createPost() {
    const content = document.getElementById('new-post-content');
    const text = content.value.trim();

    if (!text) {
        showToast('Escribe algo para publicar.', 'warning');
        return;
    }

    const btn = document.getElementById('btn-publish');
    btn.disabled = true;

    const data = await apiFetch(`${API_BASE}/publicaciones.php?action=create`, {
        method: 'POST',
        body: JSON.stringify({ contenido: text })
    });

    if (data.success) {
        const container = document.getElementById('feed-container');
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // Insertar al inicio del feed
        container.insertAdjacentHTML('afterbegin', renderPost(data.data));
        content.value = '';
        showToast('¡Publicación creada! 🎉', 'success');
    } else {
        showToast(data.error || 'Error al publicar.', 'error');
    }

    btn.disabled = false;
}

// ---- Toggle Like ----
async function toggleLike(postId) {
    if (!currentUser) {
        showToast('Inicia sesión para dar me gusta.', 'warning');
        return;
    }

    const data = await apiFetch(`${API_BASE}/publicaciones.php?action=like`, {
        method: 'POST',
        body: JSON.stringify({ publicacion_id: postId })
    });

    if (data.success) {
        const btn = document.getElementById(`like-btn-${postId}`);
        const icon = document.getElementById(`like-icon-${postId}`);
        const count = document.getElementById(`like-count-${postId}`);

        if (data.data.liked) {
            btn.classList.add('liked');
            icon.textContent = '💜';
        } else {
            btn.classList.remove('liked');
            icon.textContent = '🤍';
        }
        count.textContent = `${data.data.total_likes} me gusta`;
    }
}

// ---- Toggle Comments ----
function toggleComments(postId) {
    const form = document.getElementById(`comment-form-${postId}`);
    if (form) {
        const isVisible = form.style.display !== 'none';
        form.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            document.getElementById(`comment-input-${postId}`).focus();
        }
    }
}

// ---- Add Comment ----
async function addComment(postId) {
    if (!currentUser) {
        showToast('Inicia sesión para comentar.', 'warning');
        return;
    }

    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();

    if (!text) return;

    const data = await apiFetch(`${API_BASE}/publicaciones.php?action=comment`, {
        method: 'POST',
        body: JSON.stringify({ publicacion_id: postId, contenido: text })
    });

    if (data.success) {
        const comment = data.data;
        const initials = getInitials(comment.autor_nombre);
        
        // Buscar o crear contenedor de comentarios
        let commentsContainer = document.querySelector(`#post-${postId} .post-card__comments`);
        if (!commentsContainer) {
            commentsContainer = document.createElement('div');
            commentsContainer.className = 'post-card__comments';
            const form = document.getElementById(`comment-form-${postId}`);
            form.parentNode.insertBefore(commentsContainer, form);
        }

        commentsContainer.insertAdjacentHTML('beforeend', `
            <div class="comment">
                <div class="comment__avatar">${initials}</div>
                <div class="comment__body">
                    <div class="comment__author">${comment.autor_nombre}</div>
                    <div class="comment__text">${comment.contenido}</div>
                </div>
            </div>
        `);

        input.value = '';
        showToast('Comentario añadido.', 'success');
    } else {
        showToast(data.error || 'Error al comentar.', 'error');
    }
}
