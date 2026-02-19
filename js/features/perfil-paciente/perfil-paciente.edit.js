import { perfilPacienteState } from "./perfil-paciente.state.js";
import { renderTags } from "./perfil-paciente.tags.js";

const EYE_OPEN_SVG = `
<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
</svg>`;

const EYE_CLOSED_SVG = `
<svg class="eye-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 3l18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
    <path d="M2 12s3.5-6 10-6c2.2 0 4.1.7 5.7 1.7M22 12s-3.5 6-10 6c-2.2 0-4.1-.7-5.7-1.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`;

function setEyeButtonIcon(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(buttonId);
    const visible = input.type === "text";

    btn.innerHTML = visible ? EYE_OPEN_SVG : EYE_CLOSED_SVG;
    btn.setAttribute(
        "aria-label",
        visible ? "Ocultar contenido" : "Mostrar contenido"
    );
}

function toggleInputVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);

    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    setEyeButtonIcon(inputId, buttonId);
}

function actualizarCamposEdicion() {
    document.querySelectorAll("#profile-form input")
        .forEach(input => {
            input.disabled = !perfilPacienteState.modoEdicion;
        });

    document.getElementById("actions-bar")
        .classList.toggle("hidden", !perfilPacienteState.modoEdicion);

    document.getElementById("add-disease-box")
        .classList.toggle("hidden", !perfilPacienteState.modoEdicion);

    document.getElementById("edit-btn").innerText =
        perfilPacienteState.modoEdicion ? "Viendo Perfil" : "Editar Perfil";
}

export function toggleEdit() {
    perfilPacienteState.modoEdicion = !perfilPacienteState.modoEdicion;
    actualizarCamposEdicion();
    renderTags();
}

export function togglePhoneVisibility() {
    toggleInputVisibility("phoneNumber", "toggle-phone");
}

export function toggleCurpVisibility() {
    toggleInputVisibility("curp", "toggle-curp");
}

export function initVisibilityButtons() {
    setEyeButtonIcon("phoneNumber", "toggle-phone");
    setEyeButtonIcon("curp", "toggle-curp");
}

export function cancelEdit() {
    if (confirm("Descartar cambios?")) {
        location.reload();
    }
}
