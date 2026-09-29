// ============================================
// CARROUSELS
// ============================================

function scrollCarousel(trackId, direction) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const card = track.querySelector('.carousel-card');
    if (!card) return;

    const cardWidth = card.offsetWidth + 16;
    track.scrollBy({
        left: cardWidth * direction,
        behavior: 'smooth'
    });

    if (typeof playSound === 'function') {
        playSound('swipe');
    }
}

function initCarousels() {
    const wrappers = document.querySelectorAll('.carousel-wrapper');

    wrappers.forEach(wrapper => {
        const track = wrapper.querySelector('.carousel-track');
        const leftBtn = wrapper.querySelector('.carousel-arrow.left');
        const rightBtn = wrapper.querySelector('.carousel-arrow.right');

        if (!track) return;

        function updateArrows() {
            const maxScroll = track.scrollWidth - track.clientWidth - 1;
            if (leftBtn) leftBtn.disabled = track.scrollLeft <= 0;
            if (rightBtn) rightBtn.disabled = track.scrollLeft >= maxScroll;
        }

        track.addEventListener('scroll', updateArrows);
        window.addEventListener('resize', updateArrows);
        setTimeout(updateArrows, 200);
    });
}

// ============================================
// PROGRESSION
// ============================================

function updateProgress(pct) {
    const fill = document.querySelector('.progress-fill');
    const text = document.querySelector('.progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = pct + '% complété';
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initCarousels();
});