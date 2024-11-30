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

// Überprüfen, ob das Puzzle gelöst ist
function checkIfSolved() {
  const solvedImages = [
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

  // Vergleiche aktuelles Puzzle mit der gelösten Reihenfolge
  return images.every((img, index) => img === solvedImages[index]);
}

// Modifiziere die moveTile-Funktion, um zu prüfen, ob das Puzzle gelöst wurde
function moveTile(event) {
  const index = parseInt(event.target.dataset.index, 10);
  const emptyIndex = images.indexOf("");

  const validMoves = [
    emptyIndex - 1, // links
    emptyIndex + 1, // rechts
    emptyIndex - 3, // oben
    emptyIndex + 3, // unten
  ];

  if (validMoves.includes(index) && isValidMove(index, emptyIndex)) {
    [images[index], images[emptyIndex]] = [images[emptyIndex], images[index]];
    renderPuzzle();

    // Nach jedem Zug überprüfen, ob das Puzzle gelöst ist
    if (checkIfSolved()) {
      rightAnswer();
    }
  }
}

// Sicherstellen, dass die Bewegung nicht über das Raster hinausgeht
function isValidMove(tileIndex, emptyIndex) {
  const tileRow = Math.floor(tileIndex / 3);
  const emptyRow = Math.floor(emptyIndex / 3);
  return tileRow === emptyRow || Math.abs(tileIndex - emptyIndex) === 3;
}

renderPuzzle();

function rightAnswer() {
  if (localStorage.getItem("loggedIn")) {
    const userDataRaw = localStorage.getItem("user");
    let userData;
    try {
      userData = userDataRaw ? JSON.parse(userDataRaw) : null;
    } catch (e) {
      console.error("Fehler beim Parsen von LocalStorage-Daten:", e);
      return;
    }

    if (!userData) {
      console.error("Benutzerdaten nicht gefunden.");
      return;
    }

    showPopup(
      "Super du hast dieses Rätsel mit " + userData.tries +
        " Versuchen gelöst.",
      "successPopup",
    );

    //Daten aktualisieren
    userData.finishedRiddles = userData.currentRiddle;
    userData.allTries = userData.allTries + userData.tries;
    userData.tries = 1;

    // Speichere aktualisierte Daten
    localStorage.setItem("user", JSON.stringify(userData));
  } else {
    console.error("Benutzer ist nicht eingeloggt.");
  }

  // Weiterleitung zur Home-Seite
}
