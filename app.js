// --- FIREBASE KONFIGURATION (Optional für Live-Chat) ---
// Wenn du die Webseite auf Vercel/GitHub Pages hostest und möchtest, dass alle Gäste live chatten können,
// erstelle ein kostenloses Firebase-Projekt mit einer "Realtime Database" und füge deine Config hier ein:
const FIREBASE_CONFIG = null;
/* Beispiel:
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyA123...",
    authDomain: "fietje-geburtstag.firebaseapp.com",
    databaseURL: "https://fietje-geburtstag-default-rtdb.firebaseio.com",
    projectId: "fietje-geburtstag",
    storageBucket: "fietje-geburtstag.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef..."
};
*/

// --- State-Management ---
const appState = {
    currentSlide: 'home',
    uploadedImages: [], // Hält die base64 Strings der hochgeladenen Bilder
    chatMessages: [],
    isFirebaseActive: false,
    db: null
};

// --- Config & Assets ---
const PLACEHOLDER_ICONS = [
    { icon: 'fa-soccer-ball', label: 'Anstoß' },
    { icon: 'fa-trophy', label: 'Fietje-Cup' },
    { icon: 'fa-cake-candles', label: '15. Geburtstag' },
    { icon: 'fa-shirt', label: 'Trikot #15' },
    { icon: 'fa-ranking-star', label: 'Champion' },
    { icon: 'fa-flag', label: 'Eckfahne' },
    { icon: 'fa-calendar-day', label: 'Ehrentag' },
    { icon: 'fa-hands-clapping', label: 'Applaus' },
    { icon: 'fa-medal', label: 'Goldmedaille' },
    { icon: 'fa-fire', label: 'Torfeuer' },
    { icon: 'fa-people-group', label: 'Mannschaft' },
    { icon: 'fa-whistle', label: 'Schiedsrichter' },
    { icon: 'fa-stopwatch', label: 'Halbzeit' },
    { icon: 'fa-crown', label: 'King Fietje' },
    { icon: 'fa-gift', label: 'Geschenke' },
    { icon: 'fa-beer-mug-empty', label: 'Anstoßen' },
    { icon: 'fa-bullhorn', label: 'Stadionrufe' },
    { icon: 'fa-shoe-prints', label: 'Kick-Schuhe' },
    { icon: 'fa-heart', label: 'Fan-Liebe' },
    { icon: 'fa-sparkles', label: 'Party-Glanz' }
];

const MOCK_CHAT_MESSAGES = [
    { name: 'Oma & Opa', message: 'Alles, alles Liebe zum 15. Geburtstag, lieber Fietje! 🎂 Bleib so sportlich und fröhlich wie du bist. Wir drücken dir die Daumen beim Fietje-Cup!', time: '14:15 Uhr' },
    { name: 'Mama & Papa', message: 'Herzlichen Glückwunsch zum 15. Geburtstag, Fietje! ❤️ Wir sind super stolz auf dich und freuen uns darauf, heute mit dir zu feiern!', time: '14:10 Uhr' },
    { name: 'Kumpel Leon', message: 'Happy Birthday Bro! ⚽ 15 Jahre alt, jetzt gehts ab. Werde heute deinen Highscore im Fietje-Cup zerstören!', time: '14:02 Uhr' }
];

// --- IndexedDB für unbegrenzten Galerie-Upload-Speicher ---
const dbName = "FietjeGalleryDB";
let idb = null;

function initIndexedDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(dbName, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore("images", { keyPath: "id" });
        };
        request.onsuccess = (e) => {
            idb = e.target.result;
            resolve();
        };
        request.onerror = () => {
            console.warn("IndexedDB konnte nicht initialisiert werden, Galerie-Uploads werden nicht persistent gespeichert.");
            resolve();
        };
    });
}

function saveImageToDB(id, base64) {
    if (!idb) return;
    const transaction = idb.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    store.put({ id: id, data: base64 });
}

function getImagesFromDB() {
    return new Promise((resolve) => {
        if (!idb) return resolve([]);
        const transaction = idb.transaction(["images"], "readonly");
        const store = transaction.objectStore("images");
        const request = store.getAll();
        request.onsuccess = (e) => {
            resolve(e.target.result || []);
        };
        request.onerror = () => resolve([]);
    });
}

function clearImagesFromDB() {
    if (!idb) return;
    const transaction = idb.transaction(["images"], "readwrite");
    const store = transaction.objectStore("images");
    store.clear();
}

// --- App-Initialisierung ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Navigation Event Listeners
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const slideId = btn.getAttribute('data-slide');
            switchSlide(slideId);
        });
    });

    // 2. Confetti initialisieren
    initConfetti();
    triggerConfetti();

    // 3. Galerie initialisieren
    await initIndexedDB();
    await loadGallery();

    // 4. Chat initialisieren (Offline- oder Firebase-Modus)
    await initChat();

    // 5. Upload & Reset-Buttons für Galerie
    document.getElementById('gallery-upload').addEventListener('change', handleImageUpload);
    document.getElementById('btn-reset-gallery').addEventListener('click', resetGallery);

    // 6. Lightbox Event Listeners
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    lightboxClose.addEventListener('click', () => lightbox.style.display = 'none');
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.style.display = 'none';
    });

    // iOS Audio Context Unlocker
    const unlockAudio = () => {
        if (window.gameEngine && typeof window.gameEngine.resumeAudio === 'function') {
            window.gameEngine.resumeAudio();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    // Globale API für onclick-Handler
    window.app = {
        switchSlide,
        triggerConfetti,
        submitMessage,
        addEmoji,
        openLightbox
    };
});

// --- Slide Navigation ---
function switchSlide(slideId) {
    const currentActiveSlide = document.querySelector('.slide.active');
    const targetSlide = document.getElementById(`slide-${slideId}`);
    
    if (!targetSlide || currentActiveSlide === targetSlide) return;

    // 1. Nav-Buttons aktualisieren
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-slide') === slideId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Animationen & Sichtbarkeit der Slides steuern
    currentActiveSlide.style.opacity = 0;
    currentActiveSlide.style.transform = 'translateY(15px)';
    
    setTimeout(() => {
        currentActiveSlide.classList.remove('active');
        targetSlide.classList.add('active');
        
        // Triggert Reflow für CSS-Übergang
        targetSlide.offsetHeight;
        
        targetSlide.style.opacity = 1;
        targetSlide.style.transform = 'translateY(0)';
        appState.currentSlide = slideId;

        // Spiel anhalten oder starten, je nachdem, ob das Spiel-Slide aktiv ist
        if (slideId === 'games' || slideId.startsWith('cup-')) {
            window.gameEngine.resumeGames();
        } else {
            window.gameEngine.pauseGames();
        }
    }, 300);
}

// --- Galerie Logik ---
async function loadGallery() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    
    // Gespeicherte Bilder aus IndexedDB laden
    const savedImages = await getImagesFromDB();
    appState.uploadedImages = [];
    
    // Sortiere Bilder nach ID, um die Reihenfolge beizubehalten
    savedImages.sort((a, b) => a.id - b.id).forEach(img => {
        appState.uploadedImages[img.id] = img.data;
    });

    const resetBtn = document.getElementById('btn-reset-gallery');
    if (appState.uploadedImages.length > 0) {
        resetBtn.style.display = 'inline-flex';
    } else {
        resetBtn.style.display = 'none';
    }

    // 20 Items rendern
    for (let i = 0; i < 20; i++) {
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        
        if (appState.uploadedImages[i]) {
            // Falls ein hochgeladenes Bild existiert
            const img = document.createElement('img');
            img.src = appState.uploadedImages[i];
            img.alt = `Fietje Moment ${i + 1}`;
            item.appendChild(img);
            item.onclick = () => openLightbox(appState.uploadedImages[i], `Moment ${i + 1}`);
        } else {
            // Sonst Platzhalter rendern
            const placeholder = PLACEHOLDER_ICONS[i % PLACEHOLDER_ICONS.length];
            item.innerHTML = `
                <div class="placeholder-img">
                    <i class="fa-solid ${placeholder.icon}"></i>
                    <span>${placeholder.label}</span>
                </div>
            `;
            item.onclick = () => {
                // Beim Klick auf einen Platzhalter den File-Uploader auslösen
                document.getElementById('gallery-upload').click();
            };
        }
        container.appendChild(item);
    }
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    let loadedCount = 0;
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            // Finde die nächste freie Platzhalter-Stelle
            let nextIndex = 0;
            while (nextIndex < 20 && appState.uploadedImages[nextIndex]) {
                nextIndex++;
            }
            
            if (nextIndex < 20) {
                appState.uploadedImages[nextIndex] = event.target.result;
                saveImageToDB(nextIndex, event.target.result);
            }
            
            loadedCount++;
            if (loadedCount === files.length || nextIndex >= 19) {
                await loadGallery();
                triggerConfetti();
            }
        };
        reader.readAsDataURL(file);
    });
}

async function resetGallery() {
    if (confirm("Möchtest du alle hochgeladenen Bilder löschen und die Platzhalter wiederherstellen?")) {
        appState.uploadedImages = [];
        clearImagesFromDB();
        await loadGallery();
    }
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    
    lightboxImg.src = src;
    lightboxCap.textContent = caption;
    lightbox.style.display = 'flex';
}

function loadExternalScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) return resolve();

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function ensureFirebaseLoaded() {
    if (!FIREBASE_CONFIG) return false;
    if (window.firebase?.initializeApp && window.firebase?.database) return true;

    await loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
    await loadExternalScript('https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js');
    return !!(window.firebase?.initializeApp && window.firebase?.database);
}

// --- Chat Logik ---
async function initChat() {
    const statusBadge = document.getElementById('chat-mode-indicator');
    const statusText = document.getElementById('chat-mode-text');

    if (FIREBASE_CONFIG) {
        try {
            const firebaseReady = await ensureFirebaseLoaded();
            if (!firebaseReady) throw new Error('Firebase SDK nicht verfuegbar');

            // Firebase initialisieren
            window.firebase.initializeApp(FIREBASE_CONFIG);
            appState.db = window.firebase.database();
            appState.isFirebaseActive = true;
            
            statusBadge.className = 'chat-status-badge live';
            statusText.textContent = 'Live-Modus (Firebase)';

            // Realtime-Listener für Chat-Nachrichten
            appState.db.ref('fietje_cup_chat').limitToLast(50).on('value', (snapshot) => {
                const data = snapshot.val();
                appState.chatMessages = [];
                if (data) {
                    Object.keys(data).forEach(key => {
                        appState.chatMessages.push(data[key]);
                    });
                }
                renderChatMessages();
            });
        } catch (error) {
            console.error("Firebase konnte nicht geladen werden, Fallback auf LocalStorage:", error);
            setupOfflineChat();
        }
    } else {
        setupOfflineChat();
    }
}

function setupOfflineChat() {
    appState.isFirebaseActive = false;
    
    // Aus LocalStorage laden, falls vorhanden, andernfalls Mock-Daten nutzen
    const savedMessages = localStorage.getItem('fietje_chat_msgs');
    if (savedMessages) {
        appState.chatMessages = JSON.parse(savedMessages);
    } else {
        appState.chatMessages = [...MOCK_CHAT_MESSAGES];
        localStorage.setItem('fietje_chat_msgs', JSON.stringify(appState.chatMessages));
    }
    
    renderChatMessages();
}

function renderChatMessages() {
    const container = document.getElementById('chat-messages-container');
    container.innerHTML = '';

    appState.chatMessages.forEach((msg, index) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-msg');
        
        // Zufälliges Icon-Design basierend auf Name
        let avatarClass = '';
        let avatarLetter = msg.name.substring(0, 1).toUpperCase();
        if (index % 3 === 0) avatarClass = 'soccer';
        else if (index % 3 === 1) avatarClass = 'birthday';

        msgDiv.innerHTML = `
            <div class="avatar ${avatarClass}">${avatarLetter}</div>
            <div class="msg-body">
                <div class="msg-header">
                    <span class="msg-sender">${escapeHtml(msg.name)}</span>
                    <span class="msg-time">${msg.time}</span>
                </div>
                <div class="msg-text-card">
                    ${escapeHtml(msg.message)}
                </div>
            </div>
        `;
        container.appendChild(msgDiv);
    });

    // Zum Ende scrollen
    container.scrollTop = container.scrollHeight;
}

function submitMessage() {
    const nameInput = document.getElementById('chat-username');
    const msgInput = document.getElementById('chat-message');
    
    const name = nameInput.value.trim();
    const message = msgInput.value.trim();

    if (!name || !message) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';

    const newMessage = {
        name: name,
        message: message,
        time: timeString,
        timestamp: Date.now()
    };

    if (appState.isFirebaseActive && appState.db) {
        // Zu Firebase senden
        appState.db.ref('fietje_cup_chat').push(newMessage);
    } else {
        // Im LocalStorage speichern
        appState.chatMessages.push(newMessage);
        localStorage.setItem('fietje_chat_msgs', JSON.stringify(appState.chatMessages));
        renderChatMessages();
    }

    // Formular leeren
    msgInput.value = '';
    
    // Konfetti auslösen, falls es eine Geburtstags-Gratulation ist
    if (message.toLowerCase().includes('glückwunsch') || message.toLowerCase().includes('geburtstag') || message.includes('🎉') || message.includes('🎂')) {
        triggerConfetti();
    }
}

function addEmoji(emoji) {
    const msgInput = document.getElementById('chat-message');
    msgInput.value += emoji;
    msgInput.focus();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


// --- Konfetti Engine ---
let confettiCtx = null;
let confettiCanvas = null;
let confettiParticles = [];
let isConfettiActive = false;
let confettiTimeout = null;

function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas');
    confettiCtx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -confettiCanvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = this.getRandomColor();
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 3 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }

    getRandomColor() {
        // Union Berlin & FC Bayern Farben (Rot, Weiß, sowie Gold/Gelb als Highlight)
        const colors = [
            '#d21f3c', // Rot
            '#ffffff', // Weiß
            '#fcd34d', // Gold/Gelb
            '#f43f5e', // Helles Rot
            '#e2e8f0'  // Graues Weiß
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Wind-Effekt
        this.speedX += Math.sin(this.y * 0.01) * 0.05;
    }

    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = this.color;
        
        // Zeichne mal Rechtecke, mal Kreise
        if (this.size % 2 === 0) {
            confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        }
        
        confettiCtx.restore();
    }
}

function triggerConfetti() {
    if (confettiTimeout) clearTimeout(confettiTimeout);
    
    // Füge Partikel hinzu
    for (let i = 0; i < 150; i++) {
        confettiParticles.push(new ConfettiParticle());
    }

    if (!isConfettiActive) {
        isConfettiActive = true;
        animateConfetti();
    }

    // Stoppe die Erstellung nach 4 Sekunden, lass bestehende Partikel ausfliegen
    confettiTimeout = setTimeout(() => {
        // Die Animation läuft weiter, bis das Partikel-Array leer ist
    }, 4000);
}

function animateConfetti() {
    if (!isConfettiActive) return;

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.update();
        p.draw();

        // Partikel entfernen, wenn sie den Bildschirm verlassen
        if (p.y > confettiCanvas.height) {
            confettiParticles.splice(i, 1);
        }
    }

    if (confettiParticles.length > 0) {
        requestAnimationFrame(animateConfetti);
    } else {
        isConfettiActive = false;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}
