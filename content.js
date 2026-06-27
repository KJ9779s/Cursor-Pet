console.log("KOKO Follower loaded");

const state = {
    enabled: true,
    petType: "KOKO",
    scale: 1.00,
    distance: 34,
    speed: 0.3,
    x: 100,
    y: 100,
    targetX: 100,
    targetY: 100,
    dir: "s",
    frame: 1,
    isSleeping: false
};

let idleTimer;
const IDLE_TIMEOUT = 15000;

const pet = document.createElement("img");
pet.id = "my-idol-pet";
pet.style.position = "fixed";
pet.style.zIndex = 999999;
pet.style.pointerEvents = "none";
pet.style.left = "100px";
pet.style.top = "100px";
pet.style.width = "64px";
pet.style.height = "64px";
pet.style.transform = "translate(-50%, -50%)";
pet.style.visibility = "hidden";

document.body.appendChild(pet);

function getSprite(dir, frame) {
    if (state.isSleeping) {
        return chrome.runtime.getURL(`assets/${state.petType}/sleep_${frame}.PNG`);
    }
    return chrome.runtime.getURL(`assets/${state.petType}/${dir}_${frame}.PNG`);
}
function getDirection(dx, dy) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle >= -22.5 && angle < 22.5) return "e";
    if (angle >= 22.5 && angle < 67.5) return "se";
    if (angle >= 67.5 && angle < 112.5) return "s";
    if (angle >= 112.5 && angle < 157.5) return "sw";
    if (angle >= -67.5 && angle < -22.5) return "ne";
    if (angle >= -112.5 && angle < -67.5) return "n";
    if (angle >= -157.5 && angle < -112.5) return "nw";
    return "w";
}

document.addEventListener("mousemove", (e) => {
    state.isSleeping = false;
    clearTimeout(idleTimer);
    
    idleTimer = setTimeout(() => {
        state.isSleeping = true;
    }, IDLE_TIMEOUT);

    const buffer = 35;
    const maxX = window.innerWidth - buffer;
    const maxY = window.innerHeight - buffer;

    state.targetX = Math.min(Math.max(e.clientX + state.distance, buffer), maxX);
    state.targetY = Math.min(Math.max(e.clientY + state.distance, buffer), maxY);
});

function applySettings(data) {
    state.enabled = data.enabled ?? true;
    state.petType = data.petType ?? "KOKO";
    state.scale = data.scale ?? 1.00;
    state.distance = data.distance ?? 34;
    state.speed = (data.speed ?? 0.3) * 0.04;

    const size = 64 * state.scale;
    pet.style.width = size + "px";
    pet.style.height = size + "px";

    pet.style.display = !state.enabled ? "none" : "block";
}

function loadSettings() {
    chrome.storage.local.get({
        enabled: true,
        petType: "KOKO",
        scale: 1.00,
        distance: 34,
        speed: 0.3
    }, (data) => {
        applySettings(data);
        state.x = window.innerWidth / 2;
        state.y = window.innerHeight / 2;
        state.targetX = state.x;
        state.targetY = state.y;
        requestAnimationFrame(() => {
            pet.style.visibility = "visible";
        });
    });
}

loadSettings();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    chrome.storage.local.get(null, applySettings);
});

let frameCounter = 0; 

setInterval(() => {
    if (!state.enabled) return;

    frameCounter++;
    const skipFrames = state.isSleeping ? 4 : 1;

    if (frameCounter >= skipFrames) {
        state.frame = state.frame === 1 ? 2 : 1;
        frameCounter = 0;
    }
    
    if (state.isSleeping) {
        pet.src = getSprite(null, state.frame);
    } else {
        const dx = state.targetX - state.x;
        const dy = state.targetY - state.y;
        state.dir = getDirection(dx, dy);
        pet.src = getSprite(state.dir, state.frame);
    }
}, 180);

function animate() {
    if (!state.enabled) {
        pet.style.display = "none";
        requestAnimationFrame(animate);
        return;
    }
    pet.style.display = "block";
    
    if (!state.isSleeping) {
        state.x += (state.targetX - state.x) * state.speed;
        state.y += (state.targetY - state.y) * state.speed;
    }
    
    pet.style.left = state.x + "px";
    pet.style.top = state.y + "px";
    requestAnimationFrame(animate);
}

animate();