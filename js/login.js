document.getElementById("loginForm").addEventListener(
  "submit",
  async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
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
      const user = users.find((user) => user.username === username);

      if (!user) {
        // Benutzername existiert nicht
        message.textContent = "Benutzername ist falsch!";
        message.style.color = "red";
        message.style.display = "block";
      } else if (user.password !== password) {
        // Passwort ist falsch
        message.textContent = "Passwort ist falsch!";
        message.style.color = "red";
        message.style.display = "block";
        // Passwort-Feld leeren
        passwordField.value = "";
      } else {
        // Erfolgreiche Anmeldung
        message.textContent = "Login erfolgreich!";
        message.style.color = "green";
        message.style.display = "block";
        localStorage.setItem("loggedIn", "yes");

        // Benutzer initialisieren, falls noch nicht vorhanden
        if (!localStorage.getItem("user")) {
          setUser(user.username);
        }

        // Weiterleitung zur Startseite
        window.location.href = "home.html";
      }
    } catch (error) {
      // Fehler beim Laden der JSON-Datei
      message.textContent =
        "Es gab ein Problem beim Login. Bitte versuche es später erneut.";
      message.style.color = "red";
      message.style.display = "block";
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
