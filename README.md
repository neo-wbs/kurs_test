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

## Schritt 7 — Fehlschlagende Pipeline absichtlich testen

Testen, ob Pipeline wirklich schützt:

```bash
# Neuen Branch erstellen
git checkout -b test/broken-code
# Füge in `app.js` einen absichtlichen Syntaxfehler ein
git add .
git commit -m "test: intentionally broken code"
git push origin test/broken-code
# Pipeline ESLint schlägt fehl

# Die letzte Änderung rückgängig machen
git revert HEAD
git push origin test/broken-code
# PR aktualisiert sich → Pipeline wird wieder grün
```

## Schritt 8 — Deploy-Job hinzufügen (GitHub Pages)

Erweitere `.github/workflows/ci.yml` um einen Deploy-Job:

```yaml
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: lint-and-test          # Nur wenn CI grün!
    if: github.ref == 'refs/heads/main'   # Nur auf main-Branch

    permissions:
      contents: write

    steps:
      - name: Code auschecken
        uses: actions/checkout@v4

      - name: Auf GitHub Pages deployen
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          exclude_assets: '.github,node_modules,*.test.js,*.md,package*.json,.eslintrc.json,.htmlhintrc'
```

GitHub Pages aktivieren:
1. **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main` → Save (gh-pages)

Alles committen und pushen

```bash
# Alle neuen Dateien hinzufügen
git add .
# Commit erstellen
git commit -m "feat: add deployment"
# Pushen
git push origin main
```

Nach dem nächsten Push: Deine Seite ist live unter  
`https://USERNAME.github.io/dein_repo`

---

## Zusammenfassung: Was die Pipeline jetzt macht

```
Push/PR auf main
      │
      ▼
Job: lint-and-test
  ✓ Checkout Code
  ✓ Node.js 20 setup
  ✓ npm ci
  ✓ ESLint (JavaScript)
  ✓ HTMLHint (HTML)
  ✓ Jest Tests
  ✓ Coverage-Report speichern
      │ (nur wenn grün + nur auf main)
      ▼
Job: deploy
  ✓ Deploy zu GitHub Pages
      │
      ▼
   Live unter github.io/...
```