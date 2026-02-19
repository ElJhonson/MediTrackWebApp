import { protectPage } from "../guards/guard.js";
import { initPerfilPaciente } from "../features/perfil-paciente/perfil-paciente.controller.js";

protectPage();

document.addEventListener("DOMContentLoaded", () => {
    initPerfilPaciente();
});
