import { perfilPacienteState } from "./perfil-paciente.state.js";

function normalizarEnfermedad(valor) {
    return valor
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function crearColorSuaveAleatorio() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(55 + Math.random() * 20);
    const lightness = Math.floor(82 + Math.random() * 10);

    return {
        bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
        border: `hsl(${hue} ${Math.max(42, saturation - 12)}% ${Math.max(66, lightness - 15)}%)`,
        text: "#1f2937"
    };
}

function obtenerEstiloTag(enfermedad) {
    const key = normalizarEnfermedad(enfermedad);

    if (!perfilPacienteState.coloresEnfermedad.has(key)) {
        perfilPacienteState.coloresEnfermedad.set(
            key,
            crearColorSuaveAleatorio()
        );
    }

    return perfilPacienteState.coloresEnfermedad.get(key);
}

export function renderTags() {
    const container = document.getElementById("diseases-container");

    container.innerHTML = perfilPacienteState.enfermedades.map((enf, index) => {
        const estilo = obtenerEstiloTag(enf);

        return `
            <span class="tag"
                  style="--tag-bg:${estilo.bg};--tag-text:${estilo.text};--tag-border:${estilo.border};">
                <span class="tag-text">${enf}</span>
                ${perfilPacienteState.modoEdicion ? `<button type="button"
                                         class="remove-tag"
                                         data-index="${index}"
                                         aria-label="Eliminar enfermedad">x</button>` : ""}
            </span>
        `;
    }).join("");
}

function removeDisease(index) {
    perfilPacienteState.enfermedades.splice(index, 1);
    renderTags();
}

export function handleDiseaseActions(e) {
    const removeBtn = e.target.closest(".remove-tag");
    if (!removeBtn) return;

    const index = Number(removeBtn.dataset.index);
    if (Number.isNaN(index)) return;

    removeDisease(index);
}

export function addDiseaseTag() {
    const input = document.getElementById("new-disease-input");
    const value = input.value.trim();

    if (!value) return;

    const nuevaEnfermedad = normalizarEnfermedad(value);
    const yaExiste = perfilPacienteState.enfermedades.some(
        e => normalizarEnfermedad(e) === nuevaEnfermedad
    );

    if (yaExiste) {
        alert("Esta enfermedad ya está registrada.");
        return;
    }

    perfilPacienteState.enfermedades.push(value);
    renderTags();

    input.value = "";
}
