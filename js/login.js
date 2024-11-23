document.getElementById("loginForm").addEventListener(
  "submit",
  async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const passwordField = document.getElementById("password");
    const password = passwordField.value.trim();
    const message = document.getElementById("message");

    try {
      // JSON-Daten laden
      const response = await fetch("../data/users.json");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Benutzerdaten.");
      }

      const users = await response.json();

      // Benutzer überprüfen
      const user = users.find(
        (user) => user.username === username && user.password === password,
      );

      if (user) {
        // Erfolgreiche Anmeldung
        message.textContent = "Login erfolgreich!";
        message.style.color = "green"; // Grüne Farbe für Erfolg
        message.style.display = "block"; // Fehler sichtbar machen
        localStorage.setItem("loggedIn", "yes");

        // Benutzer initialisieren, falls noch nicht vorhanden
        if (!localStorage.getItem("user")) {
          setUser(user.username);
        }

        // Weiterleitung zur Startseite
        window.location.href = "home.html";
      } else {
        // Benutzername oder Passwort falsch
        message.textContent = "Benutzername oder Passwort ist falsch!";
        message.style.color = "red"; // Rote Farbe für Fehler
        message.style.display = "block"; // Fehler sichtbar machen
        // Passwort-Feld leeren
        passwordField.value = "";
      }
    } catch (error) {
      // Fehler beim Laden der JSON-Datei
      message.textContent = `"Benutzername oder Passwort ist falsch!"`;
      message.style.color = "red"; // Rote Farbe für Fehler
      message.style.display = "block"; // Fehler sichtbar machen
    }
  },
);

// Funktion: Benutzer initialisieren
function setUser(username) {
  const initialUser = {
    username: username,
    finishedRiddles: 0,
    currentRiddle: 0,
    tries: 1,
    allTries: 0,
  };
  localStorage.setItem("user", JSON.stringify(initialUser));
}
