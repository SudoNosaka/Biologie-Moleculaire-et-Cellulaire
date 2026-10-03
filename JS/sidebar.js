// ============================================
// SIDEBAR - GESTION BARRE LATÉRALE + THÈME + SON
// ============================================

function initSidebar() {
    // Position de la sidebar
    const savedPosition = localStorage.getItem('sidebar-position') || 'left';
    applySidebarPosition(savedPosition);

    // Thème
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);

    // Son
    const savedSound = localStorage.getItem('sound') || 'on';
    updateSoundButton(savedSound);

    // Attacher les événements
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) soundBtn.addEventListener('click', toggleSound);

    const sidebarBtn = document.getElementById('sidebar-pos-btn');
    if (sidebarBtn) sidebarBtn.addEventListener('click', toggleSidebarPosition);
}

function applySidebarPosition(position) {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    if (!sidebar) return;

    if (position === 'right') {
        sidebar.classList.add('right');
        body.classList.add('sidebar-right');
    } else {
        sidebar.classList.remove('right');
        body.classList.remove('sidebar-right');
    }

    localStorage.setItem('sidebar-position', position);

    const text = document.getElementById('sidebar-pos-text');
    if (text) text.textContent = position === 'left' ? 'Gauche' : 'Droite';
}

function toggleSidebarPosition() {
    const sidebar = document.querySelector('.sidebar');
    const isRight = sidebar.classList.contains('right');
    const newPosition = isRight ? 'left' : 'right';
    applySidebarPosition(newPosition);
    if (typeof playSound === 'function') playSound('click');
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeButton(next);
    if (typeof playSound === 'function') playSound('click');
}

function updateThemeButton(theme) {
    const icon = document.querySelector('#theme-toggle .toggle-icon');
    const text = document.querySelector('#theme-toggle .toggle-text');
    if (icon) icon.textContent = theme === 'light' ? '☀' : '🌙';
    if (text) text.textContent = theme === 'light' ? 'Clair' : 'Sombre';
}

function toggleSound() {
    const current = localStorage.getItem('sound') || 'on';
    const next = current === 'on' ? 'off' : 'on';
    localStorage.setItem('sound', next);
    updateSoundButton(next);
    if (typeof playSound === 'function' && next === 'on') playSound('click');
}

function updateSoundButton(state) {
    const icon = document.querySelector('#sound-toggle .toggle-icon');
    const text = document.querySelector('#sound-toggle .toggle-text');
    if (icon) icon.textContent = state === 'on' ? '🔊' : '🔇';
    if (text) text.textContent = state === 'on' ? 'Activé' : 'Désactivé';
}

// Initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
} else {
    initSidebar();
}