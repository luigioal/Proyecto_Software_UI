// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
document.addEventListener("DOMContentLoaded", () => {
    // In your JS file
    let baseUrl;

    async function initializeApp() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            baseUrl = config.baseUrl;
            localStorage.setItem('baseUrl', baseUrl);
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    initializeApp();
})