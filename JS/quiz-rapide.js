// ============================================
// QUIZ RAPIDE - 10 questions aléatoires en 5 min (format avec IDs)
// ============================================

let quizData = null;
let selectedQuestions = [];
let userAnswers = {};
let currentQuestionIndex = 0;
let timeLeft = 300;
let timerInterval = null;
let quizStarted = false;

function loadQuizRapide() {
    console.log('Chargement du quiz rapide...');
    
    fetch('../data/quiz-rapide.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('Quiz rapide chargé:', data.questions.length, 'questions');
            quizData = data;
            initQuizRapide();
        })
        .catch(error => {
            console.warn('Erreur fetch principal:', error);
            return fetch('data/quiz-rapide.json')
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(data => {
                    console.log('Fallback OK:', data.questions.length, 'questions');
                    quizData = data;
                    initQuizRapide();
                })
                .catch(err => {
                    console.error('Erreur fallback:', err);
                    const container = document.getElementById('quiz-content');
                    if (container) {
                        container.innerHTML = `
                            <div class="warning">
                                <h3>⚠️ Impossible de charger le quiz</h3>
                                <p>Vérifie que le fichier data/quiz-rapide.json existe.</p>
                                <p><small>Erreur: ${err.message}</small></p>
                            </div>
                        `;
                    }
                });
        });
}

function initQuizRapide() {
    const titleEl = document.getElementById('quiz-title');
    const subtitleEl = document.getElementById('quiz-subtitle');
    
    if (titleEl) titleEl.textContent = quizData.title || 'Quiz Rapide';
    if (subtitleEl) subtitleEl.textContent = quizData.subtitle || '';
    
    document.getElementById('timer').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
}

// ============================================
// SHUFFLE FUNCTIONS
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function shuffleQuestionOptions(question) {
    const optionsWithStatus = question.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.id === question.correct
    }));
    
    const shuffledOptions = shuffleArray(optionsWithStatus);
    const newCorrectId = shuffledOptions.find(opt => opt.isCorrect).id;
    
    return {
        question: question.question,
        options: shuffledOptions.map(opt => ({ id: opt.id, text: opt.text })),
        correct: newCorrectId,
        explanation: question.explanation
    };
}

function prepareShuffledQuestions(questions, count) {
    const shuffledQuestions = shuffleArray(questions);
    const selected = shuffledQuestions.slice(0, count);
    return selected.map(q => shuffleQuestionOptions(q));
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

function startQuiz() {
    // Sélectionner 10 questions aléatoires et mélanger les options
    selectedQuestions = prepareShuffledQuestions(quizData.questions, 10);
    userAnswers = {};
    currentQuestionIndex = 0;
    timeLeft = quizData.duration || 300;
    quizStarted = true;
    
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('timer').style.display = 'block';
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    displayQuestion();
    startTimer();
}

function displayQuestion() {
    const question = selectedQuestions[currentQuestionIndex];
    const container = document.getElementById('quiz-content');
    
    container.innerHTML = `
        <div class="question-progress">
            Question ${currentQuestionIndex + 1} / ${selectedQuestions.length}
        </div>
        <div class="question-text">
            ${question.question}
        </div>
        <div class="options-container">
            ${question.options.map(opt => `
                <div class="quiz-option ${userAnswers[currentQuestionIndex] === opt.id ? 'selected' : ''}" 
                     onclick="selectAnswer('${opt.id}')">
                    ${opt.text}
                </div>
            `).join('')}
        </div>
        <div class="quiz-nav">
            <button class="btn-secondary" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                ← Précédent
            </button>
            ${currentQuestionIndex === selectedQuestions.length - 1 
                ? `<button class="btn-primary" onclick="finishQuiz()">Terminer</button>`
                : `<button class="btn-secondary" onclick="nextQuestion()">Suivant →</button>`
            }
        </div>
    `;
}

function selectAnswer(optionId) {
    userAnswers[currentQuestionIndex] = optionId;
    displayQuestion();
    if (typeof playSound === 'function') playSound('click');
}

function nextQuestion() {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishQuiz();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `️ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 60) {
        timerEl.style.background = 'var(--danger)';
    } else if (timeLeft <= 120) {
        timerEl.style.background = '#F59E0B';
    } else {
        timerEl.style.background = 'var(--accent)';
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    quizStarted = false;
    
    let correct = 0;
    selectedQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correct) correct++;
    });
    
    const total = selectedQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    
    document.getElementById('timer').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    document.getElementById('score').textContent = `${correct}/${total} (${percentage}%)`;
    
    let message = '';
    if (percentage >= 90) message = '🎯 Excellent ! Tu maîtrises le cours.';
    else if (percentage >= 70) message = '✅ Bien ! Encore quelques points à revoir.';
    else if (percentage >= 50) message = '⚠️ Moyen. Revois les fiches avant de retenter.';
    else message = '❌ À retravailler. Relis les fiches et recommence.';
    
    document.getElementById('message').textContent = message;
    
    // Afficher les corrections
    let correctionsHtml = '<h3 style="margin-top: 1.5rem;">Corrections</h3>';
    selectedQuestions.forEach((q, idx) => {
        const userAnswerId = userAnswers[idx];
        const isCorrect = userAnswerId === q.correct;
        const statusClass = isCorrect ? 'correct' : 'incorrect';
        const statusIcon = isCorrect ? '✓' : '✗';
        
        const correctOption = q.options.find(opt => opt.id === q.correct);
        const userOption = userAnswerId ? q.options.find(opt => opt.id === userAnswerId) : null;
        
        correctionsHtml += `
            <div class="correction-item ${statusClass}">
                <div class="correction-header">
                    <span class="correction-status">${statusIcon}</span>
                    <strong>Question ${idx + 1} :</strong> ${q.question}
                </div>
                <div class="correction-details">
                    ${!isCorrect && userOption ? `<p>Ta réponse : <span class="wrong-answer">${userOption.text}</span></p>` : ''}
                    ${!isCorrect ? `<p>Bonne réponse : <span class="right-answer">${correctOption.text}</span></p>` : ''}
                    <p class="explanation-text"><em>${q.explanation}</em></p>
                </div>
            </div>
        `;
    });
    
    document.getElementById('corrections').innerHTML = correctionsHtml;
    
    if (typeof playSound === 'function') playSound('validate');
}

function resetQuiz() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('start-btn').style.display = 'inline-block';
    document.getElementById('corrections').innerHTML = '';
}