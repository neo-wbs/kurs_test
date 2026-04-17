# CI/CD Praxis-Anleitung — Teil 5

> **Ziel:** Du erweiterst das Projekt um einen echten Build-Prozess mit Vite,
> versionierst Releases mit Git-Tags und baust eine vollautomatische
> Deploy-Pipeline, die bei jedem Tag-Push live geht.
>
> **Voraussetzungen:** Teil 4 absolviert

---

## Schritt 1 — Vite als Build-Tool einrichten

```bash
# In dein Projektverzeichnis wechseln
cd dein_projekt

# Vite installieren (als Dev-Dependency)
npm install --save-dev vite

# esbuild installieren
npm install esbuild
```

### vite.config.js anlegen

Neue Datei `vite.config.js` im Projektroot erstellen (Inhalt vgl. Code). 
Repo-Name anpassen nicht vergessen.

### package.json Scripts aktualisieren

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint:js": "eslint app.js app.cjs",
    "lint:html": "htmlhint index.html",
    "lint": "npm run lint:js && npm run lint:html",
    "test": "jest",
    "test:ci": "jest --ci --coverage --coverageReporters=text --coverageReporters=lcov",
    "clean": "rm -rf dist"
  }
}
```

## Schritt 2 — Umgebungsvariablen einrichten

### .env anlegen (für alle Umgebungen)

```bash
VITE_APP_NAME=dein_projekt
VITE_APP_VERSION=1.0.0
```

### .env.production anlegen

```bash
VITE_APP_ENV=production
VITE_BUILD_DATE=auto
```

### .gitignore ergänzen

Öffne `.gitignore` und stelle sicher, dass .env + .env.production + dist/ vorhanden sind

---

## Schritt 3 — Build lokal testen - Problem 1 = Modul lösen

```bash
# Erster Build meldet Fehler: <script src="app.js"> in "/index.html" can't be bundled without type="module" attribute
# Zudem wird nur minified css generiert in dist/
npm run build

# vite verlangt in index.html: 
<script src="app.js" type="module"></script>

# Nach Ergänzen, geht html direkt im Browser öffnen nicht mehr
# In FF Entwicklertools viele Fehler, v.a.: (Grund: CORS-Anfrage war nicht http)
npm run preview # css, js nicht funktionabel
npm run dev # css geht, js meldet Fehler: Uncaught ReferenceError: updateStatus is not defined

# Grund: Ohne type="module" > Lädt als normales Script.
# Es landen alle Variablen/Funktionen landen im globalen Scope (`window.updateStatus` verfügbar)
# Mit type="module" > Lädt als ES Module
# Code läuft in einem eigenen Scope – nichts landet auf globalen Scope (`window.updateStatus` wird von html nicht gefunden)

# Lösung: Event Listener im Modul registrieren:
<button id="status-btn">Status aktualisieren</button>
document.getElementById('status-btn').addEventListener('click', updateStatus);
```

```bash
# Produktion-Build erstellen
npm run build

# Was wurde erzeugt?
ls -la dist/
# dist/
# ├── index.html        (optimiert)
# ├── assets/
# │   ├── index-abc123.js   (gehasht, minifiziert)
# │   └── index-def456.css  (gehasht, minifiziert)
```

```bash
# Build lokal vorschauen (simuliert Produktion) > (einfach html im Browser öffnen, geht nicht mehr)
npm run dev 
# Öffnet http://localhost:5173/dein_projekt/
```

Die Seite sollte identisch zur Development-Version aussehen — aber die Dateien
sind jetzt minifiziert und für Produktion optimiert.

---

## Schritt 4: Umgebungsvariable in app.js nutzen - Problem 2 = import.meta nur in Modul

Wenn ich Umgebungsvariablen in app.js nutzen will, läuft `npm run dev` sauber:

```javascript
const APP_NAME = import.meta.env?.VITE_APP_NAME ?? 'kurs_test';

const messages = [
    `${APP_NAME}: Pipeline läuft!`,
    'Tests bestanden!',
    'Deploy bereit!',
    'CI/CD läuft!',
    'Code ist sauber!'
];
```

`npm test` liefert aber Fehler: SyntaxError: Cannot use 'import.meta' outside a module
`app.js` ist momentan ein CommonJS (CJS) - Modul, weil Jest nur damit umgehen kann. 
CommonJS unterstützt aber kein 'import.meta'. Das ist erst mit ECMAScript modules eingeführt worden. 
Nennen wir die Datei mal um in `app.cjs` und implementieren die `app.js` mal als ES Module (ESM). Inhalt vgl. Code.

```javascript
// in app.cjs das 'import.meta' erstmal wieder raus:
const APP_NAME = 'kurs_test';
```

`npm test` liefert aber wieder Fehler: SyntaxError: Cannot use 'import.meta' outside a module
Bedeutet, Jest (unser Test-Framework) kann, wie erwähnt, nicht mit 'import.meta' umgehen, beide Modularten
haben wir getestet. Deshalb nehmen wir für die Tests CommonJS, also die `app.cjs` und für den Build
ESM, also die `app.js`, um die Umgebungsvariablen zu nutzen. Aber nicht vergessen: 
Beim Linting `app.cjs` mit aufnehmen in `package.json`: `"lint:js": "eslint app.js app.cjs"` 
und in `eslint.config.mjs` Module unterschiedlich checken (vgl. Code).

```javascript
// in app.test.js
const { getRandomMessage, validateEmail, formatVersion, messages } = require('./app.cjs');
// Testen
npm test
npm run lint
npm run dev
```

Läuft jetzt, Alternative zu unserer Variante wäre Babel: https://dev.to/rolamuibi/jest-and-vite-cannot-use-importmeta-outside-a-module-24n3. 
Nachteil unserer Variante ist, dass ich `app.js` und `app.cjs` immer synchron halten muss. Vorteil: keine zusätzlichen Abhängigkeiten.

---

## Schritt 4 — CI-Pipeline um Build-Job erweitern und Tags als Trigger

Ergänze bzw. ändere `.github/workflows/ci.yml` (vgl. Code):

## Schritt 5 — Erstes Release mit Git-Tag

Jetzt versionieren wir das Projekt und lösen das erste echte Release aus:

```bash
# Alle aktuellen Änderungen committen
git add .
git commit -m "feat: add Vite build pipeline and deploy workflow"
git push origin main

# Ersten Release-Tag erstellen
git tag -a v1.0.0 -m "Release 1.0.0: CI/CD Pipeline komplett eingerichtet"

# Tag zu GitHub pushen (löst den release-Job aus)
git push origin v1.0.0
```

### Was jetzt passiert (in GitHub Actions beobachten):

```
Push v1.0.0 Tag
      │
      ▼
┌─────────────────────┐
│  lint-and-test      │  ~1 Min
│  ✓ Lint             │
│  ✓ Tests            │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  build              │  ~30 Sek
│  ✓ npm run build    │
│  ✓ dist/ gespeichert│
└─────────────────────┘
      │
      ├──────────────────────────────┐
      ▼                              ▼
┌─────────────────┐    ┌─────────────────────┐
│  deploy         │    │  release            │
│  ✓ GitHub Pages │    │  ✓ ZIP erstellen    │
└─────────────────┘    │  ✓ GitHub Release   │
                       └─────────────────────┘
```

### Ergebnis prüfen:

- **Pipeline:** `github.com/USERNAME/dein_repo/actions`
- **Live-Seite:** `https://USERNAME.github.io/dein_repo/`
- **Release:** `github.com/USERNAME/dein_repo/releases`

---

## Schritt 6 — Rollback simulieren

### PHASE 1: Buggy Version vorbereiten

```bash
git checkout -b feature/new-version
# index.html ändern (Titel etc.), dann:
git add .
git commit -m "feat: new version with bug"
git push origin feature/new-version

# PR auf GitHub erstellen und mergen (via UI oder gh CLI)
# Danach: main aktualisieren und Tag setzen

git checkout main && git pull

git tag -a v1.1.0 -m "Release 1.1.0 - hat einen Bug"
git push origin v1.1.0
```

### PHASE 2: ROLLBACK

```bash
# Schritt 1: Merge-Commit-ID herausfinden
git log --oneline
# Beispielausgabe:
# a3f9e21 (HEAD -> main) Merge pull request #1 from feature/new-version
# 8578803 feat: new version with bug

# ─── WARUM revert statt reset? ───────────────────
#
# git reset <commit>
#   → Bewegt den Branch-Zeiger zurück, löscht Commits aus der History
#   → Nach einem Push: Andere haben diese Commits bereits!
#   → Braucht "git push --force" → überschreibt fremde Arbeit
#   → Auf shared Branches (main, develop) NICHT verwenden
#
# git revert <commit>
#   → Erstellt einen NEUEN Commit, der die Änderungen umkehrt
#   → History bleibt vollständig erhalten (Audit-Trail!)
#   → Normaler Push reicht aus — kein Force nötig
#   → Sicher für alle Teamkollegen

# Schritt 2: Den Merge-Commit rückgängig machen
# WICHTIG: Bei einem Merge-Commit MUSS -m 1 angegeben werden!
#
# -m 1 bedeutet: "Bleib beim ersten Eltern-Commit" = main vor dem Merge
# -m 2 wäre: "Bleib beim Feature-Branch-Commit" (selten sinnvoll)
#
# Ohne -m 1 weiß git revert nicht, welchen von zwei Eltern
# es als "Basis" nehmen soll. Deshalb geht "git revert HEAD" nicht,
# weil HEAD nach einem GitHub-PR-Merge auf den Merge-Commit zeigt (ein Commit mit zwei Eltern).
# → Fehlermeldung: "error: commit is a merge but no -m option was given"
git revert -m 1 a3f9e21
# git öffnet Editor für Commit-Message (oder --no-edit für Standard)
# Standard-Message: "Revert "Merge pull request #1 from feature/new-version""
# Du kannst sie anpassen: "revert: rollback v1.1.0 due to bug"

# Schritt 3: Pushen (kein --force nötig!)
git push origin main

# Schritt 4: Neuen stabilen Tag setzen
git tag -a v1.1.1 -m "Hotfix: rollback to stable state"
git push origin v1.1.1

# Schritt 5: Buggy Tag aufräumen (optional, aber sauber)
git tag -d v1.1.0                    # lokal löschen
git push origin --delete v1.1.0     # remote löschen
```

## Schritt 7 — Deployment-Umgebung mit Approval (optional)

```bash
# In GitHub: Settings → Environments → New environment
# Name: "production"
# Required reviewers: Dich selbst hinzufügen (Benutzername oben rechts bei Github)
```

Neuen Job am Ende der `ci.yml` hinzufügen:

```yaml
  deploy-production:
    name: Deploy to Production (with Approval)
    runs-on: ubuntu-latest
    needs: deploy
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production    # <- Wartet auf manuellen Approval

    steps:
      - run: echo "Production deployment approved and running!"
      # Hier echte Deployment-Steps einfügen
```

Jetzt pausiert die Pipeline beim `deploy-production`-Job und wartet auf
deinen manuellen Klick im GitHub Actions-Interface. Wenn ich selbst Reviewer bin, läuft Job durch ohne Überprüfung. 
Jobs `release` und `deploy-production` laufen nur, wenn Tag gepusht werden. 
Also bei Trigger = Tag (vgl. in `ci.yml`: `startsWith(github.ref, 'refs/tags/v')`)
```bash
git tag v1.0.0
git push origin v1.0.0
```

---