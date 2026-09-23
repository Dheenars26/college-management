// Navigation Page Switcher
function showPage(pageId) {
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));

    // 2. Remove active state from sidebar items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // 3. Remove active state from top menu buttons
    const topButtons = document.querySelectorAll('.top-nav-btn');
    topButtons.forEach(btn => btn.classList.remove('active'));

    // 4. Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }

    // 5. Set active sidebar item
    const activeNav = Array.from(navItems).find(btn => btn.getAttribute('onclick')?.includes(pageId));
    if (activeNav) activeNav.classList.add('active');

    // 6. Set active top menu button
    const activeTopBtn = Array.from(topButtons).find(btn => btn.getAttribute('onclick')?.includes(pageId));
    if (activeTopBtn) activeTopBtn.classList.add('active');

    // 7. Update dynamic Page Header Title
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

    // 8. Close mobile sidebar drawer if open
    closeSidebar();
}

// Sidebar Drawer Control for Mobile / Tablet
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (menuBtn) menuBtn.classList.add('active');
    document.body.classList.add('sidebar-locked');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (menuBtn) menuBtn.classList.remove('active');
    document.body.classList.remove('sidebar-locked');
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

    // Close sidebar on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSidebar();
            if (typeof closeStudentModal === "function") closeStudentModal();
            if (typeof closeDeleteModal === "function") closeDeleteModal();
        }
    });

    // Auto-close drawer if screen resizes to desktop width (> 900px)
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
});

// Make navigation and drawer functions available globally
window.showPage = showPage;
window.toggleSidebar = toggleSidebar;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;