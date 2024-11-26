const container = document.getElementById("puzzle-container");

// Pfade zu den Bildern
const images = [
  "../assets/schiebepuzzle/1.png",
  "../assets/schiebepuzzle/2.png",
  "../assets/schiebepuzzle/3.png",
  "../assets/schiebepuzzle/4.png",
  "../assets/schiebepuzzle/5.png",
  "../assets/schiebepuzzle/6.png",
  "../assets/schiebepuzzle/7.png",
  "../assets/schiebepuzzle/8.png",
  "", // Leeres Feld
];

// Mischen
images.sort(() => Math.random() - 0.5);

// Rendern des Puzzles
function renderPuzzle() {
  container.innerHTML = ""; // Puzzle leeren
  images.forEach((src, index) => {
    const tile = document.createElement("div");
    tile.className = "puzzle-tile";
    if (src) {
      tile.style.backgroundImage = `url(${src})`;
    } else {
      tile.classList.add("hidden"); // Leeres Feld
    }
    tile.dataset.index = index;
    tile.addEventListener("click", moveTile);
    container.appendChild(tile);
  });
}

// Bewegung der Felder
function moveTile(event) {
  const index = parseInt(event.target.dataset.index, 10);
  const emptyIndex = images.indexOf("");

  const validMoves = [
    emptyIndex - 1, // links
    emptyIndex + 1, // rechts
    emptyIndex - 3, // oben
    emptyIndex + 3, // unten
  ];

  // Überprüfen, ob das Feld verschoben werden kann
  if (validMoves.includes(index) && isValidMove(index, emptyIndex)) {
    [images[index], images[emptyIndex]] = [images[emptyIndex], images[index]];
    renderPuzzle(); // Puzzle neu rendern
  }
}

// Sicherstellen, dass die Bewegung nicht über das Raster hinausgeht
function isValidMove(tileIndex, emptyIndex) {
  const tileRow = Math.floor(tileIndex / 3);
  const emptyRow = Math.floor(emptyIndex / 3);
  return tileRow === emptyRow || Math.abs(tileIndex - emptyIndex) === 3;
}

renderPuzzle();
