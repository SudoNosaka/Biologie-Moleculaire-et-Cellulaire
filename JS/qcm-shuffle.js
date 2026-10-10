// ============================================
// QCM SHUFFLE - Mélange questions et options
// À inclure APRÈS qcm-renderer.js dans chaque HTML QCM
// ============================================

/**
 * Mélange un tableau en place (algorithme de Fisher-Yates)
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Copie pour ne pas modifier l'original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Mélange les options d'une question tout en gardant la bonne réponse correcte
 * Retourne un objet avec les nouvelles options et le nouvel index correct
 */
function shuffleQuestionOptions(question) {
    // Créer un tableau d'objets {text, isCorrect}
    const optionsWithStatus = question.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === question.correct
    }));
    
    // Mélanger les options
    const shuffledOptions = shuffleArray(optionsWithStatus);
    
    // Trouver le nouvel index de la bonne réponse
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
    
    return {
        options: shuffledOptions.map(opt => opt.text),
        correct: newCorrectIndex,
        explanation: question.explanation,
        question: question.question
    };
}

/**
 * Prépare un niveau entier : mélange les questions ET les options de chaque question
 */
function prepareShuffledLevel(questions) {
    // 1. Mélanger l'ordre des questions
    const shuffledQuestions = shuffleArray(questions);
    
    // 2. Pour chaque question, mélanger les options
    return shuffledQuestions.map(q => shuffleQuestionOptions(q));
}

// ============================================
// PATCH DU RENDERER EXISTANT
// On intercepte les fonctions du qcm-renderer.js
// ============================================

(function() {
    // Attendre que le renderer soit chargé
    if (typeof renderQuestions === 'undefined') {
        console.error('qcm-shuffle.js doit être chargé APRÈS qcm-renderer.js');
        return;
    }
    
    // Sauvegarder la fonction originale
    const originalRenderQuestions = renderQuestions;
    const originalSwitchLevel = window.switchLevel;
    
    // Redéfinir renderQuestions pour mélanger avant affichage
    window.renderQuestions = function(questions) {
        const shuffled = prepareShuffledLevel(questions);
        console.log('🎲 Questions mélangées :', shuffled.length, 'questions');
        return originalRenderQuestions(shuffled);
    };
    
    // Redéfinir switchLevel pour mélanger à chaque changement de niveau
    window.switchLevel = function(level) {
        currentLevel = level;
        userAnswers = {};
        
        // Mise à jour des boutons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        
        // Mélanger les questions du niveau
        const shuffledQuestions = prepareShuffledLevel(currentQCM.levels[level]);
        renderQuestions(shuffledQuestions);
        
        // Reset résultats
        document.getElementById('results').style.display = 'none';
        document.getElementById('validate-btn').style.display = 'block';
        
        if (typeof playSound === 'function') playSound('click');
    };
    
    console.log('✅ QCM Shuffle activé : questions et options mélangées à chaque chargement');
})();