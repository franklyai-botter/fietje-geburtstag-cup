// --- FIREBASE KONFIGURATION (Live-Chat aktiv) ---
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAOwaplk2dxOZ8bQtGL_TEmOpPAG6lZwb8",
    authDomain: "fietje-15-geburtstag.firebaseapp.com",
    databaseURL: "https://fietje-15-geburtstag-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fietje-15-geburtstag",
    storageBucket: "fietje-15-geburtstag.firebasestorage.app",
    messagingSenderId: "114751638734",
    appId: "1:114751638734:web:29effa92abfe4d2840149f",
    measurementId: "G-V0KY589FML"
};

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

// Demo-Beiträge entfernt – der Chat startet leer und zeigt nur echte Nachrichten (Firebase-Live-Modus).
const MOCK_CHAT_MESSAGES = [];

// --- Galerie: feste Bilder (mitdeployt) + Upload-Slots, Obergrenze 50 ---
const MAX_GALLERY = 50;
const PRESET_IMAGES = ["images/foto-01.jpg","images/foto-02.jpg","images/foto-03.jpg","images/foto-04.jpg","images/foto-05.jpg","images/foto-06.jpg","images/foto-07.jpg","images/foto-08.jpg","images/foto-09.jpg","images/foto-10.jpg","images/foto-11.jpg","images/foto-12.jpg","images/foto-13.jpg","images/foto-14.jpg","images/foto-15.jpg","images/foto-16.jpg","images/foto-17.jpg","images/foto-18.jpg","images/foto-19.jpg","images/foto-20.jpg","images/foto-21.jpg","images/foto-22.jpg","images/foto-23.jpg","images/foto-24.jpg","images/foto-25.jpg","images/foto-26.jpg","images/foto-27.jpg","images/foto-28.jpg","images/foto-29.jpg","images/foto-30.jpg","images/foto-31.jpg","images/foto-32.jpg","images/foto-33.jpg","images/foto-34.jpg","images/foto-35.jpg","images/foto-36.jpg","images/foto-37.jpg","images/foto-38.jpg","images/foto-39.jpg","images/foto-40.jpg","images/foto-41.jpg","images/foto-42.jpg","images/foto-43.jpg"];

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
    
    // Hochgeladene Bilder aus IndexedDB laden (als dichte Liste, nach ID sortiert)
    const savedImages = await getImagesFromDB();
    appState.uploadedImages = savedImages.sort((a, b) => a.id - b.id).map(img => img.data);

    const resetBtn = document.getElementById('btn-reset-gallery');
    resetBtn.style.display = appState.uploadedImages.length > 0 ? 'inline-flex' : 'none';

    // Anzeige: feste Bilder + hochgeladene Bilder, keine leeren Platzhalter (max MAX_GALLERY)
    const tiles = [];
    PRESET_IMAGES.forEach(src => tiles.push({ type: 'img', src }));
    appState.uploadedImages.forEach(src => tiles.push({ type: 'img', src }));
    tiles.length = Math.min(tiles.length, MAX_GALLERY);

    tiles.forEach((tile, i) => {
        const item = document.createElement('div');
        item.classList.add('gallery-item');

        if (tile.type === 'img') {
            const img = document.createElement('img');
            img.src = tile.src;
            img.alt = `Fietje Moment ${i + 1}`;
            img.loading = 'lazy';
            item.appendChild(img);
            item.onclick = () => openLightbox(tile.src, `Moment ${i + 1}`);
        } else {
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
    });
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const maxUploads = Math.max(0, MAX_GALLERY - PRESET_IMAGES.length);
    let processed = 0;

    files.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            // Nur so viele Uploads zulassen, bis MAX_GALLERY erreicht ist
            if (appState.uploadedImages.length < maxUploads) {
                const id = Date.now() + idx;
                appState.uploadedImages.push(event.target.result);
                saveImageToDB(id, event.target.result);
            }

            processed++;
            if (processed === files.length) {
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
            
            if (statusBadge && statusText) {
                statusBadge.className = 'chat-status-badge live';
                statusText.textContent = 'Live-Modus (Firebase)';
            }

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
