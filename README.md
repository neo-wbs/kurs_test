# CI/CD Praxis-Anleitung — Teil 3

> **Ziel:** CI-Pipeline ein, die bei jedem Push automatisch Linting 
> und Tests ausführt — und kannst erst in `main` mergen,
> wenn alles grün ist.
>
> **Voraussetzungen:** Node.js installiert | Teil 2 absolviert

---

## Schritt 1 — Node.js prüfen & Projekt initialisieren

```bash
node --version   # mind. v18
npm --version    # mind. v9
```

Falls nicht installiert: https://nodejs.org (LTS-Version wählen)

```bash
# In dein Projektverzeichnis wechseln
cd dein/ordner

# package.json anlegen (falls noch nicht vorhanden, -y überspringt alle Fragen)
npm init -y
# package.json anpassen (vgl. Code), danach:
npm install
```

---

## Schritt 2 — Linting-Tools installieren

```bash
# ESLint für JavaScript
npm install --save-dev eslint

# HTMLHint für HTML
npm install --save-dev htmlhint

# ESLint initialisieren
npx eslint --init
```

Bei `npx eslint --init` folgende Antworten wählen:
- What do you want to lint? → **Javascript**
- How would you like to use ESLint? → **To check syntax and find problems**
- What type of modules? → **CommonJS**
- Which framework? → **None of these**
- Does your project use TypeScript? → **No**
- Where does your code run? → **Browser**
- Package Manager? → **npm**

### Er legt .eslintrc.json oder eslint.config.mjs an

.eslintrc.json so anpassen:

```json
{
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}
```

eslint.config.mjs so anpassen:

```js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
]);
```

### .htmlhintrc anlegen

Neue Datei `.htmlhintrc` im Projektroot:

```json
{
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "doctype-first": true,
  "tag-pair": true,
  "id-unique": true,
  "src-not-empty": true,
  "title-require": true
}
```

### npm-Scripts aktualisieren

`package.json` Scripts-Bereich ersetzen:

```json
{
  "scripts": {
    "lint:js": "eslint app.js",
    "lint:html": "htmlhint index.html",
    "lint": "npm run lint:js && npm run lint:html",
    "start": "npx http-server . -p 3000 -o"
  }
}
```

Linting testen:

```bash
npm run lint
# Erwartete Ausgabe: Fehler
# error  'validateEmail' is defined but never used  no-unused-vars
# error  'formatVersion' is defined but never used  no-unused-vars

# Korrektur: Genannte Funktionen verwenden für Modul export, sonst nicht testbar
// Für Tests exportieren (Node.js-Umgebung)
if (typeof module !== 'undefined') {
    module.exports = { getRandomMessage, validateEmail, formatVersion, messages };
}

# Erwartete Ausgabe: Scanned 1 files, no errors found
```

## Schritt 3 — GitHub Actions Workflow anlegen

Erstelle folgende Verzeichnisstruktur:

```bash
mkdir -p .github/workflows
```

Neue Datei: `.github/workflows/ci.yml` (Evtl. GitHub Actions for VS Code Extension installieren)

```yaml
name: CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Code auschecken
        uses: actions/checkout@v4

      - name: 🟢 Node.js einrichten
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Abhängigkeiten installieren
        run: npm ci

      - name: 🔍 JavaScript Linting (ESLint)
        run: npm run lint:js

      - name: 🔍 HTML Linting (HTMLHint)
        run: npm run lint:html

```

> **Hinweis `npm ci` vs `npm install`:** `npm ci` ist für CI-Umgebungen optimiert.
> Es installiert exakt die Versionen aus `package-lock.json` und ist schneller
> und deterministisch. Immer `npm ci` in Pipelines verwenden!

---

## Schritt 4 — Alles committen und Pipeline beobachten

```bash
# Alle neuen Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "feat: add CI pipeline with linting and Jest tests"

# Pushen
git push origin main
```

### Pipeline beobachten

1. Gehe zu `github.com/USERNAME/dein_repo`
2. Klicke auf den Tab **"Actions"**
3. Du siehst den laufenden Workflow "CI Pipeline"
4. Klicke drauf → dann auf "Lint & Test" → siehst jeden Step live
5. Nach ~1-2 Minuten: Grüner Haken
---