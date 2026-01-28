import { obtenerMisMedicinas, registrarMedicina } from "./services/medicina.service.js";
import { protectPage } from "./guard.js";

// Protege la página (JWT + rol)
protectPage();

const container = document.getElementById("medContainer");
const modal = document.getElementById("modalMed");
const form = document.getElementById("medForm");

let medicinas = [];

// ===============================
// Cargar medicinas del paciente
// ===============================
async function cargarMedicinas() {
    try {
        medicinas = await obtenerMisMedicinas();
        renderMeds(medicinas);
    } catch (error) {
        console.error(error);
        alert("No se pudieron cargar tus medicinas");
    }
}

// ===============================
// Renderizar tarjetas
// ===============================
function renderMeds(lista) {
    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p>No tienes medicinas registradas.</p>";
        return;
    }

    lista.forEach((med) => {
        const card = `
            <div class="med-card glass-card" data-id="${med.id}">
                
                <button class="btn-delete" title="Eliminar">✖</button>

                <div>
                    <span class="type">${med.dosageForm}</span>
                    <h4>${med.nombre}</h4>
                    <p style="font-size: 0.8rem; color: #64748b;">
                        Expira: ${new Date(med.expirationDate).toLocaleDateString()}
                    </p>
                </div>

                <div class="card-footer">
                    <span class="registered-by">
                        Registrado por: ${med.registradoPorNombre}
                    </span>

                    <div class="card-actions">
                        <button class="btn-edit">✏️</button>
                        <button class="btn-reminder">⏰</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", card);
    });
}


// ===============================
// Abrir modal (nueva medicina)
// ===============================
document.getElementById("btnOpenModal").onclick = () => {
    document.getElementById("modalTitle").innerText = "Registrar Medicina";
    form.reset();
    modal.classList.add("active");
};

// ===============================
// Cerrar modal
// ===============================
document.getElementById("btnCloseModal").onclick = () => {
    modal.classList.remove("active");
};

// ===============================
// Guardar medicina
// ===============================
form.onsubmit = async (e) => {
    e.preventDefault();

    try {
        const dto = {
            nombre: document.getElementById("name").value.trim(),
            dosageForm: document.getElementById("dosageForm").value,
            expirationDate: document.getElementById("expirationDate").value
            // pacienteId NO se envía (backend lo obtiene del JWT)
        };

        await registrarMedicina(dto);

        modal.classList.remove("active");
        await cargarMedicinas();
        form.reset();

    } catch (error) {
        console.error(error);
        alert(error.message || "Error al registrar la medicina");
    }
};

// ===============================
// Carga inicial
// ===============================
document.addEventListener("DOMContentLoaded", cargarMedicinas);
