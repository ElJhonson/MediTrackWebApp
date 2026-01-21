export const API_BASE_URL = "http://localhost:8080";

export const AUTH_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/acceder`
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    ROLE: "rol",
    NAME: "name"
};

export const ROLES = Object.freeze({
    PACIENTE: "PACIENTE",
    CUIDADOR: "CUIDADOR"
});

export const ROUTES = Object.freeze({
    LOGIN: "/index.html",
    DASHBOARD_PACIENTE: "/pages/dashboard-paciente.html",
    DASHBOARD_CUIDADOR: "/pages/dashboard-cuidador.html"
});

