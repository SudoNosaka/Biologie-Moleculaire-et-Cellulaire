# Cahier BMC - Biologie Moléculaire & Cellulaire

*MAJ : 28-09-26*

## Architecture du projet
/
├── index.html # Point d'entrée
├── parametres.html # Toggle thème + lien GitHub Issues
├── Cahier BMC.md # Ce fichier (progression)
│
├── /css/
│ ├── style.css # Design violet clair + rouge sombre
│ └── animations.css # Transitions subtiles
│
├── /JS/
│ ├── config.js # Paramètres globaux
│ ├── theme.js # Toggle light/dark
│ ├── components.js # Header/nav/footer réutilisables
│ ├── sound.js # Micro-sons discrets
│ ├── notion-renderer.js # Renderer générique pour les notions
│ ├── quiz-renderer.js # Renderer générique pour les quiz
│ ├── textesatrous-renderer.js # Renderer pour textes à trous
│ └── td-renderer.js # Renderer générique pour les TD
│
├── /theorie/
│ ├── bases.html
│ ├── resume.html
│ └── notion1.html → notion3.html
│
├── /pratique/
│ ├── quiz1.html → quiz3.html
│ ├── textesatrous.html
│ └── td1.html → tdx.html # POur l'instant à ignorer
│
├── /data/
│ ├── notion1.json → notion3.json # Contenu des notions
│ ├── quiz1.json → quiz3.json # Questions des quiz
│ ├── textesatrous.json # Textes à compléter
│ └── td1.json → tdx.json # Exercices des TD a ignorer pour l'instant
│
├── /assets/
│ ├── /fonts/
│ ├── /icons/
│ ├── /sounds/
│ │ ├── click.mp3
│ │ ├── swipe.mp3
│ │ └── validate.mp3
│ └── /videos/
│
└── /Ressources/
├── bio.pdf
└── CM-Cytosquelette-Burgo-26-27.pdf

## Progression du cours

### Cours traités

### Fichiers générés

#### Théorie (`/theorie/`)

#### Pratique (`/pratique/`)

#### Données (`/data/`)

## Méthodologie de révision

### Quotidien (10 min)
1. Relire `theorie/resume.html`
2. Faire un quiz ou textes à trous

### Hebdomadaire (15 min)
1. Relecture approfondie des notions
2. Méthode Pomodoro : 15 min travail / 3 min pause
3. Méthode feuille blanche

### Pratique


## Prochaines étapes


## Design & UX
- **Palette** : Violet clair (#F5F3FF) + Rouge sombre (#991B1B)
- **Thèmes** : Light/Dark avec toggle manuel
- **Animations** : Subtiles (fade-in, hover)
- **Sons** : Micro-sons optionnels (clic, swipe, validation)
- **Accessibilité** : Contraste ≥ 4.5:1

## Statistiques

