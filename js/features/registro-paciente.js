import { API_BASE_URL } from "../core/config.js";
import { saveSession } from "../core/auth.js";

const form = document.getElementById("registerPacienteForm");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const paciente = {
        name: form.name.value.trim(),
        phoneNumber: form.phoneNumber.value.trim(),
        edad: Number(form.edad.value),
        password: form.password.value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/pacientes/registro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paciente)
        });

        if (!response.ok) {
            throw new Error("Error al registrar paciente");
        }

        const data = await response.json();

        // data = { accessToken, refreshToken }
        saveSession(data);

        // Redirección directa (rol ya validado en JWT)
        window.location.href = "/pages/dashboard-paciente.html";

    } catch (error) {
        console.error(error);
        alert("No se pudo crear la cuenta");
    }
});

document.querySelector(".toggle-password")?.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
});
