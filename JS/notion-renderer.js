function renderNotion(notionKey) {
    fetch(`../data/${notionKey}.json`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            try {
                renderNotionData(data, notionKey);
            } catch (e) {
                console.error('Erreur de rendu:', e);
                document.getElementById('content').innerHTML = `
                    <div class="warning">
                        <h3>⚠️ Erreur d'affichage</h3>
                        <p>${e.message}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.warn('Fetch échoué, fallback...', error);
            return fetch(`data/${notionKey}.json`)
                .then(r => r.json())
                .then(data => renderNotionData(data, notionKey))
                .catch(err => {
                    document.getElementById('content').innerHTML = `
                        <div class="warning">
                            <h3>⚠️ Impossible de charger</h3>
                            <p>Utilise un serveur local.</p>
                        </div>
                    `;
                });
        });
}

function renderNotionData(notion, notionKey) {
    document.getElementById('notion-title').textContent = notion.title || 'Chargement...';
    document.getElementById('notion-subtitle').textContent = notion.subtitle || '';
    document.title = `Notion ${notionKey.replace('notion', '')} - ${notion.title || ''}`;
    
    const contentDiv = document.getElementById('content');
    let html = '';
    
    if (notion.sections && Array.isArray(notion.sections)) {
        notion.sections.forEach(section => {
            html += renderSection(section);
        });
    }
    
    contentDiv.innerHTML = html;
    addSoundEffects();
}

function renderSection(section) {
    if (!section) return '';
    let html = `<section class="content-section fade-in">`;
    
    if (section.title) html += `<h2>${section.title}</h2>`;
    if (section.content) html += `<p>${section.content}</p>`;
    if (section.formulation) html += `<p><em>${section.formulation}</em></p>`;
    if (section.interpretation) html += `<p><em>${section.interpretation}</em></p>`;
    
    if (section.formula) html += `<div class="formula">${section.formula}</div>`;
    if (section.formula2) html += `<div class="formula">${section.formula2}</div>`;
    if (section.equation) html += `<div class="formula">${section.equation}</div>`;
    if (section.solution) html += `<div class="formula">${section.solution}</div>`;
    if (section.formulas && Array.isArray(section.formulas)) {
        section.formulas.forEach(f => html += `<div class="formula">${f}</div>`);
    }
    
    if (section.list && Array.isArray(section.list)) {
        html += `<ul>${section.list.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
    if (section.observations && Array.isArray(section.observations)) {
        html += `<ul>${section.observations.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
    if (section.applications && Array.isArray(section.applications)) {
        html += `<ul>${section.applications.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
    if (section.method && Array.isArray(section.method)) {
        html += `<ol>${section.method.map(i => `<li>${i}</li>`).join('')}</ol>`;
    }
    if (section.structure && Array.isArray(section.structure)) {
        html += `<ul>${section.structure.map(i => `<li>${i}</li>`).join('')}</ul>`;
    }
    
    if (section.example) html += `<div class="example"><strong>Exemple :</strong> ${section.example}</div>`;
    if (section.examples && Array.isArray(section.examples) && section.examples.length > 0) {
        html += renderTableFromObjects(section.examples);
    }
    if (section.table && Array.isArray(section.table) && section.table.length > 0) {
        html += renderTableFromObjects(section.table);
    }
    if (section.types && Array.isArray(section.types) && section.types.length > 0) {
        html += renderTableFromObjects(section.types);
    }
    if (section.calculations && Array.isArray(section.calculations) && section.calculations.length > 0) {
        html += renderTableFromObjects(section.calculations);
    }
    
    if (section.warning) html += `<div class="warning">${section.warning}</div>`;
    if (section.consequence) html += `<div class="consequence"><strong>Conséquence :</strong> ${section.consequence}</div>`;
    if (section.total) html += `<div class="formula"><strong>Total :</strong> ${section.total}</div>`;
    
    if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections.forEach(sub => {
            if (!sub) return;
            html += `<h3>${sub.title || ''}</h3>`;
            if (sub.content) html += `<p>${sub.content}</p>`;
            if (sub.content2) html += `<p>${sub.content2}</p>`;
            if (sub.formulation) html += `<p><em>${sub.formulation}</em></p>`;
            if (sub.interpretation) html += `<p><em>${sub.interpretation}</em></p>`;
            if (sub.formula) html += `<div class="formula">${sub.formula}</div>`;
            if (sub.formula2) html += `<div class="formula">${sub.formula2}</div>`;
            if (sub.formulas && Array.isArray(sub.formulas)) {
                sub.formulas.forEach(f => html += `<div class="formula">${f}</div>`);
            }
            if (sub.list && Array.isArray(sub.list)) {
                html += `<ul>${sub.list.map(i => `<li>${i}</li>`).join('')}</ul>`;
            }
            if (sub.table && Array.isArray(sub.table) && sub.table.length > 0) {
                html += renderTableFromObjects(sub.table);
            }
            if (sub.calculations && Array.isArray(sub.calculations) && sub.calculations.length > 0) {
                html += renderTableFromObjects(sub.calculations);
            }
            if (sub.warning) html += `<div class="warning">${sub.warning}</div>`;
            if (sub.consequence) html += `<div class="consequence"><strong>Conséquence :</strong> ${sub.consequence}</div>`;
        });
    }
    
    html += `</section>`;
    return html;
}

function renderTableFromObjects(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) return '';
    
    try {
        const keys = Object.keys(arr[0]);
        let html = `<table class="table-custom"><tr>`;
        keys.forEach(k => {
            html += `<th>${k.replace(/_/g, ' ')}</th>`;
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
        console.error('Erreur tableau:', e, arr);
        return '<p><em>Erreur d\'affichage du tableau</em></p>';
    }
}

function addSoundEffects() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('swipe');
        });
    });
}