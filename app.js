const API_URL = "https://sheetdb.io/api/v1/790lj1g5rpkl3";

// ---- NOTIFICACIONES SWEETALERT2 ----
const notify = {
    success: (msg) => {
        Swal.fire({ icon: 'success', title: '¡Logrado!', text: msg, confirmButtonColor: '#1e40af' });
    },
    error: (msg) => {
        Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#b91c1c' });
    },
    loading: (msg = 'Guardando información...') => {
        Swal.fire({ title: msg, allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
    }
};

// ---- LÓGICA DEL LÍDER ----
function actualizarInterfazLider() {
    const liderJson = sessionStorage.getItem("lider");
    const reg = document.getElementById("registroLider");
    const perf = document.getElementById("perfilLider");
    const acc = document.getElementById("acciones");

    if (liderJson) {
        const l = JSON.parse(liderJson);
        document.getElementById("displayNombreLider").textContent = l.nombre_lider;
        document.getElementById("displayCodigoLider").textContent = l.codigo_lider;
        document.getElementById("displayAreaLider").textContent = l.area_lider;
        reg.classList.add("hidden");
        perf.classList.remove("hidden");
        acc.classList.remove("hidden");
    } else {
        reg.classList.remove("hidden");
        perf.classList.add("hidden");
        acc.classList.add("hidden");
        ocultarTodosLosFormularios();
    }
}

function guardarLider() {
    const d = {
        codigo_lider: document.getElementById("codigoLider").value.trim(),
        nombre_lider: document.getElementById("nombreLider").value.trim(),
        area_lider: document.getElementById("areaLider").value
    };

    if (!d.codigo_lider || !d.nombre_lider || !d.area_lider) {
        return notify.error("Por favor completa tus datos de líder.");
    }

    sessionStorage.setItem("lider", JSON.stringify(d));
    actualizarInterfazLider();
    notify.success("Bienvenido al sistema de evaluación.");
}

function borrarLider() {
    Swal.fire({
        title: '¿Cambiar de líder?',
        text: "Se cerrará la sesión actual.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1e40af',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            sessionStorage.removeItem("lider");
            actualizarInterfazLider();
        }
    });
}

// ---- UI ----
function ocultarTodosLosFormularios() {
    ["desvinculacion", "retencion", "contratacion"].forEach(f => {
        const el = document.getElementById(`form-${f}`);
        if (el) el.classList.add("hidden");
    });
}

function mostrarFormulario(tipo) {
    ocultarTodosLosFormularios();
    const f = document.getElementById(`form-${tipo}`);
    if (f) {
        f.classList.remove("hidden");
        f.scrollIntoView({ behavior: 'smooth' });
    }
}

// ---- ENVÍO FINAL ----
async function enviarADatabase(datosForm) {
    const lider = JSON.parse(sessionStorage.getItem("lider"));

    if (!lider) return notify.error("Datos del líder no encontrados.");

    // Estructura de la fila para SheetDB / Google Sheets
    const row = {
        timestamp: new Date().toLocaleString(),
        tipo_formulario: datosForm.tipo_formulario,
        codigo_lider: lider.codigo_lider,
        nombre_lider: lider.nombre_lider,
        area_lider: lider.area_lider,
        // Campos de baja
        codigo_colaborador: datosForm.codigo_colaborador || "",
        nombre_colaborador: datosForm.nombre_colaborador || "",
        motivo_baja: datosForm.motivo_baja || "",
        impacto_baja: datosForm.impacto_baja || "",
        accion_posicion: datosForm.accion_posicion || "",
        comentarios_baja: datosForm.comentarios_baja || "",
        // Campos de retención
        motivo_retencion: datosForm.motivo_retencion || "",
        acciones_retencion: datosForm.acciones_retencion || "",
        comentarios_retencion: datosForm.comentarios_retencion || "",
        // Campos de contratación
        nombre_proyecto: datosForm.nombre_proyecto || "",
        tipo_puesto: datosForm.tipo_puesto || "",
        nombre_puesto: datosForm.nombre_puesto || "",
        subarea_puesto: datosForm.subarea_puesto || "",
        urgencia_puesto: datosForm.urgencia_puesto || "",
        justificacion_puesto: datosForm.justificacion_puesto || ""
    };

    notify.loading();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [row] })
        });

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Enviado!',
                text: 'La información se guardó correctamente en el Excel.',
                confirmButtonColor: '#1e40af'
            }).then(() => {
                ocultarTodosLosFormularios();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        } else {
            throw new Error();
        }
    } catch (e) {
        notify.error("Error al conectar con el servidor.");
    }
}

// ---- CAPTURA DE FORMS ----

function enviarDesvinculacion() {
    const d = {
        tipo_formulario: "BAJA",
        codigo_colaborador: document.getElementById("codColabBaja").value.trim(),
        nombre_colaborador: document.getElementById("nomColabBaja").value.trim(),
        motivo_baja: document.getElementById("motivoBaja").value,
        impacto_baja: document.getElementById("impactoBaja").value,
        accion_posicion: document.getElementById("accionPosicion").value,
        comentarios_baja: document.getElementById("comentariosBaja").value.trim()
    };

    if (!d.codigo_colaborador || !d.nombre_colaborador || !d.motivo_baja || !d.motivo_baja || !d.accion_posicion || !d.comentarios_baja) {
        return notify.error("Todos los campos son obligatorios.");
    }

    enviarADatabase(d);
}

function enviarRetencion() {
    const d = {
        tipo_formulario: "RETENCIÓN",
        codigo_colaborador: document.getElementById("codColabRet").value.trim(),
        nombre_colaborador: document.getElementById("nomColabRet").value.trim(),
        motivo_retencion: document.getElementById("motivoRetencion").value,
        acciones_retencion: document.getElementById("accionesRetencion").value,
        comentarios_retencion: document.getElementById("comentariosRet").value.trim()
    };

    if (!d.codigo_colaborador || !d.nombre_colaborador || !d.comentarios_retencion || !d.motivo_retencion || !d.acciones_retencion) {
        return notify.error("Todos los campos son obligatorios.");
    }

    enviarADatabase(d);
}

function enviarContratacion() {
    const d = {
        tipo_formulario: "CONTRATACION",
        nombre_proyecto: document.getElementById("proyecto").value.trim(),
        tipo_puesto: document.getElementById("tipoPuesto").value,
        nombre_puesto: document.getElementById("nombrePuesto").value.trim(),
        subarea_puesto: document.getElementById("subareaPuesto").value.trim(),
        urgencia_puesto: document.getElementById("urgencia").value,
        justificacion_puesto: document.getElementById("justificacion").value.trim()
    };

    // Validación de campos
    if (!d.nombre_proyecto || !d.tipo_puesto || !d.nombre_puesto || !d.subarea_puesto || !d.urgencia_puesto || !d.justificacion_puesto) {
        return notify.error("Todos los campos son obligatorios.");
    }
    
    enviarADatabase(d);
}

window.onload = actualizarInterfazLider;
