const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const playerHealth = document.getElementById("playerHealth");
const sysHealthDisplay = document.getElementById("sysHealth");
const keysDisplay = document.getElementById("keys");
const shradsDisplay = document.getElementById("shrads");
const scoreDisplay = document.getElementById("score");
const pauseBt = document.getElementById("pause");
const resumeBt = document.getElementById("resume");
const resetBt = document.getElementById("reset");
const highScoreSt = localStorage.getItem("highScore");
let highScore;
if (highScoreSt != null) highScore = parseInt(highScoreSt);
else highScore = 0;
const rows = 7;
const columns = 15;
let paused = false;
let cones = [];
let buildings = [];
let keys = [];
let bullets = [];
let keysCollected = 0;
let sysHealth = 50;
let shrads = 0;
let baseStation;
let centralHub;
let shradArr = [];
let shradsDelivered = 0;
let gameOver = false;
let result;
let health = 100;
do {
    baseStation = {
        c: Math.floor(Math.random() * columns),
        r: Math.floor(Math.random() * rows),
        shrads: 0
    }
} while (baseStation.r == 0 && baseStation.c == 0);
do {
    centralHub = {
        c: Math.floor(Math.random() * columns),
        r: Math.floor(Math.random() * rows)
    }
} while ((centralHub.r == 0 && centralHub.c == 0) || (centralHub.r == baseStation.r && centralHub.c == baseStation.c));
for (let i = 0; i < 10; i++) {
    const x = centralHub.c * 240 + Math.random() * 150 - 10;
    const y = centralHub.r * 240 + Math.random() * 150 + 45;
    shradArr.push({ x: x, y: y });
}
for (let i = 0; i < rows; i++) {
    buildings[i] = []
    for (let j = 0; j < columns; j++) {
        const xc = j * 240 + 100;
        const yc = i * 240 + 100;
        if (!(i == baseStation.r && j == baseStation.c) && !(i == centralHub.r && j == centralHub.c)) {
            cones.push({
                x: xc,
                y: yc,
                angle: Math.random() * 360,
                hits: 0
            });
        }
        sq = [];
        for (let k = 0; k < 6; k++) {
            const xs = Math.floor(Math.random() * 120) + (j * 240) + 10;
            const ys = Math.floor(Math.random() * 120) + (i * 240) + 10;
            sq.push({ x: xs, y: ys, hits: 0 });
        }
        buildings[i][j] = sq;
    }
}
const player = {
    x: 220 + 3 * 240,
    y: 220 + 240,
    health: 100
};
for (let i = 0; i < 50; i++) {
    let r;
    let c;
    do {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * columns);
    } while ((r == baseStation.r && c == baseStation.c) || (r == 0 && c == 0) || (r == centralHub.r && c == centralHub.c));
    const x = c * 240 + Math.random() * 170 + 15;
    const y = r * 240 + Math.random() * 170 + 15;
    keys.push({ x: x, y: y });
}
function drawPlayer() {
    c.beginPath();
    c.arc(player.x, player.y, 22, 0, Math.PI * 2, false);
    if (shrads > 0) {
        c.strokeStyle = "rgb(255, 136, 0)";
        c.lineWidth = 8;
        c.stroke();
    }
    c.fillStyle = "white";
    c.fill();
    for (const key of keys) {
        c.beginPath();
        c.arc(key.x, key.y, 12, 0, 2 * Math.PI, false);
        c.fillStyle = "rgb(255, 0, 230)";
        c.fill();
    }
}
function newKeys() {
    let r;
    let c;
    do {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * columns);
    } while ((r == baseStation.r && c == baseStation.c) || (r == 0 && c == 0) || (r == centralHub.r && c == centralHub.c));
    const x = c * 240 + Math.random() * 170 + 15;
    const y = r * 240 + Math.random() * 170 + 15;
    keys.push({ x: x, y: y });
}
document.addEventListener("keydown", function (e) {
    if (!paused) {
        let xNext = player.x;
        let yNext = player.y;
        switch (e.key) {
            case "ArrowUp":
                yNext -= 8;
                e.preventDefault();
                break;
            case "ArrowDown":
                yNext += 8;
                e.preventDefault();
                break;
            case "ArrowLeft":
                xNext -= 8;
                e.preventDefault();
                break;
            case "ArrowRight":
                xNext += 8;
                e.preventDefault();
                break;
        }
        xNext = Math.max(Math.min(canvas.width - 22, xNext), 22);
        yNext = Math.max(Math.min(canvas.height - 22, yNext), 22);
        if (!collide(xNext, yNext)) {
            player.x = xNext;
            player.y = yNext;
        }
    }
});
function keyCollection() {
    for (let i = keys.length - 1; i >= 0; i--) {
        const dx = keys[i].x - player.x;
        const dy = keys[i].y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 34) {
            keys.splice(i, 1);
            if (keys.length < 40) newKeys();
            keysCollected++;
            console.log(keysCollected);
        }
    }
}
function shradCollection() {
    for (let i = shradArr.length - 1; i >= 0; i--) {
        const dx = shradArr[i].x + 20 - player.x;
        const dy = shradArr[i].y + 10 - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 42 && keysCollected >= 3) {
            keysCollected -= 3;
            shradArr.splice(i, 1);
            shrads++;
        }
    }
}
function shradDelivery() {
    const xNearest = Math.max(baseStation.c * 240, Math.min(player.x, baseStation.c * 240 + 200));
    const yNearest = Math.max(baseStation.r * 240, Math.min(player.y, baseStation.r * 240 + 200));
    const dx = player.x - xNearest;
    const dy = player.y - yNearest;
    if ((dx * dx + dy * dy <= 22 * 22) && shrads > 0) {
        shradsDelivered += shrads;
        shrads = 0;
        sysHealth = Math.min(100, sysHealth + 10);
        if (sysHealth >= 100) {
            sysHealth = 100;
            result = "win";
            endGame();
        }
    }
}
canvas.addEventListener("click", function (e) {
    if (!paused) {
        const canv = canvas.getBoundingClientRect();
        const x = e.clientX - canv.left;
        const y = e.clientY - canv.top;
        const dx = x - player.x;
        const dy = y - player.y;
        const theta = Math.atan2(dy, dx);
        bullets.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(theta) * 10,
            vy: Math.sin(theta) * 10
        })
    }
})
function tower() {
    for (const t of cones) {
        const dx = player.x - t.x;
        const dy = player.y - t.y;
        if (dx * dx + dy * dy < 137 * 137) {
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if (angle < 0) angle += 360;
            const start = t.angle % 360;
            const end = (t.angle + 60) % 360;
            const inside = start < end ? angle >= start && angle <= end : angle <= end || angle >= start;
            if (inside) {
                health -= 0.3;
                player.health = Math.ceil(health);
                if (player.health <= 0) {
                    player.health = 0;
                    result = "loss";
                    endGame();
                }
                break;
            }
        }
    }
}
function shoot() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].vx;
        bullets[i].y += bullets[i].vy;
        bullets[i].vx *= 0.99;
        bullets[i].vy *= 0.99;
        if (Math.abs(bullets[i].vx) + Math.abs(bullets[i].vy) < 1) {
            bullets.splice(i, 1);
            continue;
        }
        c.beginPath();
        c.arc(bullets[i].x, bullets[i].y, 7, 0, 2 * Math.PI, false);
        c.fillStyle = "white";
        c.fill();
        for (let l = 0; l < rows; l++) {
            for (let j = 0; j < columns; j++) {
                for (let k = buildings[l][j].length - 1; k >= 0; k--) {
                    const sq = buildings[l][j][k]
                    const xNearest = Math.max(sq.x, Math.min(bullets[i].x, sq.x + 60));
                    const yNearest = Math.max(sq.y, Math.min(bullets[i].y, sq.y + 60));
                    const dx = xNearest - bullets[i].x;
                    const dy = yNearest - bullets[i].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist <= 7) {
                        const nx = dx / dist;
                        const ny = dy / dist;
                        sq.hits += 1;
                        bullets[i].vx *= 0.9;
                        bullets[i].vy *= 0.9;
                        const dot = bullets[i].vx * nx + bullets[i].vy * ny;
                        bullets[i].vx = bullets[i].vx - 2 * dot * nx;
                        bullets[i].vy = bullets[i].vy - 2 * dot * ny;
                    }
                    if (sq.hits >= 3) buildings[l][j].splice(k, 1);
                }
            }
        }
        for (let j = cones.length - 1; j >= 0; j--) {
            let dx = cones[j].x - bullets[i].x;
            let dy = cones[j].y - bullets[i].y;
            const d = Math.hypot(dx, dy);
            if (d <= 137) {
                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                angle += 180;
                const start = cones[j].angle % 360;
                const end = (cones[j].angle + 60) % 360;
                console.log(`start=${start}`);
                console.log(`end=${end}`);
                console.log(`angle=${angle}`);
                const inside = start < end ? angle >= start && angle <= end : angle <= end || angle >= start;
                const x1 = cones[j].x + 130 * Math.cos(start * Math.PI / 180);
                const y1 = cones[j].y + 130 * Math.sin(start * Math.PI / 180);
                const x2 = cones[j].x + 130 * Math.cos(end * Math.PI / 180);
                const y2 = cones[j].y + 130 * Math.sin(end * Math.PI / 180);
                const l1 = dist(bullets[i].x, bullets[i].y, cones[j].x, cones[j].y, x1, y1);
                const l2 = dist(bullets[i].x, bullets[i].y, cones[j].x, cones[j].y, x2, y2);
                const line = l1 <= 49 || l2 <= 49;
                if (inside || line) {
                    cones[j].hits++;
                    bullets[i].vx *= 0.9;
                    bullets[i].vy *= 0.9;
                    if (cones[j].hits >= 3) cones.splice(j, 1);
                }
                if (line) {
                    if (l2 <= 49) {
                        let tx = x2 - cones[j].x;
                        let ty = y2 - cones[j].y;
                        const tl = Math.hypot(tx, ty);
                        if (tl != 0) {
                            tx /= tl;
                            ty /= tl;
                        }
                        const nx = ty;
                        const ny = -tx;
                        const dot = bullets[i].vx * nx + bullets[i].vy * ny;
                        bullets[i].vx = bullets[i].vx - 2 * dot * nx;
                        bullets[i].vy = bullets[i].vy - 2 * dot * ny;
                    }
                    else {
                        let tx = x1 - cones[j].x;
                        let ty = y1 - cones[j].y;
                        const tl = Math.hypot(tx, ty);
                        if (tl != 0) {
                            tx /= tl;
                            ty /= tl;
                        }
                        const nx = -ty;
                        const ny = tx;
                        const dot = bullets[i].vx * nx + bullets[i].vy * ny;
                        bullets[i].vx = bullets[i].vx - 2 * dot * nx;
                        bullets[i].vy = bullets[i].vy - 2 * dot * ny;
                    }
                }
                else if (inside) {
                    const l = Math.hypot(dx, dy);
                    if (l != 0) {
                        dx /= -l;
                        dy /= -l;
                    }
                    const dot = bullets[i].vx * dx + bullets[i].vy * dy;
                    bullets[i].vx = bullets[i].vx - 2 * dot * dx;
                    bullets[i].vy = bullets[i].vy - 2 * dot * dy;
                }
            }

        }
    }
}
function dist(x, y, x1, y1, x2, y2) {
    const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
    const lenS = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    const p = lenS != 0 ? dot / lenS : -1;
    let xc, yc;
    if (p < 0) {
        xc = x1;
        yc = y1;
    }
    else if (p > 1) {
        xc = x2;
        yc = y2;
    }
    else {
        xc = x1 + p * (x2 - x1);
        yc = y1 + p * (y2 - y1);
    }
    const dx = x - xc;
    const dy = y - yc;
    return dx * dx + dy * dy;
}
function grid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const x = j * 240;
            const y = i * 240;
            if (i == baseStation.r && j == baseStation.c) c.fillStyle = "cyan";
            else if (i == centralHub.r && j == centralHub.c) c.fillStyle = "rgba(64, 64, 64, 1)";
            else c.fillStyle = "limegreen";
            c.fillRect(x, y, 200, 200);
            const xl = x - 20;
            const yl = y - 20;
            c.lineWidth = 3;
            c.strokeStyle = "limegreen";
            c.strokeRect(xl, yl, 240, 240);
            buildings[i][j].forEach(sq => {
                if (!(i == centralHub.r && j == centralHub.c)) {
                    c.fillStyle = "black";
                    c.fillRect(sq.x, sq.y, 60, 60);
                }
            });
            if (i == baseStation.r && j == baseStation.c) {
                c.beginPath();
                c.arc(x + 100, y + 100, 30, 0, 2 * Math.PI, false);
                c.fillStyle = "blue";
                c.fill();
                c.closePath();
            }
            if (i == centralHub.r && j == centralHub.c) {
                c.beginPath();
                c.strokeStyle = "rgba(93,180,255,255)";
                c.strokeRect(x, y, 200, 200);
                c.closePath();
            }
        }
    }

}
function shrad() {
    c.font = "50px courier new";
    c.fillStyle = "skyblue";
    shradArr.forEach(s => {
        c.fillText("💠", s.x, s.y);
    });
}
function cone() {
    cones.forEach(cone => {
        cone.angle = (cone.angle + 0.5) % 360;
        c.beginPath();
        c.moveTo(cone.x, cone.y);
        c.arc(cone.x, cone.y, 130, cone.angle * Math.PI / 180, (cone.angle + 60) * Math.PI / 180, false);
        c.lineTo(cone.x, cone.y);
        c.lineWidth = 2;
        c.strokeStyle = "rgb(140, 44, 44)";
        c.fillStyle = "rgba(165, 68, 68, 0.27)";
        c.stroke();
        c.fill();
        c.closePath();
    })
}
function collide(x, y) {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (i == centralHub.r && j == centralHub.c) continue;
            for (const sq of buildings[i][j]) {
                const xNearest = Math.max(Math.min(x, sq.x + 60), sq.x);
                const yNearest = Math.max(Math.min(y, sq.y + 60), sq.y);
                const dx = xNearest - x;
                const dy = yNearest - y;
                if (dx * dx + dy * dy <= 22 * 22) return true;
            }
        }
    }
    return false;
}
function box() {
    playerHealth.textContent = player.health;
    sysHealthDisplay.textContent = sysHealth;
    keysDisplay.textContent = keysCollected;
    shradsDisplay.textContent = shradsDelivered;
    scoreDisplay.textContent = highScore;
}
function pause() {
    paused = true;
    pauseBt.disabled = true;
    resumeBt.disabled = false;
}
function resume() {
    if (!gameOver && paused) {
        paused = false;
        pauseBt.disabled = false;
        resumeBt.disabled = true;
        animate();
    }
}
function reset() {
    location.reload();
}
setInterval(() => {
    if (!paused && !gameOver) {
        if (sysHealth > 0) sysHealth--;
        else {
            sysHealth = 0;
            result = "loss";
            endGame();
        }
    }
}, 5000);
function endGame() {
    gameOver = true;
    if (shradsDelivered > highScore) {
        localStorage.setItem("highScore", shradsDelivered);
    }
    // if (result == "win") alert(`You WON!! AUREX restored successfully!`);
    // else alert(`The AUREX is Dead! You Lost:(`)
}
function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (gameOver) {
        grid();
        cone();
        shrad();
        return;
        // c.fillStyle = "rgb(64,64,64)";
        // c.fillRect(window.innerWidth / 2 - 300, window.innerHeight / 2 - 300, 600, 600);
        // c.strokeStyle = rgb(29, 226, 230);
        // c.strokeRect(window.innerWidth / 2 - 300, window.innerHeight / 2 - 300, 600, 600);
    }
    if (paused) {
        grid();
        cone();
        shrad();
        drawPlayer();
        return;
    }
    grid();
    keyCollection();
    shoot();
    box();
    shrad();
    shradCollection();
    shradDelivery();
    drawPlayer();
    cone();
    requestAnimationFrame(animate);
    tower();
}
animate();