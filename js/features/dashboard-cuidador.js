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
const btnLogout = document.getElementById("btnLogout");
const accountMenuWrap = document.getElementById("accountMenuWrap");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const caregiverAvatar = document.getElementById("caregiver-avatar");

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

function normalizarEnfermedad(texto = "") {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function hashTexto(texto) {
    return [...texto].reduce(
        (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
        0
    );
}

function obtenerEstiloEnfermedad(enfermedad) {
    const clave = normalizarEnfermedad(enfermedad);
    const hash = Math.abs(hashTexto(clave));
    const hue = hash % 360;
    const saturation = 58 + (hash % 16);
    const lightness = 82 + (hash % 10);

    return {
        bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
        border: `hsl(${hue} ${Math.max(42, saturation - 12)}% ${Math.max(66, lightness - 15)}%)`,
        text: "#1f2937"
    };
}

function renderEnfermedades(enfermedades = [], expanded = false) {
    if (!enfermedades.length) {
        return `
            <span class="condition-badge condition-empty">
                Sin enfermedades registradas
            </span>
        `;
    }

    const visibles = expanded ? enfermedades : enfermedades.slice(0, 3);
    const faltantes = Math.max(enfermedades.length - 3, 0);

    const tags = visibles.map(e => {
        const estilo = obtenerEstiloEnfermedad(e);
        return `
        <span class="condition-badge"
              style="--tag-bg:${estilo.bg};--tag-text:${estilo.text};--tag-border:${estilo.border};">${e}</span>
    `;
    }).join("");

    if (enfermedades.length <= 3) return tags;

    const boton = expanded
        ? `<button class="btn-see-more" data-expanded="true">- Menos</button>`
        : `<button class="btn-see-more" data-expanded="false">+${faltantes}</button>`;

    return `${tags}${boton}`;
}

btnAddPatient.addEventListener("click", () => {
    modal.style.display = "flex";
});

btnCloseModal.addEventListener("click", cerrarModal);
btnLogout?.addEventListener("click", () => {
    logout();
});

function cerrarAccountMenu() {
    if (!accountMenuWrap || !accountMenuBtn) return;
    accountMenuWrap.classList.remove("open");
    accountMenuBtn.setAttribute("aria-expanded", "false");
}

accountMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    const isOpen = accountMenuWrap.classList.toggle("open");
    accountMenuBtn.setAttribute("aria-expanded", String(isOpen));
});

window.addEventListener("click", (e) => {
    if (!accountMenuWrap?.contains(e.target)) {
        cerrarAccountMenu();
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarAccountMenu();
});

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

        const initials = nombreCorto
            .split(" ")
            .map(part => part[0] || "")
            .join("")
            .substring(0, 2)
            .toUpperCase();
        if (caregiverAvatar) caregiverAvatar.textContent = initials;

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
        const pacientesConDetalle = await Promise.all(
            pacientes.map(async (paciente) => {
                const enfermedadesLista = Array.isArray(paciente.enfermedadesCronicas)
                    ? paciente.enfermedadesCronicas
                    : [];

                if (enfermedadesLista.length > 0) {
                    return paciente;
                }

                try {
                    const detalle = await conRetry(
                        () => obtenerPacientePorId(paciente.id),
                        1
                    );

                    return {
                        ...paciente,
                        enfermedadesCronicas: detalle.enfermedadesCronicas || []
                    };
                } catch {
                    return {
                        ...paciente,
                        enfermedadesCronicas: []
                    };
                }
            })
        );

        patientCount.textContent =
            `Pacientes Asignados (${pacientesConDetalle.length})`;

        patientContainer.innerHTML = "";

        if (!pacientesConDetalle.length) {
            patientContainer.innerHTML = `
                <div class="patients-loading">No hay pacientes registrados todavia.</div>
            `;
            return;
        }

        pacientesConDetalle.forEach(p => {
            const initials = p.name
                .split(" ")
                .map(n => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

            const enfermedades = p.enfermedadesCronicas || [];

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
                            ${renderEnfermedades(enfermedades, false)}
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
            const conditionsDiv = card.querySelector(".patient-conditions");
            conditionsDiv.addEventListener("click", (e) => {
                const btn = e.target.closest(".btn-see-more");
                if (!btn) return;

                const isExpanded = btn.dataset.expanded === "true";
                conditionsDiv.innerHTML = renderEnfermedades(
                    enfermedades,
                    !isExpanded
                );
            });

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
