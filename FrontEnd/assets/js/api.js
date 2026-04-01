const API_BASE_URL = 'http://localhost:8080/api';

// get the JWT token from LocalStorage
function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

function checkAuth() {
    if (!getAuthToken()) {
        window.location.href = '../pages/login.html';
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    window.location.href = '../pages/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});