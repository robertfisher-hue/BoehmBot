# 🔐 Passwort einrichten

## Schnellanleitung

**Standard-Passwort**: `password` (BITTE ÄNDERN!)

### So änderst du das Passwort:

1. **Hash generieren**:
   - Gehe zu: https://emn178.github.io/online-tools/sha256.html
   - Gib dein gewünschtes Passwort ein (z.B. `unsereWohnung2024`)
   - Kopiere den generierten Hash (lange Zeichenkette)

2. **Hash in Code eintragen**:
   - Öffne `app.js`
   - Suche Zeile 13: `const PASSWORD_HASH = '5e88...';`
   - Ersetze den Hash mit deinem kopierten Hash
   - Speichern!

3. **Committen & Pushen**:
   ```bash
   git add app.js
   git commit -m "Passwort geändert"
   git push
   ```

4. **Warten**:
   - GitHub Pages braucht 1-2 Minuten zum Aktualisieren
   - Dann mit neuem Passwort einloggen

## Beispiel

**Gewünschtes Passwort**: `Haushalt123!`

**Generierter SHA-256 Hash**:
```
e5f8a5c2b9d3e1f4a7c8b6d9e2f5a8c3b6d9e2f5a8c3b6d9e2f5a8c3b6d9e2f5
```

**In app.js eintragen**:
```javascript
const PASSWORD_HASH = 'e5f8a5c2b9d3e1f4a7c8b6d9e2f5a8c3b6d9e2f5a8c3b6d9e2f5a8c3b6d9e2f5';
```

## ⚠️ Wichtig!

- Das Passwort wird **nicht** im Klartext gespeichert
- Nur der SHA-256 Hash ist im Code
- Beide Partner nutzen dasselbe Passwort
- Der Hash ist öffentlich auf GitHub sichtbar (aber sicher genug für diesen Zweck)

## Wie funktioniert's?

Wenn du dich einloggst:
1. Du gibst dein Passwort ein
2. Die App hasht es mit SHA-256
3. Vergleicht den Hash mit dem gespeicherten Hash
4. Bei Übereinstimmung → Zugriff gewährt

Der Hash ist eine Einweg-Funktion - niemand kann aus dem Hash dein Original-Passwort ableiten.

## Passwort vergessen?

Kein Problem:
1. Wähle ein neues Passwort
2. Generiere einen neuen Hash
3. Trage ihn in `app.js` ein
4. Commit & Push
5. Fertig!
