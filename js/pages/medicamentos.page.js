import { protectPage } from "../guards/guard.js";
import { initMedicamentos } from "../features/medicamentos/medicamentos.controller.js";
import { cargarDatosPaciente } from "../features/paciente/paciente.controller.js";
import { initAlarmaModal } from "../features/medicamentos/medicamentos.alarma.js"; 

protectPage();

document.addEventListener("DOMContentLoaded", async () => {
    initAlarmaModal();
    await cargarDatosPaciente();
    setTimeout(cargarDatosPaciente, 300);
    await initMedicamentos();
});
