let textesData = null;

function loadTextesATrous() {
    fetch('../data/textesatrous.json')
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(initTextesATrous)
        .catch(err => {
            console.warn('Fallback...', err);
            return fetch('data/textesatrous.json')
                .then(r => r.json())
                .then(initTextesATrous)
                .catch(e => showError(e));
        });
}

function initTextesATrous(data) {
    textesData = data;
    document.getElementById('title').textContent = data.title;
    document.getElementById('subtitle').textContent = data.subtitle;
    renderContent();
}

function renderContent() {
    const container = document.getElementById('content');
    let html = '';
    
    textesData.sections.forEach(section => {
        html += `<section class="content-section fade-in"><h2>${section.title}</h2>`;
        
        section.texts.forEach((t, idx) => {
            // Remplacer les {réponses} par des inputs
            const content = t.content.replace(/\{([^}]+)\}/g, (match, answer) => {
                const safeAnswer = answer.replace(/"/g, '&quot;');
                return `<span class="blank-wrapper"><input type="text" class="fill-blank" data-answer="${safeAnswer}" placeholder="?"></span>`;
            });
            
            html += `<div class="text-block">
                <p>${content}</p>`;
            
            if (t.hint) {
                html += `<p class="hint">💡 ${t.hint}</p>`;
            }
            
            html += `</div>`;
        });
        
        html += `</section>`;
    });
    
    container.innerHTML = html;
}

function checkAll() {
    const blanks = document.querySelectorAll('.fill-blank');
    let correct = 0;
    let total = blanks.length;
    
    blanks.forEach(input => {
        const userAnswer = input.value.trim();
        const correctAnswer = input.dataset.answer;
        
        // Supprimer les anciens feedbacks
        const wrapper = input.closest('.blank-wrapper');
        const oldFeedback = wrapper.querySelector('.answer-feedback');
        if (oldFeedback) oldFeedback.remove();
        
        // Vérifier la réponse
        const isCorrect = checkAnswer(userAnswer, correctAnswer);
        
        if (isCorrect) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
            correct++;
        } else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
            
            // Afficher la bonne réponse dans un bloc distinct
            const feedback = document.createElement('div');
            feedback.className = 'answer-feedback';
            feedback.innerHTML = `<strong>Réponse attendue :</strong> <span class="correct-answer">${correctAnswer}</span>`;
            wrapper.appendChild(feedback);
        }
    });
    
    const pct = Math.round(correct / total * 100);
    document.getElementById('score').textContent = `${correct}/${total} (${pct}%)`;
    
    let msg = '';
    if (pct >= 80) msg = '🎉 Excellent !';
    else if (pct >= 60) msg = '👍 Pas mal !';
    else msg = '📚 À revoir !';
    
    document.getElementById('message').textContent = msg;
    document.getElementById('global-score').style.display = 'block';
    
    if (typeof playSound === 'function') playSound('validate');
}

function checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer) return false;
    
    // Normaliser les deux réponses
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Vérification exacte après normalisation
    if (normalizedUser === normalizedCorrect) return true;
    
    // Vérifier les variantes courantes
    const variants = getVariants(correctAnswer);
    for (let variant of variants) {
        if (normalizedUser === normalizeAnswer(variant)) return true;
    }
    
    // Tolérance aux fautes de frappe (distance de Levenshtein)
    if (normalizedUser.length > 3 && normalizedCorrect.length > 3) {
        const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
        const maxDistance = Math.max(1, Math.floor(normalizedCorrect.length / 8));
        if (distance <= maxDistance) return true;
    }
    
    return false;
}

function normalizeAnswer(str) {
    return str
        .toLowerCase()
        .trim()
        // Remplacer les accents
        .replace(/[éèêë]/g, 'e')
        .replace(/[àâä]/g, 'a')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        // Normaliser les symboles mathématiques
        .replace(/λ/g, 'lambda')
        .replace(/Δ/g, 'delta')
        .replace(/σ/g, 'sigma')
        .replace(/μ/g, 'mu')
        .replace(/ε/g, 'epsilon')
        .replace(/ħ/g, 'hbar')
        .replace(/→/g, 'to')
        .replace(/≤/g, 'leq')
        .replace(/≥/g, 'geq')
        .replace(/×/g, 'x')
        .replace(/·/g, '')
        .replace(/[()]/g, '')
        .replace(/[{}]/g, '')
        .replace(/\^/g, '^')
        .replace(/⁻/g, '-')
        .replace(/⁺/g, '+')
        .replace(/₀/g, '0')
        .replace(/₁/g, '1')
        .replace(/₂/g, '2')
        .replace(/₃/g, '3')
        .replace(/₄/g, '4')
        .replace(/₅/g, '5')
        .replace(/₆/g, '6')
        .replace(/₇/g, '7')
        .replace(/₈/g, '8')
        .replace(/₉/g, '9')
        // Normaliser les espaces et tirets
        .replace(/[\s_-]+/g, '');
}

function getVariants(answer) {
    const variants = [];
    
    // Variantes pour les symboles grecs
    if (answer.includes('lambda')) variants.push('λ');
    if (answer.includes('λ')) variants.push('lambda');
    if (answer.includes('delta')) variants.push('Δ');
    if (answer.includes('Δ')) variants.push('delta');
    if (answer.includes('sigma')) variants.push('σ');
    if (answer.includes('σ')) variants.push('sigma');
    
    // Variantes pour les formules courantes
    if (answer.includes('e^(-λt)') || answer.includes('e^(-lambda*t)')) {
        variants.push('e^(-λt)');
        variants.push('e^(-lambda*t)');
        variants.push('e^(-lambda t)');
        variants.push('exp(-λt)');
        variants.push('exp(-lambda*t)');
    }
    
    if (answer.includes('ln(2)/λ') || answer.includes('ln(2)/lambda')) {
        variants.push('ln(2)/λ');
        variants.push('ln(2)/lambda');
        variants.push('ln2/λ');
        variants.push('ln2/lambda');
    }
    
    if (answer.includes('0,693/λ') || answer.includes('0.693/λ')) {
        variants.push('0,693/λ');
        variants.push('0,693/lambda');
        variants.push('0.693/λ');
        variants.push('0.693/lambda');
    }
    
    return variants;
}

function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[b.length][a.length];
}

function resetAll() {
    document.querySelectorAll('.fill-blank').forEach(input => {
        input.value = '';
        input.classList.remove('correct', 'incorrect');
        
        const wrapper = input.closest('.blank-wrapper');
        const feedback = wrapper.querySelector('.answer-feedback');
        if (feedback) feedback.remove();
    });
    
    document.getElementById('global-score').style.display = 'none';
}

function showError(e) {
    document.getElementById('title').textContent = '⚠️ Erreur de chargement';
    document.getElementById('content').innerHTML = `
        <div class="warning">
            <p>Impossible de charger. Utilise un serveur local.</p>
        </div>
    `;
}