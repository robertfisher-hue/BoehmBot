# Haushalt PWA - Gemeinsame Haushaltsorganisation

Eine Progressive Web App für die gemeinsame Organisation eures Haushalts mit Echtzeit-Synchronisation über Firebase.

## Features

✅ **Termine & Berlin-Fahrten**: Kalenderansicht mit Berlin-Trips und gemeinsame Terminliste  
✅ **Haushalts-Tracker**: Wiederkehrende Aufgaben mit Tages-Zählern  
✅ **Einkaufsliste**: Automatische Übernahme in Bestandsliste  
✅ **Bestandsliste**: Dauerlauf-Artikel für häufig gekaufte Items  
✅ **Echtzeit-Sync**: Änderungen werden sofort auf beiden Geräten sichtbar  
✅ **Google Login**: Sichere Authentifizierung  
✅ **PWA**: Installierbar auf Handy (Android & iOS)

## Setup-Anleitung

### 1. Firebase-Projekt erstellen

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Klicke auf "Projekt hinzufügen"
3. Projektname: z.B. "haushalt-app" (beliebig)
4. Google Analytics kannst du deaktivieren
5. Klicke auf "Projekt erstellen"

### 2. Web-App in Firebase registrieren

1. In deinem Firebase-Projekt, klicke auf das **Web-Symbol** (`</>`) unter "Fügen Sie Firebase Ihrer App hinzu"
2. App-Nickname: z.B. "Haushalt Web"
3. **WICHTIG**: Haken bei "Firebase Hosting einrichten" **NICHT** setzen
4. Klicke auf "App registrieren"
5. Du siehst jetzt deine Firebase-Config - **diese Werte brauchst du gleich!**

### 3. Firestore Database einrichten

1. Im linken Menü: **Build** → **Firestore Database**
2. Klicke auf "Datenbank erstellen"
3. Wähle **"Im Testmodus starten"** (wichtig!)
4. Wähle einen Standort (z.B. "europe-west3" für Frankfurt)
5. Klicke auf "Aktivieren"

### 4. Firestore Sicherheitsregeln setzen

1. In Firestore Database, gehe zum Tab **"Regeln"**
2. Ersetze den gesamten Inhalt mit:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Nur authentifizierte User dürfen lesen/schreiben
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Klicke auf "Veröffentlichen"

### 5. Passwort festlegen

Das Passwort wird im Code als SHA-256 Hash gespeichert (nicht im Klartext!).

1. Gehe zu einem SHA-256 Generator: https://emn178.github.io/online-tools/sha256.html
2. Gib dein gewünschtes Passwort ein (z.B. "unsereWohnung2024")
3. Kopiere den generierten Hash (eine lange Zeichenkette)
4. Öffne die Datei `app.js`
5. Suche nach Zeile 13 (ca.): `const PASSWORD_HASH = '5e88...`
6. Ersetze den Hash mit deinem kopierten Hash:

```javascript
const PASSWORD_HASH = 'DEIN_GENERIERTER_HASH_HIER';
```

**Wichtig**: Das Standard-Passwort ist "password" - du MUSST das ändern!

### 6. Firebase-Config in die App eintragen

1. Öffne die Datei `firebase-config.js` in einem Texteditor
2. Ersetze die Platzhalter-Werte mit deinen echten Firebase-Daten:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // Deine API Key
  authDomain: "haushalt-xxx.firebaseapp.com",
  projectId: "haushalt-xxx",
  storageBucket: "haushalt-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

**Wo finde ich diese Werte?**
- Firebase Console → Projekteinstellungen (Zahnrad-Symbol) → runterscrollen zu "Deine Apps" → bei deiner Web-App auf "Config" klicken

### 7. GitHub Repository erstellen & hochladen

```bash
# In deinem lokalen Projekt-Ordner:
git init
git add .
git commit -m "Initial commit"

# Auf GitHub: Erstelle ein neues Repository (z.B. "haushalt-pwa")
# Dann:
git remote add origin https://github.com/DEIN-USERNAME/haushalt-pwa.git
git branch -M main
git push -u origin main
```

### 8. GitHub Pages aktivieren

1. Gehe zu deinem GitHub Repository
2. **Settings** → **Pages** (linkes Menü)
3. Source: **Deploy from a branch**
4. Branch: **main** / Ordner: **/ (root)**
5. Klicke auf "Save"
6. Nach 1-2 Minuten ist deine App online unter:
   `https://DEIN-USERNAME.github.io/REPO-NAME/`

### 9. App auf dem Handy installieren

#### Android:
1. Öffne die URL in Chrome
2. Tippe auf die drei Punkte (⋮) → "App installieren" oder "Zum Startbildschirm hinzufügen"

#### iPhone:
1. Öffne die URL in Safari
2. Tippe auf das Teilen-Symbol (□↑)
3. Scrolle runter und tippe "Zum Home-Bildschirm"
4. Tippe auf "Hinzufügen"

## Erste Schritte

1. **Login**: Beide Partner nutzen dasselbe Passwort
2. **Nur eure Daten**: Die Firestore-Regeln erlauben nur Zugriff mit dem Passwort
3. **Synchronisation**: Alle Änderungen werden automatisch synchronisiert

**Passwort ändern**: In `app.js` Zeile 13 den PASSWORD_HASH ändern (siehe Schritt 5 der Setup-Anleitung)

## Projekt-Struktur

```
haushalt-pwa/
├── index.html           # Haupt-HTML mit allen Seiten
├── styles.css           # Styling mit Salmon-Hintergrund
├── app.js              # JavaScript-Logik & Firebase
├── firebase-config.js  # Deine Firebase-Konfiguration
├── manifest.json       # PWA-Manifest
├── icon-192.png        # App-Icon (klein)
├── icon-512.png        # App-Icon (groß)
└── README.md           # Diese Datei
```

## Technologien

- **Vanilla JavaScript** (kein Framework nötig)
- **Passwort-Authentication** (SHA-256 Hash)
- **Cloud Firestore** (Echtzeit-Datenbank)
- **PWA** (installierbar, offline-fähig)
- **Responsive Design** (funktioniert auf allen Geräten)

## Weitere Anpassungen

### Neue Tracker hinzufügen
Benutze den ➕-Button auf der Tracker-Seite

### Dauerlauf-Artikel anpassen
In `app.js` Zeile 9 die `PERMANENT_ITEMS` Liste bearbeiten:
```javascript
const PERMANENT_ITEMS = ['Bananen', 'Hafermilch', ...];
```

### Design anpassen
In `styles.css` die CSS-Variablen ändern:
```css
:root {
    --bg-primary: #FA8072;  /* Hintergrundfarbe */
    --accent: #ff6b6b;      /* Akzentfarbe */
}
```

## Troubleshooting

### "Firebase nicht konfiguriert" Fehler
→ Überprüfe, ob `firebase-config.js` korrekt ausgefüllt ist

### Login funktioniert nicht
→ Stelle sicher, dass du den PASSWORD_HASH in `app.js` Zeile 13 geändert hast
→ Verwende https://emn178.github.io/online-tools/sha256.html um einen neuen Hash zu generieren

### Daten werden nicht synchronisiert
→ Überprüfe die Firestore-Sicherheitsregeln (siehe Schritt 4)

### App lädt nicht auf dem Handy
→ Stelle sicher, dass GitHub Pages aktiviert ist und warte 2-3 Minuten

## Datenschutz & Sicherheit

- ✅ Nur authentifizierte User haben Zugriff
- ✅ Daten werden in deinem privaten Firebase-Projekt gespeichert
- ✅ Keine Drittanbieter-Tracking
- ⚠️ **Wichtig**: Die `firebase-config.js` mit deinen echten Daten **NICHT** öffentlich committen!
  - Erstelle eine `.gitignore` Datei:
    ```
    firebase-config.js
    ```
  - Committe nur die Template-Version
  - Trage die echten Werte lokal ein

## Support

Bei Fragen oder Problemen:
1. Überprüfe die Firebase Console auf Fehler
2. Öffne die Browser-Konsole (F12) für JavaScript-Fehler
3. Stelle sicher, dass alle Setup-Schritte befolgt wurden

---

Viel Spaß mit eurer Haushalts-App! 🏠✨
