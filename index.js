"use strict";

const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);

function createPiece(type) {
    if (type === "T") {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    } else if (type === "O") {
        return [
            [2, 2],
            [2, 2]
        ];
    } else if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    } else if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    } else if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    } else if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

function arenaSweep() {
    let rowCount = 1;
    // The outer loop is used to iterate through the rows of the arena.
    outer: for (let y = arena.length - 1; y > 0; --y) {
        // The inner loop is used to iterate through the columns of the arena.
        for (let x = 0; x < arena[y].length; x++) {
            // If the value of the current column is 0, then we know that the
            // row is not full, so we can continue to the next row.
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        // If the row is full, it gets removed from and overwritten with a new row of 0s.
        const row = arena.splice(y, 1)[0].fill(0);
        // The row is then added back to the top of the arena.
        arena.unshift(row);
        y++;

        // The score is updated based on the number of rows cleared.
        player.score += rowCount * 10;
        
        // If more than one row is cleared at a time, the score is multiplied by 2.
        // for each additional row.
        rowCount *= 2;
    }
}

function collide(arena, player) {
    // The matrix and position of the player are stored in 2 variables.
    const [m, o] = [player.matrix, player.pos];
    // The outer loop is used to iterate through the rows of the player's matrix.
    for (let y = 0; y < m.length; y++) {
        // The inner loop is used to iterate through the columns of the player's matrix.
        for (let x = 0; x < m[y].length; x++) {
            // If the current player cell is not empyt,
            // and the corresponding cell in the arena is not empty,
            // then we know that the player has collided with the arena. 
            if (
                m[y][x] !== 0 &&
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0
            ) {
                // The function returns true if there is a collision.
                return true;
            }
        }
    }
    // The function returns false if there is no collision.
    return false;
}

function createMatrix(w, h) {
    // The matrix is created as an array of arrays.
    // Or better said as a two dimensional array (Matrix). 
    const matrix = [];
    
    for (let i = 0; i < h; i++) {
        // For each iteration, a new array filled with 0's is pushed to the matrix.
        matrix.push(new Array(w).fill(0));
    }
    
    // The matrix is returned with h rows and w columns.
    return matrix;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    });
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = 
            [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }

    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "ILJOTSZ";
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById("score").innerText = player.score;
}

const colors = [
    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF"
];

document.addEventListener("keydown", event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const arena = createMatrix(12, 20);
const player = {
    matrix: null,
    pos: {x: 0, y: 0},
    score: 0
};
playerReset();
updateScore();
update();
