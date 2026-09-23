// Navigation Page Switcher
function showPage(pageId) {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));

    // 2. Remove active state from sidebar items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 3. Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // 4. Update dynamic Page Header Title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titles = {
            'dashboard': 'Executive Campus Dashboard',
            'students': 'Student Directory & Management',
            'attendance': 'Daily Attendance Overview',
            'bus': 'Real-Time Bus Tracking',
            'canteen': 'Canteen & Food Services',
            'reminders': 'Campus Reminders & Alerts'
        };
        pageTitle.innerText = titles[pageId] || 'College Management System';
    }
}

// Set Current Date in Header
function setCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.innerText = now.toLocaleDateString('en-US', options);
    }
}

// Global Initialization
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    showPage('dashboard');
});

// Make navigation available globally
window.showPage = showPage;