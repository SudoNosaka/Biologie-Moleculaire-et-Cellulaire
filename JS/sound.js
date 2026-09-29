// Gestion des micro-sons pour les interactions

const soundCache = {};

function preloadSounds() {
    if (!CONFIG.sound.enabled) return;
    
    Object.keys(CONFIG.sound.sounds).forEach(key => {
        const audio = new Audio(CONFIG.sound.sounds[key]);
        audio.volume = CONFIG.sound.volume;
        soundCache[key] = audio;
    });
}

function playSound(soundName) {
    if (!CONFIG.sound.enabled) return;
    
    const sound = soundCache[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Son bloqué par le navigateur:', e));
    }
}

function toggleSound() {
    CONFIG.sound.enabled = !CONFIG.sound.enabled;
    localStorage.setItem(CONFIG.sound.storageKey, CONFIG.sound.enabled);
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    preloadSounds();
    
    // Ajouter des sons aux interactions courantes
    document.addEventListener('click', (e) => {
        if (e.target.matches('.card, .nav-link, .btn-primary, .toggle-btn')) {
            playSound('click');
        }
    });
});