// WICHTIG: Diese Datei ist ein ES Module.
//   ✅ import/export erlaubt
//   ✅ import.meta.env verfügbar (Vite injiziert Umgebungsvariablen)
//   ❌ require() / module.exports NICHT erlaubt
//   ❌ Funktionen sind NICHT global → kein onclick="..." im HTML!
//      → Event Listener müssen per addEventListener() registriert werden.

// Umgebungsvariable aus .env / .env.production (wird von Vite ersetzt).
// Fallback auf hartkodierten String, falls die Variable nicht gesetzt ist.
const APP_NAME = import.meta.env?.VITE_APP_NAME ?? 'kurs_test';

// Nachrichten-Pool für den Status-Bereich
const messages = [
  `${APP_NAME}: Pipeline läuft!`,
  'Tests bestanden!',
  'Deploy bereit!',
  'CI/CD läuft!',
  'Code ist sauber!'
];

// Gibt eine zufällige Nachricht aus dem Pool zurück
function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Schreibt eine zufällige Nachricht in das #status-text-Element
function updateStatus() {
    const el = document.getElementById('status-text');
    if (el) el.textContent = getRandomMessage();
}

// Prüft, ob eine E-Mail-Adresse gültig ist
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Formatiert drei Zahlen als Versionsnummer, z.B. formatVersion(1,2,3) → "v1.2.3"
export function formatVersion(major, minor, patch) {
    if (typeof major !== 'number' || typeof minor !== 'number' || typeof patch !== 'number') {
        throw new Error('All version parts must be numbers');
    }
    return `v${major}.${minor}.${patch}`;
}

// Exportiert für externe Nutzung (z.B. andere Module im Projekt)
export { getRandomMessage, messages };

// DOM-Setup: Wird ausgeführt, sobald das HTML vollständig geladen ist.
// Event Listener MÜSSEN hier registriert werden – onclick="..." im HTML
// funktioniert mit type="module" NICHT (Funktionen sind nicht global).
document.addEventListener('DOMContentLoaded', () => {
    console.log('App geladen - bereit für CI/CD!');

    // Sofort einen Status anzeigen
    updateStatus();

    // Button-Klick per Event Listener registrieren (statt onclick im HTML)
    const btn = document.getElementById('status-btn');
    if (btn) btn.addEventListener('click', updateStatus);
});