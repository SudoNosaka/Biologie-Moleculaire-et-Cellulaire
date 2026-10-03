// ============================================
// BILAN RENDERER - Affiche les bilans depuis JSON
// ============================================

function loadBilan(bilanKey) {
    console.log('Chargement du bilan:', bilanKey);
    
    fetch(`../data/${bilanKey}.json`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('Bilan chargé:', data.exercices.length, 'exercices');
            renderBilan(data, bilanKey);
        })
        .catch(error => {
            console.warn('Erreur fetch principal:', error);
            return fetch(`data/${bilanKey}.json`)
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(data => {
                    console.log('Fallback OK:', data.exercices.length, 'exercices');
                    renderBilan(data, bilanKey);
                })
                .catch(err => {
                    console.error('Erreur fallback:', err);
                    const container = document.getElementById('bilan-content');
                    if (container) {
                        container.innerHTML = `
                            <div class="warning">
                                <h3>⚠️ Impossible de charger le bilan</h3>
                                <p>Vérifie que le fichier data/${bilanKey}.json existe.</p>
                                <p><small>Erreur: ${err.message}</small></p>
                            </div>
                        `;
                    }
                });
        });
}

function renderBilan(data, bilanKey) {
    const titleEl = document.getElementById('bilan-title');
    const subtitleEl = document.getElementById('bilan-subtitle');
    
    if (titleEl) titleEl.textContent = data.title || 'Chargement...';
    if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
    
    document.title = `${data.title || 'Bilan'} - BMC`;
    
    const contentDiv = document.getElementById('bilan-content');
    if (!contentDiv) return;
    
    let html = '';
    
    if (data.exercices && Array.isArray(data.exercices)) {
        data.exercices.forEach(exercice => {
            html += renderExercice(exercice);
        });
    }
    
    contentDiv.innerHTML = html;
}

function renderExercice(exercice) {
    if (!exercice) return '';
    
    let html = `<section class="content-section">`;
    
    if (exercice.titre) {
        html += `<h2>Exercice ${exercice.id} - ${exercice.titre}</h2>`;
    }
    
    if (exercice.enonce) {
        html += `<div class="enonce">${exercice.enonce.replace(/\n/g, '<br>')}</div>`;
    }
    
    if (exercice.aide) {
        html += `<button class="btn-secondary" onclick="toggleAide('${exercice.id}')">💡 Afficher l'aide</button>`;
        html += `<div class="hint" id="aide-${exercice.id}" style="display: none;">${exercice.aide}</div>`;
    }
    
    if (exercice.solution) {
        html += `<button class="btn-primary" onclick="toggleSolution('${exercice.id}')">✓ Afficher la solution</button>`;
        html += `<div class="solution" id="solution-${exercice.id}">`;
        html += `<h4>Solution</h4>`;
        html += `<div>${exercice.solution.replace(/\n/g, '<br>')}</div>`;
        html += `</div>`;
    }
    
    html += `</section>`;
    return html;
}

function toggleAide(exerciceId) {
    const aideDiv = document.getElementById(`aide-${exerciceId}`);
    if (aideDiv) {
        aideDiv.style.display = aideDiv.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleSolution(exerciceId) {
    const solutionDiv = document.getElementById(`solution-${exerciceId}`);
    if (solutionDiv) {
        solutionDiv.classList.toggle('show');
    }
}