// Countdown bis Weihnachten
function updateCountdown() {
    const christmas = new Date("December 25, " + new Date().getFullYear() + " 00:00:00").getTime();
    const now = new Date().getTime();
    const timeLeft = christmas - now;

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("countdown").innerHTML = days + " Tage " + hours + " Stunden " + minutes + " Minuten " + seconds + " Sekunden";

    if (timeLeft < 0) {
        document.getElementById("countdown").innerHTML = "Frohe Weihnachten!";
    }
}

setInterval(updateCountdown, 1000);

