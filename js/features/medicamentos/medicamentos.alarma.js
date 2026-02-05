import { crearAlarmaConfig } from "../../services/alarma.service.js";
import { medicamentosState } from "./medicamentos.state.js";

const modal = document.getElementById("modalAlarma");
const form = document.getElementById("alarmaForm");

export function initAlarmaModal() {
    // Cerrar modal
    document.getElementById("btnCloseAlarma").onclick = () => {
        modal.classList.remove("active");
    };

    // Manejar el envío del formulario
    form.onsubmit = async (e) => {
        e.preventDefault();

        const dto = {
            medicinaId: Number(document.getElementById("alarmaMedicinaId").value),
            fechaInicio: document.getElementById("fechaInicio").value,
            fechaFin: document.getElementById("fechaFin").value,
            frecuenciaHoras: Number(document.getElementById("frecuenciaHoras").value)
        };


        try {
            await crearAlarmaConfig(dto);
            alert("¡Alarma configurada con éxito!");
            modal.classList.remove("active");
            form.reset();
        } catch (error) {
            console.error("Error al configurar alarma:", error);
            alert("Hubo un error al guardar la alarma.");
        }
    };
}

// Función que llamarás desde el botón del reloj (Render)
export function abrirModalAlarma(medicinaId) {
    form.reset();
    document.getElementById("alarmaMedicinaId").value = medicinaId;
    modal.classList.add("active");
}