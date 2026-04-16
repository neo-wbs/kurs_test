# CI/CD Praxis-Anleitung — Teil 4

> **Ziel:** Tests erstellen. CI-Pipeline ändern, die bei jedem Push neben Linting 
> auch Tests ausführt — und kannst erst in `main` mergen,
> wenn alles grün ist.
>
> **Voraussetzungen:** Teil 3 absolviert

---
## Schritt 1 — Jest einrichten und erste Tests schreiben

```bash
npm install --save-dev jest
```

### app.js für Tests vorbereiten

Die Funktionen in `app.js` müssen exportiert werden, damit Jest sie testen kann.
Hatten wir gemacht im letzten Teil.

### Testdatei erstellen: app.test.js

vgl. Code in `app.test.js`

### npm-Scripts aktualisieren

`package.json` Scripts-Bereich ergänzen:

```json
{
  "scripts": {
    "lint:js": "eslint app.js",
    "lint:html": "htmlhint index.html",
    "lint": "npm run lint:js && npm run lint:html",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "start": "npx http-server . -p 3000 -o"
  }
}
```

Tests lokal ausführen:

```bash
npm test
# Erwartete Ausgabe: 
# Test Suites: 1 passed, 1 total
# Tests:       8 passed, 8 total

npm run test:coverage
# Zeigt Coverage-Tabelle — app.js sollte >70% haben
```

## Schritt 4 — GitHub Actions Workflow ergänzen

```yaml
name: CI Pipeline
...
jobs:
  lint-and-test:
    ...
      - name: 🧪 Tests ausführen
        run: npm test

      - name: 📊 Coverage-Bericht hochladen
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7
```

## Schritt 5 — Alles committen und Pipeline beobachten

```bash
# Alle neuen Dateien hinzufügen
git add .
# Commit erstellen
git commit -m "feat: add CI pipeline with linting and Jest tests"
# Pushen
git push origin main
```

### Pipeline beobachten

1. Gehe zu `github.com/USERNAME/ci_cd_web_test`
2. Klicke auf den Tab **"Actions"**
3. Du siehst den laufenden Workflow "CI Pipeline"
4. Klicke drauf → dann auf "Lint & Test" → siehst jeden Step live
5. Nach ~1-2 Minuten: Grüner Haken

---

## Schritt 6 — Branch Protection einrichten

1. Gehe zu **Settings → Branches**
2. Klicke **"Add branch ruleset"**
3. **Ruleset Name:** `main_rule`
4. Target branches > Include by pattern > `main`
4. Aktiviere: **"Require status checks to pass before merging"**
5. Suche und wähle: `Lint & Test` als Required Check
6. Aktiviere: **"Require a pull request before merging"** *(empfohlen)*
7. Klicke **"Save changes"**

---