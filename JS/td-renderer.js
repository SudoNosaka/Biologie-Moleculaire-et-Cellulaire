function loadTD(tdId) {
    fetch(`../data/${tdId}.json`)
        .then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(data => renderTD(data, tdId))
        .catch(err => {
            console.warn('Fallback...', err);
            return fetch(`data/${tdId}.json`)
                .then(r => r.json())
                .then(data => renderTD(data, tdId))
                .catch(e => showError(e));
        });
}

function renderTD(data, tdId) {
    document.getElementById('td-title').textContent = data.titre;
    document.title = data.titre;
    
    const donneesList = document.getElementById('donnees-list');
    donneesList.innerHTML = data.donnees.map(d => `<li>${d}</li>`).join('');
    
    const container = document.getElementById('exercices-container');
    let html = '';
    data.exercices.forEach((ex, i) => {
        html += `<section class="content-section fade-in">
            <h2>Exercice ${ex.id} : ${ex.titre}</h2>
            <div class="enonce">${ex.enonce.replace(/\n/g, '<br>')}</div>
            <div class="hint"><strong>Aide :</strong> ${ex.aide}</div>
            <button class="btn-primary" onclick="toggleSolution('sol${i}')">Afficher la correction</button>
            <div class="solution" id="sol${i}">
                <h4>Correction</h4>
                <p>${ex.solution.replace(/\n/g, '<br>')}</p>
            </div>
        </section>`;
    });
    
    const tdNumber = parseInt(tdId.replace('td', ''));
    html += `<div class="navigation-section">`;
    if (tdNumber > 1) {
        html += `<a href="td${tdNumber-1}.html" class="nav-btn prev">← TD${tdNumber-1}</a>`;
    }
    if (tdNumber < 7) {
        html += `<a href="td${tdNumber+1}.html" class="nav-btn next">TD${tdNumber+1} →</a>`;
    }
    html += `</div>`;
    
    container.innerHTML = html;
}

function toggleSolution(id) {
    const sol = document.getElementById(id);
    sol.classList.toggle('show');
    if (typeof playSound === 'function') playSound('swipe');
}

function showError(e) {
    document.getElementById('td-title').textContent = '⚠️ Erreur de chargement';
    document.getElementById('exercices-container').innerHTML = `
        <div class="warning">
            <p>Impossible de charger le TD. Utilise un serveur local.</p>
        </div>
    `;
}