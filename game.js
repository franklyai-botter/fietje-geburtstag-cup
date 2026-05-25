// --- Web Audio API Synthesizer für Soundeffekte ---
const SoundEffects = {
    audioCtx: null,

    init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    resumeAudio() {
        this.init();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    },

    playKick() {
        this.resumeAudio();
        if (!this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, this.audioCtx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.12);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
    },

    playWhistle() {
        this.resumeAudio();
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600, this.audioCtx.currentTime);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1605, this.audioCtx.currentTime); // Schwebung
        
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.08);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.22);
        
        osc.start();
        osc2.start();
        osc.stop(this.audioCtx.currentTime + 0.22);
        osc2.stop(this.audioCtx.currentTime + 0.22);
    },

    playGoal() {
        this.resumeAudio();
        if (!this.audioCtx) return;

        // Stadionjubel (Weißes Rauschen)
        const bufferSize = this.audioCtx.sampleRate * 1.5;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 850;
        filter.Q.value = 0.8;

        const gain = this.audioCtx.createGain();

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 0.15);
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.4);

        noise.start();
        noise.stop(this.audioCtx.currentTime + 1.4);

        // FC Bayern / Union Fanfarenton
        const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
        notes.forEach((freq, idx) => {
            const osc = this.audioCtx.createOscillator();
            const oscGain = this.audioCtx.createGain();
            osc.connect(oscGain);
            oscGain.connect(this.audioCtx.destination);
            
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.12);
            oscGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
            oscGain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.12 + 0.02);
            oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.12 + 0.18);
            
            osc.start(this.audioCtx.currentTime + idx * 0.12);
            osc.stop(this.audioCtx.currentTime + idx * 0.12 + 0.18);
        });
    },

    playSave() {
        this.resumeAudio();
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, this.audioCtx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.35);
    },

    playStar() {
        this.resumeAudio();
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, this.audioCtx.currentTime + 0.15); // D6
        
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    },

    playRedCard() {
        this.resumeAudio();
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, this.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
    }
};

// --- Spiel-Engine ---
window.gameEngine = {
    activeGame: 'penalty',
    gamesPaused: true,
    gameTypes: ['penalty', 'keepup', 'tennis', 'hockey'],
    gameLabels: {
        penalty: 'Union-Elfmeter',
        keepup: 'Bayern-Header',
        tennis: 'Tennis',
        hockey: 'Eishockey'
    },

    // --- GAME 1: Union Berlin - Eisern-Elfmeter ---
    penalty: {
        canvas: null,
        ctx: null,
        score: 0,
        shots: 0,
        goals: 0,
        highscore: 0,
        gameState: 'menu', // 'menu', 'playing', 'shooting', 'goal', 'saved', 'gameover'
        ball: { x: 300, y: 350, r: 16, targetX: 300, targetY: 350, speed: 12, size: 16 },
        keeper: { x: 300, y: 130, w: 50, h: 70, speed: 3.8, dir: 1, jumpX: 0, state: 'idle' },
        net: { x: 120, y: 70, w: 360, h: 140 },
        grassParticles: [],
        animationId: null
    },

    // --- GAME 2: Bayern München - Mia-San-Header ---
    keepup: {
        canvas: null,
        ctx: null,
        score: 0,
        lives: 3,
        highscore: 0,
        gameState: 'menu', // 'menu', 'playing', 'gameover'
        playerX: 300,
        playerY: 340,
        playerR: 35,
        targetPlayerX: 300,
        items: [], // Array für fallende Fußbälle, Sterne, Trophäen, rote Karten
        itemSpawnTimer: 0,
        scoreParticles: [],
        animationId: null
    },

    tennis: {
        canvas: null,
        ctx: null,
        score: 0,
        lives: 3,
        highscore: 0,
        gameState: 'menu',
        paddleX: 300,
        targetPaddleX: 300,
        paddleY: 345,
        paddleW: 92,
        items: [],
        itemSpawnTimer: 0,
        particles: [],
        animationId: null
    },

    hockey: {
        canvas: null,
        ctx: null,
        score: 0,
        lives: 3,
        highscore: 0,
        gameState: 'menu',
        goalieX: 300,
        targetGoalieX: 300,
        goalieY: 330,
        goalieW: 92,
        shots: [],
        shotSpawnTimer: 0,
        particles: [],
        animationId: null
    },

    // --- Allgemeine Steuerung ---
    init() {
        this.penalty.highscore = parseInt(localStorage.getItem('fietje_penalty_highscore') || '0');
        this.keepup.highscore = parseInt(localStorage.getItem('fietje_keepup_highscore') || '0');
        this.tennis.highscore = parseInt(localStorage.getItem('fietje_tennis_highscore') || '0');
        this.hockey.highscore = parseInt(localStorage.getItem('fietje_hockey_highscore') || '0');

        document.getElementById('penalty-highscore').textContent = this.penalty.highscore;
        document.getElementById('keepup-highscore').textContent = this.keepup.highscore;
        document.getElementById('tennis-highscore').textContent = this.tennis.highscore;
        document.getElementById('hockey-highscore').textContent = this.hockey.highscore;

        this.penalty.canvas = document.getElementById('penalty-canvas');
        this.penalty.ctx = this.penalty.canvas.getContext('2d');
        this.setupPenaltyListeners();

        this.keepup.canvas = document.getElementById('keepup-canvas');
        this.keepup.ctx = this.keepup.canvas.getContext('2d');
        this.setupKeepUpListeners();

        this.tennis.canvas = document.getElementById('tennis-canvas');
        this.tennis.ctx = this.tennis.canvas.getContext('2d');
        this.setupTennisListeners();

        this.hockey.canvas = document.getElementById('hockey-canvas');
        this.hockey.ctx = this.hockey.canvas.getContext('2d');
        this.setupHockeyListeners();

        this.drawPenaltyMenu();
        this.drawKeepUpMenu();
        this.drawTennisMenu();
        this.drawHockeyMenu();
        this.renderLeaderboard();
    },

    switchGame(gameType) {
        if (!this.gameTypes.includes(gameType)) return;

        cancelAnimationFrame(this.penalty.animationId);
        cancelAnimationFrame(this.keepup.animationId);
        cancelAnimationFrame(this.tennis.animationId);
        cancelAnimationFrame(this.hockey.animationId);
        this.activeGame = gameType;

        const gamesSlideActive = document.getElementById('slide-games')?.classList.contains('active');
        this.gameTypes.forEach(type => {
            document.getElementById(`tab-${type}`)?.classList.toggle('active', type === gameType);
            document.getElementById(`game-${type}-container`)?.classList.toggle('active', type === gameType);
        });

        this.syncOverlayForGame(gameType);
        if (gameType === 'penalty' && this.penalty.gameState === 'menu') this.drawPenaltyMenu();
        if (gameType === 'keepup' && this.keepup.gameState === 'menu') this.drawKeepUpMenu();
        if (gameType === 'tennis' && this.tennis.gameState === 'menu') this.drawTennisMenu();
        if (gameType === 'hockey' && this.hockey.gameState === 'menu') this.drawHockeyMenu();

        this.gamesPaused = !gamesSlideActive;
        if (gamesSlideActive) {
            this.resumeGames();
        }
    },

    syncOverlayForGame(gameType) {
        const state = this[gameType]?.gameState;
        const overlay = document.getElementById(`${gameType}-overlay`);
        const title = document.getElementById(`${gameType}-overlay-title`);
        const desc = document.getElementById(`${gameType}-overlay-desc`);
        const copy = {
            penalty: ['Eisern-Elfmeter', 'Schiesse Tore fuer Union Berlin! Klicke im richtigen Moment auf das Tor, um den Ball am Torwart vorbeizuzirkeln.'],
            keepup: ['Mia-San-Header', 'Allianz Kopfball-Arena! Fange Fussbaelle, Sterne und die Meisterschale auf. Weiche roten Karten aus!'],
            tennis: ['Matchball', 'Halte die Tennis-Rally am Laufen! Triff die Baelle mit deinem Schlaeger und sammle Bonussterne.'],
            hockey: ['Eis-Goalie', 'Beschuetze das Tor! Fange Pucks, sammle Pokale und weiche Strafzeiten aus.']
        };

        if (!overlay || !title || !desc) return;

        if (state === 'menu') {
            overlay.style.display = 'flex';
            title.textContent = copy[gameType][0];
            desc.textContent = copy[gameType][1];
        } else if (state === 'playing' || state === 'shooting' || state === 'goal' || state === 'saved') {
            overlay.style.display = 'none';
        }
    },

    pauseGames() {
        this.gamesPaused = true;
        cancelAnimationFrame(this.penalty.animationId);
        cancelAnimationFrame(this.keepup.animationId);
        cancelAnimationFrame(this.tennis.animationId);
        cancelAnimationFrame(this.hockey.animationId);
    },

    resumeGames() {
        cancelAnimationFrame(this.penalty.animationId);
        cancelAnimationFrame(this.keepup.animationId);
        cancelAnimationFrame(this.tennis.animationId);
        cancelAnimationFrame(this.hockey.animationId);
        this.gamesPaused = false;
        if (this.activeGame === 'penalty' && !['menu', 'gameover'].includes(this.penalty.gameState)) {
            this.loopPenalty();
        } else if (this.activeGame === 'keepup' && this.keepup.gameState === 'playing') {
            this.loopKeepUp();
        } else if (this.activeGame === 'tennis' && this.tennis.gameState === 'playing') {
            this.loopTennis();
        } else if (this.activeGame === 'hockey' && this.hockey.gameState === 'playing') {
            this.loopHockey();
        }
    },

    resumeAudio() {
        SoundEffects.resumeAudio();
    },

    getLeaderboard() {
        try {
            return JSON.parse(localStorage.getItem('fietje_friend_leaderboard') || '[]');
        } catch {
            return [];
        }
    },

    saveScoreToLeaderboard(gameType, score) {
        if (!score || score <= 0) {
            this.renderLeaderboard();
            return;
        }

        const rawName = prompt(`Starker Lauf! Name fuer die Top 10 eintragen (${score} Punkte):`, '');
        const name = (rawName || '').trim().slice(0, 24);
        if (!name) {
            this.renderLeaderboard();
            return;
        }

        const entry = {
            name,
            score,
            game: this.gameLabels[gameType] || gameType,
            timestamp: Date.now()
        };
        const leaderboard = this.getLeaderboard()
            .concat(entry)
            .sort((a, b) => b.score - a.score || a.timestamp - b.timestamp)
            .slice(0, 10);

        localStorage.setItem('fietje_friend_leaderboard', JSON.stringify(leaderboard));
        this.renderLeaderboard();
    },

    renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        const leaderboard = this.getLeaderboard();
        if (!leaderboard.length) {
            list.innerHTML = '<li>Noch keine Eintraege. Starte ein Spiel und trag dich ein!</li>';
            return;
        }

        list.innerHTML = leaderboard.map((entry, index) => `
            <li>
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${this.escapeLeaderboardText(entry.name)}</span>
                <span class="leaderboard-game">${this.escapeLeaderboardText(entry.game)}</span>
                <span class="leaderboard-score">${entry.score}</span>
            </li>
        `).join('');
    },

    escapeLeaderboardText(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char]));
    },

    // --- GAME 1: EISERN-ELFMETER (UNION BERLIN) ---
    setupPenaltyListeners() {
        const getMousePos = (e) => {
            const rect = this.penalty.canvas.getBoundingClientRect();
            const scaleX = this.penalty.canvas.width / rect.width;
            const scaleY = this.penalty.canvas.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const handleAction = (x, y) => {
            if (this.penalty.gameState !== 'playing') return;

            const net = this.penalty.net;
            if (x >= net.x && x <= net.x + net.w && y >= net.y && y <= net.y + net.h) {
                // Schuss triggern
                SoundEffects.playKick();
                this.penalty.gameState = 'shooting';
                this.penalty.ball.targetX = x;
                this.penalty.ball.targetY = y;
                this.penalty.shots++;

                // Rasenstücke fliegen lassen
                this.spawnGrassParticles();

                this.calculateKeeperJump(x);
            }
        };

        this.penalty.canvas.addEventListener('mousedown', (e) => {
            const pos = getMousePos(e);
            handleAction(pos.x, pos.y);
        });

        this.penalty.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const pos = getMousePos(touch);
            handleAction(pos.x, pos.y);
        });
    },

    startPenaltyGame() {
        SoundEffects.playWhistle();
        document.getElementById('penalty-overlay').style.display = 'none';
        cancelAnimationFrame(this.penalty.animationId);
        this.penalty.score = 0;
        this.penalty.shots = 0;
        this.penalty.goals = 0;
        this.penalty.gameState = 'playing';
        this.resetPenaltyBall();

        document.getElementById('penalty-score').textContent = '0';
        document.getElementById('penalty-goals').textContent = '0/5';

        this.gamesPaused = false;
        this.loopPenalty();
    },

    resetPenaltyBall() {
        this.penalty.ball.x = 300;
        this.penalty.ball.y = 350;
        this.penalty.ball.size = 16;
        this.penalty.keeper.state = 'idle';
        this.penalty.keeper.x = 300;
        this.penalty.keeper.speed = 3.8 + (this.penalty.goals * 0.7);
    },

    calculateKeeperJump(targetX) {
        this.penalty.keeper.state = 'jumping';
        const error = (Math.random() - 0.5) * 70;
        this.penalty.keeper.jumpX = targetX + error;
        
        const minX = this.penalty.net.x + 35;
        const maxX = this.penalty.net.x + this.penalty.net.w - 35;
        this.penalty.keeper.jumpX = Math.max(minX, Math.min(maxX, this.penalty.keeper.jumpX));
    },

    spawnGrassParticles() {
        this.penalty.grassParticles = [];
        for (let i = 0; i < 15; i++) {
            this.penalty.grassParticles.push({
                x: 300,
                y: 350,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 5 - 2,
                size: Math.random() * 4 + 2,
                color: '#22c55e',
                life: 1.0
            });
        }
    },

    loopPenalty() {
        if (this.gamesPaused || this.penalty.gameState === 'menu') return;

        this.updatePenalty();
        this.drawPenalty();

        this.penalty.animationId = requestAnimationFrame(() => this.loopPenalty());
    },

    updatePenalty() {
        // Torwart-Bewegung
        const keeper = this.penalty.keeper;
        const net = this.penalty.net;

        if (this.penalty.gameState === 'playing') {
            keeper.x += keeper.speed * keeper.dir;
            const leftLimit = net.x + 40;
            const rightLimit = net.x + net.w - 40;
            if (keeper.x < leftLimit) {
                keeper.x = leftLimit;
                keeper.dir = 1;
            } else if (keeper.x > rightLimit) {
                keeper.x = rightLimit;
                keeper.dir = -1;
            }
        } else if (keeper.state === 'jumping') {
            const dx = keeper.jumpX - keeper.x;
            keeper.x += dx * 0.16;
        }

        // Ball-Bewegung
        if (this.penalty.gameState === 'shooting') {
            const ball = this.penalty.ball;
            const dx = ball.targetX - ball.x;
            const dy = ball.targetY - ball.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            ball.size = 16 - (350 - ball.y) * 0.025;
            if (ball.size < 7) ball.size = 7;

            if (dist > 5) {
                ball.x += (dx / dist) * ball.speed;
                ball.y += (dy / dist) * ball.speed;
            } else {
                this.checkPenaltyResult();
            }
        }

        // Graspartikel updaten
        this.penalty.grassParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // Schwerkraft
            p.life -= 0.03;
        });
        this.penalty.grassParticles = this.penalty.grassParticles.filter(p => p.life > 0);
    },

    checkPenaltyResult() {
        const ball = this.penalty.ball;
        const keeper = this.penalty.keeper;

        // Keeper Hitbox
        const kLeft = keeper.x - 38;
        const kRight = keeper.x + 38;
        const kTop = keeper.y - 12;
        const kBottom = keeper.y + 60;

        const isSaved = ball.x >= kLeft && ball.x <= kRight && ball.y >= kTop && ball.y <= kBottom;

        if (isSaved) {
            this.penalty.gameState = 'saved';
            SoundEffects.playSave();
            setTimeout(() => this.nextPenaltyTurn(), 1200);
        } else {
            this.penalty.gameState = 'goal';
            this.penalty.goals++;
            this.penalty.score += Math.round(120 + (120 - Math.abs(300 - ball.x)));
            SoundEffects.playGoal();

            if (window.app) window.app.triggerConfetti();

            document.getElementById('penalty-score').textContent = this.penalty.score;
            document.getElementById('penalty-goals').textContent = `${this.penalty.goals}/${this.penalty.shots}`;

            setTimeout(() => this.nextPenaltyTurn(), 1200);
        }
    },

    nextPenaltyTurn() {
        if (this.penalty.shots >= 5) {
            this.penalty.gameState = 'gameover';

            if (this.penalty.score > this.penalty.highscore) {
                this.penalty.highscore = this.penalty.score;
                localStorage.setItem('fietje_penalty_highscore', this.penalty.highscore);
                document.getElementById('penalty-highscore').textContent = this.penalty.highscore;
            }
            this.saveScoreToLeaderboard('penalty', this.penalty.score);

            const overlay = document.getElementById('penalty-overlay');
            const title = document.getElementById('penalty-overlay-title');
            const desc = document.getElementById('penalty-overlay-desc');

            overlay.style.display = 'flex';
            title.textContent = "Spiel Beendet!";
            desc.innerHTML = `Du hast <strong>${this.penalty.goals} von 5 Toren</strong> für Union erzielt!<br>Gesamtpunktzahl: <strong>${this.penalty.score}</strong>`;
        } else {
            this.penalty.gameState = 'playing';
            document.getElementById('penalty-goals').textContent = `${this.penalty.goals}/${this.penalty.shots}`;
            this.resetPenaltyBall();
        }
    },

    drawPenalty() {
        const ctx = this.penalty.ctx;
        const canvas = this.penalty.canvas;
        const net = this.penalty.net;
        const keeper = this.penalty.keeper;
        const ball = this.penalty.ball;

        // 1. Hintergrund: Alte Försterei (Ziegelsteinmauer & Wald-Silhouette)
        ctx.fillStyle = '#0a2310'; // Dunkles Rasengrün oben
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Himmel
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, 80);

        // Wald-Silhouette
        ctx.fillStyle = '#06170c';
        ctx.beginPath();
        for (let i = 0; i <= canvas.width; i += 20) {
            const h = 50 + Math.sin(i * 0.05) * 12 + Math.cos(i * 0.1) * 5;
            if (i === 0) ctx.moveTo(i, 80 - h);
            else ctx.lineTo(i, 80 - h);
        }
        ctx.lineTo(canvas.width, 80);
        ctx.lineTo(0, 80);
        ctx.fill();

        // Ziegelmauer (Tribüne)
        ctx.fillStyle = '#450a0a'; // Backsteinrot
        ctx.fillRect(0, 80, canvas.width, 50);
        // Fugen
        ctx.strokeStyle = '#2d0606';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, 80);
            ctx.lineTo(x, 130);
            ctx.stroke();
        }
        for (let y = 80; y <= 130; y += 10) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Rasenfläche mit Streifen
        for (let i = 130; i < canvas.height; i += 30) {
            ctx.fillStyle = ((i - 130) / 30) % 2 === 0 ? '#1b4d22' : '#225d2c';
            ctx.fillRect(0, i, canvas.width, 30);
        }

        // Linien
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 205);
        ctx.lineTo(canvas.width, 205);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(300, 350, 4, 0, Math.PI*2);
        ctx.fill();

        // 2. Das Tor (Netz)
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(net.x, net.y, net.w, net.h);

        // Netzstruktur
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        for (let x = net.x; x <= net.x + net.w; x += 12) {
            ctx.beginPath();
            ctx.moveTo(x, net.y);
            ctx.lineTo(x, net.y + net.h);
            ctx.stroke();
        }
        for (let y = net.y; y <= net.y + net.h; y += 12) {
            ctx.beginPath();
            ctx.moveTo(net.x, y);
            ctx.lineTo(net.x + net.w, y);
            ctx.stroke();
        }

        // Rote Querstange am Torrahmen (Branding)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(net.x, net.y + net.h);
        ctx.lineTo(net.x, net.y);
        ctx.lineTo(net.x + net.w, net.y);
        ctx.lineTo(net.x + net.w, net.y + net.h);
        ctx.stroke();

        // Rote Netzaufhängung (Verschönert im Union-Stil)
        ctx.strokeStyle = '#d21f3c';
        ctx.lineWidth = 2;
        ctx.strokeRect(net.x - 3, net.y - 3, net.w + 6, net.h + 3);

        // Graspartikeln zeichnen
        this.penalty.grassParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        ctx.globalAlpha = 1.0;

        // 3. Torwart Schatten
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        const shadowScale = keeper.state === 'jumping' ? 0.65 : 1.0;
        ctx.beginPath();
        ctx.ellipse(keeper.x, 205, 22 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. Torwart zeichnen (Union-Trikot: Rot-Weiß)
        ctx.save();
        ctx.translate(keeper.x, keeper.y + 30);
        
        if (keeper.state === 'jumping') {
            const diveDirection = keeper.jumpX - keeper.x;
            let angle = diveDirection * 0.005;
            angle = Math.max(-0.6, Math.min(0.6, angle));
            ctx.rotate(angle);
        }

        // Körper (Rot)
        ctx.fillStyle = '#d21f3c';
        ctx.fillRect(-15, -20, 30, 35);
        // Trikotstreifen (Weiß)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -20, 5, 35);
        ctx.fillRect(5, -20, 5, 35);

        // Hose (Weiß)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-15, 15, 30, 15);
        
        // Stutzen (Rot)
        ctx.fillStyle = '#d21f3c';
        ctx.fillRect(-10, 30, 6, 15);
        ctx.fillRect(4, 30, 6, 15);
        ctx.fillStyle = '#111111'; // Schuhe
        ctx.fillRect(-11, 45, 8, 4);
        ctx.fillRect(3, 45, 8, 4);

        // Arme & Handschuhe
        ctx.strokeStyle = '#d21f3c';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        if (keeper.state === 'jumping') {
            ctx.beginPath();
            ctx.moveTo(-15, -10);
            ctx.lineTo(-30, -32);
            ctx.moveTo(15, -10);
            ctx.lineTo(30, -32);
            ctx.stroke();

            ctx.fillStyle = '#ffffff'; // Weiße Handschuhe
            ctx.strokeStyle = '#d21f3c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-30, -32, 7, 0, Math.PI*2);
            ctx.arc(30, -32, 7, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(-15, -10);
            ctx.lineTo(-26, 8);
            ctx.moveTo(15, -10);
            ctx.lineTo(26, 8);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d21f3c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-26, 8, 7, 0, Math.PI*2);
            ctx.arc(26, 8, 7, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }

        // Kopf & Mütze
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -30, 10, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#1e293b'; // Cappy
        ctx.fillRect(-7, -40, 14, 4);
        ctx.beginPath();
        ctx.moveTo(0, -39);
        ctx.lineTo(10, -36);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // 5. Ball
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 4;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#d21f3c'; // Rote Ballmuster (Union-Style!)
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size * 0.35, 0, Math.PI*2);
        ctx.fill();

        ctx.strokeStyle = '#d21f3c';
        ctx.lineWidth = 1.8;
        const angles = [0, 72, 144, 216, 288];
        angles.forEach(angle => {
            const rad = (angle * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(ball.x + Math.cos(rad) * (ball.size * 0.35), ball.y + Math.sin(rad) * (ball.size * 0.35));
            ctx.lineTo(ball.x + Math.cos(rad) * ball.size, ball.y + Math.sin(rad) * ball.size);
            ctx.stroke();
        });
        ctx.restore();

        // 6. Treffer-Feedback
        if (this.penalty.gameState === 'goal') {
            ctx.fillStyle = '#22c55e';
            ctx.font = '900 48px Kanit';
            ctx.textAlign = 'center';
            ctx.fillText('EISERN UNION!', 300, 210);
        } else if (this.penalty.gameState === 'saved') {
            ctx.fillStyle = '#d21f3c';
            ctx.font = '900 36px Kanit';
            ctx.textAlign = 'center';
            ctx.fillText('GEHALTEN!', 300, 210);
        }
    },

    drawPenaltyMenu() {
        const ctx = this.penalty.ctx;
        ctx.fillStyle = '#0f3c0f';
        ctx.fillRect(0, 0, this.penalty.canvas.width, this.penalty.canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('EISERN-ELFMETER', 300, 180);
        
        ctx.font = '400 14px Outfit';
        ctx.fillStyle = '#a0a0b0';
        ctx.fillText('Klicke auf den Button oben, um für Union anzutreten.', 300, 220);
    },

    // --- GAME 2: MIA-SAN-HEADER (BAYERN MÜNCHEN) ---
    setupKeepUpListeners() {
        const getPointerX = (e) => {
            const rect = this.keepup.canvas.getBoundingClientRect();
            const scaleX = this.keepup.canvas.width / rect.width;
            return (e.clientX - rect.left) * scaleX;
        };

        const updateTarget = (x) => {
            this.keepup.targetPlayerX = Math.max(this.keepup.playerR, Math.min(this.keepup.canvas.width - this.keepup.playerR, x));
        };

        const updateFromPointer = (e) => {
            if (this.activeGame !== 'keepup') return;
            const x = getPointerX(e);
            updateTarget(x);
        };

        this.keepup.canvas.addEventListener('mousemove', updateFromPointer);
        this.keepup.canvas.addEventListener('pointermove', updateFromPointer);
        window.addEventListener('mousemove', updateFromPointer);

        this.keepup.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const x = getPointerX(touch);
            updateTarget(x);
        });

        this.keepup.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const x = getPointerX(touch);
            updateTarget(x);
            
            // Audio-Trigger für iOS
            this.resumeAudio();
        });
    },

    startKeepUpGame() {
        SoundEffects.playWhistle();
        document.getElementById('keepup-overlay').style.display = 'none';
        cancelAnimationFrame(this.keepup.animationId);

        this.keepup.score = 0;
        this.keepup.lives = 3;
        this.keepup.gameState = 'playing';
        this.keepup.items = [];
        this.keepup.scoreParticles = [];
        this.keepup.playerX = 300;
        this.keepup.targetPlayerX = 300;
        this.keepup.itemSpawnTimer = 0;

        document.getElementById('keepup-score').textContent = '0';
        document.getElementById('keepup-lives').textContent = '3';

        this.gamesPaused = false;
        this.loopKeepUp();
    },

    spawnFallingItem() {
        const r = Math.random();
        let type = 'ball';
        let speed = 2.0 + Math.random() * 1.5 + (this.keepup.score * 0.03); // Skaliert mit Score

        if (r < 0.50) {
            type = 'ball';
        } else if (r < 0.75) {
            type = 'star';
            speed += 0.5;
        } else if (r < 0.90) {
            type = 'red_card';
            speed += 1.0;
        } else {
            type = 'trophy'; // Meisterschale!
            speed -= 0.5; // Fällt etwas gemächlicher
        }

        this.keepup.items.push({
            x: Math.random() * (this.keepup.canvas.width - 50) + 25,
            y: -30,
            r: type === 'ball' ? 18 : type === 'star' ? 14 : type === 'trophy' ? 22 : 12,
            vy: speed,
            vx: (Math.random() - 0.5) * 1.5, // Leichter Drift
            type: type,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.08
        });
    },

    spawnScoreParticles(x, y, text, color) {
        for (let i = 0; i < 8; i++) {
            this.keepup.scoreParticles.push({
                x: x,
                y: y,
                text: i === 0 ? text : '', // Nur das erste Partikel zeigt den Text
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 1,
                alpha: 1.0,
                color: color || '#fcd34d'
            });
        }
    },

    loopKeepUp() {
        if (this.gamesPaused || this.keepup.gameState === 'menu') return;

        this.updateKeepUp();
        this.drawKeepUp();

        this.keepup.animationId = requestAnimationFrame(() => this.loopKeepUp());
    },

    updateKeepUp() {
        // Player Position interpolieren (Smooth Follow)
        this.keepup.playerX += (this.keepup.targetPlayerX - this.keepup.playerX) * 0.22;

        // Items spawnen
        this.keepup.itemSpawnTimer++;
        const spawnInterval = Math.max(30, 85 - (this.keepup.score * 0.4)); // Schnellerer Spawn bei höherem Score
        if (this.keepup.itemSpawnTimer >= spawnInterval) {
            this.spawnFallingItem();
            this.keepup.itemSpawnTimer = 0;
        }

        // Items updaten
        const playerX = this.keepup.playerX;
        const playerY = this.keepup.playerY;
        const playerR = this.keepup.playerR;

        for (let i = this.keepup.items.length - 1; i >= 0; i--) {
            const item = this.keepup.items[i];
            item.y += item.vy;
            item.x += item.vx;
            item.rotation += item.rotSpeed;

            // Wände abprallen
            if (item.x - item.r < 0 || item.x + item.r > this.keepup.canvas.width) {
                item.vx *= -1;
            }

            // Kollisionserkennung mit Kopf des Spielers
            const dx = item.x - playerX;
            const dy = item.y - playerY;
            const dist = Math.sqrt(dx*dx + dy*dy);

            // Kopfbereichs-Kollision (Großzügige Hitbox für Spaßfaktor!)
            if (dist <= item.r + playerR) {
                if (item.type === 'ball') {
                    // Ball zurückprallen
                    SoundEffects.playKick();
                    this.keepup.score += 10;
                    this.spawnScoreParticles(item.x, item.y, '+10', '#ffffff');
                    
                    // Der Ball fliegt in hohem Bogen weg
                    this.keepup.items.splice(i, 1);
                } else if (item.type === 'star') {
                    SoundEffects.playStar();
                    this.keepup.score += 50;
                    this.spawnScoreParticles(item.x, item.y, '+50', '#fcd34d');
                    this.keepup.items.splice(i, 1);
                } else if (item.type === 'trophy') {
                    SoundEffects.playGoal(); // Großer Fanfarenton
                    this.keepup.score += 150;
                    this.spawnScoreParticles(item.x, item.y, 'MEISTERSCHALE! +150', '#a855f7');
                    this.keepup.items.splice(i, 1);
                } else if (item.type === 'red_card') {
                    SoundEffects.playRedCard();
                    this.keepup.score = Math.max(0, this.keepup.score - 50);
                    this.spawnScoreParticles(item.x, item.y, '-50 Rote Karte!', '#f43f5e');
                    this.keepup.items.splice(i, 1);
                }
                
                document.getElementById('keepup-score').textContent = this.keepup.score;
                continue;
            }

            // Wenn ein Ball den Boden berührt -> Leben verlieren!
            if (item.y - item.r > this.keepup.canvas.height) {
                if (item.type === 'ball') {
                    this.keepup.lives--;
                    SoundEffects.playSave(); // Buzzer
                    document.getElementById('keepup-lives').textContent = this.keepup.lives;

                    if (this.keepup.lives <= 0) {
                        this.keepup.gameState = 'gameover';
                        this.endKeepUpGame();
                    }
                }
                this.keepup.items.splice(i, 1);
            }
        }

        // Partikel updaten
        this.keepup.scoreParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
        });
        this.keepup.scoreParticles = this.keepup.scoreParticles.filter(p => p.alpha > 0);
    },

    endKeepUpGame() {
        if (this.keepup.score > this.keepup.highscore) {
            this.keepup.highscore = this.keepup.score;
            localStorage.setItem('fietje_keepup_highscore', this.keepup.highscore);
            document.getElementById('keepup-highscore').textContent = this.keepup.highscore;
        }
        this.saveScoreToLeaderboard('keepup', this.keepup.score);

        const overlay = document.getElementById('keepup-overlay');
        const title = document.getElementById('keepup-overlay-title');
        const desc = document.getElementById('keepup-overlay-desc');

        overlay.style.display = 'flex';
        title.textContent = "Abpfiff!";
        desc.innerHTML = `Du hast <strong>${this.keepup.score} Punkte</strong> für den FC Bayern geholt!<br>Highscore: <strong>${this.keepup.highscore}</strong>`;
    },

    drawKeepUp() {
        const ctx = this.keepup.ctx;
        const canvas = this.keepup.canvas;
        const playerX = this.keepup.playerX;
        const playerY = this.keepup.playerY;
        const playerR = this.keepup.playerR;

        // 1. Hintergrund: Allianz Arena Leucht-Optik (Dunkelblau + Glühende rote Rauten)
        ctx.fillStyle = '#0b0f19'; // Tiefes Dunkelblau
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Allianz Arena Waben-Gitter zeichnen
        ctx.strokeStyle = 'rgba(210, 31, 60, 0.12)';
        ctx.lineWidth = 1.5;
        const size = 45;
        for (let x = -50; x < canvas.width + 50; x += size * 1.5) {
            for (let y = -50; y < canvas.height + 50; y += size * 0.86) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + size * 0.5, y - size * 0.28);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size, y + size * 0.5);
                ctx.lineTo(x + size * 0.5, y + size * 0.78);
                ctx.lineTo(x, y + size * 0.5);
                ctx.closePath();
                ctx.stroke();
            }
        }

        // Glühender Nebel im Zentrum/Boden
        const glowGrad = ctx.createRadialGradient(300, 300, 50, 300, 400, 300);
        glowGrad.addColorStop(0, 'rgba(210, 31, 60, 0.15)'); // Bayern-Rot Glow
        glowGrad.addColorStop(1, 'rgba(11, 15, 25, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bodenlinie
        ctx.fillStyle = '#0d1626';
        ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
        ctx.fillStyle = 'rgba(210, 31, 60, 0.5)';
        ctx.fillRect(0, canvas.height - 18, canvas.width, 3); // Rote Begrenzung

        // 2. Items zeichnen
        this.keepup.items.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);

            if (item.type === 'ball') {
                // Ball
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(0, 0, item.r, 0, Math.PI*2);
                ctx.fill();
                // Bayern-blaues Muster auf dem Ball
                ctx.fillStyle = '#1e3a8a';
                ctx.beginPath();
                ctx.arc(0, 0, item.r * 0.3, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = '#1e3a8a';
                ctx.lineWidth = 1.5;
                const angles = [0, 72, 144, 216, 288];
                angles.forEach(angle => {
                    const rad = (angle * Math.PI) / 180;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(rad) * (item.r * 0.3), Math.sin(rad) * (item.r * 0.3));
                    ctx.lineTo(Math.cos(rad) * item.r, Math.sin(rad) * item.r);
                    ctx.stroke();
                });
            } else if (item.type === 'star') {
                // Goldener Stern
                ctx.fillStyle = '#fcd34d';
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * item.r,
                               -Math.sin((18 + i * 72) * Math.PI / 180) * item.r);
                    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (item.r * 0.5),
                               -Math.sin((54 + i * 72) * Math.PI / 180) * (item.r * 0.5));
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (item.type === 'trophy') {
                // Goldene Meisterschale
                ctx.fillStyle = '#e2e8f0';
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, item.r, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();

                // Innerer Kreis
                ctx.fillStyle = '#fcd34d';
                ctx.beginPath();
                ctx.arc(0, 0, item.r * 0.55, 0, Math.PI*2);
                ctx.fill();

                // Details (Gravurpunkte)
                ctx.fillStyle = '#1e293b';
                ctx.font = '8px Kanit';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('15', 0, 0);
            } else if (item.type === 'red_card') {
                // Rote Karte
                ctx.fillStyle = '#ef4444';
                ctx.strokeStyle = '#dc2626';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
                ctx.shadowBlur = 6;
                ctx.fillRect(-8, -12, 16, 24);
                ctx.strokeRect(-8, -12, 16, 24);
            }

            ctx.restore();
        });

        // 3. Score Partikel zeichnen
        this.keepup.scoreParticles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            
            if (p.text) {
                ctx.font = 'bold 18px Kanit';
                ctx.textAlign = 'center';
                ctx.fillText(p.text, p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1.0;

        // 4. Spieler Schatten
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(playerX, 390, 30, 8, 0, 0, Math.PI*2);
        ctx.fill();

        // 5. Spieler zeichnen (Bayern-Trikot: Rot-Blau gestreift mit 15)
        ctx.save();
        ctx.translate(playerX, playerY);

        // Beine / Stutzen
        ctx.fillStyle = '#1e3a8a'; // Blaue Stutzen
        ctx.fillRect(-12, 30, 7, 20);
        ctx.fillRect(5, 30, 7, 20);
        ctx.fillStyle = '#000000'; // Schuhe
        ctx.fillRect(-13, 47, 9, 4);
        ctx.fillRect(4, 47, 9, 4);

        // Körper/Hose
        ctx.fillStyle = '#d21f3c'; // Rotes Trikot
        ctx.fillRect(-18, -10, 36, 32);
        // Blaue Längsstreifen (Bayern)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-12, -10, 5, 32);
        ctx.fillRect(7, -10, 5, 32);

        // Hose (Blau)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(-18, 22, 36, 12);

        // Rückennummer "15" andeuten (Spieler guckt nach vorne, aber wir deuten Logo auf Trikot an)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('15', 0, 10);

        // Arme
        ctx.strokeStyle = '#d21f3c';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-18, -5);
        ctx.lineTo(-28, 12);
        ctx.moveTo(18, -5);
        ctx.lineTo(28, 12);
        ctx.stroke();

        // Kopf (Bayern-Spieler Fietje)
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(0, -22, 13, 0, Math.PI*2);
        ctx.fill();

        // Haare (Sportlicher Schnitt, blond/braun)
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.arc(0, -24, 13, Math.PI, 0);
        ctx.fill();
        // Haarsträhnen
        ctx.fillRect(-13, -24, 6, 8);
        ctx.fillRect(7, -24, 6, 8);

        // Augen & Grinsen
        ctx.fillStyle = '#1a1a24';
        ctx.beginPath();
        ctx.arc(-5, -22, 1.5, 0, Math.PI*2);
        ctx.arc(5, -22, 1.5, 0, Math.PI*2);
        ctx.fill();
        // Mund
        ctx.strokeStyle = '#1a1a24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -18, 4, 0, Math.PI);
        ctx.stroke();

        ctx.restore();

        // 6. Leben-Anzeige auf dem Canvas zeichnen (Herzen)
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < this.keepup.lives; i++) {
            ctx.font = '20px Arial';
            ctx.fillText('❤️', 20 + i * 25, 40);
        }
    },

    // --- GAME 3: TENNIS - MATCHBALL ---
    setupTennisListeners() {
        const getPointerX = (e) => {
            const rect = this.tennis.canvas.getBoundingClientRect();
            const scaleX = this.tennis.canvas.width / rect.width;
            return (e.clientX - rect.left) * scaleX;
        };

        const updateTarget = (x) => {
            const half = this.tennis.paddleW / 2;
            this.tennis.targetPaddleX = Math.max(half, Math.min(this.tennis.canvas.width - half, x));
        };

        const updateFromPointer = (e) => {
            if (this.activeGame !== 'tennis') return;
            updateTarget(getPointerX(e));
        };

        this.tennis.canvas.addEventListener('mousemove', updateFromPointer);
        this.tennis.canvas.addEventListener('pointermove', updateFromPointer);
        window.addEventListener('mousemove', updateFromPointer);
        this.tennis.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            updateTarget(getPointerX(e.touches[0]));
        });
        this.tennis.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            updateTarget(getPointerX(e.touches[0]));
            this.resumeAudio();
        });
    },

    startTennisGame() {
        SoundEffects.playWhistle();
        document.getElementById('tennis-overlay').style.display = 'none';
        cancelAnimationFrame(this.tennis.animationId);

        this.tennis.score = 0;
        this.tennis.lives = 3;
        this.tennis.gameState = 'playing';
        this.tennis.items = [];
        this.tennis.particles = [];
        this.tennis.paddleX = 300;
        this.tennis.targetPaddleX = 300;
        this.tennis.itemSpawnTimer = 0;

        document.getElementById('tennis-score').textContent = '0';
        document.getElementById('tennis-lives').textContent = '3';

        this.gamesPaused = false;
        this.loopTennis();
    },

    spawnTennisItem() {
        const isStar = Math.random() > 0.82;
        this.tennis.items.push({
            x: Math.random() * (this.tennis.canvas.width - 50) + 25,
            y: -24,
            r: isStar ? 15 : 16,
            vy: (isStar ? 2.2 : 2.8) + Math.random() * 1.4 + this.tennis.score * 0.02,
            vx: (Math.random() - 0.5) * 1.8,
            type: isStar ? 'star' : 'ball',
            rotation: 0
        });
    },

    loopTennis() {
        if (this.gamesPaused || this.tennis.gameState !== 'playing') return;
        this.updateTennis();
        this.drawTennis();
        this.tennis.animationId = requestAnimationFrame(() => this.loopTennis());
    },

    updateTennis() {
        const game = this.tennis;
        game.paddleX += (game.targetPaddleX - game.paddleX) * 0.28;
        game.itemSpawnTimer++;
        const spawnInterval = Math.max(34, 78 - game.score * 0.25);
        if (game.itemSpawnTimer >= spawnInterval) {
            this.spawnTennisItem();
            game.itemSpawnTimer = 0;
        }

        for (let i = game.items.length - 1; i >= 0; i--) {
            const item = game.items[i];
            item.x += item.vx;
            item.y += item.vy;
            item.rotation += 0.08;
            if (item.x - item.r < 0 || item.x + item.r > game.canvas.width) item.vx *= -1;

            const paddleLeft = game.paddleX - game.paddleW / 2;
            const paddleRight = game.paddleX + game.paddleW / 2;
            const hitY = item.y + item.r >= game.paddleY - 8 && item.y - item.r <= game.paddleY + 14;
            if (hitY && item.x >= paddleLeft && item.x <= paddleRight) {
                const points = item.type === 'star' ? 60 : 15;
                game.score += points;
                SoundEffects.playKick();
                document.getElementById('tennis-score').textContent = game.score;
                game.items.splice(i, 1);
                continue;
            }

            if (item.y - item.r > game.canvas.height) {
                if (item.type === 'ball') {
                    game.lives--;
                    SoundEffects.playSave();
                    document.getElementById('tennis-lives').textContent = game.lives;
                    if (game.lives <= 0) {
                        game.gameState = 'gameover';
                        this.endTennisGame();
                    }
                }
                game.items.splice(i, 1);
            }
        }
    },

    endTennisGame() {
        if (this.tennis.score > this.tennis.highscore) {
            this.tennis.highscore = this.tennis.score;
            localStorage.setItem('fietje_tennis_highscore', this.tennis.highscore);
            document.getElementById('tennis-highscore').textContent = this.tennis.highscore;
        }
        this.saveScoreToLeaderboard('tennis', this.tennis.score);

        const overlay = document.getElementById('tennis-overlay');
        document.getElementById('tennis-overlay-title').textContent = 'Match vorbei!';
        document.getElementById('tennis-overlay-desc').innerHTML = `Du hast <strong>${this.tennis.score} Punkte</strong> im Tennis-Match geholt.`;
        overlay.style.display = 'flex';
    },

    drawTennis() {
        const ctx = this.tennis.ctx;
        const canvas = this.tennis.canvas;
        ctx.fillStyle = '#123c2b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 3;
        ctx.strokeRect(45, 40, 510, 310);
        ctx.beginPath();
        ctx.moveTo(300, 40);
        ctx.lineTo(300, 350);
        ctx.moveTo(45, 195);
        ctx.lineTo(555, 195);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(45, 190, 510, 10);

        this.tennis.items.forEach(item => {
            ctx.save();
            ctx.translate(item.x, item.y);
            ctx.rotate(item.rotation);
            if (item.type === 'star') {
                ctx.fillStyle = '#fcd34d';
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * item.r, -Math.sin((18 + i * 72) * Math.PI / 180) * item.r);
                    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * item.r * 0.5, -Math.sin((54 + i * 72) * Math.PI / 180) * item.r * 0.5);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillStyle = '#ccff33';
                ctx.beginPath();
                ctx.arc(0, 0, item.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(-4, 0, item.r * 0.72, -1.2, 1.2);
                ctx.arc(4, 0, item.r * 0.72, 1.95, 4.35);
                ctx.stroke();
            }
            ctx.restore();
        });

        ctx.fillStyle = '#f97316';
        ctx.fillRect(this.tennis.paddleX - this.tennis.paddleW / 2, this.tennis.paddleY, this.tennis.paddleW, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('FIETJE', this.tennis.paddleX, this.tennis.paddleY + 32);
    },

    drawTennisMenu() {
        const ctx = this.tennis.ctx;
        ctx.fillStyle = '#123c2b';
        ctx.fillRect(0, 0, this.tennis.canvas.width, this.tennis.canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('TENNIS: MATCHBALL', 300, 180);
        ctx.font = '400 14px Outfit';
        ctx.fillStyle = '#a0a0b0';
        ctx.fillText('Starte das Spiel und halte die Rally am Leben.', 300, 220);
    },

    // --- GAME 4: EISHOCKEY - EIS-GOALIE ---
    setupHockeyListeners() {
        const getPointerX = (e) => {
            const rect = this.hockey.canvas.getBoundingClientRect();
            const scaleX = this.hockey.canvas.width / rect.width;
            return (e.clientX - rect.left) * scaleX;
        };
        const updateTarget = (x) => {
            const half = this.hockey.goalieW / 2;
            this.hockey.targetGoalieX = Math.max(half, Math.min(this.hockey.canvas.width - half, x));
        };
        const updateFromPointer = (e) => {
            if (this.activeGame !== 'hockey') return;
            updateTarget(getPointerX(e));
        };
        this.hockey.canvas.addEventListener('mousemove', updateFromPointer);
        this.hockey.canvas.addEventListener('pointermove', updateFromPointer);
        window.addEventListener('mousemove', updateFromPointer);
        this.hockey.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            updateTarget(getPointerX(e.touches[0]));
        });
        this.hockey.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            updateTarget(getPointerX(e.touches[0]));
            this.resumeAudio();
        });
    },

    startHockeyGame() {
        SoundEffects.playWhistle();
        document.getElementById('hockey-overlay').style.display = 'none';
        cancelAnimationFrame(this.hockey.animationId);

        this.hockey.score = 0;
        this.hockey.lives = 3;
        this.hockey.gameState = 'playing';
        this.hockey.shots = [];
        this.hockey.goalieX = 300;
        this.hockey.targetGoalieX = 300;
        this.hockey.shotSpawnTimer = 0;

        document.getElementById('hockey-score').textContent = '0';
        document.getElementById('hockey-lives').textContent = '3';

        this.gamesPaused = false;
        this.loopHockey();
    },

    spawnHockeyShot() {
        const r = Math.random();
        const type = r > 0.86 ? 'penalty' : r > 0.74 ? 'cup' : 'puck';
        this.hockey.shots.push({
            x: Math.random() * (this.hockey.canvas.width - 60) + 30,
            y: -24,
            r: type === 'cup' ? 19 : 14,
            vy: 3.0 + Math.random() * 1.8 + this.hockey.score * 0.018,
            vx: (Math.random() - 0.5) * 1.4,
            type
        });
    },

    loopHockey() {
        if (this.gamesPaused || this.hockey.gameState !== 'playing') return;
        this.updateHockey();
        this.drawHockey();
        this.hockey.animationId = requestAnimationFrame(() => this.loopHockey());
    },

    updateHockey() {
        const game = this.hockey;
        game.goalieX += (game.targetGoalieX - game.goalieX) * 0.3;
        game.shotSpawnTimer++;
        const spawnInterval = Math.max(28, 72 - game.score * 0.22);
        if (game.shotSpawnTimer >= spawnInterval) {
            this.spawnHockeyShot();
            game.shotSpawnTimer = 0;
        }

        for (let i = game.shots.length - 1; i >= 0; i--) {
            const shot = game.shots[i];
            shot.x += shot.vx;
            shot.y += shot.vy;
            if (shot.x - shot.r < 0 || shot.x + shot.r > game.canvas.width) shot.vx *= -1;

            const goalieLeft = game.goalieX - game.goalieW / 2;
            const goalieRight = game.goalieX + game.goalieW / 2;
            const hitY = shot.y + shot.r >= game.goalieY - 18 && shot.y - shot.r <= game.goalieY + 28;
            if (hitY && shot.x >= goalieLeft && shot.x <= goalieRight) {
                if (shot.type === 'penalty') {
                    game.lives--;
                    SoundEffects.playRedCard();
                    document.getElementById('hockey-lives').textContent = game.lives;
                } else {
                    game.score += shot.type === 'cup' ? 80 : 20;
                    SoundEffects.playSave();
                    document.getElementById('hockey-score').textContent = game.score;
                }
                game.shots.splice(i, 1);
                if (game.lives <= 0) {
                    game.gameState = 'gameover';
                    this.endHockeyGame();
                }
                continue;
            }

            if (shot.y - shot.r > game.canvas.height) {
                if (shot.type === 'puck') {
                    game.lives--;
                    document.getElementById('hockey-lives').textContent = game.lives;
                    if (game.lives <= 0) {
                        game.gameState = 'gameover';
                        this.endHockeyGame();
                    }
                }
                game.shots.splice(i, 1);
            }
        }
    },

    endHockeyGame() {
        if (this.hockey.score > this.hockey.highscore) {
            this.hockey.highscore = this.hockey.score;
            localStorage.setItem('fietje_hockey_highscore', this.hockey.highscore);
            document.getElementById('hockey-highscore').textContent = this.hockey.highscore;
        }
        this.saveScoreToLeaderboard('hockey', this.hockey.score);

        const overlay = document.getElementById('hockey-overlay');
        document.getElementById('hockey-overlay-title').textContent = 'Abpfiff auf dem Eis!';
        document.getElementById('hockey-overlay-desc').innerHTML = `Du hast <strong>${this.hockey.score} Punkte</strong> als Eis-Goalie geholt.`;
        overlay.style.display = 'flex';
    },

    drawHockey() {
        const ctx = this.hockey.ctx;
        const canvas = this.hockey.canvas;
        ctx.fillStyle = '#dbeafe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.28)';
        ctx.lineWidth = 2;
        for (let y = 30; y < canvas.height; y += 42) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y + Math.sin(y) * 10);
            ctx.stroke();
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.strokeRect(175, 286, 250, 80);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.fillRect(175, 286, 250, 80);

        this.hockey.shots.forEach(shot => {
            if (shot.type === 'cup') {
                ctx.fillStyle = '#fcd34d';
                ctx.beginPath();
                ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1f2937';
                ctx.font = '900 10px Kanit';
                ctx.textAlign = 'center';
                ctx.fillText('15', shot.x, shot.y + 3);
            } else if (shot.type === 'penalty') {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(shot.x - 10, shot.y - 14, 20, 28);
            } else {
                ctx.fillStyle = '#111827';
                ctx.beginPath();
                ctx.ellipse(shot.x, shot.y, shot.r + 4, shot.r, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#374151';
                ctx.beginPath();
                ctx.ellipse(shot.x, shot.y - 3, shot.r, shot.r * 0.45, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.fillStyle = '#d21f3c';
        ctx.fillRect(this.hockey.goalieX - this.hockey.goalieW / 2, this.hockey.goalieY, this.hockey.goalieW, 24);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.hockey.goalieX - 18, this.hockey.goalieY - 34, 36, 34);
        ctx.fillStyle = '#111827';
        ctx.font = '900 13px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('15', this.hockey.goalieX, this.hockey.goalieY - 12);
    },

    drawHockeyMenu() {
        const ctx = this.hockey.ctx;
        ctx.fillStyle = '#dbeafe';
        ctx.fillRect(0, 0, this.hockey.canvas.width, this.hockey.canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 24px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('EISHOCKEY: EIS-GOALIE', 300, 180);
        ctx.font = '400 14px Outfit';
        ctx.fillText('Starte das Spiel und halte den Kasten sauber.', 300, 220);
    },

    drawKeepUpMenu() {
        const ctx = this.keepup.ctx;
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, this.keepup.canvas.width, this.keepup.canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px Kanit';
        ctx.textAlign = 'center';
        ctx.fillText('MIA-SAN-HEADER', 300, 180);
        
        ctx.font = '400 14px Outfit';
        ctx.fillStyle = '#a0a0b0';
        ctx.fillText('Klicke auf den Button oben, um für Bayern anzutreten.', 300, 220);
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine.init();
});
