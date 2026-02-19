export function obtenerPacienteIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

export function calcularIniciales(nombre = "") {
    return nombre
        .split(" ")
        .map(p => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
}

export function setHeaderPaciente(nombre) {
    document.getElementById("display-name").innerText = nombre;
    document.getElementById("avatar-initials").innerText =
        calcularIniciales(nombre);
}

export function setFormularioPaciente(data) {
    document.getElementById("nombre").value = data.name ?? "";
    document.getElementById("edad").value = data.edad ?? "";
    document.getElementById("curp").value = data.curp ?? "";
    document.getElementById("phoneNumber").value = data.phoneNumber ?? "";
}

export function getFormularioPacienteDTO(enfermedades) {
    return {
        nombre: document.getElementById("nombre").value.trim(),
        edad: Number(document.getElementById("edad").value),
        curp: document.getElementById("curp").value.trim(),
        phoneNumber: document.getElementById("phoneNumber").value.trim(),
        enfermedadesCronicas: [...enfermedades]
    };
}

export function mostrarPerfilCargado() {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("profile-card").classList.remove("hidden");
}
