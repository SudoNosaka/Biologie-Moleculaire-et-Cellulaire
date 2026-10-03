// ============================================
// QCM RENDERER - Affiche les QCM depuis JSON
// ============================================

let currentQCM = null;
let userAnswers = {};
let currentLevel = 'facile';

function loadQCM(qcmKey) {
    fetch(`../data/${qcmKey}.json`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            currentQCM = data;
            renderQCM(data, qcmKey);
        })
        .catch(error => {
            console.warn('Fetch échoué, fallback...', error);
            return fetch(`data/${qcmKey}.json`)
                .then(r => r.json())
                .then(data => {
                    currentQCM = data;
                    renderQCM(data, qcmKey);
                })
                .catch(err => {
                    document.getElementById('qcm-content').innerHTML = `
                        <div class="warning">
                            <h3>⚠️ Impossible de charger</h3>
                            <p>Utilise un serveur local.</p>
                        </div>
                    `;
                });
        });
}

function renderQCM(data, qcmKey) {
    document.getElementById('qcm-title').textContent = data.title || 'Chargement...';
    document.getElementById('qcm-subtitle').textContent = data.subtitle || '';
    document.title = `${data.title} - BMC`;
    
    renderLevelSelector();
    switchLevel('facile');
}

function renderLevelSelector() {
    const container = document.getElementById('level-selector');
    const levels = ['facile', 'moyen', 'vicieux'];
    const labels = {
        'facile': '🟢 Facile',
        'moyen': '🟡 Moyen',
        'vicieux': '🔴 Vicieux'
    };
    
    container.innerHTML = levels.map(level => `
        <button class="level-btn ${level === 'facile' ? 'active' : ''}" 
                data-level="${level}" 
                onclick="switchLevel('${level}')">
            ${labels[level]}
            <span class="level-count">${currentQCM.levels[level].length} Q</span>
        </button>
    `).join('');
}

function switchLevel(level) {
    currentLevel = level;
    userAnswers = {};
    
    // Mise à jour des boutons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });
    
    // Rendu des questions
    renderQuestions(currentQCM.levels[level]);
    
    // Reset résultats
    document.getElementById('results').style.display = 'none';
    document.getElementById('validate-btn').style.display = 'block';
}

function renderQuestions(questions) {
    const container = document.getElementById('qcm-content');
    let html = '';
    
    questions.forEach((q, idx) => {
        html += `
            <div class="qcm-question" data-id="${idx}">
                <div class="qcm-number">Question ${idx + 1}</div>
                <div class="qcm-text">${q.question}</div>
                <div class="qcm-options">
                    ${q.options.map((opt, optIdx) => `
                        <div class="qcm-option" 
                             data-question="${idx}" 
                             data-option="${optIdx}"
                             onclick="selectOption(${idx}, ${optIdx})">
                            ${opt}
                        </div>
                    `).join('')}
                </div>
                <div class="qcm-explanation" id="explanation-${idx}">
                    <strong>💡 Explication :</strong> ${q.explanation}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function selectOption(questionIdx, optionIdx) {
    userAnswers[questionIdx] = optionIdx;
    
    // Mise à jour visuelle
    const options = document.querySelectorAll(`.qcm-option[data-question="${questionIdx}"]`);
    options.forEach(opt => opt.classList.remove('selected'));
    options[optionIdx].classList.add('selected');
    
    if (typeof playSound === 'function') playSound('click');
}

function validateAnswers() {
    const questions = currentQCM.levels[currentLevel];
    let correct = 0;
    
    questions.forEach((q, idx) => {
        const userAnswer = userAnswers[idx];
        const correctAnswer = q.correct;
        const options = document.querySelectorAll(`.qcm-option[data-question="${idx}"]`);
        const explanation = document.getElementById(`explanation-${idx}`);
        
        // Désactiver les clics
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        if (userAnswer === correctAnswer) {
            options[userAnswer].classList.add('correct');
            correct++;
        } else {
            if (userAnswer !== undefined) {
                options[userAnswer].classList.add('incorrect');
            }
            options[correctAnswer].classList.add('correct');
        }
        
        // Afficher l'explication
        explanation.classList.add('show');
    });
    
    // Afficher le score
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    
    document.getElementById('results').style.display = 'block';
    document.getElementById('score').textContent = `${correct}/${total} (${percentage}%)`;
    
    let message = '';
    if (percentage >= 90) message = '🎯 Excellent ! Tu maîtrises ce niveau.';
    else if (percentage >= 70) message = '✅ Bien ! Encore quelques points à revoir.';
    else if (percentage >= 50) message = '⚠️ Moyen. Revois la fiche avant de passer au niveau suivant.';
    else message = '❌ À retravailler. Relis la fiche et recommence.';
    
    document.getElementById('message').textContent = message;
    document.getElementById('validate-btn').style.display = 'none';
    
    if (typeof playSound === 'function') playSound('validate');
}

function resetQCM() {
    userAnswers = {};
    renderQuestions(currentQCM.levels[currentLevel]);
    document.getElementById('results').style.display = 'none';
    document.getElementById('validate-btn').style.display = 'block';
}