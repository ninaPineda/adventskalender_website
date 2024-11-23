document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".carousel-card");
  // Login-Text setzen
  setLoginText();

  // Login-Button Event-Listener
  document.getElementById("loginButton").addEventListener("click", function () {
    const loggedIn = localStorage.getItem("loggedIn");
    if (loggedIn) {
      localStorage.removeItem("loggedIn");
      setLoginText();
      document.getElementById("message").textContent =
        "Erfolgreich abgemeldet!";
    } else {
      window.location.href = "login.html";
    }
  });

  // Klick-Events für Felder
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const currentRiddle = parseInt(card.id, 10); // ID des Feldes ist die Zahl

      // Benutzer aus localStorage abrufen und aktualisieren
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const loggedIn = localStorage.getItem("loggedIn");

        if (loggedIn) {
          // Überprüfen, ob das aktuelle Rätsel gelöst werden darf
          if (currentRiddle === user.finishedRiddles + 1) {
            // Weiterleitung zur Rätselseite
            user.currentRiddle = currentRiddle;
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = `day${currentRiddle}.html`;
          } else if (currentRiddle <= user.finishedRiddles) {
            window.location.href = `solved.html`;
          } else {
            showPopup(
              `Rätsel ${currentRiddle} kann noch nicht gelöst werden. Löse zuerst Rätsel ${
                user.finishedRiddles + 1
              }.`,
            );
          }
        } else {
          showPopup("Bitte logge dich ein, um zu starten!");
        }
      } else {
        showPopup("Bitte logge dich ein, um zu starten!");
      }
    });
  });
});

function setLoginText() {
  const loggedIn = localStorage.getItem("loggedIn");
  const loginButton = document.getElementById("loginButton");

  // Entferne vorherige Inhalte
  loginButton.innerHTML = "";

  // Füge das passende Icon hinzu
  const icon = document.createElement("i");
  icon.className = loggedIn ? "fas fa-sign-out-alt" : "fas fa-sign-in-alt";
  loginButton.appendChild(icon);
}

// Funktion, um das Popup zu zeigen
function showPopup(message) {
  const popup = document.getElementById("errorPopup");
  const popupMessage = document.getElementById("popupMessage");
  popupMessage.textContent = message; // Nachricht setzen
  popup.style.display = "flex"; // Popup sichtbar machen
}

// Funktion, um das Popup zu schließen
function closePopup() {
  const popup = document.getElementById("errorPopup");
  popup.style.display = "none"; // Popup verstecken
}

// Event-Listener für den Schließen-Button
document.getElementById("closePopup").addEventListener("click", closePopup);
document.getElementById("loginPopup").addEventListener("click", goTo);

function goTo() {
  window.location.href = "login.html";
}
