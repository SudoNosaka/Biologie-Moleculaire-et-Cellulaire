// ============================================
// CALENDRIER DYNAMIQUE - Semaines ISO de l'année
// ============================================

let calendrierData = null;
let semaineIsoActuelle = 0;

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
                        <p>Vérifie que le fichier data/calendrier.json existe.</p>
                    </div>
                `;
            }
        });
}

function initCalendrier() {
    // Récupérer la semaine ISO de l'année en cours
    semaineIsoActuelle = getISOWeek(new Date());
    console.log('Semaine ISO actuelle :', semaineIsoActuelle);
    
    afficherSemaine(semaineIsoActuelle);
}

/**
 * Calcule le numéro de semaine ISO d'une date
 */
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Retourne le lundi de la semaine ISO donnée pour une année donnée
 */
function getMondayOfISOWeek(isoWeek, year) {
    const simple = new Date(year, 0, 1 + (isoWeek - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
}

function isDateInRange(date, start, end) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
}

function afficherSemaine(numSemaine) {
    const container = document.getElementById('calendrier-container');
    if (!container || !calendrierData) return;
    
    const aujourd = new Date();
    const year = aujourd.getFullYear();
    
    // Lundi de la semaine ISO demandée
    const lundiSemaine = getMondayOfISOWeek(numSemaine, year);
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changerSemaine(-1)">
                ← Semaine précédente
            </button>
            <div class="calendar-week-info">
                <h3>Semaine ${numSemaine}</h3>
                <p class="calendar-dates">${formaterDate(lundiSemaine)} - ${formaterDate(new Date(lundiSemaine.getTime() + 4 * 24 * 60 * 60 * 1000))} ${year}</p>
            </div>
            <button class="calendar-nav-btn" onclick="changerSemaine(1)">
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
    
    // Carrousel des semaines ISO (autour de la semaine actuelle)
    html += `
        <div class="calendar-weeks-track">
            <button class="weeks-nav-btn" onclick="scrollWeeks(-1)">‹</button>
            <div class="weeks-scroll" id="weeks-scroll">
    `;
    
    // Afficher les semaines ISO de l'année universitaire (septembre à juin)
    // Généralement semaines 36 à 25 de l'année suivante
    const debutAnneeUniv = 36; // Semaine ISO de début septembre
    const finAnneeUniv = 25;   // Semaine ISO de fin juin
    
    for (let i = debutAnneeUniv; i <= 52; i++) {
        const isCurrent = i === semaineIsoActuelle;
        const weekStart = getMondayOfISOWeek(i, year);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const hasEvent = calendrierData.evenements.some(e => {
            const eventDate = new Date(e.date);
            return isDateInRange(eventDate, weekStart, weekEnd);
        });
        
        html += `
            <button class="week-btn ${isCurrent ? 'current' : ''} ${hasEvent ? 'has-event' : ''}" 
                    onclick="allerSemaine(${i})">
                S${i}
            </button>
        `;
    }
    
    // Semaines de l'année suivante (janvier à juin)
    for (let i = 1; i <= finAnneeUniv; i++) {
        const isCurrent = i === semaineIsoActuelle;
        const weekStart = getMondayOfISOWeek(i, year + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const hasEvent = calendrierData.evenements.some(e => {
            const eventDate = new Date(e.date);
            return isDateInRange(eventDate, weekStart, weekEnd);
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
    semaineIsoActuelle += delta;
    if (semaineIsoActuelle < 1) semaineIsoActuelle = 52;
    if (semaineIsoActuelle > 52) semaineIsoActuelle = 1;
    afficherSemaine(semaineIsoActuelle);
}

function allerSemaine(numSemaine) {
    semaineIsoActuelle = numSemaine;
    afficherSemaine(semaineIsoActuelle);
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

window.onclick = function(event) {
    const modal = document.getElementById('event-modal');
    if (event.target === modal) {
        fermerModal();
    }
}