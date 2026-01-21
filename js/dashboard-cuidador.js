import { protectPage } from "./guard.js";
import { getAccessToken, logout } from "./auth.js";
import { API_BASE_URL } from "./config.js";

protectPage();

async function cargarDatosCuidador() {
    const token = getAccessToken();

    if (!token) {
        logout();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cuidadores/mis-datos`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("No autorizado");
        }

        const cuidador = await response.json();

        const nombreCorto = cuidador.name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ");

        document.getElementById("caregiver-name").textContent = nombreCorto;
        document.getElementById("link-code").textContent = cuidador.codigoVinculacion;

    } catch (error) {
        console.error(error);
        logout();
    }
}

cargarDatosCuidador();
