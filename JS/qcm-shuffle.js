// ============================================
// QCM SHUFFLE - Mélange questions et options (format avec IDs)
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ✅ MODIFIÉ : le shuffle préserve les IDs, pas besoin de recalculer l'index correct
function shuffleQuestionOptions(question) {
    return {
        question: question.question,
        options: shuffleArray(question.options),  // Mélange les options (objets avec id et text)
        correct: question.correct,  // ✅ L'ID de la bonne réponse reste le même
        explanation: question.explanation
    };
}

function prepareShuffledLevel(questions) {
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.map(q => shuffleQuestionOptions(q));
}

(function() {
    if (typeof renderQuestions === 'undefined') {
        console.error('qcm-shuffle.js doit être chargé APRÈS qcm-renderer.js');
        return;
    }
    
    const originalSwitchLevel = window.switchLevel;
    
    window.switchLevel = function(level) {
        currentLevel = level;
        userAnswers = {};
        
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        
        const shuffled = prepareShuffledLevel(currentQCM.levels[level]);
        window.shuffledQuestions = shuffled;
        
        console.log('🎲 Niveau', level, '- Questions mélangées :', shuffled.length);
        
        renderQuestions(shuffled);
        
        document.getElementById('results').style.display = 'none';
        document.getElementById('validate-btn').style.display = 'block';
        
        if (typeof playSound === 'function') playSound('click');
    };
    
    console.log('✅ QCM Shuffle activé : mélange au changement de niveau');
})();