// sidebar-toggle.js - Mobile Sidebar Toggle Logic

document.addEventListener('click', function (e) {
    if (e.target.closest('#hamburger-btn')) {
        document.body.classList.toggle('sidebar-open');
    }
    // Close when overlay clicked or when a nav link is clicked (to resolve navigation instantly)
    if (e.target.closest('#sidebar-overlay') || e.target.closest('.nav-link')) {
        document.body.classList.remove('sidebar-open');
    }
});
