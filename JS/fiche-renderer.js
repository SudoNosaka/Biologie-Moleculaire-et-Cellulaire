// ============================================
// FICHE RENDERER - Affiche les fiches depuis JSON
// ============================================

function loadFiche(ficheKey) {
    fetch(`../data/${ficheKey}.json`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => renderFiche(data, ficheKey))
        .catch(error => {
            console.error('Erreur fetch:', error);
            return fetch(`data/${ficheKey}.json`)
                .then(r => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(data => renderFiche(data, ficheKey))
                .catch(err => {
                    console.error('Erreur fallback:', err);
                    document.getElementById('fiche-content').innerHTML = `
                        <div class="warning">
                            <h3>⚠️ Impossible de charger la fiche</h3>
                            <p>Vérifie que le fichier data/${ficheKey}.json existe et que tu utilises un serveur local.</p>
                            <p><small>Erreur: ${err.message}</small></p>
                        </div>
                    `;
                });
        });
}

function renderFiche(data, ficheKey) {
    const titleEl = document.getElementById('fiche-title');
    const subtitleEl = document.getElementById('fiche-subtitle');
    
    if (titleEl) titleEl.textContent = data.title || 'Chargement...';
    if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
    
    document.title = `${data.title || 'Fiche'} - BMC`;
    
    const contentDiv = document.getElementById('fiche-content');
    if (!contentDiv) {
        console.error('Element #fiche-content non trouvé');
        return;
    }
    
    let html = '';
    
    if (data.sections && Array.isArray(data.sections)) {
        data.sections.forEach(section => {
            html += renderFicheSection(section);
        });
    }
    
    contentDiv.innerHTML = html;
}

function renderFicheSection(section) {
    if (!section) return '';
    
    let html = `<section class="content-section">`;
    
    // Titre
    if (section.title) {
        html += `<h2>${section.title}</h2>`;
    }
    
    // Contenu texte
    if (section.content) {
        html += `<p>${section.content}</p>`;
    }
    
    // Liste
    if (section.list && Array.isArray(section.list)) {
        html += `<ul>`;
        section.list.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul>`;
    }
    
    // Tableau
    if (section.table && Array.isArray(section.table) && section.table.length > 0) {
        html += renderFicheTable(section.table);
    }
    
    // Formule
    if (section.formula) {
        html += `<div class="formula">${section.formula}</div>`;
    }
    
    // Hint
    if (section.hint) {
        html += `<div class="hint"><strong>💡 À retenir :</strong> ${section.hint}</div>`;
    }
    
    // Warning
    if (section.warning) {
        html += `<div class="warning"><strong>⚠️ Important :</strong> ${section.warning}</div>`;
    }
    
    // Subsections
    if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections.forEach(subsection => {
            html += renderSubsection(subsection);
        });
    }
    
    html += `</section>`;
    return html;
}

function renderSubsection(subsection) {
    if (!subsection) return '';
    
    let html = '';
    
    if (subsection.title) {
        html += `<h3>${subsection.title}</h3>`;
    }
    
    if (subsection.content) {
        html += `<p>${subsection.content}</p>`;
    }
    
    if (subsection.list && Array.isArray(subsection.list)) {
        html += `<ul>`;
        subsection.list.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `</ul>`;
    }
    
    if (subsection.table && Array.isArray(subsection.table) && subsection.table.length > 0) {
        html += renderFicheTable(subsection.table);
    }
    
    if (subsection.formula) {
        html += `<div class="formula">${subsection.formula}</div>`;
    }
    
    if (subsection.hint) {
        html += `<div class="hint"><strong>💡 À retenir :</strong> ${subsection.hint}</div>`;
    }
    
    if (subsection.warning) {
        html += `<div class="warning"><strong>⚠️ Important :</strong> ${subsection.warning}</div>`;
    }
    
    return html;
}

function renderFicheTable(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
    
    try {
        const keys = Object.keys(arr[0]);
        let html = `<table class="table-custom"><tr>`;
        keys.forEach(k => {
            const label = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            html += `<th>${label}</th>`;
        });
        html += `</tr>`;
        arr.forEach(row => {
            html += `<tr>`;
            keys.forEach(k => {
                const val = row[k] !== undefined && row[k] !== null ? row[k] : '';
                html += `<td>${val}</td>`;
            });
            html += `</tr>`;
        });
        html += `</table>`;
        return html;
    } catch (e) {
        console.error('Erreur tableau:', e);
        return '<p><em>Erreur d\'affichage du tableau</em></p>';
    }
}