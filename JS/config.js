// Configuration globale de l'application
const CONFIG = {
    // Thème
    theme: {
        default: 'light',
        storageKey: 'theme-preference'
    },
    
    // Sons
    sound: {
        enabled: true,
        volume: 0.3,
        storageKey: 'sound-preference',
        sounds: {
            click: 'assets/sounds/click.mp3',
            swipe: 'assets/sounds/swipe.mp3',
            validate: 'assets/sounds/validate.mp3'
        }
    },
    
    // GitHub
    github: {
        issuesUrl: 'https://github.com/TON-USER/TON-REPO/issues/new'
    },
    
    // Progression
    progress: {
        storageKey: 'sdm-progress'
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem(CONFIG.theme.storageKey);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Charger la préférence de son
    const savedSound = localStorage.getItem(CONFIG.sound.storageKey);
    if (savedSound !== null) {
        CONFIG.sound.enabled = savedSound === 'true';
    }
});