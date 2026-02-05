import {
    obtenerMisMedicinas,
    eliminarMedicina
} from "../../services/medicina.service.js";

import { medicamentosState } from "./medicamentos.state.js";
import { renderMeds } from "./medicamentos.render.js";
import {
    initMedicamentosModal,
    abrirModalEditar
} from "./medicamentos.modal.js";

const container = document.getElementById("medContainer");

export async function cargarMedicamentos() {
    if (medicamentosState.cargando) return;

    medicamentosState.cargando = true;
    medicamentosState.lista = await obtenerMisMedicinas();
    renderMeds(medicamentosState.lista);
    medicamentosState.cargando = false;
}

// Dentro de tu archivo medicamentos.controller.js, en la función initMedicamentos:

export function initMedicamentos() {
    initMedicamentosModal();
    cargarMedicamentos();

    container.addEventListener("click", async (e) => {
        const id = e.target.dataset.id || e.target.closest("button")?.dataset.id;

        // Caso Eliminar (Ya lo tienes)
        if (e.target.classList.contains("btn-delete")) {
            if (!confirm("¿Deseas eliminar esta medicina?")) return;
            await eliminarMedicina(id);
            await cargarMedicamentos();
        }

        // Caso Editar (Ya lo tienes)
        if (e.target.classList.contains("btn-edit")) {
            const med = medicamentosState.lista.find(m => m.id == id);
            abrirModalEditar(med);
        }

        // NUEVO: Caso Alarma (Reloj)
        if (e.target.classList.contains("btn-reminder")) {
            import("./medicamentos.alarma.js").then(module => {
                module.abrirModalAlarma(id);
            });
        }
    });
}
