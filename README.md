# CI/CD Praxis-Anleitung — Teil 2

> **Ziel:** Git initialisieren, mit GitHub verbinden und einen
> vollständigen Git-Workflow einrichten
>
> **Voraussetzungen:** GitHub-Account ✓ | VS Code ✓ | Projektstruktur ✓

---
## Schritt 1 — GitHub Repository erstellen

1. Gehe zu **github.com** und logge dich ein
2. Klicke auf **"New repository"** (grüner Button oder `+` oben rechts)
3. Einstellungen:
   - **Repository name:** `dein_repo`
   - **Visibility:** Public *(für kostenlose GitHub Actions)*
   - **Initialize with README:** optional anhaken
   - **.gitignore:** `Node` auswählen
4. Klicke **"Create repository"**

## Schritt 2 — Git installieren & konfigurieren

Öffne ein Terminal (VS Code: `Strg + ö` oder `Terminal > New Terminal`), auf Gitbash umschalten:

```bash
git --version # Prüfen ob Git bereits installiert ist
cd pfad/zu/deinem/lokalen/ordner

# Variante 1 Github Repository ist nicht leer
git clone https://github.com/dein_name/dein_repo.git

# Variante 2 Github Repository ist leer
git init -b main
git remote add origin https://github.com/dein_name/dein_repo.git
git remote -v # Schauen ob es mit remote-Repo verbunden ist
git status # Überprüfe

git config user.name "Dein Name" 
git config user.email "Dein_Name@email.com"
git config --list (Abbruch mit q)

touch .gitignore # Datei anlegen, falls .gitignore nicht von GitHub generiert (Inhalt vgl. lokale .gitignore)
```

## Schritt 3 — Mit Branches arbeiten (GitHub Flow)

```bash
# Neuen Feature-Branch erstellen
git checkout -b feature/add-footer

# Prüfen auf welchem Branch du bist
git branch
# * feature/add-footer
#   main
```

Füge einen Footer zu `index.html` und `style.css` hinzu (vgl. Code):

```bash
# Änderungen committen
git add .
git commit -m "feat: add footer"
# Feature-Branch zu GitHub pushen
git push origin feature/add-footer
```

---
## Schritt 4 — Pull Request erstellen

1. Gehe zu **github.com/USERNAME/dein_repo**
2. Du siehst einen Banner: **"feature/add-footer had recent pushes"**
3. Klicke **"Compare & pull request"**
4. Fülle das PR-Formular aus:
   - **Titel:** `feat: add footer with deployment info`
   - **Beschreibung:**
     ```
     ## Was wurde gemacht?
     Footer zur Startseite hinzugefügt.

     ## Warum?
     Zeigt Deployment-Informationen an.

     ## Wie testen?
     index.html im Browser öffnen - Footer sollte sichtbar sein.
     ```
5. Klicke **"Create pull request"**

---

## Schritt 4 — Pull Request mergen

1. Klicke auf **"Merge pull request"**
2. Klicke **"Confirm merge"**
3. Klicke **"Delete branch"** (aufräumen)

Lokal synchronisieren:

```bash
# Zurück auf main wechseln
git checkout main

# Neueste Änderungen herunterladen (inkl. des Merges)
git pull origin main

# Lokalen Feature-Branch löschen
git branch -d feature/add-footer

# Kontrolle
git status
```