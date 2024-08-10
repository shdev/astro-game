const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Basisgröße definieren
const baseSize = Math.min(canvas.width, canvas.height) * 0.1; // 10% der kleineren Dimension

// Astronautenbild laden
const astronautImg = new Image();
astronautImg.src = 'astronaut.png'; // Pfad zum Astronautenbild

// ISS-Bild laden
const issImg = new Image();
issImg.src = 'iss.png'; // Pfad zum ISS-Bild

// Gewinn- und Verlustbilder laden
const winImg = new Image();
winImg.src = 'win.png'; // Pfad zum Gewinnbild

const loseImg = new Image();
loseImg.src = 'lose.png'; // Pfad zum Verlustbild

// Audiodateien laden
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const thrustSound = document.getElementById("thrustSound"); // Beschleunigungssound

// Weltraummüllbilder laden
const debrisImages = [
    new Image(),
    new Image(),
    new Image()
];

debrisImages[0].src = 'debris1.png'; // Pfad zum ersten Weltraummüllbild
debrisImages[1].src = 'debris2.png'; // Pfad zum zweiten Weltraummüllbild
debrisImages[2].src = 'debris3.png'; // Pfad zum dritten Weltraummüllbild

let imagesLoaded = 0;
const totalImages = 7; // Gesamtzahl der Bilder, die geladen werden müssen

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        update(); // Startet das Spiel, wenn alle Bilder geladen sind
    }
}

// Bilder laden und prüfen, ob sie erfolgreich geladen wurden
astronautImg.onload = imageLoaded;
issImg.onload = imageLoaded;
winImg.onload = imageLoaded;
loseImg.onload = imageLoaded;
debrisImages.forEach(img => img.onload = imageLoaded);

const astronaut = {
    x: 50,
    y: canvas.height / 2 - baseSize / 2,
    width: baseSize,
    height: baseSize, // Behalte das Seitenverhältnis bei
    dx: 0,
    dy: 0,
    vx: 0, // Geschwindigkeit in x-Richtung
    vy: 0, // Geschwindigkeit in y-Richtung
    ax: 0, // Beschleunigung in x-Richtung
    ay: 0, // Beschleunigung in y-Richtung
    maxSpeed: baseSize * 0.2, // Maximale Geschwindigkeit als 20% der Basisgröße
    friction: 0.98, // Trägheit/Friction
    thrust: baseSize * 0.02 // Beschleunigungsfaktor als 2% der Basisgröße
};

const iss = {
    x: canvas.width * 0.75,
    y: Math.random() * (canvas.height - baseSize),
    width: baseSize * 2, // ISS ist doppelt so groß wie der Astronaut
    height: baseSize,
    speedX: baseSize * 0.1 + (Math.random() - 0.5) * baseSize * 0.2, // Geschwindigkeit relativ zur Basisgröße
    speedY: baseSize * 0.1 + (Math.random() - 0.5) * baseSize * 0.2 // Geschwindigkeit relativ zur Basisgröße
};

let debris = [];
let score = 0;
let gameOver = false;
let gameWon = false;
let thrustActive = false; // Variable, um den Thrust-Sound zu steuern

function drawAstronaut() {
    ctx.drawImage(astronautImg, astronaut.x, astronaut.y, astronaut.width, astronaut.height);
}

function drawISS() {
    ctx.drawImage(issImg, iss.x, iss.y, iss.width, iss.height);
}

function moveISS() {
    iss.x += iss.speedX;
    iss.y += iss.speedY;

    if (iss.x < canvas.width / 2) {
        iss.x = canvas.width / 2;
        iss.speedX *= -1;
    }

    if (iss.x + iss.width > canvas.width) {
        iss.x = canvas.width - iss.width;
        iss.speedX *= -1;
    }

    if (iss.y < 0 || iss.y + iss.height > canvas.height) {
        iss.speedY *= -1;
    }
}

function resetISS() {
    iss.x = canvas.width * 0.75;
    iss.y = Math.random() * (canvas.height - iss.height);
    iss.speedX = baseSize * 0.1 + (Math.random() - 0.5) * baseSize * 0.2;
    iss.speedY = baseSize * 0.1 + (Math.random() - 0.5) * baseSize * 0.2;
}

function generateDebris() {
    const size = baseSize * (Math.random() * 0.5 + 0.5); // Größe relativ zur Basisgröße
    const x = canvas.width;
    const y = Math.random() * (canvas.height - size);
    const img = debrisImages[Math.floor(Math.random() * debrisImages.length)];
    debris.push({ x: x, y: y, width: size, height: size, img: img, speed: baseSize * 0.1 });
}

function drawDebris() {
    debris.forEach(d => {
        ctx.drawImage(d.img, d.x, d.y, d.width, d.height);
        d.x -= d.speed;
    });
}

function moveAstronaut() {
    // Beschleunigung zu Geschwindigkeit hinzufügen
    astronaut.vx += astronaut.ax;
    astronaut.vy += astronaut.ay;

    // Friction anwenden, um die Bewegung allmählich zu verlangsamen
    astronaut.vx *= astronaut.friction;
    astronaut.vy *= astronaut.friction;

    // Geschwindigkeit auf maximale Geschwindigkeit begrenzen
    if (astronaut.vx > astronaut.maxSpeed) astronaut.vx = astronaut.maxSpeed;
    if (astronaut.vx < -astronaut.maxSpeed) astronaut.vx = -astronaut.maxSpeed;
    if (astronaut.vy > astronaut.maxSpeed) astronaut.vy = astronaut.maxSpeed;
    if (astronaut.vy < -astronaut.maxSpeed) astronaut.vy = -astronaut.maxSpeed;

    // Position basierend auf Geschwindigkeit aktualisieren
    astronaut.x += astronaut.vx;
    astronaut.y += astronaut.vy;

    // Grenzen des Bildschirms für den Astronauten
    if (astronaut.x < 0) {
        astronaut.x = 0;
        astronaut.vx = 0;
    }
    if (astronaut.x + astronaut.width > canvas.width) {
        astronaut.x = canvas.width - astronaut.width;
        astronaut.vx = 0;
    }
    if (astronaut.y < 0) {
        astronaut.y = 0;
        astronaut.vy = 0;
    }
    if (astronaut.y + astronaut.height > canvas.height) {
        astronaut.y = canvas.height - astronaut.height;
        astronaut.vy = 0;
    }
}

function checkCollision() {
    // Überprüfen, ob der Astronaut die ISS erreicht hat
    if (astronaut.x < iss.x + iss.width &&
        astronaut.x + astronaut.width > iss.x &&
        astronaut.y < iss.y + iss.height &&
        astronaut.y + astronaut.height > iss.y) {
        gameWon = true;
    }

    // Überprüfen, ob der Astronaut mit Weltraummüll kollidiert
    debris.forEach(d => {
        if (astronaut.x < d.x + d.width &&
            astronaut.x + astronaut.width > d.x &&
            astronaut.y < d.y + d.height &&
            astronaut.y + d.height > d.y) {
            gameOver = true;
        }
    });
}

let audioInitialized = false;

function initializeAudio() {
    if (!audioInitialized) {
        thrustSound.play(); // Audiowiedergabe starten, um Audio in iOS zu initialisieren
        thrustSound.pause(); // Sofort pausieren
        thrustSound.currentTime = 0; // Setze den Sound zurück
        audioInitialized = true;
    }
}

initializeAudio();

document.addEventListener('touchstart', initializeAudio, { once: true });
document.addEventListener('mousedown', initializeAudio, { once: true });


function update() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCenteredImageProportional(loseImg, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.5, canvas.height * 0.3);
        loseSound.play(); // Spiele das Verlust-Audio ab

        // Event-Listener für Klick oder Touch zum Neustart des Spiels
        document.addEventListener('click', reloadGame);
        document.addEventListener('touchstart', reloadGame);
        return;
    }

    if (gameWon) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCenteredImageProportional(winImg, canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.5, canvas.height * 0.3);
        winSound.play(); // Spiele das Gewinn-Audio ab

        // Event-Listener für Klick oder Touch zum Neustart des Spiels
        document.addEventListener('click', reloadGame);
        document.addEventListener('touchstart', reloadGame);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveISS();
    drawAstronaut();
    drawISS();
    drawDebris();
    moveAstronaut();
    checkCollision();

    score++;
    if (score % 20 === 0) generateDebris(); // Erhöhte Häufigkeit des Müllspawns

    requestAnimationFrame(update);
}

function reloadGame() {
    location.reload(); // Browser-Seite neu laden
}

function drawCenteredImageProportional(img, x, y, maxWidth, maxHeight) {
    const imgAspectRatio = img.width / img.height;
    let width = maxWidth;
    let height = maxHeight;

    if (imgAspectRatio > 1) {
        // Bild ist breiter als hoch
        height = maxWidth / imgAspectRatio;
    } else {
        // Bild ist höher als breit
        width = maxHeight * imgAspectRatio;
    }

    ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
}

function keyDownHandler(e) {
    initializeAudio(); // Sicherstellen, dass das Audio initialisiert ist, wenn eine Taste gedrückt wird
    
    let thrust = false;

    if (e.key === "ArrowUp" || e.key === "w") {
        astronaut.ay = -astronaut.thrust;
        thrust = true;
    }
    if (e.key === "ArrowDown" || e.key === "s") {
        astronaut.ay = astronaut.thrust;
        thrust = true;
    }
    if (e.key === "ArrowLeft" || e.key === "a") {
        astronaut.ax = -astronaut.thrust;
        thrust = true;
    }
    if (e.key === "ArrowRight" || e.key === "d") {
        astronaut.ax = astronaut.thrust;
        thrust = true;
    }

    if (thrust && !thrustActive) {
        thrustSound.play(); // Starte den Thrust-Sound
        thrustActive = true;
    }
}

function keyUpHandler(e) {
    let stillThrusting = false;

    if (e.key === "ArrowUp" || e.key === "w") {
        astronaut.ay = 0;
    }
    if (e.key === "ArrowDown" || e.key === "s") {
        astronaut.ay = 0;
    }
    if (e.key === "ArrowLeft" || e.key === "a") {
        astronaut.ax = 0;
    }
    if (e.key === "ArrowRight" || e.key === "d") {
        astronaut.ax = 0;
    }

    // Überprüfen, ob eine andere Richtungstaste noch gedrückt ist
    if (astronaut.ax !== 0 || astronaut.ay !== 0) {
        stillThrusting = true;
    }

    if (!stillThrusting && thrustActive) {
        thrustSound.pause(); // Pausiere den Thrust-Sound
        thrustSound.currentTime = 0; // Setze den Sound zurück
        thrustActive = false;
    }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Proportionale Größen und andere Initialisierungen ...

function handleTouchStart(direction) {
    initializeAudio();

    let thrust = false;

    if (direction === 'up') {
        astronaut.ay = -astronaut.thrust;
        thrust = true;
    }
    if (direction === 'down') {
        astronaut.ay = astronaut.thrust;
        thrust = true;
    }
    if (direction === 'left') {
        astronaut.ax = -astronaut.thrust;
        thrust = true;
    }
    if (direction === 'right') {
        astronaut.ax = astronaut.thrust;
        thrust = true;
    }

    if (thrust && !thrustActive) {
        thrustSound.play();
        thrustActive = true;
    }
}

function handleTouchEnd() {
    astronaut.ax = 0;
    astronaut.ay = 0;
    thrustSound.pause();
    thrustSound.currentTime = 0;
    thrustActive = false;
}

document.getElementById('upButton').addEventListener('touchstart', () => handleTouchStart('up'));
document.getElementById('downButton').addEventListener('touchstart', () => handleTouchStart('down'));
document.getElementById('leftButton').addEventListener('touchstart', () => handleTouchStart('left'));
document.getElementById('rightButton').addEventListener('touchstart', () => handleTouchStart('right'));

document.getElementById('upButton').addEventListener('touchend', handleTouchEnd);
document.getElementById('downButton').addEventListener('touchend', handleTouchEnd);
document.getElementById('leftButton').addEventListener('touchend', handleTouchEnd);
document.getElementById('rightButton').addEventListener('touchend', handleTouchEnd);
document.addEventListener('gesturestart', function (e) {
    e.preventDefault(); // Verhindert das Zoomen durch Gesten
});

document.addEventListener('dblclick', function(e) {
    e.preventDefault(); // Verhindert das Zoomen durch Doppeltippen
});

console.log("Sounds Attribution:");
console.log("1. hvrl.wav by inferno -- https://freesound.org/s/18380/ -- License: Sampling+");
console.log("2. OKAY! by Scrampunk -- https://freesound.org/s/345299/ -- License: Attribution 4.0");
console.log("3. game over sound (i think) by ro1qa -- https://freesound.org/s/584336/ -- License: Creative Commons 0");