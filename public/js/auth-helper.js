/**
 * Authentication Helper Utilities
 * Include this file in HTML pages that need authentication
 */

// Get JWT token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set JWT token in localStorage and cookie
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
    // Also set as cookie for backend protection
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);
    document.cookie = `authToken=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
}

// Remove JWT token from localStorage and cookie
function removeAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tenant');
    // Clear cookie
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Get tenant data from localStorage
function getTenantData() {
    const tenantStr = localStorage.getItem('tenant');
    return tenantStr ? JSON.parse(tenantStr) : null;
}

// Make authenticated fetch request
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    // Add Authorization header
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // If unauthorized, redirect to login
    if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        window.location.href = '/pages/auth/login.html';
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    removeAuthToken();
    window.location.href = '/pages/auth/login.html';
}

// Initialize auth check on protected pages
// Call this in your page's DOMContentLoaded or script
function initAuthCheck() {
    // Skip auth check for login and signup pages
    const currentPath = window.location.pathname;
    if (currentPath.includes('/auth/login.html') || currentPath.includes('/auth/signup.html')) {
        return;
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        window.location.href = '/pages/auth/login.html';
    }
}

// Example usage in your HTML pages:
/*
<script src="/js/auth-helper.js"></script>
<script>
    // Protect the page
    initAuthCheck();
    
    // Make authenticated API call
    async function fetchMyData() {
        try {
            const response = await authenticatedFetch('/api/v1/tenants/123');
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
</script>
*/
