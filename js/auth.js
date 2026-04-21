// ============================================
// EquiRed - Auth (Login & Registro)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// ---- Login ----
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('btn-login-submit');

    if (!email || !password) {
        showToast('Completa todos los campos.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Ingresando...';

    const data = await apiFetch(`${API_BASE}/auth.php?action=login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        currentUser = data.data;
        setTimeout(() => {
            window.location.href = 'principal.html';
        }, 800);
    } else {
        showToast(data.error || 'Error al iniciar sesión.', 'error');
        btn.disabled = false;
        btn.textContent = 'Ingresar';
    }
}

// ---- Register ----
async function handleRegister(e) {
    e.preventDefault();

    const nombre = document.getElementById('reg-nombre').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    const tipo = document.querySelector('input[name="tipo_usuario"]:checked')?.value || 'beneficiario';
    const btn = document.getElementById('btn-register-submit');

    // Validaciones
    if (!nombre || !email || !password || !confirm) {
        showToast('Completa todos los campos.', 'warning');
        return;
    }

    if (!email.includes('@')) {
        showToast('Ingresa un correo electrónico válido.', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
        return;
    }

    if (password !== confirm) {
        showToast('Las contraseñas no coinciden.', 'error');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';

    const data = await apiFetch(`${API_BASE}/auth.php?action=register`, {
        method: 'POST',
        body: JSON.stringify({
            nombre,
            email,
            password,
            confirm_password: confirm,
            tipo_usuario: tipo
        })
    });

    if (data.success) {
        showToast(data.data.message, 'success');
        currentUser = data.data;
        setTimeout(() => {
            window.location.href = 'principal.html';
        }, 800);
    } else {
        showToast(data.error || 'Error al registrarse.', 'error');
        btn.disabled = false;
        btn.textContent = 'Crear cuenta';
    }
}
