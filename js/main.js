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
      const today = new Date();
      const currentDay = today.getDate(); // Aktueller Tag des Monats
      const currentMonth = today.getMonth(); // 0-basiert (0 = Januar)

      // Benutzer prüfen
      const userData = localStorage.getItem("user");
      if (!userData) {
        showPopup("Bitte logge dich ein, um zu starten!");
        return;
      }

      const user = JSON.parse(userData);
      const loggedIn = localStorage.getItem("loggedIn");

      if (!loggedIn) {
        showPopup("Bitte logge dich ein, um zu starten!");
        return;
      }

      // Prüfen, ob es Dezember ist
      if (currentMonth !== 11) {
        showDecPopup("Es ist noch nicht Dezember! Warte noch ein wenig.");
        return;
      }

      // Prüfen, ob das Rätsel in der Zukunft liegt
      //if (currentRiddle > currentDay) {
      // showDecPopup("Na! Nicht so hastig! Es ist noch nicht so weit!");
      // return;
      //}

      // Prüfen, ob die vorherigen Rätsel gelöst wurden
      if (currentRiddle > user.finishedRiddles + 1) {
        showDecPopup(
          `Rätsel ${currentRiddle} kann noch nicht gelöst werden. Löse zuerst Rätsel ${
            user.finishedRiddles + 1
          }.`,
        );
        return;
      }

      if (currentRiddle <= user.finishedRiddles) {
        window.location.href = `solved.html`;
        return;
      }

      // Weiterleitung zur Rätselseite
      user.currentRiddle = currentRiddle;
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = `day${currentRiddle}.html`;
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

// Funktion, um das Popup zu zeigen
function showDecPopup(message) {
  const popup = document.getElementById("decPopup");
  const popupMessage = document.getElementById("decPopupMessage");
  popupMessage.textContent = message; // Nachricht setzen
  popup.style.display = "flex"; // Popup sichtbar machen
}

// Funktion, um das Popup zu schließen
function closeDecPopup() {
  const popup = document.getElementById("decPopup");
  popup.style.display = "none"; // Popup verstecken
}

// Funktion, um das Popup zu schließen
function closePopup() {
  const popup = document.getElementById("errorPopup");
  popup.style.display = "none"; // Popup verstecken
}

// Event-Listener für den Schließen-Button
document.getElementById("closePopup").addEventListener("click", closePopup);
document.getElementById("closeDecPopup").addEventListener(
  "click",
  closeDecPopup,
);
document.getElementById("loginPopup").addEventListener("click", goTo);

function goTo() {
  window.location.href = "login.html";
}
