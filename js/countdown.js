document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".carousel-card");
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");
  let currentIndex = 0;

  cards.forEach((card) => {
    const day = card.dataset.day; // Tagesnummer aus "data-day" Attribut
    const imagePath = `../assets/covers/${day}.png`;
    card.style.backgroundImage = `url(${imagePath})`;
  });

  document.getElementById("scrollToToday").addEventListener("click", () => {
    const today = new Date().getDate() - 1; // Heutiger Tag (1-basiert zu 0-basiert)
    currentIndex = today; // Direkt auf den Index des heutigen Tages setzen
    updateCarousel();
  });

  document.getElementById("first").addEventListener("click", () => {
    currentIndex = 0; // Index der ersten Karte
    updateCarousel();
  });

  // Aktualisiert die Positionen der Karten
  const updateCarousel = () => {
    cards.forEach((card, index) => {
      card.classList.remove("active", "left", "right", "far-left", "far-right");

      if (index === currentIndex) {
        card.classList.add("active");
      } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
        card.classList.add("left");
      } else if (index === (currentIndex + 1) % cards.length) {
        card.classList.add("right");
      } else if (index === (currentIndex - 2 + cards.length) % cards.length) {
        card.classList.add("far-left");
      } else if (index === (currentIndex + 2) % cards.length) {
        card.classList.add("far-right");
      }
    });
  };

  // Event-Listener für die Pfeile
  leftArrow.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  });

  rightArrow.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  });

  // Initiales Layout
  updateCarousel();
});
