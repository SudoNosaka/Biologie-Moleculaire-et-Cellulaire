// ============================================
// CARROUSEL VERTICAL - BASES.HTML
// ============================================

let currentSlide = 0;
const slides = document.querySelectorAll('.vertical-slide');
const totalSlides = slides.length;
const slideCurrent = document.getElementById('slide-current');
const slideTotal = document.getElementById('slide-total');

// Initialisation
function initCarousel() {
    slideTotal.textContent = totalSlides;
    updateSlide();
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            changeSlide(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            changeSlide(-1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            goToSlide(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            goToSlide(totalSlides - 1);
        }
    });
    
    // Support du swipe tactile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    // Support de la molette (avec debounce)
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        if (wheelTimeout) return;
        
        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 800);
        
        if (e.deltaY > 30) {
            changeSlide(1);
        } else if (e.deltaY < -30) {
            changeSlide(-1);
        }
    }, { passive: true });
}

function handleSwipe() {
    const diff = touchStartY - touchEndY;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            changeSlide(1);  // Swipe vers le haut → slide suivant
        } else {
            changeSlide(-1); // Swipe vers le bas → slide précédent
        }
    }
}

function changeSlide(direction) {
    const newSlide = currentSlide + direction;
    
    if (newSlide >= 0 && newSlide < totalSlides) {
        goToSlide(newSlide);
    }
}

function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    // Retirer la classe active du slide actuel
    slides[currentSlide].classList.remove('active');
    
    // Mettre à jour l'index
    currentSlide = index;
    
    // Ajouter la classe active au nouveau slide
    slides[currentSlide].classList.add('active');
    
    // Mettre à jour l'indicateur
    updateSlide();
    
    // Son
    if (typeof playSound === 'function') {
        playSound('swipe');
    }
    
    // Scroll en haut du slide
    slides[currentSlide].scrollTop = 0;
}

function updateSlide() {
    slideCurrent.textContent = currentSlide + 1;
    
    // Gestion des boutons
    const upBtn = document.querySelector('.vertical-arrow.up');
    const downBtn = document.querySelector('.vertical-arrow.down');
    
    if (upBtn) upBtn.disabled = currentSlide === 0;
    if (downBtn) downBtn.disabled = currentSlide === totalSlides - 1;
}

// Initialisation au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
} else {
    initCarousel();
}