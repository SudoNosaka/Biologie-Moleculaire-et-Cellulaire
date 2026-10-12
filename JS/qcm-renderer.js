// ============================================
// QCM RENDERER - Autonome avec shuffle + multi-réponses + points négatifs
// ============================================
let currentQCM = null;
let userAnswers = {};
let currentLevel = 'facile';
let displayedQuestions = null; // Questions actuellement affichées (mélangées)

// ============================================
// SHUFFLE (intégré)
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
        isCorrect: Array.isArray(question.correct) 
            ? question.correct.includes(opt.id) 
            : opt.id === question.correct
    }));
    
    const shuffledOptions = shuffleArray(optionsWithStatus);
    const newCorrect = Array.isArray(question.correct)
        ? shuffledOptions.filter(opt => opt.isCorrect).map(opt => opt.id)
        : shuffledOptions.find(opt => opt.isCorrect).id;
    
    return {
        question: question.question,
        options: shuffledOptions.map(opt => ({ id: opt.id, text: opt.text })),
        correct: newCorrect,
        explanation: question.explanation
    };
}

function prepareShuffledLevel(questions) {
    return shuffleArray(questions).map(q => shuffleQuestionOptions(q));
}

// ============================================
// CHARGEMENT
// ============================================
function getCurrentQuestions() {
    return displayedQuestions || currentQCM.levels[currentLevel];
}

function isMultiAnswer(question) {
    return Array.isArray(question.correct);
}

function loadQCM(qcmKey) {
    console.log('Chargement QCM:', qcmKey);
    
    fetch(`../data/${qcmKey}`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('QCM chargé:', data.title, '- Niveaux:', Object.keys(data.levels));
            currentQCM = data;
            renderQCM(data, qcmKey);
        })
        .catch(error => {
            console.warn('Fetch ../data/ échoué, tentative fallback...', error);
            return fetch(`data/${qcmKey}`)
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(data => {
                    console.log('Fallback OK:', data.title);
                    currentQCM = data;
                    renderQCM(data, qcmKey);
                })
                .catch(err => {
                    console.error('Erreur finale:', err);
                    const container = document.getElementById('qcm-content');
                    if (container) {
                        container.innerHTML = `
                            <div class="warning" style="background:#FEE2E2; padding:1rem; border-left:4px solid #EF4444;">
                                <h3>⚠️ Impossible de charger le QCM</h3>
                                <p>Vérifie que le fichier <code>data/${qcmKey}</code> existe.</p>
                                <p><small>Erreur: ${err.message}</small></p>
                            </div>
                        `;
                    }
                });
        });
}

function renderQCM(data, qcmKey) {
    const titleEl = document.getElementById('qcm-title');
    const subtitleEl = document.getElementById('qcm-subtitle');
    
    if (titleEl) titleEl.textContent = data.title || 'Chargement...';
    if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
    if (document.title) document.title = `${data.title} - BMC`;
    
    renderLevelSelector();
    switchLevel('facile');
}

function renderLevelSelector() {
    const container = document.getElementById('level-selector');
    if (!container) return;
    
    const levels = Object.keys(currentQCM.levels);
    const labels = {
        'facile': '🟢 Facile',
        'moyen': '🟡 Moyen',
        'vicieux': '🔴 Vicieux',
        'infernal': '🔥 Infernal'
    };
    
    container.innerHTML = levels.map(level => `
        <button class="level-btn ${level === 'facile' ? 'active' : ''}" 
                data-level="${level}" 
                onclick="switchLevel('${level}')">
            ${labels[level] || level}
            <span class="level-count">${currentQCM.levels[level].length} Q</span>
        </button>
    `).join('');
}

function switchLevel(level) {
    console.log('Switch vers niveau:', level);
    currentLevel = level;
    userAnswers = {};
    
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
    });
    
    // Mélanger les questions ET les options
    displayedQuestions = prepareShuffledLevel(currentQCM.levels[level]);
    console.log('Questions mélangées:', displayedQuestions.length);
    
    renderQuestions(displayedQuestions);
    
    const resultsEl = document.getElementById('results');
    const validateBtn = document.getElementById('validate-btn');
    const warningEl = document.getElementById('infernal-warning');
    
    if (resultsEl) resultsEl.style.display = 'none';
    if (validateBtn) validateBtn.style.display = 'block';
    if (warningEl) warningEl.style.display = level === 'infernal' ? 'block' : 'none';
}

function renderQuestions(questions) {
    const container = document.getElementById('qcm-content');
    if (!container) return;
    
    let html = '';
    
    questions.forEach((q, idx) => {
        const multi = isMultiAnswer(q);
        const inputType = multi ? 'checkbox' : 'radio';
        
        html += `
            <div class="qcm-question" data-id="${idx}">
                <div class="qcm-number">Question ${idx + 1} ${multi ? '<span class="multi-badge">Multi-réponses</span>' : ''}</div>
                <div class="qcm-text">${q.question}</div>
                <div class="qcm-options">
                    ${q.options.map(opt => `
                        <label class="qcm-option-label">
                            <input type="${inputType}" 
                                   name="q${idx}" 
                                   value="${opt.id}" 
                                   onchange="selectOption(${idx}, '${opt.id}', ${multi})">
                            <div class="qcm-option" data-question="${idx}" data-option-id="${opt.id}">
                                ${opt.text}
                            </div>
                        </label>
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

function selectOption(questionIdx, optionId, multi) {
    if (multi) {
        if (!Array.isArray(userAnswers[questionIdx])) {
            userAnswers[questionIdx] = [];
        }
        const idx = userAnswers[questionIdx].indexOf(optionId);
        if (idx > -1) {
            userAnswers[questionIdx].splice(idx, 1);
        } else {
            userAnswers[questionIdx].push(optionId);
        }
    } else {
        userAnswers[questionIdx] = optionId;
    }
    
    const options = document.querySelectorAll(`.qcm-option[data-question="${questionIdx}"]`);
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (multi) {
            if (userAnswers[questionIdx] && userAnswers[questionIdx].includes(opt.dataset.optionId)) {
                opt.classList.add('selected');
            }
        } else {
            if (opt.dataset.optionId === optionId) {
                opt.classList.add('selected');
            }
        }
    });
    
    if (typeof playSound === 'function') playSound('click');
}

function validateAnswers() {
    const questions = getCurrentQuestions();
    let score = 0;
    let bonnes = 0;
    let mauvaises = 0;
    let partielles = 0;
    let nonRepondues = 0;
    const isInfernal = currentLevel === 'infernal';
    const negativeMultiplier = isInfernal ? 2 : 1;
    
    questions.forEach((q, idx) => {
        const userAnswer = userAnswers[idx];
        const correctAnswer = q.correct;
        const multi = isMultiAnswer(q);
        const options = document.querySelectorAll(`.qcm-option[data-question="${idx}"]`);
        const explanation = document.getElementById(`explanation-${idx}`);
        
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
            opt.classList.remove('correct', 'incorrect', 'partial');
        });
        
        if (multi) {
            const userSet = new Set(userAnswer || []);
            const correctSet = new Set(correctAnswer);
            
            options.forEach(opt => {
                if (correctSet.has(opt.dataset.optionId)) {
                    opt.classList.add('correct');
                }
            });
            
            if (userSet.size === 0) {
                nonRepondues++;
            } else {
                const allCorrect = [...correctSet].every(id => userSet.has(id));
                const noWrong = [...userSet].every(id => correctSet.has(id));
                
                if (allCorrect && noWrong) {
                    score += 1;
                    bonnes++;
                } else if (userSet.size > 0 && [...userSet].some(id => correctSet.has(id))) {
                    const wrongSelections = [...userSet].filter(id => !correctSet.has(id)).length;
                    const missedSelections = [...correctSet].filter(id => !userSet.has(id)).length;
                    const partialScore = 1 - (wrongSelections * 0.5) - (missedSelections * 0.3);
                    score += Math.max(0, partialScore);
                    partielles++;
                    
                    options.forEach(opt => {
                        if (userSet.has(opt.dataset.optionId) && !correctSet.has(opt.dataset.optionId)) {
                            opt.classList.add('incorrect');
                        }
                    });
                } else {
                    score -= 1 * negativeMultiplier;
                    mauvaises++;
                    
                    options.forEach(opt => {
                        if (userSet.has(opt.dataset.optionId)) {
                            opt.classList.add('incorrect');
                        }
                    });
                }
            }
        } else {
            if (userAnswer === undefined) {
                nonRepondues++;
                options.forEach(opt => {
                    if (opt.dataset.optionId === correctAnswer) {
                        opt.classList.add('correct');
                    }
                });
            } else if (userAnswer === correctAnswer) {
                score += 1;
                bonnes++;
                options.forEach(opt => {
                    if (opt.dataset.optionId === correctAnswer) {
                        opt.classList.add('correct');
                    }
                });
            } else {
                score -= 1 * negativeMultiplier;
                mauvaises++;
                options.forEach(opt => {
                    if (opt.dataset.optionId === correctAnswer) {
                        opt.classList.add('correct');
                    } else if (opt.dataset.optionId === userAnswer) {
                        opt.classList.add('incorrect');
                    }
                });
            }
        }
        
        if (explanation) explanation.classList.add('show');
    });
    
    const total = questions.length;
    const maxScore = total;
    
    const resultsEl = document.getElementById('results');
    const scoreEl = document.getElementById('score');
    const messageEl = document.getElementById('message');
    const validateBtn = document.getElementById('validate-btn');
    
    if (resultsEl) resultsEl.style.display = 'block';
    if (scoreEl) {
        scoreEl.innerHTML = `
            <div class="score-details">
                <div class="score-main">${score.toFixed(1)} / ${maxScore} points ${isInfernal ? '(Infernal ×2)' : ''}</div>
                <div class="score-breakdown">
                    <span class="score-good">✓ ${bonnes} bonne${bonnes > 1 ? 's' : ''} (+${bonnes})</span>
                    ${partielles > 0 ? `<span class="score-partial">≈ ${partielles} partielle${partielles > 1 ? 's' : ''}</span>` : ''}
                    <span class="score-bad">✗ ${mauvaises} mauvaise${mauvaises > 1 ? 's' : ''} (-${mauvaises * negativeMultiplier})</span>
                    <span class="score-skip">○ ${nonRepondues} non répondue${nonRepondues > 1 ? 's' : ''} (0)</span>
                </div>
            </div>
        `;
    }
    
    const pourcentage = Math.round(((score + total) / (2 * total)) * 100);
    let message = '';
    if (score === maxScore) message = '🏆 Parfait ! Score maximal, tu maîtrises totalement le sujet.';
    else if (pourcentage >= 80) message = '🎯 Excellent ! Tu maîtrises bien ce niveau.';
    else if (pourcentage >= 60) message = '✅ Bien ! Encore quelques points à revoir.';
    else if (pourcentage >= 40) message = '️ Moyen. Revois la fiche avant de passer au niveau suivant.';
    else if (pourcentage >= 20) message = '😕 Insuffisant. Relis attentivement le cours.';
    else if (score > 0) message = ' Très insuffisant. Reprends les bases.';
    else if (score === 0) message = '⚪ Score nul. Soit tu n\'as rien répondu, soit autant de bonnes que de mauvaises.';
    else message = '📉 Score négatif ! Il vaut mieux ne pas répondre que de répondre au hasard.';
    
    if (messageEl) messageEl.textContent = message;
    if (validateBtn) validateBtn.style.display = 'none';
    
    if (typeof playSound === 'function') playSound('validate');
}

function resetQCM() {
    userAnswers = {};
    displayedQuestions = prepareShuffledLevel(currentQCM.levels[currentLevel]);
    renderQuestions(displayedQuestions);
    
    const resultsEl = document.getElementById('results');
    const validateBtn = document.getElementById('validate-btn');
    
    if (resultsEl) resultsEl.style.display = 'none';
    if (validateBtn) validateBtn.style.display = 'block';
}