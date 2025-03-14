// recojer el canvas y el lienzo y ponerlos en variables
const canvas = document.getElementById('tetris');
const lienzo = canvas.getContext('2d');

const ppCanvas = document.getElementById('nextPiece'); // pp significa proxima pieza
const ppLienzo = ppCanvas.getContext('2d');

const aguantarCanvas = document.getElementById('holdPiece');
const aguantarLienzo = aguantarCanvas.getContext('2d');

// Constantes del canvas
const filas = 20;
const columnas = 10;
const tamanoCelda = 30;

// inicializar tablero
let tablero = Array.from({ length: filas }, () => Array(columnas).fill(0));

// variables de juego
let puntos = 0;
let nivel = 0;
let lineasEliminadas = 0;
let velocidadJuego = 500;
let intervalJuego = null;
let iniciarJuego = false;
let finJuego = false;
let piezaAguantada = null;

// Points for different types of line clears
const valorPuntos = {
    1: 40,    // Single
    2: 50,    // Double
    3: 100,   // Triple
    4: 300    // Tetris
};

// piezas definition
const piezas = [
    {
        nombre: 'L',
        forma: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        color: 'orange',
        probabilidad: 0.125
    },
    {
        nombre: 'O',
        forma: [
            [1, 1],
            [1, 1]
        ],
        color: 'yellow',
        probabilidad: 0.125
    },
    {
        nombre: 'T',
        forma: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: 'purple',
        probabilidad: 0.125
    },
    {
        nombre: 'I',
        forma: [[1], [1], [1], [1]],
        color: 'cyan',
        probabilidad: 0.125
    },
    {
        nombre: 'Z',
        forma: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: 'red',
        probabilidad: 0.125
    },
    {
        nombre: 'S',
        forma: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: 'green',
        probabilidad: 0.125
    },
    {
        nombre: 'J',
        forma: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        color: 'blue',
        probabilidad: 0.125
    }
];

// actualizar game state
let piezaActual = generarPieza();
let piezaSeguiente = generarPieza();
let posX = 4, posY = 0;

//---------------------------------------------

// START DRAWING FUNCTIONS

//---------------------------------------------


// Function to draw a piece
function dibujarPieza(pieza, offsetX, offsetY) {
    if (!iniciarJuego || finJuego) return; // Don't draw anything if the game hasn't started or if it's over

    pieza.forma.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                lienzo.fillStyle = pieza.color;
                lienzo.fillRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
                lienzo.strokeStyle = 'white';
                lienzo.strokeRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
            }
        });
    });
}

// Function to draw the tablero
function dibujarTablero() {
    tablero.forEach((row, y) => {
        row.forEach((cell, x) => {
            lienzo.fillStyle = cell === 1 ? 'gray' : 'black';
            lienzo.fillRect(x * tamanoCelda, y * tamanoCelda, tamanoCelda, tamanoCelda);
            lienzo.strokeStyle = 'white';
            lienzo.strokeRect(x * tamanoCelda, y * tamanoCelda, tamanoCelda, tamanoCelda);
        });
    });
}

// Function to draw the next pieza
function dibujarSiguientePieza() {
    if (!iniciarJuego || finJuego) return; // Don't draw anything if the game hasn't started or if it's over

    ppLienzo.clearRect(0, 0, ppCanvas.width, ppCanvas.height); // Clear the next piece canvas

    const offsetX = (ppCanvas.width / tamanoCelda - piezaSeguiente.forma[0].length) / 2;
    const offsetY = (ppCanvas.height / tamanoCelda - piezaSeguiente.forma.length) / 2;

    piezaSeguiente.forma.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                ppLienzo.fillStyle = piezaSeguiente.color;
                ppLienzo.fillRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
                ppLienzo.strokeStyle = 'white';
                ppLienzo.strokeRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
            }
        });
    });

    // Calculate the center position for the next piece to fit inside the smaller canvas
    
}

function dibujarPiezaAguantada() {
    aguantarLienzo.clearRect(0, 0, aguantarCanvas.width, aguantarCanvas.height);  // Clear the canvas

    if (piezaAguantada) {
        const offsetX = (aguantarCanvas.width / tamanoCelda - piezaAguantada.forma[0].length) / 2;
        const offsetY = (aguantarCanvas.height / tamanoCelda - piezaAguantada.forma.length) / 2;

        piezaAguantada.forma.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    aguantarLienzo.fillStyle = piezaAguantada.color;
                    aguantarLienzo.fillRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
                    aguantarLienzo.strokeStyle = 'white';
                    aguantarLienzo.strokeRect((x + offsetX) * tamanoCelda, (y + offsetY) * tamanoCelda, tamanoCelda, tamanoCelda);
                }
            });
        });
    }
}


//---------------------------------------------

// END DRAWING FUNCTIONS

//---------------------------------------------


//---------------------------------------------

// START PIECE CONTROL FUNCTIONS

//---------------------------------------------

// Function to hold a piece
function aguantarPieza() {
    if (!iniciarJuego || finJuego) return;  // Do nothing if the game isn't active

    if (piezaAguantada) {
        // Swap the current piece with the held piece
        const temp = clonarPieza(piezaActual);
        piezaActual = clonarPieza(piezaAguantada);
        piezaAguantada = temp;
    } else {
        // Store the current piece as the held piece and generate a new piece
        piezaAguantada = clonarPieza(piezaActual);
        piezaActual = generarPieza();  // Generate a new piece
    }

    // Reset the position of the current piece
    posX = 4;
    posY = 0;
}

// Generate a random piece based on probabilities
function generarPieza() {
    const rand = Math.random();
    let acumular = 0;

    for (let pieza of piezas) {
        acumular += pieza.probabilidad;
        if (rand < acumular) {
            // Clone the pieza before returning it
            return clonarPieza(pieza);
        }
    }

    // If no piece is selected due to floating-point precision, return the last piece as a fallback
    return clonarPieza(piezas[piezas.length - 1]);
}

// Check for collisions
function chequearColisiones(pieza, offsetX, offsetY, forma = pieza.forma) {
    for (let y = 0; y < forma.length; y++) {
        for (let x = 0; x < forma[y].length; x++) {
            if (forma[y][x]) {
                const nX = x + offsetX;
                const nY = y + offsetY;

                // Check for out of bounds or collision with another pieza
                if (nX < 0 || nX >= columnas || nY >= filas || (nY >= 0 && tablero[nY][nX] === 1)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Position the pieza on the tablero
function posicionaPieza(pieza, offsetX, offsetY) {
    pieza.forma.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                tablero[y + offsetY][x + offsetX] = 1;
            }
        });
    });
}


//---------------------------------------------

// END PIECE CONTROL FUNCTIONS

//---------------------------------------------


//---------------------------------------------

// START STATS CONTROL FUNCTIONS

//---------------------------------------------

// actualizar score based on the number of lines cleared
function actulizarPuntos(linesRemoved) {
    puntos += valorPuntos[linesRemoved] * linesRemoved * (nivel + 1); // Score increases with nivel
    document.getElementById('points').textContent = puntos; // Update points display
}

// Update the nivel based on the total lines cleared
function actulizarNIveles(linesRemoved) {
    lineasEliminadas += linesRemoved;
    const linesToNextLevel = (nivel + 1) * 10;

    if (lineasEliminadas >= linesToNextLevel) {
        nivel++;
        lineasEliminadas -= linesToNextLevel; // Carry over extra lines for the next level
        document.getElementById('level').textContent = nivel; // Update level display
    }
}


//---------------------------------------------

// END STATS CONTROL FUNCTIONS

//---------------------------------------------

//---------------------------------------------

// START GAME FUNCTIONS

//---------------------------------------------


// Function to reset the game
function resetJuego() {
    tablero = Array.from({ length: filas }, () => Array(columnas).fill(0)); // Clear the tablero
    puntos = 0; // Reset puntos
    nivel = 0; // Reset nivel
    lineasEliminadas = 0; // Reset lines cleared
    finJuego = false; // Reset game-over flag
    document.getElementById('points').textContent = puntos; // Update points display
    document.getElementById('level').textContent = nivel; // Update level display
    piezaActual = generarPieza(); // Generate a new piece
    piezaSeguiente = generarPieza(); // Generate a new next piece
    piezaAguantada = null; // Reset held piece
    posX = 4; // Reset position
    posY = 0;
    clearCanvas(); // Clear the canvas
}

// Function to stop the game
function stopJuego() {
    if (intervalJuego) {
        clearInterval(intervalJuego);
        intervalJuego = null;
        iniciarJuego = false;
        finJuego = true; // Mark the game as over
        alert('FIN DE LA PARTIDA, este juego ha sido desarrollado por Austin Beltran'); // Show a game-over message
        document.getElementById('playButton').disabled = false;
    }
}

// Function to start the game
function startJuego() {
    resetJuego();
    velocidadJuego = getVelocidadJuego(nivel);
    intervalJuego = setInterval(jugar, velocidadJuego);
    iniciarJuego = true;
    document.getElementById('playButton').disabled = true;
}

// Function to check if the game is over and handle it
function chequearFinJuego() {
    if (posY === 0 && chequearColisiones(piezaActual, posX, posY)) {
        stopJuego();
    }
}

// Function to get the game speed based on the nivel
function getVelocidadJuego(nivel) {
    if (nivel <= 10) {
        return 500 - nivel * 25; // Speed decreases by 25ms per nivel
    } else if (nivel <= 12) {
        return 120;
    } else if (nivel <= 15) {
        return 100;
    } else if (nivel <= 18) {
        return 80;
    } else if (nivel <= 28) {
        return 60;
    } else {
        return 40; // Max speed after nivel 29
    }
}

// Function to play the game
function jugar() {
    if (!iniciarJuego || finJuego) return; // Don't draw anything if the game hasn't started or if it's over

    clearCanvas(); // Clear the canvas before drawing
    dibujarTablero();
    dibujarPieza(piezaActual, posX, posY);
    dibujarSiguientePieza();
    actualizar();
    dibujarPiezaAguantada();
}

//---------------------------------------------

// END GAME FUNCTIONS

//---------------------------------------------


//---------------------------------------------

// START CONTROL FUNCTIONS

//---------------------------------------------


// Event listener for the Play button
document.getElementById('playButton').addEventListener('click', startJuego);

// Player controls
document.addEventListener('keydown', event => {
    if (!iniciarJuego || finJuego) return; // Don't handle key events if the game hasn't started or if it's over

    if ((event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') && !chequearColisiones(piezaActual, posX - 1, posY)) {
        posX--;
    } else if ((event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') && !chequearColisiones(piezaActual, posX + 1, posY)) {
        posX++;
    } else if ((event.key === 's' || event.key === 'S'|| event.key === 'ArrowDown') && !chequearColisiones(piezaActual, posX, posY + 1)) {
        posY++;
    } else if (event.key === 'w' || event.key === 'W' || event.key === 'ArrowUp') {
        rotarPiezas();  // Rotate with wall kicks
    } else if (event.key === ' ') {
        instantDrop();
    } else if (event.key === 'Shift' || event.key === 'c' || event.key === 'C') {
        aguantarPieza();
    }

    dibujarTablero();
    dibujarPieza(piezaActual, posX, posY);
    dibujarSiguientePieza();
    dibujarPiezaAguantada();
});

// Rotate the piece and check for collisions
function rotarPiezas() {
    const originalforma = piezaActual.forma;
    const rotatedforma = piezaActual.forma[0].map((_, index) =>
        piezaActual.forma.map(row => row[index]).reverse()
    );
    let offsetX = 0, offsetY = 0;

    // Check if the rotated forma would cause a collision
    if (!chequearColisiones({ ...piezaActual, forma: rotatedforma }, posX, posY)) {
        piezaActual.forma = rotatedforma;  // Apply rotation if no collision
    }

    // Attempt the rotation
    if (!chequearColisiones(piezaActual, posX, posY, rotatedforma)) {
        piezaActual.forma = rotatedforma;
        return;
    }

    // Wall kicks - try moving the piece left or right to find a valid position
    const wallKickOffsets = [
        {x: 1, y: 0},  // Try moving right
        {x: -1, y: 0}, // Try moving left
        {x: 0, y: 1},  // Try moving down
        {x: 0, y: -1}, // Try moving up (rare but sometimes needed)
    ];

    // Try applying the wall kick offsets
    for (let kick of wallKickOffsets) {
        offsetX = kick.x;
        offsetY = kick.y;

        // Try the rotation with the kick applied
        if (!chequearColisiones(piezaActual, posX + offsetX, posY + offsetY, rotatedforma)) {
            piezaActual.forma = rotatedforma;  // Apply the rotated forma if valid
            posX += offsetX;  // Apply the offset (move the piece if necessary)
            posY += offsetY;
            return;
        }
    }

    // If no valid kick works, revert to original forma
    piezaActual.forma = originalforma;
}

function clonarPieza(pieza) {
    return {
        forma: pieza.forma.map(row => [...row]),  // Clone each row of the forma
        color: pieza.color,                      // Copy the color
        probabilidad: pieza.probabilidad           // Copy the probabilidad (optional, for reference)
    };
}


//---------------------------------------------

// END CONTROL FUNCTIONS

//---------------------------------------------

//---------------------------------------------

// START UPDATE FUNCTIONS

//---------------------------------------------

// Remove complete lines and update score
function eliminarLinea() {
    let linesRemoved = 0;

    for (let y = filas - 1; y >= 0; y--) {
        if (tablero[y].every(cell => cell === 1)) {
            tablero.splice(y, 1);
            tablero.unshift(Array(columnas).fill(0));
            linesRemoved++;
            y++; // Re-check the new row
        }
    }

    if (linesRemoved > 0) {
        actulizarPuntos(linesRemoved);
        actulizarNIveles(linesRemoved);
    }
}

// Function to clear the canvas
function clearCanvas() {
    lienzo.fillStyle = 'black';
    lienzo.fillRect(0, 0, canvas.width, canvas.height);
}

// Instant drop functionality
function instantDrop() {
    if (!iniciarJuego || finJuego) return; // Do nothing if the game hasn't started or if it's over

    while (!chequearColisiones(piezaActual, posX, posY + 1)) {
        posY++;
    }
    posicionaPieza(piezaActual, posX, posY);
    eliminarLinea();
    piezaActual = piezaSeguiente; // Use the next piece
    piezaSeguiente = generarPieza(); // Generate a new next piece
    posX = 4;
    posY = 0;

    chequearFinJuego()

    // Adjust speed based on nivel
    let newSpeed = getVelocidadJuego(nivel);
    if (newSpeed !== velocidadJuego) {
        velocidadJuego = newSpeed;
        clearInterval(intervalJuego);
        intervalJuego = setInterval(jugar, velocidadJuego);
    }
}

// Update the game state
function actualizar() {
    if (!iniciarJuego || finJuego) return; // Do nothing if the game hasn't started or if it's over

    if (chequearColisiones(piezaActual, posX, posY + 1)) {
        posicionaPieza(piezaActual, posX, posY);
        eliminarLinea();
        piezaActual = piezaSeguiente; // Use the next piece
        piezaSeguiente = generarPieza(); // Generate a new next piece
        posX = 4;
        posY = 0;


        chequearFinJuego()
    } else {
        posY++;
    }

    // Adjust speed based on nivel
    let newSpeed = getVelocidadJuego(nivel);
    if (newSpeed !== velocidadJuego) {
        velocidadJuego = newSpeed;
        clearInterval(intervalJuego);
        intervalJuego = setInterval(jugar, velocidadJuego);
    }
}


//---------------------------------------------

// END actualizar FUNCTIONS

//---------------------------------------------