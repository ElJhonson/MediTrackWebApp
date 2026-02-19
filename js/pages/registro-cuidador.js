import { API_BASE_URL } from "../core/config.js";
import { saveSession } from "../core/auth.js";

const form = document.getElementById("registerCuidadorForm");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordGroup = document.querySelector(".password-group");

// Toggle de contraseña
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cuidador = {
        name: form.name.value,
        phoneNumber: form.phoneNumber.value,
        relacionConPaciente: form.relacionConPaciente.value,
        password: form.password.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/cuidadores/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuidador)
        });

        if (!response.ok) {
            throw new Error("Error al registrar cuidador");
        }

        const data = await response.json();

        saveSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
        });

        window.location.replace("../pages/dashboard-cuidador.html");

    } catch (error) {
        alert("No se pudo crear la cuenta");
        console.error(error);
    }
});
