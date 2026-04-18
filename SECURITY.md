# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ |
| < 1.0   | ❌ |

## Reporting a Vulnerability

Sicherheitslücken bitte **nicht** als öffentliches GitHub Issue melden.

Stattdessen:
1. Gehe zu **Security → Report a vulnerability** in diesem Repository
2. Oder sende eine E-Mail an: [irgendwen@email.de]

Ich antworte innerhalb von 48 Stunden und koordiniere die Behebung
und Offenlegung gemeinsam mit dir.

## Security Measures

Dieses Projekt nutzt:
- GitHub Dependabot für automatische Abhängigkeits-Updates
- CodeQL für statische Code-Analyse
- GitHub Secret Scanning für versehentlich eingecheckte Secrets
- npm audit in der CI-Pipeline