let tiles = [];
let spawnPositions = [0, 100, 200, 300];
let canvasContainer, canvasWidth, canvasHeight;
let removedTiles = 0; // Anzahl der entfernten Kacheln
const winCondition = 40; // Anzahl der Kacheln, um zu gewinnen

function Tile(x) {
  this.w = 80;
  this.h = 100;
  this.x = x;
  this.y = -this.h;
  this.moveSpeed = 4;

  // Farben definieren
  const colors = [
    "#9E3D1A", // Weihnachtsgrün
    "#782e13", // Dunkles Weihnachtsgrün
    "#D9BFB1", // Weihnachtliches Rot
    "#9F8446", // Gold
  ];
  this.color = random(colors); // Zufällige Farbe wählen

  this.show = function () {
    fill(this.color); // Blockfarbe setzen
    noStroke();
    rect(this.x, this.y, this.w, this.h);
  };

  this.move = function () {
    this.y += this.moveSpeed;
  };

  this.clicked = function (mx, my) {
    return mx > this.x && mx < this.x + this.w && my > this.y &&
      my < this.y + this.h;
  };

  this.checkOffScreen = function () {
    if (this.y > canvasHeight) {
      gameOver();
    }
  };
}

function spawnTile() {
  let validPosition = false;
  let newX;

  // Finde eine gültige Position, die nicht von einem anderen Tile belegt ist
  while (!validPosition) {
    newX = random(spawnPositions);
    validPosition = !tiles.some((tile) =>
      tile.x === newX && tile.y === -tile.h
    );
  }

  // Erstelle das Tile mit der gültigen Position
  tiles.push(new Tile(newX));
}

function setup() {
  canvasContainer = document.querySelector(".riddle-container");
  canvasWidth = 400;
  canvasHeight = 400;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(canvasContainer);

  resetGame();
}

function draw() {
  background(255);

  for (let i = tiles.length - 1; i >= 0; i--) {
    tiles[i].show();
    tiles[i].move();
    tiles[i].checkOffScreen();
  }

  if (frameCount % 60 === 0) {
    spawnTile(); // Verwende die neue Funktion
  }
}

function touchStarted() {
  if (touches.length > 0) { // Prüfen, ob es einen Touch gibt
    const touchX = touches[0].x;
    const touchY = touches[0].y;

    for (let i = tiles.length - 1; i >= 0; i--) {
      if (tiles[i].clicked(touchX, touchY)) {
        tiles.splice(i, 1);
        removedTiles++;
        checkWinCondition();
        return;
      }
    }
    // Keine Reaktion bei Touch außerhalb eines Tiles
  }
}

// mousePressed bleibt bestehen, falls jemand mit Maus spielt
function mousePressed() {
  touchStarted(); // Ruft die gleiche Logik auf wie bei Touch-Ereignissen
}

function checkWinCondition() {
  if (removedTiles >= winCondition) {
    showPopup("successPopup"); // Zeigt das "Gewonnen"-Popup an
    noLoop(); // Stoppt das Spiel
  }
}

function gameOver() {
  removedTiles = 0;
  noLoop();
  showPopup("errorPopup"); // Zeigt das "Game Over"-Popup an
}

function resetGame() {
  tiles = [];
  removedTiles = 0;
  spawnTile(); // Starte mit einem neuen Tile
  loop(); // Startet das Spiel neu
}

function showPopup(popupId) {
  document.getElementById(popupId).style.display = "flex";
}

function closePopup(popupId) {
  document.getElementById(popupId).style.display = "none";
  resetGame();
}

// Event-Listener für "Schließen"-Buttons
document.getElementById("closePopup").addEventListener(
  "click",
  () => closePopup("errorPopup"),
);
document.getElementById("retryButton").addEventListener(
  "click",
  () => closePopup("errorPopup"),
);
