// ============================================================
// seed.js - outil de simulation de charge
// Fourni par la société d'audit dans le cadre du mandat
// Chronos & Associés (module ICT-321).
//
// Usage : node seed.js <nom_utilisateur> [nombre_de_saisies]
// Exemple : node seed.js jvermot 200
//
// Injecte des saisies de temps réalistes dans timetrack.db
// afin de simuler plusieurs mois d'utilisation réelle.
// ============================================================

const Database = require('better-sqlite3');

const username = process.argv[2];
const count = parseInt(process.argv[3] || '200', 10);

if (!username) {
  console.log('Usage : node seed.js <nom_utilisateur> [nombre_de_saisies]');
  process.exit(1);
}

const db = new Database('timetrack.db');

const PROJECTS = ['Comptabilité Muller SA', 'Audit Fiduciaire Perret', 'Fiscalité privés', 'Administration interne'];

const DESCRIPTIONS = [
  'Saisie des pièces comptables',
  'Contrôle des écritures',
  'Préparation du bouclement',
  'Déclarations fiscales',
  'Rendez-vous client',
  'Séance interne',
  'Réconciliation bancaire',
  'Décompte TVA',
  'Classement et archivage',
  'Réponse aux courriels clients',
  'Préparation de rapports',
  'Formation continue',
];

// nombre aléatoire entier entre min et max inclus
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// date aléatoire sur les 8 derniers mois, jours ouvrables uniquement
function randomWorkDate() {
  const d = new Date();
  d.setDate(d.getDate() - rand(0, 240));
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1); // dimanche -> lundi
  if (day === 6) d.setDate(d.getDate() - 1); // samedi -> vendredi
  return d.toISOString().slice(0, 10);
}

const ins = db.prepare('INSERT INTO entries (username, date, project, hours, description) VALUES (?, ?, ?, ?, ?)');

const insertMany = db.transaction(() => {
  for (let i = 0; i < count; i++) {
    ins.run(
      username,
      randomWorkDate(),
      PROJECTS[rand(0, PROJECTS.length - 1)],
      rand(1, 16) * 0.5, // entre 0.5 et 8 heures, par demi-heures
      DESCRIPTIONS[rand(0, DESCRIPTIONS.length - 1)]
    );
  }
});

insertMany();

const total = db.prepare('SELECT COUNT(*) AS n FROM entries WHERE username = ?').get(username).n;
console.log(`${count} saisies injectées pour ${username} (total en base : ${total}).`);
console.log('Rechargez la page Totaux et chronométrez...');
