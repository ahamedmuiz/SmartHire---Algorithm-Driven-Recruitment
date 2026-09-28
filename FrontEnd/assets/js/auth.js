document.addEventListener('DOMContentLoaded', () => {

    const showAlert = (message, type = 'danger') => {
        const alertBox = document.getElementById('alertBox');
        if (alertBox) {
            alertBox.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show rounded-3 small fw-semibold" role="alert">
                    <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2"></i>${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>`;
        }
    };

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const btn = document.getElementById('loginBtn');
            const originalText = btn.innerText;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Authenticating...';
            btn.disabled = true;

            const payload = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(async response => {
                    const data = await response.json().catch(() => null);
                    if (!response.ok) throw new Error(data?.message || 'Invalid email or password');
                    return data;
                })
                .then(data => {
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_role', data.role);

                    if (data.role === 'ROLE_HR') {
                        window.location.href = 'hr-dashboard.html';
                    } else {
                        window.location.href = 'candidate-dashboard.html';
                    }
                })
                .catch(error => {
                    showAlert(error.message);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const btn = document.getElementById('regBtn');
            const originalText = btn.innerText;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating Account...';
            btn.disabled = true;

            const payload = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value,
                role: document.getElementById('role').value
            };

            fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(async response => {
                    if (!response.ok) {
                        const err = await response.text();
                        throw new Error(err || 'Registration failed');
                    }

                    showAlert('Account created successfully! Redirecting to login...', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                })
                .catch(error => {
                    showAlert(error.message);
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                });
        });
    }
});