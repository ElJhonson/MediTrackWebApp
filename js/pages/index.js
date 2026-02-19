import {
    AUTH_ENDPOINTS,
    STORAGE_KEYS,
    ROLES,
    ROUTES
} from "/js/core/config.js"; import {
    saveSession,
    isAuthenticated,
    startSessionExpiryWatcher
} from "/js/core/auth.js";

const loginForm = document.getElementById("loginForm");
const phoneInput = document.getElementById("phoneNumber");
const passwordInput = document.getElementById("password");

function redirectIfAuthenticated() {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

    if (!token) return;

    if (!isAuthenticated()) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.ROLE);
        localStorage.removeItem(STORAGE_KEYS.NAME);
        return;
    }

    startSessionExpiryWatcher();

    if (rol === ROLES.PACIENTE) {
        window.location.replace(ROUTES.DASHBOARD_PACIENTE);
        return;
    }

    if (rol === ROLES.CUIDADOR) {
        window.location.replace(ROUTES.DASHBOARD_CUIDADOR);
    }
}

redirectIfAuthenticated();
window.addEventListener("pageshow", redirectIfAuthenticated);

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneNumber = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!phoneNumber || !password) {
        alert("Todos los campos son obligatorios");
        return;
    }

    try {
        const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phoneNumber, password })
        });

        if (!response.ok) {
            alert("Credenciales incorrectas");
            return;
        }

        const data = await response.json();
        saveSession(data);

        const rol = localStorage.getItem(STORAGE_KEYS.ROLE);

        switch (rol) {
            case ROLES.PACIENTE:
                window.location.replace(ROUTES.DASHBOARD_PACIENTE);
                break;

            case ROLES.CUIDADOR:
                window.location.replace(ROUTES.DASHBOARD_CUIDADOR);
                break;

            default:
                alert('Rol no reconocido:', rol);
                window.location.replace(ROUTES.LOGIN);
        }

    } catch (error) {
        console.error(error);
        alert("Error de conexión con el servidor");
    }
});


// mostrar - ocultar password
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordGroup = document.querySelector(".password-group");

togglePasswordBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordGroup.classList.add("visible");
    } else {
        passwordInput.type = "password";
        passwordGroup.classList.remove("visible");
    }
});

const modal = document.getElementById("roleModal");
const btnOpen = document.getElementById("btnOpenModal");
const btnClose = document.getElementById("btnCloseModal");

// modal
btnOpen.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("active");
});

btnClose.addEventListener("click", () => {
    modal.classList.remove("active");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});
