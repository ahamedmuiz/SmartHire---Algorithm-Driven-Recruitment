document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Invalid credentials');
                    return response.json();
                })
                .then(data => {
                    // Save the token and role in LocalStorage
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('user_role', data.role);

                    // Redirect based on role
                    if (data.role === 'ROLE_HR') {
                        window.location.href = 'hr-dashboard.html';
                    } else {
                        window.location.href = 'candidate-dashboard.html';
                    }
                })
                .catch(error => alert('Login failed: ' + error.message));
        });
    }

    // --- REGISTRATION LOGIC ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();

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
                .then(response => {
                    if (!response.ok) throw new Error('Registration failed');
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                })
                .catch(error => alert(error.message));
        });
    }
});