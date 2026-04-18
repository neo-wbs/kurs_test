const APP_NAME = 'kurs_test';

const messages = [
    `${APP_NAME}: Pipeline läuft!`,
    'Tests bestanden!',
    'Deploy bereit!',
    'CI/CD läuft!',
    'Code ist sauber!'
];

function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
}

function updateStatus() {
    const el = document.getElementById('status-text');
    if (el) {
        el.textContent = getRandomMessage();
    }
}

// Teil                 Bedeutung
// ^                    Anfang des Strings
// [^\s@]+              Ein oder mehr Zeichen, die kein Leerzeichen (\s) und kein @ sind
// @                    Genau ein @-Zeichen
// [^\s@]+              Wieder: ein oder mehr Zeichen ohne Leerzeichen und ohne @
// \.                   Ein echter Punkt (ohne \ wäre . ein Platzhalter für beliebige Zeichen)
// [^\s@]+              Nochmal: ein oder mehr Zeichen ohne Leerzeichen und ohne @$Ende des Strings
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function formatVersion(major, minor, patch) {
    if (typeof major !== 'number' || typeof minor !== 'number' || typeof patch !== 'number') {
        throw new Error('All version parts must be numbers');
    }
    return `v${major}.${minor}.${patch}`;
}

// Diese Prüfung testet, ob document überhaupt existiert. Das ist nötig, 
// weil JavaScript nicht nur im Browser läuft – in Node.js z.B. gibt 
// es kein document. Ohne die Prüfung würde der Code dort crashen.
if (typeof document !== 'undefined') {
    // Registriert einen Event-Listener, der wartet bis der Browser das HTML 
    // vollständig geparst hat. Erst dann wird der Callback ausgeführt – sicherstellt, 
    // dass alle HTML-Elemente im DOM vorhanden sind, bevor man darauf zugreift.
    document.addEventListener('DOMContentLoaded', () => {
        console.log('App geladen - bereit für CI/CD!');
        updateStatus();
        // Button-Klick per Event Listener registrieren (statt onclick im HTML)
        const btn = document.getElementById('status-btn');
        if (btn) btn.addEventListener('click', updateStatus);
    });
}

// Strukturiertes Logging – kein import.meta hier, daher statische Version
function log(level, message, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'simple-web-app',
    version: '1.0.0',  // kein import.meta.env in CJS/Node.js
    ...data
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
  return entry;
}

// CJS-Export – macht die Funktionen für require() in Tests verfügbar
module.exports = { getRandomMessage, validateEmail, formatVersion, messages, log };