let currentQuiz = null;
let userAnswers = [];
let timerInterval;
let timeLeft = 600;

function loadQuiz(quizId) {
    fetch(`../data/${quizId}.json`)
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(initQuiz)
        .catch(err => {
            console.warn('Fallback...', err);
            return fetch(`data/${quizId}.json`)
                .then(r => r.json())
                .then(initQuiz)
                .catch(e => showError(e));
        });
}

function initQuiz(data) {
    currentQuiz = data;
    document.getElementById('quiz-title').textContent = data.title;
    document.getElementById('quiz-subtitle').textContent = data.subtitle;
    document.title = data.title;
    timeLeft = data.duration || 600;
    userAnswers = new Array(data.questions.length).fill(-1);
}

function showError(e) {
    document.getElementById('quiz-title').textContent = '⚠️ Erreur de chargement';
    document.getElementById('quiz-subtitle').textContent = 'Utilise un serveur local';
}

function startQuiz() {
    if (!currentQuiz) {
        alert('Quiz non chargé. Utilise un serveur local !');
        return;
    }
    document.querySelector('.content-section').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    renderQuiz();
    startTimer();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        document.getElementById('timer').textContent = `⏱️ ${m}:${s.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    let html = '';
    currentQuiz.questions.forEach((q, i) => {
        html += `<section class="content-section fade-in">
            <h3>Question ${i+1}</h3>
            <p>${q.question}</p>`;
        q.options.forEach((opt, j) => {
            html += `<div class="quiz-option" onclick="selectOption(${i}, ${j})" id="q${i}-opt${j}">${opt}</div>`;
        });
        html += `<div class="explanation" id="exp${i}"><strong>Explication :</strong> ${q.explanation}</div></section>`;
    });
    html += `<button class="btn-primary" onclick="submitQuiz()">Valider mes réponses</button>`;
    container.innerHTML = html;
}

function selectOption(qi, oi) {
    userAnswers[qi] = oi;
    for (let i = 0; i < currentQuiz.questions[qi].options.length; i++) {
        document.getElementById(`q${qi}-opt${i}`).classList.remove('selected');
    }
    document.getElementById(`q${qi}-opt${oi}`).classList.add('selected');
    if (typeof playSound === 'function') playSound('click');
}

function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;
    currentQuiz.questions.forEach((q, i) => {
        document.getElementById(`q${i}-opt${q.correct}`).classList.add('correct');
        if (userAnswers[i] !== -1 && userAnswers[i] !== q.correct) {
            document.getElementById(`q${i}-opt${userAnswers[i]}`).classList.add('incorrect');
        }
        document.getElementById(`exp${i}`).classList.add('show');
        if (userAnswers[i] === q.correct) score++;
    });
    
    const pct = Math.round(score / currentQuiz.questions.length * 100);
    document.getElementById('score').textContent = `${score}/${currentQuiz.questions.length} (${pct}%)`;
    let msg = pct >= 80 ? '🎉 Excellent !' : pct >= 60 ? '👍 Pas mal !' : '📚 À revoir !';
    document.getElementById('message').textContent = msg;
    document.getElementById('results').style.display = 'block';
    if (typeof playSound === 'function') playSound('validate');
}

function resetQuiz() {
    userAnswers = new Array(currentQuiz.questions.length).fill(-1);
    timeLeft = currentQuiz.duration || 600;
    document.getElementById('results').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'none';
    document.querySelector('.content-section').style.display = 'block';
    document.getElementById('timer').textContent = '⏱️ 10:00';
}