// Centralized API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get the JWT token from LocalStorage
function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

// Helper function to check if a user is logged in
function checkAuth() {
    if (!getAuthToken()) {
        window.location.href = '../pages/login.html';
    }
}

// Helper function to log out
function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    window.location.href = '../pages/login.html';
}

// Attach logout function to any logout buttons on the page
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});