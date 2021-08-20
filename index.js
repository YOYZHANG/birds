let birds = [];
const NUM = 100;
const DRAW_HISTORY = false;
let width = 150;
let height = 150;

const NEARBY = 20;
let history = [];
function refreshCanvas() {
    let canvas = document.getElementById('canvas');
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawBirds(ctx, bird) {
    const {x, y, dx, dy} = bird;
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dy, dx));
    ctx.translate(-x, -y);
    ctx.fillStyle = "#558cf4";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 15, y + 5);
    ctx.lineTo(x - 15, y - 5);
    ctx.lineTo(x, y);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (DRAW_HISTORY) {
        ctx.strokeStyle = "#558cf466";
        ctx.beginPath();
        ctx.moveTo(bird.history[0][0], bird.history[0][1]);
        for (let item of history) {
            ctx.lineTo(item[0], item[1]);
        }
       ctx.stroke();
    }
}

function distance(bird1, bird2) {
    return Math.sqrt((bird1.x - bird2.x) * (bird1.x - bird2.x) + (bird1.y - bird2.y) * (bird1.y - bird2.y));
}

// RULE 1: 向着群体中心飞
function centerTowards(bird) {
    let centerX = 0;
    let centerY = 0;
    let neighborNum = 0;
    const centerRange = 75;
    const rate = 0.005;

    for (let anotherBird of birds) {
        if (distance(bird, anotherBird) < centerRange) {
            centerX += anotherBird.x;
            centerY += anotherBird.y;
            neighborNum += 1;
        }
    }
    if (neighborNum) {
        bird.dx += (centerX / neighborNum - bird.x) * rate;
        bird.dy += (centerY/neighborNum - bird.y) * rate;
    }
}

// RULE 2: 不相撞
function escapeCrash(bird) {
    let moveX = 0;
    let moveY = 0;
    const crashDistance = 20;
    const rate = 0.05;
    for (let anotherBird of birds) {
        if (anotherBird != bird) {
            if (distance(bird, anotherBird) < crashDistance) {
                moveX += bird.x - anotherBird.x;
                moveY += bird.y - anotherBird.y;
            }
        }
    }

    bird.dx += moveX * rate;
    bird.dy += moveY * rate;
}

// RULE3: 速度与大方向保持一致
function averageV(bird) {
    let vx = 0;
    let vy = 0;
    let neighborNum = 0;
    const averageDistance = 50;
    const rate = 0.05;
    for (let anotherBird of birds) {
        if (distance(bird, anotherBird) < averageDistance) {
            vx += anotherBird.dx;
            vy += anotherBird.dy;
            neighborNum += 1;
        }
    }
    if (neighborNum) {
        bird.dx += (vx/neighborNum - bird.dx) * rate;
        bird.dy += (vy/neighborNum - bird.dy) * rate;
    }
}

// 不超出边界
function frameIn(bird) {
    const margin = 200;
    const turnFactor = 1;
    if (bird.x < margin) {
        bird.dx += turnFactor;
    }
    if (bird.x > window.innerWidth - margin) {
        bird.dx -= turnFactor;
    }
    if (bird.y < margin) {
        bird.dy += turnFactor;
    }
    if (bird.y > window.innerHeight - margin) {
        bird.dy -= turnFactor;
    }
}

function loop() {
    for (let bird of birds) {
        // 中心飞行
        centerTowards(bird);
        // 不相撞
        escapeCrash(bird);
        // 速度控制
        averageV(bird);
        // 边界范围内
        frameIn(bird);

        bird.x += bird.dx;
        bird.y += bird.dy;

        bird.history.push([bird.x, bird.y]);
        bird.history = bird.history.slice(-50);
    }

    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    for (let bird of birds) {
        drawBirds(ctx, bird);
    }

    window.requestAnimationFrame(loop);
}

function initRandomBirds() {
    for ( let i = 0; i < NUM; i++) {
        birds.push({
            x: Math.random() * width,
            y: Math.random() * height,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * 10 - 5,
            history: []
        })
    }
}


window.onload = function() {
    window.addEventListener('resize', refreshCanvas, false);
    refreshCanvas(canvas);

    initRandomBirds();
    window.requestAnimationFrame(loop);
}