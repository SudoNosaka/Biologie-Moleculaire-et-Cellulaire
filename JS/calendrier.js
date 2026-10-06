// ============================================
// CALENDRIER DYNAMIQUE - Synchronisé avec dates réelles
// ============================================

let calendrierData = null;
let semaineActuelle = 0;

function loadCalendrier() {
    console.log('Chargement du calendrier...');
    
    fetch('data/calendrier.json')
        .then(response => {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('Calendrier chargé:', data.nombreSemaines, 'semaines');
            calendrierData = data;
            initCalendrier();
        })
        .catch(error => {
            console.error('Erreur chargement calendrier:', error);
            const container = document.getElementById('calendrier-container');
            if (container) {
                container.innerHTML = `
                    <div class="warning">
                        <h3>⚠️ Impossible de charger le calendrier</h3>
                        <p>Vérifie que le fichier data/calendrier.json existe et que tu utilises un serveur local.</p>
                        <p><small>Erreur: ${error.message}</small></p>
                    </div>
                `;
            }
        });
}

function initCalendrier() {
    // Calculer la semaine actuelle
    const dateDebut = new Date(calendrierData.dateDebutSemestre);
    const aujourd = new Date();
    const diffTime = aujourd - dateDebut;
    const diffJours = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    semaineActuelle = Math.floor(diffJours / 7) + 1;
    
    // Limiter aux semaines valides
    if (semaineActuelle < 1) semaineActuelle = 1;
    if (semaineActuelle > calendrierData.nombreSemaines) semaineActuelle = calendrierData.nombreSemaines;
    
    afficherSemaine(semaineActuelle);
}

function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function afficherSemaine(numSemaine) {
    const container = document.getElementById('calendrier-container');
    if (!container || !calendrierData) return;
    
    const dateDebut = new Date(calendrierData.dateDebutSemestre);
    const debutSemaine = new Date(dateDebut);
    debutSemaine.setDate(debutSemaine.getDate() + (numSemaine - 1) * 7);
    
    const lundiSemaine = getMondayOfWeek(debutSemaine);
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changerSemaine(-1)" ${numSemaine <= 1 ? 'disabled' : ''}>
                ← Semaine précédente
            </button>
            <div class="calendar-week-info">
                <h3>Semaine ${numSemaine}</h3>
                <p class="calendar-dates">${formaterDate(lundiSemaine)} - ${formaterDate(new Date(lundiSemaine.getTime() + 4 * 24 * 60 * 60 * 1000))}</p>
            </div>
            <button class="calendar-nav-btn" onclick="changerSemaine(1)" ${numSemaine >= calendrierData.nombreSemaines ? 'disabled' : ''}>
                Semaine suivante →
            </button>
        </div>
        <div class="calendar-days">
    `;
    
    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    
    for (let i = 0; i < 5; i++) {
        const dateJour = new Date(lundiSemaine);
        dateJour.setDate(dateJour.getDate() + i);
        const dateStr = formaterDateISO(dateJour);
        
        const evenementsJour = calendrierData.evenements.filter(e => e.date === dateStr);
        const isToday = estAujourd(dateJour);
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-header">
                    <span class="day-name">${joursSemaine[i]}</span>
                    <span class="day-number">${dateJour.getDate()}</span>
                </div>
                <div class="day-events">
        `;
        
        if (evenementsJour.length > 0) {
            evenementsJour.forEach(event => {
                const titreSafe = event.titre.replace(/'/g, "\\'");
                const detailsSafe = (event.details || '').replace(/'/g, "\\'");
                html += `
                    <div class="event ${event.type}">
                        <span class="event-title">${event.titre}</span>
                        <button class="event-view-btn" 
                                onclick="afficherModal('${titreSafe}', '${event.date}', '${event.type}', '${detailsSafe}')">
                            Détails
                        </button>
                    </div>
                `;
            });
        } else {
            html += `<div class="no-event">-</div>`;
        }
        
        html += `
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    // Carrousel des semaines
    html += `
        <div class="calendar-weeks-track">
            <button class="weeks-nav-btn" onclick="scrollWeeks(-1)">‹</button>
            <div class="weeks-scroll" id="weeks-scroll">
    `;
    
    for (let i = 1; i <= calendrierData.nombreSemaines; i++) {
        const isCurrent = i === semaineActuelle;
        const hasEvent = calendrierData.evenements.some(e => {
            const eventDate = new Date(e.date);
            const weekStart = new Date(dateDebut);
            weekStart.setDate(weekStart.getDate() + (i - 1) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return eventDate >= weekStart && eventDate <= weekEnd;
        });
        
        html += `
            <button class="week-btn ${isCurrent ? 'current' : ''} ${hasEvent ? 'has-event' : ''}" 
                    onclick="allerSemaine(${i})">
                S${i}
            </button>
        `;
    }
    
    html += `
            </div>
            <button class="weeks-nav-btn" onclick="scrollWeeks(1)">›</button>
        </div>
    `;
    
    container.innerHTML = html;
    
    setTimeout(() => {
        const currentBtn = container.querySelector('.week-btn.current');
        if (currentBtn) {
            currentBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 100);
}

function changerSemaine(delta) {
    semaineActuelle += delta;
    if (semaineActuelle < 1) semaineActuelle = 1;
    if (semaineActuelle > calendrierData.nombreSemaines) semaineActuelle = calendrierData.nombreSemaines;
    afficherSemaine(semaineActuelle);
}

function allerSemaine(numSemaine) {
    semaineActuelle = numSemaine;
    afficherSemaine(semaineActuelle);
}

function scrollWeeks(direction) {
    const scrollContainer = document.getElementById('weeks-scroll');
    if (scrollContainer) {
        scrollContainer.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
}

function formaterDate(date) {
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

function formaterDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function estAujourd(date) {
    const aujourd = new Date();
    return date.toDateString() === aujourd.toDateString();
}

// ============================================
// MODAL ÉVÉNEMENT
// ============================================

function afficherModal(titre, date, type, details) {
    console.log('Modal ouverte:', titre, date, type, details);
    
    const modal = document.getElementById('event-modal');
    if (!modal) {
        console.error('Modal non trouvée dans le HTML !');
        alert('Erreur : le modal HTML n\'existe pas dans index.html');
        return;
    }
    
    document.getElementById('modal-title').textContent = titre;
    document.getElementById('modal-date').textContent = formaterDateComplete(date);
    
    const modalType = document.getElementById('modal-type');
    modalType.textContent = type === 'examen' ? '📝 Examen' : '📚 TD';
    modalType.className = `modal-type ${type}`;
    
    document.getElementById('modal-details').textContent = details || 'Aucun détail disponible';
    
    modal.style.display = 'flex';
    
    if (typeof playSound === 'function') playSound('click');
}

function fermerModal() {
    const modal = document.getElementById('event-modal');
    if (modal) modal.style.display = 'none';
}

function formaterDateComplete(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

// Fermer la modal en cliquant en dehors
window.onclick = function(event) {
    const modal = document.getElementById('event-modal');
    if (event.target === modal) {
        fermerModal();
    }
}