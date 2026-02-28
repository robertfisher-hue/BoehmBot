// Global state
let isAuthenticated = false;
let db = null;
let unsubscribers = [];

// Icons for trackers
const TRACKER_ICONS = ['🌱', '🗑️', '🛏️', '♻️', '🍵', '🧹', '🧺', '🚿', '🪴', '🧼', '🔧', '💡'];

// Permanent items (Dauerlauf-Artikel)
const PERMANENT_ITEMS = ['Bananen', 'Hafermilch', 'Kaffee', 'Gefrierobst', 'Haferflocken', 'Eier', 'Tofu'];

// Passwort-Hash (SHA-256)
const PASSWORD_HASH = '59598f97ddde04a2f0c1b6f5271d19510b2dd94ecf94421c4b2fef2e279ae896';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is configured
    if (typeof firebaseConfig === 'undefined') {
        console.error('Firebase config not found. Please create firebase-config.js');
        document.getElementById('loading-screen').innerHTML = `
            <div style="text-align: center; color: white; padding: 40px;">
                <h2>Firebase nicht konfiguriert</h2>
                <p style="margin-top: 16px;">Bitte die README-Anleitung befolgen.</p>
            </div>
        `;
        return;
    }

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();

    // Check if already logged in
    const savedAuth = localStorage.getItem('haushalts_auth');
    if (savedAuth === 'true') {
        isAuthenticated = true;
        showMainApp();
    } else {
        showLoginScreen();
    }

    setupEventListeners();
});

// Show/Hide screens
function showLoginScreen() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('main-app').classList.remove('active');
}

function showMainApp() {
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-app').classList.add('active');
    
    // Load all data
    loadBerlinTrips();
    loadAppointments();
    loadTrackers();
    loadShoppingList();
    loadInventory();
}

// Simple SHA-256 hash function
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Setup event listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Wirklich abmelden?')) {
            unsubscribers.forEach(unsub => unsub());
            unsubscribers = [];
            localStorage.removeItem('haushalts_auth');
            isAuthenticated = false;
            window.location.reload();
        }
    });

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            switchPage(page);
        });
    });

    // Berlin trips
    document.getElementById('add-berlin-trip-btn').addEventListener('click', addBerlinTrip);

    // Appointments
    document.getElementById('all-day-checkbox').addEventListener('change', (e) => {
        document.getElementById('appointment-time').disabled = e.target.checked;
    });
    document.getElementById('add-appointment-btn').addEventListener('click', addAppointment);

    // Trackers
    document.getElementById('add-tracker-btn').addEventListener('click', () => {
        showModal('add-tracker-modal');
        renderIconSelector();
    });
    document.getElementById('cancel-tracker-btn').addEventListener('click', () => {
        hideModal('add-tracker-modal');
    });
    document.getElementById('save-tracker-btn').addEventListener('click', saveNewTracker);

    // Shopping list
    document.getElementById('add-shopping-item-btn').addEventListener('click', addShoppingItem);
    document.getElementById('shopping-item-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addShoppingItem();
    });

    // Inventory
    document.getElementById('add-inventory-btn').addEventListener('click', () => {
        showModal('add-inventory-modal');
    });
    document.getElementById('cancel-inventory-btn').addEventListener('click', () => {
        hideModal('add-inventory-modal');
    });
    document.getElementById('save-inventory-btn').addEventListener('click', saveNewInventoryItem);
}

// Handle login
async function handleLogin() {
    const password = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('login-error');
    
    if (!password) {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = 'Bitte Passwort eingeben';
        return;
    }

    const hash = await hashPassword(password);
    
    if (hash === PASSWORD_HASH) {
        localStorage.setItem('haushalts_auth', 'true');
        isAuthenticated = true;
        errorMsg.classList.add('hidden');
        showMainApp();
    } else {
        errorMsg.classList.remove('hidden');
        errorMsg.textContent = 'Falsches Passwort';
        document.getElementById('password-input').value = '';
    }
}

// Navigation
function switchPage(pageName) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(`${pageName}-page`).classList.add('active');
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ==================== BERLIN TRIPS ====================

function loadBerlinTrips() {
    const unsub = db.collection('berlin-trips')
        .where('departureDate', '>=', new Date().toISOString().split('T')[0])
        .orderBy('departureDate')
        .onSnapshot(snapshot => {
            renderBerlinCalendar(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    unsubscribers.push(unsub);
}

function addBerlinTrip() {
    const departureDate = document.getElementById('berlin-departure-date').value;
    const departureTime = document.getElementById('berlin-departure-time').value;
    const returnDate = document.getElementById('berlin-return-date').value;
    const returnTime = document.getElementById('berlin-return-time').value;

    if (!departureDate || !returnDate) {
        alert('Bitte Datum ausfüllen');
        return;
    }

    if (new Date(returnDate) < new Date(departureDate)) {
        alert('Rückfahrt muss nach Hinfahrt sein');
        return;
    }

    db.collection('berlin-trips').add({
        departureDate,
        departureTime,
        returnDate,
        returnTime,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('berlin-departure-date').value = '';
        document.getElementById('berlin-return-date').value = '';
    });
}

function deleteBerlinTrip(tripId) {
    if (confirm('Berlin-Trip löschen?')) {
        db.collection('berlin-trips').doc(tripId).delete();
    }
}

function renderBerlinCalendar(trips) {
    const calendar = document.getElementById('berlin-trips-calendar');
    calendar.innerHTML = '';

    // Generate 4 weeks calendar view
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday

    // Day names
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    dayNames.forEach(name => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-name';
        dayElement.textContent = name;
        calendar.appendChild(dayElement);
    });

    // Generate 4 weeks (28 days)
    for (let i = 0; i < 28; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const isInBerlin = trips.some(trip => 
            dateString >= trip.departureDate && dateString <= trip.returnDate
        );

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day calendar-day-number';
        if (isInBerlin) dayElement.classList.add('in-berlin');
        dayElement.textContent = date.getDate();
        calendar.appendChild(dayElement);
    }

    // List trips below calendar
    trips.forEach(trip => {
        const tripElement = document.createElement('div');
        tripElement.className = 'berlin-trip-item';
        tripElement.innerHTML = `
            <div class="berlin-trip-info">
                <div class="berlin-trip-dates">
                    ${formatDate(trip.departureDate)} - ${formatDate(trip.returnDate)}
                </div>
                <div class="berlin-trip-times">
                    ${trip.departureTime} → ${trip.returnTime}
                </div>
            </div>
            <button class="delete-trip-btn" onclick="deleteBerlinTrip('${trip.id}')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        calendar.appendChild(tripElement);
    });
}

// ==================== APPOINTMENTS ====================

function loadAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const unsub = db.collection('appointments')
        .where('date', '>=', today)
        .orderBy('date')
        .orderBy('time')
        .onSnapshot(snapshot => {
            renderAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    unsubscribers.push(unsub);
}

function addAppointment() {
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const subject = document.getElementById('appointment-subject').value;
    const allDay = document.getElementById('all-day-checkbox').checked;

    if (!date || !subject) {
        alert('Bitte Datum und Betreff ausfüllen');
        return;
    }

    if (!allDay && !time) {
        alert('Bitte Uhrzeit ausfüllen oder "Ganztägig" wählen');
        return;
    }

    db.collection('appointments').add({
        date,
        time: allDay ? null : time,
        subject,
        allDay,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        document.getElementById('appointment-date').value = '';
        document.getElementById('appointment-time').value = '';
        document.getElementById('appointment-subject').value = '';
        document.getElementById('all-day-checkbox').checked = false;
        document.getElementById('appointment-time').disabled = false;
    });
}

function deleteAppointment(appointmentId) {
    if (confirm('Termin löschen?')) {
        db.collection('appointments').doc(appointmentId).delete();
    }
}

function renderAppointments(appointments) {
    const list = document.getElementById('appointments-list');
    
    if (appointments.length === 0) {
        list.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Keine anstehenden Termine</p>';
        return;
    }

    list.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-subject">${apt.subject}</div>
                <div class="appointment-datetime">
                    ${formatDate(apt.date)}${apt.allDay ? ' (ganztägig)' : ` um ${apt.time}`}
                </div>
            </div>
            <button class="delete-appointment-btn" onclick="deleteAppointment('${apt.id}')">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// ==================== TRACKERS ====================

function loadTrackers() {
    const unsub = db.collection('trackers')
        .orderBy('createdAt')
        .onSnapshot(snapshot => {
            const trackers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Add default trackers if none exist
            if (trackers.length === 0 && snapshot.metadata.fromCache === false) {
                initializeDefaultTrackers();
            } else {
                renderTrackers(trackers);
            }
        });
    unsubscribers.push(unsub);
}

function initializeDefaultTrackers() {
    const defaults = [
        { name: 'Blumen gießen', icon: '🌱', goalDays: 7 },
        { name: 'Biomüll rausbringen', icon: '🗑️', goalDays: 5 },
        { name: 'Bettwäsche wechseln', icon: '🛏️', goalDays: 14 },
        { name: 'Pfand wegbringen', icon: '♻️', goalDays: 7 },
        { name: 'Kombucha ansetzen', icon: '🍵', goalDays: 10 }
    ];

    defaults.forEach(tracker => {
        db.collection('trackers').add({
            ...tracker,
            lastReset: new Date().toISOString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    });
}

function renderIconSelector() {
    const selector = document.getElementById('icon-selector');
    selector.innerHTML = TRACKER_ICONS.map(icon => `
        <div class="icon-option" onclick="selectIcon(this, '${icon}')">${icon}</div>
    `).join('');
}

function selectIcon(element, icon) {
    document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    element.dataset.selected = icon;
}

function saveNewTracker() {
    const name = document.getElementById('new-tracker-name').value;
    const goalDays = parseInt(document.getElementById('new-tracker-goal').value);
    const selectedIcon = document.querySelector('.icon-option.selected');

    if (!name || !goalDays || !selectedIcon) {
        alert('Bitte alle Felder ausfüllen und Icon wählen');
        return;
    }

    db.collection('trackers').add({
        name,
        icon: selectedIcon.dataset.selected,
        goalDays,
        lastReset: new Date().toISOString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        hideModal('add-tracker-modal');
        document.getElementById('new-tracker-name').value = '';
        document.getElementById('new-tracker-goal').value = '';
    });
}

function resetTracker(trackerId) {
    db.collection('trackers').doc(trackerId).update({
        lastReset: new Date().toISOString()
    });
}

function renderTrackers(trackers) {
    const list = document.getElementById('trackers-list');
    const now = new Date();

    list.innerHTML = trackers.map(tracker => {
        const lastReset = new Date(tracker.lastReset);
        const daysSince = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
        const isOverdue = daysSince >= tracker.goalDays;

        return `
            <div class="tracker-item ${isOverdue ? 'overdue' : ''}">
                <div class="tracker-icon">${tracker.icon}</div>
                <div class="tracker-info">
                    <div class="tracker-name">${tracker.name}</div>
                    <div class="tracker-days">
                        Vor ${daysSince} Tag${daysSince !== 1 ? 'en' : ''} 
                        ${isOverdue ? '(überfällig!)' : ''}
                    </div>
                </div>
                <button class="tracker-reset-btn" onclick="resetTracker('${tracker.id}')">
                    Erledigt
                </button>
            </div>
        `;
    }).join('');
}

// ==================== SHOPPING LIST ====================

function loadShoppingList() {
    const unsub = db.collection('shopping-list')
        .orderBy('createdAt')
        .onSnapshot(snapshot => {
            renderShoppingList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    unsubscribers.push(unsub);
}

function addShoppingItem() {
    const input = document.getElementById('shopping-item-input');
    const item = input.value.trim();

    if (!item) return;

    db.collection('shopping-list').add({
        name: item,
        checked: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        input.value = '';
    });
}

function toggleShoppingItem(itemId, currentState, itemName) {
    if (!currentState) {
        // Moving to inventory
        db.collection('shopping-list').doc(itemId).delete();
        
        // Add to inventory
        const isPermanent = PERMANENT_ITEMS.includes(itemName);
        db.collection('inventory').add({
            name: itemName,
            isPermanent,
            checked: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // If permanent, add back to shopping list
        if (isPermanent) {
            setTimeout(() => {
                db.collection('shopping-list').add({
                    name: itemName,
                    checked: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }, 500);
        }
    }
}

function renderShoppingList(items) {
    const list = document.getElementById('shopping-list');
    
    if (items.length === 0) {
        list.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Einkaufsliste ist leer</p>';
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="checklist-item ${item.checked ? 'checked' : ''}">
            <input type="checkbox" 
                   id="shopping-${item.id}" 
                   ${item.checked ? 'checked' : ''}
                   onchange="toggleShoppingItem('${item.id}', ${item.checked}, '${item.name.replace(/'/g, "\\'")}')">
            <label for="shopping-${item.id}">${item.name}</label>
            ${PERMANENT_ITEMS.includes(item.name) ? '<span class="permanent-badge">⭐ Dauerlauf</span>' : ''}
        </div>
    `).join('');
}

// ==================== INVENTORY ====================

function loadInventory() {
    const unsub = db.collection('inventory')
        .orderBy('createdAt')
        .onSnapshot(snapshot => {
            renderInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    unsubscribers.push(unsub);
}

function saveNewInventoryItem() {
    const input = document.getElementById('new-inventory-item');
    const isPermanent = document.getElementById('permanent-item-checkbox').checked;
    const item = input.value.trim();

    if (!item) {
        alert('Bitte Artikel eingeben');
        return;
    }

    db.collection('inventory').add({
        name: item,
        isPermanent,
        checked: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        hideModal('add-inventory-modal');
        input.value = '';
        document.getElementById('permanent-item-checkbox').checked = false;
    });
}

function toggleInventoryItem(itemId, currentState, itemName, isPermanent) {
    if (!currentState) {
        // Item is being checked (used up)
        db.collection('inventory').doc(itemId).delete();

        // If permanent, add back to shopping list
        if (isPermanent) {
            db.collection('shopping-list').add({
                name: itemName,
                checked: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }
}

function renderInventory(items) {
    const list = document.getElementById('inventory-list');
    
    if (items.length === 0) {
        list.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">Bestand ist leer</p>';
        return;
    }

    list.innerHTML = items.map(item => `
        <div class="checklist-item ${item.checked ? 'checked' : ''}">
            <input type="checkbox" 
                   id="inventory-${item.id}" 
                   ${item.checked ? 'checked' : ''}
                   onchange="toggleInventoryItem('${item.id}', ${item.checked}, '${item.name.replace(/'/g, "\\'")}', ${item.isPermanent})">
            <label for="inventory-${item.id}">${item.name}</label>
            ${item.isPermanent ? '<span class="permanent-badge">⭐ Dauerlauf</span>' : ''}
        </div>
    `).join('');
}

// ==================== UTILITY FUNCTIONS ====================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
}

// Make functions globally accessible
window.deleteBerlinTrip = deleteBerlinTrip;
window.deleteAppointment = deleteAppointment;
window.resetTracker = resetTracker;
window.toggleShoppingItem = toggleShoppingItem;
window.toggleInventoryItem = toggleInventoryItem;
window.selectIcon = selectIcon;
