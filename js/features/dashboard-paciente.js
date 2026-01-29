import { protectPage } from "../../guards/guard.js";
import { STORAGE_KEYS } from "../../core/config.js";
import { logout } from "../../core/auth.js";

protectPage();

const name = localStorage.getItem(STORAGE_KEYS.NAME);

if (!name) {
    logout();
}

const shortName = name.split(" ").slice(0, 2).join(" ");


document.querySelector("h1").textContent = `Bienvenido, ${shortName}`;

const medicinasCard = document.querySelector('.service-card.reminders');

medicinasCard.addEventListener('click', () => {
    window.location.href = '../pages/medicamentos.html';
});