document.addEventListener("DOMContentLoaded", () => {
  const checkAnswerButton = document.getElementById("checkAnswerButton");
  const answerInput = document.getElementById("answerInput");
  const errorPopup = document.getElementById("errorPopup");
  const closeErrorPopup = document.getElementById("closePopup");
  let correctAnswers = []; // Wird aus der JSON-Datei geladen
  const userData = JSON.parse(localStorage.getItem("user"));
  const currentRiddleId = userData.currentRiddle;

  updateAttemptDisplay();

  // Lösungen aus JSON laden
  fetch("../data/solutions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Lösungen.");
      }
      return response.json();
    })
    .then((data) => {
      // Finde die Antworten für das aktuelle Rätsel
      const riddle = data.find((item) => item.riddle === currentRiddleId);
      if (riddle) {
        correctAnswers = riddle.answers;
      } else {
        console.error("Rätsel nicht in JSON gefunden." + currentRiddleId);
      }
    })
    .catch((error) => {
      console.error("Fehler beim Laden der JSON-Datei:", error);
    });

  // Antwort prüfen
  checkAnswerButton.addEventListener("click", () => {
    const userAnswer = answerInput.value.trim().toLowerCase();

    if (correctAnswers.includes(userAnswer)) {
      rightAnswer(); // Richtig
    } else {
      wrongAnswer();
    }
  });

  // Popup schließen
  closeErrorPopup.addEventListener("click", () => closePopup(errorPopup));
});

// Event-Listener für die Buttons
document.getElementById("rightButton").addEventListener("click", function () {
  rightAnswer();
});

document.getElementById("wrongButton1").addEventListener("click", function () {
  wrongAnswer();
});

document.getElementById("wrongButton2").addEventListener("click", function () {
  wrongAnswer();
});

function wrongAnswer() {
  // Daten aus LocalStorage abrufen und parsen
  const userData = JSON.parse(localStorage.getItem("user"));
  userData.tries = parseInt(userData.tries) + 1;
  // Aktualisierte Daten zurück in LocalStorage speichern
  localStorage.setItem("user", JSON.stringify(userData));
  showPopup("Das war leider falsch! Versuch es nochmal.", "errorPopup");
  updateAttemptDisplay();
}

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

// Funktion, um das Popup zu zeigen
function showPopup(message, id) {
  const popup = document.getElementById(id);
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.textContent = message; // Nachricht setzen
  popup.style.display = "flex"; // Popup sichtbar machen
}

// Funktion, um das Popup zu schließen
function closePopup() {
  const popup = document.getElementById("errorPopup");
  popup.style.display = "none"; // Popup verstecken
}

function updateAttemptDisplay() {
  const userDataRaw = localStorage.getItem("user");
  const attemptDisplay = document.getElementById("attemptDisplay"); // Element holen

  if (!userDataRaw) {
    console.error("Benutzerdaten nicht im LocalStorage gefunden.");
    attemptDisplay.textContent = "Versuch 0";
    return;
  }

  try {
    const userData = JSON.parse(userDataRaw);
    if (userData.tries !== undefined) {
      attemptDisplay.textContent = `Versuch ${userData.tries}`;
    } else {
      console.error("Versuche nicht definiert in Benutzerdaten.");
      attemptDisplay.textContent = "Versuch 0";
    }
  } catch (e) {
    console.error("Fehler beim Parsen von LocalStorage-Daten:", e);
    attemptDisplay.textContent = "Versuch 0";
  }
}

// Event-Listener für den Schließen-Button
document.getElementById("closePopup").addEventListener("click", closePopup);
