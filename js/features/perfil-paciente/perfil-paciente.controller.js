import {
    obtenerPacientePorId,
    actualizarPacienteDesdeCuidador
} from "../../services/cuidador.service.js";
import { perfilPacienteState } from "./perfil-paciente.state.js";
import {
    renderTags,
    addDiseaseTag,
    handleDiseaseActions
} from "./perfil-paciente.tags.js";
import {
    obtenerPacienteIdDesdeURL,
    setHeaderPaciente,
    setFormularioPaciente,
    getFormularioPacienteDTO,
    mostrarPerfilCargado
} from "./perfil-paciente.dom.js";
import {
    toggleEdit,
    togglePhoneVisibility,
    toggleCurpVisibility,
    initVisibilityButtons,
    cancelEdit
} from "./perfil-paciente.edit.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function esErrorRedFetch(error) {
    const message = String(error?.message || "").toLowerCase();
    return error?.name === "AbortError"
        || (error instanceof TypeError && message.includes("failed to fetch"));
}

async function obtenerPacienteConRetry(pacienteId, retries = 1) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await obtenerPacientePorId(pacienteId);
        } catch (error) {
            lastError = error;
            if (!esErrorRedFetch(error) || attempt === retries) {
                throw error;
            }
            await sleep(300);
        }
    }

    throw lastError;
}

async function cargarPerfil() {
    try {
        const pacienteId = obtenerPacienteIdDesdeURL();

        if (!pacienteId) {
            alert("Paciente no especificado");
            return;
        }

        const data = await obtenerPacienteConRetry(pacienteId, 1);
        setHeaderPaciente(data.name);
        setFormularioPaciente(data);

        perfilPacienteState.enfermedades = [...(data.enfermedadesCronicas || [])];
        renderTags();
        mostrarPerfilCargado();
    } catch (error) {
        if (esErrorRedFetch(error)) {
            alert("No se pudo conectar al servidor. Intenta recargar en unos segundos.");
            return;
        }

        alert(error.message);
        console.error(error);
    }
}

async function guardarCambiosPaciente(e) {
    e.preventDefault();

    if (!perfilPacienteState.modoEdicion) return;

    const pacienteId = obtenerPacienteIdDesdeURL();

    if (!pacienteId) {
        alert("Paciente no especificado");
        return;
    }

    const dto = getFormularioPacienteDTO(perfilPacienteState.enfermedades);

    try {
        const actualizado = await actualizarPacienteDesdeCuidador(pacienteId, dto);

        setHeaderPaciente(actualizado.name);

        toggleEdit();
        alert("Datos del paciente actualizados correctamente");

    } catch (error) {
        console.error(error);
        alert(error.message || "No se pudo actualizar el paciente");
    }
}


export function initPerfilPaciente() {
    initVisibilityButtons();

    document.getElementById("edit-btn")
        .addEventListener("click", toggleEdit);

    document.getElementById("toggle-phone")
        .addEventListener("click", togglePhoneVisibility);

    document.getElementById("toggle-curp")
        .addEventListener("click", toggleCurpVisibility);

    document.querySelector(".btn-add-tag")
        .addEventListener("click", addDiseaseTag);

    document.querySelector(".btn-cancel-flat")
        .addEventListener("click", cancelEdit);

    document.getElementById("profile-form")
        .addEventListener("submit", guardarCambiosPaciente);

    document.getElementById("diseases-container")
        .addEventListener("click", handleDiseaseActions);

    cargarPerfil();
}
