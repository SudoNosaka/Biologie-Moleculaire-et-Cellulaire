// ============================================
// FLASHCARDS - Système recto-verso
// ============================================

let flashcardsData = null;
let currentCardIndex = 0;
let isFlipped = false;
let filteredCards = [];
let currentCategory = 'all';

function loadFlashcards() {
    console.log('Chargement des flashcards...');
    
    fetch('../data/flashcards.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('Flashcards chargées:', data.cards.length, 'cartes');
            flashcardsData = data;
            initFlashcards();
        })
        .catch(error => {
            console.warn('Erreur fetch principal:', error);
            return fetch('data/flashcards.json')
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(data => {
                    console.log('Fallback OK:', data.cards.length, 'cartes');
                    flashcardsData = data;
                    initFlashcards();
                })
                .catch(err => {
                    console.error('Erreur fallback:', err);
                    const container = document.getElementById('flashcard-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="warning">
                                <h3>⚠️ Impossible de charger les flashcards</h3>
                                <p>Vérifie que le fichier data/flashcards.json existe.</p>
                            </div>
                        `;
                    }
                });
        });
}

function initFlashcards() {
    const titleEl = document.getElementById('flashcard-title');
    const subtitleEl = document.getElementById('flashcard-subtitle');
    
    if (titleEl) titleEl.textContent = flashcardsData.title || 'Flashcards';
    if (subtitleEl) subtitleEl.textContent = flashcardsData.subtitle || '';
    
    createCategorySelector();
    filterCards('all');
}

function createCategorySelector() {
    const categories = ['all'];
    const seen = new Set();
    
    flashcardsData.cards.forEach(card => {
        if (!seen.has(card.category)) {
            seen.add(card.category);
            categories.push(card.category);
        }
    });
    
    const container = document.getElementById('category-selector');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => {
        const count = cat === 'all' 
            ? flashcardsData.cards.length 
            : flashcardsData.cards.filter(c => c.category === cat).length;
        
        return `
            <button class="category-btn ${cat === 'all' ? 'active' : ''}" 
                    data-category="${cat}" 
                    onclick="filterCards('${cat}')">
                <span class="category-name">${cat === 'all' ? 'Toutes' : cat}</span>
                <span class="category-count">${count}</span>
            </button>
        `;
    }).join('');
}

function filterCards(category) {
    currentCategory = category;
    
    if (category === 'all') {
        filteredCards = [...flashcardsData.cards];
    } else {
        filteredCards = flashcardsData.cards.filter(card => card.category === category);
    }
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    currentCardIndex = 0;
    isFlipped = false;
    displayCard();
}

function displayCard() {
    const container = document.getElementById('flashcard-container');
    if (!container) return;
    
    if (filteredCards.length === 0) {
        container.innerHTML = '<p>Aucune carte dans cette catégorie.</p>';
        return;
    }
    
    const card = filteredCards[currentCardIndex];
    
    container.innerHTML = `
        <div class="flashcard-counter">
            Carte ${currentCardIndex + 1} / ${filteredCards.length}
        </div>
        <div class="flashcard-category">
            ${card.category}
        </div>
        <div class="flashcard-container">
            <div class="flashcard ${isFlipped ? 'flipped' : ''}" onclick="flipCard()">
                <div class="flashcard-face flashcard-front">
                    <div class="flashcard-content">
                        ${card.recto}
                    </div>
                    <div class="flashcard-hint">
                        <span class="hint-icon">↻</span>
                        <span class="hint-text">Clique pour retourner</span>
                    </div>
                </div>
                <div class="flashcard-face flashcard-back">
                    <div class="flashcard-content">
                        ${card.verso.replace(/\n/g, '<br>')}
                    </div>
                    <div class="flashcard-hint">
                        <span class="hint-icon">↻</span>
                        <span class="hint-text">Clique pour retourner</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="flashcard-controls">
            <button class="btn-secondary" onclick="previousCard()" ${currentCardIndex === 0 ? 'disabled' : ''}>
                ← Précédent
            </button>
            <button class="btn-secondary" onclick="shuffleCards()">
                🔀 Mélanger
            </button>
            <button class="btn-secondary" onclick="nextCard()" ${currentCardIndex === filteredCards.length - 1 ? 'disabled' : ''}>
                Suivant →
            </button>
        </div>
    `;
}

function flipCard() {
    isFlipped = !isFlipped;
    const flashcard = document.querySelector('.flashcard');
    if (flashcard) {
        flashcard.classList.toggle('flipped', isFlipped);
    }
    if (typeof playSound === 'function') playSound('click');
}

function nextCard() {
    if (currentCardIndex < filteredCards.length - 1) {
        currentCardIndex++;
        isFlipped = false;
        displayCard();
    }
}

function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        isFlipped = false;
        displayCard();
    }
}

function shuffleCards() {
    for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentCardIndex = 0;
    isFlipped = false;
    displayCard();
}