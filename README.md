# CI/CD Praxis-Anleitung — Teil 8

> **Ziel:** Du verwendest Secrets und ergänzt Permissions.
>
> **Voraussetzungen:** Teil 7 absolviert

---

## Schritt 1 — Secrets sicher verwalten

### Repository-Secret anlegen (Beispiel: API-Key)

1. Gehe zu **Settings → Secrets and variables → Actions**
2. Klicke **"New repository secret"**
3. Name: `MY_API_KEY` (nur Großbuchstaben, Zahlen, Unterstriche)
4. Value: Der geheime Wert
5. **"Add secret"** klicken

### Secret im Workflow verwenden

```yaml
      - name: API aufrufen (Beispiel)
        env:
          API_KEY: ${{ secrets.MY_API_KEY }}
        run: |
          # Secret ist als Umgebungsvariable verfügbar
          # GitHub maskiert den Wert automatisch in Logs
          echo "Key ist gesetzt: ${{ secrets.MY_API_KEY != '' }}"
```

### Geheimen Wert aus .env NIEMALS committen

```bash
# .env mit echten Werten anlegen (lokal, nie committen)
echo "MY_API_KEY=test" > .env

# Prüfen ob .env in .gitignore steht
grep ".env" .gitignore
# Ausgabe: .env  ← muss vorhanden sein!

# Prüfen ob versehentlich Secrets gestaged wurden
git diff --cached
```

### Secret Scanning testen (absichtlich + kontrolliert)

GitHub Secret Scanning erkennt viele gängige Secret-Formate automatisch.
Um Push Protection zu testen, kannst du einen Dummy-Key verwenden:

```bash
# ACHTUNG: Nur zu Testzwecken — echte Keys niemals einchecken!
# GitHub erkennt z.B. GitHub Personal Access Tokens (ghp_...) sofort
# und blockiert den Push BEVOR er auf GitHub landet
```

---

## Schritt 2 — Workflow-Permissions absichern

Ergänze die `ci.yml` um explizite Permissions:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ main ]

# Globale Permissions: so wenig wie möglich
permissions:
  contents: read

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest
    # Keine extra Permissions nötig — contents: read reicht
    steps:
      # ... wie bisher ...

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-test
    # Keine extra Permissions nötig
    steps:
      # ... wie bisher ...

  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    # Nur dieser Job braucht Schreib-Rechte
    permissions:
      contents: write
      pages: write
      id-token: write
    steps:
      # ... wie bisher ...

  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: build
    if: startsWith(github.ref, 'refs/tags/v')
    permissions:
      contents: write    # Für Release erstellen
    steps:
      # ... wie bisher ...
```

---

## Schritt 3 — SECURITY.md anlegen

Eine `SECURITY.md` teilt anderen mit, wie sie Sicherheitslücken melden sollen. Im Projektroot anlegen (vgl. Code)

```bash
git add .
git commit -m "docs: add security policy"
git push origin main
```

---

## Finale Zusammenfassung: Was die Pipeline jetzt alles macht

```
Push / PR
    │
    ▼
┌──────────────────────────────────────────────
│  lint-and-test                               
│  ✓ ESLint (JavaScript)                      
│  ✓ HTMLHint (HTML)                          
│  ✓ Jest Tests mit Coverage                  
│  ✓ npm audit (Sicherheits-Scan)             
│  ✓ Job-Zusammenfassung (Success/Failure)    
└──────────────────────────────────────────────
    │
    ▼
┌──────────────────────────────────────────────
│  build                                       
│  ✓ Vite Produktion-Build                    
│  ✓ dist/ als Artefakt gespeichert           
└──────────────────────────────────────────────
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
┌────────────────────   ┌───────────────────────
│  deploy (main/tag)    │  release (nur tags)   
│  ✓ GitHub Pages       │  ✓ ZIP-Artefakt      
└────────────────────   │  ✓ GitHub Release     
                        └───────────────────────

Parallel (wöchentlich):
┌─────────────────────────────────────────
│  CodeQL Analyse                              
│  ✓ JavaScript Security Scan                 
│  ✓ Ergebnisse in Security-Tab               
└────────────────────────────────────────

Automatisch (Dependabot):
✓ PRs bei veralteten npm-Paketen
✓ PRs bei unsicheren Abhängigkeiten
✓ PRs für veraltete GitHub Actions
```

---