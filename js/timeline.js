document.addEventListener("DOMContentLoaded", () => {
  const progressElement = document.getElementById("progress");
  const countdownTextElement = document.getElementById("countdown-text");

  function updateTimeline() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 11, 1); // 1. Dezember
    const endDate = new Date(now.getFullYear(), 11, 24); // 24. Dezember

    if (now < startDate) {
      countdownTextElement.textContent = "Noch nicht Dezember!";
      progressElement.style.width = "0%";
      return;
    }

    if (now > endDate) {
      countdownTextElement.textContent = "Frohe Weihnachten!";
      progressElement.style.width = "100%";
      return;
    }

    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24); // Gesamtanzahl Tage
    const elapsedDays = (now - startDate) / (1000 * 60 * 60 * 24); // Vergangene Tage
    const progressPercent = (elapsedDays / totalDays) * 100;

    countdownTextElement.textContent = `Noch ${
      24 - now.getDate()
    } Tage bis Weihnachten!`;
    progressElement.style.width = `${progressPercent}%`;
  }

  updateTimeline();
  setInterval(updateTimeline, 1000 * 60); // Aktualisiere jede Minute
});
