import { API_BASE_URL } from "../js/config.js";
import { saveSession } from "../js/auth.js";

const form = document.getElementById("registerCuidadorForm");
const passwordInput = document.getElementById("password");

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

        window.location.href = "../pages/dashboard-cuidador.html";

    } catch (error) {
        alert("No se pudo crear la cuenta");
        console.error(error);
    }
});
document.querySelector(".toggle-password")?.addEventListener("click", () => {
    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
});