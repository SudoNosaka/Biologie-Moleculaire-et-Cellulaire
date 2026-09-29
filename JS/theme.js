// Gestion du thème (light/dark)

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(CONFIG.theme.storageKey, newTheme);
}

function getTheme() {
    return document.documentElement.getAttribute('data-theme') || CONFIG.theme.default;
}

function isDarkMode() {
    return getTheme() === 'dark';
}