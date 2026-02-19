import { protectPage } from "../guards/guard.js";
import { STORAGE_KEYS } from "../core/config.js";
import { logout } from "../core/auth.js";
import { obtenerMisDatosPaciente } from "../services/paciente.service.js";

protectPage();

function bloquearNavegacionAtras() {
    history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", () => {
        history.pushState(null, "", window.location.href);
    });
}

const name = localStorage.getItem(STORAGE_KEYS.NAME);

if (!name) {
    logout();
}

const shortName = name.split(" ").slice(0, 2).join(" ");

bloquearNavegacionAtras();

const titleEl = document.querySelector("h1");
const statusEl = document.querySelector(".status");
titleEl.textContent = "Panel de Control";

const medicinasCard = document.querySelector('.service-card.reminders');
const btnLogout = document.getElementById("btnLogout");
const accountMenuWrap = document.getElementById("accountMenuWrap");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const patientDisplayName = document.getElementById("patient-display-name");
const patientAvatar = document.getElementById("patient-avatar");

if (patientDisplayName) {
    patientDisplayName.textContent = shortName;
}

if (patientAvatar) {
    const initials = shortName
        .split(" ")
        .map(part => part[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase();
    patientAvatar.textContent = initials;
}

async function cargarDatosPacienteEnHeader() {
    try {
        const paciente = await obtenerMisDatosPaciente();

        if (!paciente) {
            logout();
            return;
        }

        const nombrePaciente = (paciente.name || shortName).trim();
        const nombreCorto = nombrePaciente.split(" ").slice(0, 2).join(" ");

        if (patientDisplayName) {
            patientDisplayName.textContent = nombreCorto;
        }

        if (patientAvatar) {
            const initials = nombreCorto
                .split(" ")
                .map(part => part[0] || "")
                .join("")
                .substring(0, 2)
                .toUpperCase();
            patientAvatar.textContent = initials;
        }

        if (statusEl) {
            statusEl.textContent = paciente.cuidadorName
                ? `Cuidador: ${paciente.cuidadorName}`
                : "Sin cuidador vinculado";
        }
    } catch (error) {
        console.error(error);
        if (statusEl) {
            statusEl.textContent = "Sin cuidador vinculado";
        }
    }
}

function cerrarAccountMenu() {
    if (!accountMenuWrap || !accountMenuBtn) return;
    accountMenuWrap.classList.remove("open");
    accountMenuBtn.setAttribute("aria-expanded", "false");
}

accountMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = accountMenuWrap.classList.toggle("open");
    accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("click", (e) => {
    if (!accountMenuWrap?.contains(e.target)) {
        cerrarAccountMenu();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarAccountMenu();
});

medicinasCard.addEventListener('click', () => {
    window.location.href = '../pages/medicamentos.html';
});

btnLogout?.addEventListener("click", () => {
    logout();
});

cargarDatosPacienteEnHeader();
