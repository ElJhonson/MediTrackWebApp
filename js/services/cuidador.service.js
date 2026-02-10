import { API_BASE_URL } from "../core/config.js";
import { getAccessToken } from "../core/auth.js";

const BASE_URL = `${API_BASE_URL}/cuidadores`;

/**
 * Obtener datos del cuidador autenticado
 * GET /cuidadores/mis-datos
 */
export async function obtenerMisDatosCuidador() {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/mis-datos`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "No se pudieron obtener los datos del cuidador");
    }

    return response.json();
}

/**
 * Obtener pacientes asociados al cuidador
 * GET /cuidadores/pacientes-del-cuidador
 */
export async function obtenerPacientesDelCuidador() {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/pacientes-del-cuidador`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al obtener pacientes");
    }

    return response.json();
}

/**
 * Registrar paciente desde cuidador
 * POST /cuidadores/registrar-paciente
 */
export async function registrarPacienteDesdeCuidador(dto) {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/registrar-paciente`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dto)
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al registrar paciente");
    }

    return response.json();
}

/**
 * Obtener perfil de un paciente por ID
 * GET /cuidadores/pacientes/{id}
 */
export async function obtenerPacientePorId(id) {
    const token = getAccessToken();

    const response = await fetch(`${BASE_URL}/pacientes/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Error al obtener paciente");
    }

    return response.json();
}
