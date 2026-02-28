# 🚀 Schnell-Setup Checkliste

## Vor dem ersten Commit

✅ **1. Firebase-Projekt erstellen**
   - Gehe zu https://console.firebase.google.com/
   - Neues Projekt anlegen

✅ **2. Web-App registrieren**
   - Web-Symbol (`</>`) klicken
   - Firebase Config kopieren

✅ **3. Firestore aktivieren**
   - Build → Firestore Database
   - Im Testmodus starten
   - Regeln setzen (siehe README)

✅ **4. Passwort festlegen**
   - SHA-256 Generator: https://emn178.github.io/online-tools/sha256.html
   - Hash in `app.js` Zeile 13 eintragen

✅ **5. Config eintragen**
   - `firebase-config.js` mit echten Daten ausfüllen
   - **NICHT committen!** (steht in .gitignore)

## Für GitHub

✅ **6. Repository erstellen**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

✅ **7. GitHub Pages aktivieren**
   - Settings → Pages
   - Branch: main, Ordner: / (root)

## Fertig! 🎉

Deine App ist jetzt online unter:
`https://USERNAME.github.io/REPO-NAME/`

---

## ⚠️ Wichtig!

- `firebase-config.js` mit echten Daten lokal behalten
- Nur `firebase-config.template.js` wird auf GitHub gepusht
- Nach jedem `git pull` musst du `firebase-config.js` neu erstellen

## 📱 Auf dem Handy installieren

**Android (Chrome):**
Menu (⋮) → "App installieren"

**iPhone (Safari):**
Teilen (□↑) → "Zum Home-Bildschirm"
