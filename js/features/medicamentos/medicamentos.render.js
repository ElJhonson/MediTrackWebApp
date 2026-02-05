import { abrirModalAlarma } from "./medicamentos.alarma.js"; 
import { abrirModalEditar } from "./medicamentos.modal.js";

const container = document.getElementById("medContainer");

export function renderMeds(lista) {
    container.innerHTML = "";

    if (!lista || lista.length === 0) {
        container.innerHTML = "<p>No tienes medicinas registradas.</p>";
        return;
    }

    lista.forEach((med) => {
        // Usamos insertAdjacentHTML para que el Controller pueda manejar los clicks vía delegación
        container.insertAdjacentHTML("beforeend", `
            <div class="med-card glass-card" data-id="${med.id}">
                <button class="btn-delete" data-id="${med.id}" title="Eliminar">✖</button>
                <div>
                    <span class="type">${med.dosageForm}</span>
                    <h4>${med.nombre}</h4>
                    <p style="font-size: 0.8rem; color: #64748b;">
                        Expira: ${formatDate(med.expirationDate)}
                    </p>
                </div>
                <div class="card-footer">
                    <span class="registered-by">
                        Registrado por: ${med.registradoPorNombre}
                    </span>
                    <div class="card-actions">
                        <button class="btn-edit" data-id="${med.id}">✏️</button>
                        <button class="btn-reminder" data-id="${med.id}">⏰</button>
                    </div>
                </div>
            </div>
        `);
    });
}

function formatDate(dateStr) {
    if(!dateStr) return "--/--/--";
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
}