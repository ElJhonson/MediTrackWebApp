import { protectPage } from "../guards/guard.js";
import { logout } from "../core/auth.js";
import {
    obtenerMisDatosCuidador,
    obtenerPacientesDelCuidador,
    registrarPacienteDesdeCuidador,
    obtenerPacientePorId
} from "../services/cuidador.service.js";

const btnAddPatient = document.querySelector(".btn-add-patient");
const modal = document.getElementById("modalRegister");
const btnCloseModal = document.getElementById("btnCloseModal");
const registerForm = document.getElementById("registerPacienteForm");

protectPage();

btnAddPatient.addEventListener("click", () => {
    modal.style.display = "flex";
});

btnCloseModal.addEventListener("click", cerrarModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
});


async function cargarDatosCuidador() {
    try {
        const cuidador = await obtenerMisDatosCuidador();

        const nombreCorto = cuidador.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ");

        document.getElementById("caregiver-name").textContent = nombreCorto;
        document.getElementById("link-code").textContent =
            cuidador.codigoVinculacion;

    } catch (error) {
        console.error(error);
        logout();
    }
}

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dto = {
        name: registerForm.name.value.trim(),
        phoneNumber: registerForm.phoneNumber.value.trim(),
        edad: Number(registerForm.edad.value),
        password: registerForm.password.value
        // cuidadorId NO se envía
    };

    try {
        await registrarPacienteDesdeCuidador(dto);

        alert("Paciente registrado con éxito");

        cerrarModal();


    } catch (error) {
        console.error("Error al registrar:", error);
        alert(error.message || "Error al registrar paciente");
    }
});

function cerrarModal() {
    modal.style.display = "none";
    registerForm.reset();
}


cargarDatosCuidador();
