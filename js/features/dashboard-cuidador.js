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
const togglePasswordBtn = document.getElementById("togglePasswordBtn");
const passwordInput = document.getElementById("password");
const passwordGroup = document.querySelector(".password-group");
const patientContainer = document.getElementById("patient-list-container");
const patientCount = document.getElementById("patient-count");
const btnCopy = document.getElementById("btnCopy");
const linkCode = document.getElementById("link-code");

protectPage();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function esErrorRedFetch(error) {
    const message = String(error?.message || "").toLowerCase();
    return error?.name === "AbortError"
        || (error instanceof TypeError && message.includes("failed to fetch"));
}

async function conRetry(operacion, retries = 1) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await operacion();
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

function setPacientesLoading(loading) {
    if (loading) {
        patientContainer.innerHTML = `
            <div class="patients-loading">Cargando pacientes...</div>
        `;
    }
}

btnAddPatient.addEventListener("click", () => {
    modal.style.display = "flex";
});

btnCloseModal.addEventListener("click", cerrarModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
});

// Toggle del candado de contraseña
togglePasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordGroup.classList.add("visible");
    } else {
        passwordInput.type = "password";
        passwordGroup.classList.remove("visible");
    }
});

// Copiar código de vinculación
btnCopy.addEventListener("click", async () => {
    const codigoTexto = linkCode.textContent.trim();

    if (!codigoTexto) {
        alert("El código aún no está disponible");
        return;
    }

    try {
        await navigator.clipboard.writeText(codigoTexto);

        // Feedback visual
        const originalTitle = btnCopy.title;
        btnCopy.title = "¡Copiado!";
        btnCopy.style.color = "var(--accent-lime)";

        setTimeout(() => {
            btnCopy.title = originalTitle;
            btnCopy.style.color = "";
        }, 2000);
    } catch (error) {
        console.error("Error al copiar:", error);
        alert("No se pudo copiar el código. Intenta de nuevo.");
    }
});


async function cargarDatosCuidador() {
    try {
        const cuidador = await conRetry(() => obtenerMisDatosCuidador(), 1);

        const nombreCorto = cuidador.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ");

        document.getElementById("caregiver-name").textContent = nombreCorto;
        document.getElementById("link-code").textContent =
            cuidador.codigoVinculacion;

    } catch (error) {
        if (esErrorRedFetch(error)) {
            console.warn("Error de red temporal al cargar datos del cuidador.");
            return;
        }

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
    };

    try {
        await registrarPacienteDesdeCuidador(dto);

        alert("Paciente registrado con éxito");
        cerrarModal();
        await cargarPacientes();

    } catch (error) {
        console.error("Error al registrar:", error);
        alert(error.message || "Error al registrar paciente");
    }
});

async function cargarPacientes() {
    setPacientesLoading(true);

    try {
        const pacientes = await conRetry(() => obtenerPacientesDelCuidador(), 1);

        patientCount.textContent =
            `Pacientes Asignados (${pacientes.length})`;

        patientContainer.innerHTML = "";

        if (!pacientes.length) {
            patientContainer.innerHTML = `
                <div class="patients-loading">No hay pacientes registrados todavia.</div>
            `;
            return;
        }

        pacientes.forEach(p => {
            const initials = p.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

            const enfermedades = p.enfermedadesCronicas || [];
            const enfermedadesVisibles = enfermedades.slice(0, 3);
            const enfermedadesOcultas = enfermedades.slice(3);

            const card = document.createElement("div");
            card.className = "patient-card";

            card.innerHTML = `
                <div style="display: flex; align-items: center; width: 100%; margin-bottom: 0.8rem;">
                    <div class="patient-avatar">${initials}</div>
                    <div class="patient-info" style="flex: 1;">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                            <h4 style="margin: 0;">
                                ${p.name}, 
                                <span class="patient-age-inline">
                                    ${p.edad ?? "N/A"} años
                                </span>
                            </h4>
                            <span class="status-badge">Estable</span>
                        </div>

                        <div class="patient-conditions">
                            ${enfermedadesVisibles.map(e =>
                                `<span class="condition-badge">${e}</span>`
                            ).join("")}

                            ${enfermedades.length > 3
                                ? `<button class="btn-see-more" data-expanded="false">
                                        +${enfermedadesOcultas.length}
                                   </button>`
                                : ""
                            }
                        </div>
                    </div>
                </div>

                <div class="patient-actions">
                    <button class="btn-action btn-profile" data-id="${p.id}">
                        Ver Perfil
                    </button>

                    <button class="btn-action btn-medicine" data-id="${p.id}">
                        Medicinas
                    </button>

                    <button class="btn-action btn-notes">
                        Notas
                    </button>

                    <button class="btn-action btn-menu">
                        ⋮
                    </button>
                </div>
            `;

            // 🔹 Navegación a perfil
            card.querySelector(".btn-profile")
                .addEventListener("click", () => {
                    window.location.href =
                        `../../pages/perfil-paciente.html?id=${p.id}`;
                });

            // 🔹 Expandir / contraer enfermedades
            const btnSeeMore = card.querySelector(".btn-see-more");

            if (btnSeeMore) {
                btnSeeMore.addEventListener("click", function () {
                    const expanded = this.dataset.expanded === "true";
                    const conditionsDiv =
                        card.querySelector(".patient-conditions");

                    if (expanded) {
                        conditionsDiv.innerHTML = `
                            ${enfermedadesVisibles.map(e =>
                                `<span class="condition-badge">${e}</span>`
                            ).join("")}
                            <button class="btn-see-more" data-expanded="false">
                                +${enfermedadesOcultas.length}
                            </button>
                        `;
                    } else {
                        conditionsDiv.innerHTML = `
                            ${enfermedades.map(e =>
                                `<span class="condition-badge">${e}</span>`
                            ).join("")}
                            <button class="btn-see-more" data-expanded="true">
                                - Menos
                            </button>
                        `;
                    }

                    // Volver a enlazar evento
                    conditionsDiv.querySelector(".btn-see-more")
                        .addEventListener("click", arguments.callee);
                });
            }

            patientContainer.appendChild(card);
        });

    } catch (error) {
        if (esErrorRedFetch(error)) {
            patientContainer.innerHTML = "";
            alert("No se pudo conectar al servidor. Intenta recargar en unos segundos.");
            return;
        }

        patientContainer.innerHTML = "";
        console.error("Error cargando pacientes:", error);
        alert("No se pudieron cargar los pacientes.");
    }
}



function cerrarModal() {
    modal.style.display = "none";
    registerForm.reset();
    passwordInput.type = "password";
    passwordGroup.classList.remove("visible");
}


cargarDatosCuidador();
cargarPacientes();
