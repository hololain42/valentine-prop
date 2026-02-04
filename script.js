// ============================================
// YOUTUBE PLAYER
// ============================================

// Load Youtube IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var isYouTubeReady = false;
var videoPlayed = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: '09R8_2nJtjg', // Maroon 5 - Sugar
        playerVars: {
            'start': 40,
            'controls': 0,
            'autoplay': 1,
            'mute': 1, // Start muted to allow autoplay
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    isYouTubeReady = true;
    console.log("YouTube player ready");
}

function onPlayerError(event) {
    console.log("YouTube Player Error: ", event.data);
}

// ============================================
// CONFETTI
// ============================================

const confettiCanvas = document.getElementById("confettiCanvas");

function resizeConfettiCanvas() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    confettiCanvas.width = Math.floor(window.innerWidth * dpr);
    confettiCanvas.height = Math.floor(window.innerHeight * dpr);
    confettiCanvas.style.width = "100vw";
    confettiCanvas.style.height = "100vh";
}

resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeConfettiCanvas, 150));

const confettiInstance = confetti.create(confettiCanvas, {
    resize: false,
    useWorker: true
});

function fullScreenConfetti() {
    const end = Date.now() + 1600;

    (function frame() {
        confettiInstance({
            particleCount: 12,
            spread: 90,
            startVelocity: 45,
            ticks: 180,
            origin: { x: Math.random(), y: Math.random() * 0.3 }
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();

    setTimeout(() => {
        confettiInstance({
            particleCount: 300,
            spread: 140,
            startVelocity: 60,
            ticks: 220,
            origin: { x: 0.5, y: 0.55 }
        });
    }, 300);
}

// ============================================
// "YES" BUTTON GROWS AND "NO" BUTTON RUNS AWAY
// ============================================

const zone = document.getElementById("buttonZone");
const yesBtn = document.getElementById("yesButton");
const noBtn = document.getElementById("noButton");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const mainImage = document.getElementById("mainImage");
const question = document.getElementById("question");
const nameTitle = document.getElementById("name");

let yesScale = 1;

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function growYes() {
    yesScale = Math.min(2.2, yesScale + 0.1);
    yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

function moveNo(px, py) {
    const z = zone.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();

    // Calculate vector from the cursor to the button center
    let dx = (b.left + b.width / 2) - px;
    let dy = (b.top + b.height / 2) - py;
    let mag = Math.hypot(dx, dy) || 1;
    dx /= mag;
    dy /= mag;

    // Move button in opposite direction to the cursor
    let newLeft = (b.left - z.left) + dx * 150;
    let newTop = (b.top - z.top) + dy * 150;

    // Maintain button inside boundaries
    newLeft = clamp(newLeft, 0, z.width - b.width);
    newTop = clamp(newTop, 0, z.height - b.height);

    noBtn.style.left = newLeft + "px";
    noBtn.style.top = newTop + "px";
    noBtn.style.transform = "none";

    growYes();
}

// ========================================
// EVENT LISTENERS
// ========================================

// Detect movement close to the "No" button
zone.addEventListener("pointermove", e => {
    const b = noBtn.getBoundingClientRect();
    const distance = Math.hypot(
        (b.left + b.width / 2) - e.clientX,
        (b.top + b.height / 2) - e.clientY
    );
    
    // If the cursor is closer than 140px, the button runs away
    if (distance < 140) {
        moveNo(e.clientX, e.clientY);
        
        // Change image to gun.jif the first time
        if (mainImage.src.indexOf('catflower.jpg') !== -1) {
            mainImage.src = "images/gun.gif";
            question.textContent = "Elige sabiamente...";
            if (nameTitle) nameTitle.style.display = "none";
        }
        
        // Play Youtube video the first time
        if (!videoPlayed && isYouTubeReady && player) {
            document.getElementById('youtube-player-container').style.display = 'block';
            try {
                player.unMute();
                player.playVideo();
                videoPlayed = true;
            } catch (e) {
                console.log("Autoplay blocked, user interaction needed");
            }
        }
    }
});

// ========================================
// "YES" BUTTON
// ========================================

function cheeringYes() {

        // Change image, show result
        mainImage.src = "images/dance.gif";
        question.style.display = "none";
        nameTitle.remove();
        result.style.display = "block";

        // Add heart photos
        document.querySelector('.hearts-container').style.display = 'block';

        // Play cheering sound
        const cheerAudio = document.createElement("audio");
        cheerAudio.src = "./Eric Andre Show Yeah.mp4";
        cheerAudio.preload = "auto";
        cheerAudio.play().catch(e => {
            console.error("Cheering sound play error:", e);
        });
}

yesBtn.addEventListener("click", () => {
    
    // Stop Youtube video
    const playerContainer = document.getElementById('youtube-player-container');
    if (playerContainer) {
        playerContainer.remove();
    }
    if (player && player.stopVideo) {
        player.stopVideo();
        player.destroy();
    }

    // Remove buttons
    zone.style.display = "none";
    hint.style.display = "none";
    if (nameTitle) nameTitle.remove();
    
    // Cheering
    cheeringYes();
    
    // Throw confetti
    resizeConfettiCanvas();
    fullScreenConfetti();
});

// ========================================
// "NO" BUTTON
// ========================================

let sadAudio = null; // Variable global para guardar el audio triste

noBtn.addEventListener("click", e => {
    e.preventDefault();
    
    // Stop Youtube video
    const playerContainer = document.getElementById('youtube-player-container');
    if (playerContainer) {
        playerContainer.remove();
    }
    if (player && player.stopVideo) {
        player.stopVideo();
        player.destroy();
    }
    
    // Remove buttons
    zone.style.display = "none";
    hint.style.display = "none";

    // Play sad violin sound
    sadAudio = document.createElement("audio");
    sadAudio.src = "./Sad Violin.mp4";
    sadAudio.preload = "auto";
    sadAudio.loop = true; // Opcional: hacer que se repita
    sadAudio.play()
        .catch(e => console.error("Sad violin sound play error:", e));
    
    // Change image, show result and goodbye message
    mainImage.src = "images/sad.jpg";

    nameTitle.textContent = "Entiendo... 💔";
    question.textContent = "Respeto tu decisión";
    nameTitle.style.display = "block";
    
    // Show second chance button
    const secondChanceBtn = document.getElementById("secondChanceButton");
    secondChanceBtn.style.display = "block";
    
    // Event listener
    secondChanceBtn.addEventListener("click", () => {
        secondChanceBtn.style.display = "none";
        
        // Sad music stop
        if (sadAudio) {
            sadAudio.pause();
            sadAudio.currentTime = 0;
            sadAudio = null;
        }
        
        // Cheering
        cheeringYes();
        
        // Confetti
        resizeConfettiCanvas();
        fullScreenConfetti();
    });
});