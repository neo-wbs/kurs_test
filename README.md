[![CI/CD Pipeline](https://github.com/neo-wbs/kurs_test/actions/workflows/ci.yml/badge.svg)](https://github.com/neo-wbs/kurs_test/actions/workflows/ci.yml)
[![CodeQL](https://github.com/neo-wbs/kurs_test/actions/workflows/codeql.yml/badge.svg)](https://github.com/neo-wbs/kurs_test/actions/workflows/codeql.yml)

Ein CI/CD-Lernprojekt mit vollständiger automatisierter Pipeline.

## Live-Demo
🌐 https://neo-wbs.github.io/kurs_test/

## Pipeline
- ✅ Linting (ESLint + HTMLHint)
- ✅ Unit-Tests mit Jest
- ✅ Vite-Build mit Asset-Optimierung
- ✅ Automatisches Deployment auf GitHub Pages
- ✅ Sicherheits-Scans mit CodeQL und Dependabot

# CI/CD Praxis-Anleitung — Teil 6

> **Ziel:** Du ergänzt die Pipeline um Benachrichtigungen bei Fehlern,
> einen Status-Badge im README, automatische Sicherheits-Scans mit CodeQL
> und Dependabot, und lernst den richtigen Umgang mit Secrets.
>
> **Voraussetzungen:** Teil 5 absolviert

---

## Schritt 1 — Pipeline-Badge ins README einfügen (sh. oben)

> Ersetze `USERNAME` durch deinen GitHub-Benutzernamen!

```bash
git add README.md
git commit -m "docs: add pipeline badges to README"
git push origin main
```

Nach dem Push zeigt das README live den Grün/Rot-Status der Pipeline.

---

## Schritt 2 — E-Mail-Benachrichtigungen einrichten

GitHub schickt bei fehlgeschlagenen Pipelines automatisch E-Mails — wenn richtig konfiguriert:

1. Gehe zu **github.com → Dein Profilbild (oben rechts) → Settings**
2. Klicke auf **Notifications** (linke Seitenleiste)
3. Unter **"Actions"** sicherstellen:
   - **"Send notifications for failed workflows only"** ist aktiviert
   - **"Email"** ist als Kanal ausgewählt
4. Speichern

### Benachrichtigung im Workflow selbst (fortgeschritten)

Füge diesen Step am Ende des `lint-and-test`-Jobs in `ci.yml` ein:

```yaml
      - name: Zusammenfassung bei Fehler
        if: failure()
        run: |
          echo "## Pipeline fehlgeschlagen!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Repository:** ${{ github.repository }}" >> $GITHUB_STEP_SUMMARY
          echo "**Branch:** ${{ github.ref_name }}" >> $GITHUB_STEP_SUMMARY
          echo "**Commit:** ${{ github.sha }}" >> $GITHUB_STEP_SUMMARY
          echo "**Ausgelöst von:** ${{ github.actor }}" >> $GITHUB_STEP_SUMMARY
```

> `$GITHUB_STEP_SUMMARY` schreibt in die Job-Zusammenfassung im Actions-Tab —
> sichtbar ohne in die Logs zu klicken.

Und einen Step für den Erfolgsfall:

```yaml
      - name: Zusammenfassung bei Erfolg
        if: success()
        run: |
          echo "## Pipeline erfolgreich!" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "| Check | Status |" >> $GITHUB_STEP_SUMMARY
          echo "|-------|--------|" >> $GITHUB_STEP_SUMMARY
          echo "| Linting | ✅ |" >> $GITHUB_STEP_SUMMARY
          echo "| Tests | ✅ |" >> $GITHUB_STEP_SUMMARY
          echo "| Coverage | ✅ |" >> $GITHUB_STEP_SUMMARY
```

---

## Schritt 3 — Strukturiertes Logging in app.js

Füge eine Logger-Funktion in `app.js`, `app.cjs`, `app.test.js` ein (vgl. Code):

```js
// import, export nicht vergessen
// app.test.js
const { getRandomMessage, validateEmail, formatVersion, messages, log } = require('./app.cjs');

// app.cjs
module.exports = { getRandomMessage, validateEmail, formatVersion, messages, log };
```

```bash
npm test
# Alle Tests sollten weiterhin grün sein
```

---

## Schritt 4 — Dependabot konfigurieren

Erstelle `.github/dependabot.yml` (Inhalt vgl. Code)

```bash
git add .github/dependabot.yml
git commit -m "chore: add Dependabot configuration for automated updates"
git push origin main
```

### Dependabot aktivieren

1. Gehe zu **Repo → Settings → Advanced Security → Dependabot**
2. Aktiviere:
   - **Dependabot alerts** ✅
   - **Dependabot security updates** ✅
   - **Dependabot version updates** ✅ (nach dem Push von dependabot.yml automatisch)

Ab jetzt erstellt Dependabot automatisch PRs wenn Abhängigkeiten veraltet oder unsicher sind.

---

## Schritt 5 — npm audit in die Pipeline integrieren

Ergänze den `lint-and-test`-Job in `ci.yml` um einen Sicherheits-Scan-Step:

```yaml
      - name: Sicherheits-Scan (npm audit)
        run: npm audit --audit-level=high
```

### Lokal testen

```bash
# Aktuelle Schwachstellen prüfen
npm audit

# Bericht als JSON speichern
npm audit --json > audit-report.json

# Behebbare Probleme automatisch fixen
npm audit fix
```

---

## Schritt 6 — CodeQL Security Scanning einrichten

Erstelle `.github/workflows/codeql.yml` (vgl. Code)

```bash
git add .github/workflows/codeql.yml
git commit -m "feat: add CodeQL security scanning workflow"
git push origin main
```

### Ergebnisse ansehen

1. Gehe zu **Security → Code scanning** im Repository
2. CodeQL-Findings werden dort aufgelistet
3. Bei kritischen Findings: Automatische Alerts per E-Mail

---