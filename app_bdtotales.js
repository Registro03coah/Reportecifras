const firebaseConfig = { 
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", 
    authDomain: "cifrasmac.firebaseapp.com", 
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", 
    projectId: "cifrasmac" 
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let datosGlobalesBd = []; 
let datosEnPantalla = []; 
let columnaOrdenActual = 'IDMAC'; 
let ordenAscendente = false; 
let idmacEdicionActual = null;

// Control visual del semáforo de conexión Online/Offline
database.ref(".info/connected").on("value", (snap) => {
    let sem = document.getElementById("semaforoConexion");
    if(!sem) return;
    if (snap.val() === true) {
        sem.className = "badge bg-success text-white ms-auto";
        sem.innerHTML = '<i class="bi bi-check-circle"></i> ONLINE';
    } else {
        sem.className = "badge bg-danger text-white ms-auto";
        sem.innerHTML = '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

function generarIdMac(remesa, modulo) {
    let modStr = String(modulo || '').replace(/\D/g, ''); 
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';
    let remStr = String(remesa || '').trim(); 
    let remMatch = remStr.match(/(\d+)\s*(-?\s*bis\d*)?/i);
    let numPart = '0000'; 
    let suffix = '';
    if (remMatch) { 
        numPart = remMatch[1].length >= 4 ? remMatch[1].slice(-4) : remMatch[1].padStart(4, '0'); 
        if (remMatch[2]) { 
            suffix = remMatch[2].replace(/\s+/g, ''); 
            if (!suffix.startsWith('-')) suffix = '-' + suffix; 
        } 
    }
    return `${modDigits}${numPart}${suffix}`;
}

const ordenDeseado = [
    'ENT', 'DTTO', 'MODULO', 'REMESA', 'INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS', 'INSCRIPCIONES', 
    'CORRECCION_DE_DATOS_PERSONALES', 'CAMBIO_DE_DOMICILIO', 'REPOSISION', 'REIMPRESION', 
    'CORR__DE_DATOS_DIRECCION', 'REINCORPORACION', 'REEMPLAZO', 'TOTAL_DE_TRAMITES', 
    'RECHAZOS_DE_MAC_34', 'RECHAZOS_DE_MAC_35', 'CANCELADOS', 'TOTAL_DE_MOVIMIENTOS', 
    'CIF-05', 'CREDEN_DEVUELTAS_POR_TERCEROS', 'SOLICITUD_EXPEDICION', 'SOLICITUD_RECTIFICACION', 
    'DEMANDA_DE_JUICIO', 'INICIALES_C', 'INICIALES_A', 'INICIALES_S', 'ACTUALIZACIÓN', 
    'RECIBIDAS_DE_OTROS_TIPOS', 'IMPORTADAS', 'EXPORTADAS', 'ENTREGADAS', 'RECIBO_Y_O_EXTRAVIO', 
    'CPV_DEVUELA_ENTREGA', 'RESGUARDO', 'SOLICITUD_DE_REIMPRESION', 'RETIRADAS_POR_OTRA_CAUSA', 
    'DISPONIBLES', 'DUPLICADO', 'DISPONIBLES_AL_DÍA_ANTERIOR', 'DIAS_TRABAJADOS', 'CONFIGURACION', 
    'SRIPT_EJECUTADO_VIGENCIA', 'DIA', 'FECHA', 'IDMAC', 'SEDES',
    '34_IMAGEN_INCONSISTENTE', '35_MOVIMIENTO_POSTERIOR', 'ANEXAS_A_FUAR', 'ANEXAS_A_SOLICITUD', 
    'CARTOGRAFIA_SOLICITUD', 'CRED_PROD_CANJE_POR_NUEVA', 'CRED_PRODUCTO_DE_REGISTRO_DUPLICADO', 
    'DATOS_ERRONEOS', 'DEFUNCION', 'DEVUELTAS_POR_TERCEROS', 'DISPONIBLES_DE_SOL_DE_EXP', 
    'DUPLICADOS', 'ERROR_EN_CARTOGRAFIA', 'ERROR_EN_NUM_DE_EMISION', 'FALTANTES', 'FICHAS_ATENDIDAS', 
    'FICHAS_ENTREGADAS', 'FOLIO_NEC_POST', 'FOTO_MAL_IMPRESA', 'LOTES_DE_CREDENCIALES', 
    'MAC_QUE_ENTREGA', 'MAC_QUE_RECIBE', 'MAL_IMPRESAS', 'MOV_POST', 'NO_UTILIZADOS', 
    'OBSERVACIONES', 'OTRAS_BAJAS', 'PERDIDA_DE_VIGENCIA', 'REGISTRADAS_POR_DIA', 
    'REIMPRE_FUERA_DEL_SISTEMA', 'REPOSISION_REIMPRESIONES', 'SIN_NOMBRE3', 'SOBRANTES', 
    'SOLICITUD_EXPEDICION_REPATRIADOS', 'SOLICITUDE_RECTIFICACIÒN', 'SUSPENSION', 'TOTAL_DE_ANEXO_DE_RECHAZO'
];

function obtenerIndiceOrden(k) { 
    let idx = ordenDeseado.indexOf(k.toUpperCase().trim()); 
    return idx !== -1 ? idx : 9999; 
}

database.ref('bdtotales').on('value', (snap) => {
    let datos = snap.val(); 
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    ejecutarOrdenamiento(datosGlobalesBd);
});

document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('buscadorBdTotales');
    if(b) b.addEventListener('input', e => {
        let t = e.target.value.toLowerCase().trim();
        if(t === '') { ejecutarOrdenamiento(datosGlobalesBd); return; }
        ejecutarOrdenamiento(datosGlobalesBd.filter(i => String(i.IDMAC || generarIdMac(i.REMESA, i.MODULO)).toLowerCase().includes(t) || String(i.REMESA).toLowerCase().includes(t)));
    });
});

// ORDENAMIENTO POR IDMAC (De mayor a menor, manteniendo las -bis juntas a su remesa correspondiente)
function ejecutarOrdenamiento(arr) {
    if(!arr || arr.length === 0) { dibujarTabla([]); return; }
    let o = [...arr];

    o.sort((a, b) => {
        let idA = String(a.IDMAC || generarIdMac(a.REMESA, a.MODULO)).trim();
        let idB = String(b.IDMAC || generarIdMac(b.REMESA, b.MODULO)).trim();
        
        // Orden alfabético/numérico inverso (de mayor a menor por IDMAC)
        return idB.localeCompare(idA, undefined, {numeric: true});
    });

    dibujarTabla(o);
}

window.cambiarOrden = function(col) { 
    if (columnaOrdenActual === col) ordenAscendente = !ordenAscendente; 
    else { columnaOrdenActual = col; ordenAscendente = false; } 
    ejecutarOrdenamiento(datosEnPantalla); 
};

function dibujarTabla(arr) {
    datosEnPantalla = arr;
    const thead = document.getElementById('cabeceraBdTotales'); 
    const tbody = document.getElementById('cuerpoBdTotales');
    if(!thead || !tbody) return; 
    thead.innerHTML = ''; 
    tbody.innerHTML = '';
    if(arr.length === 0) return;
    
    let datosNorm = arr.map(i => {
        let obj = {}; 
        for(let k in i) obj[k.toUpperCase().trim()] = i[k];
        obj['IDMAC'] = generarIdMac(obj['REMESA'], obj['MODULO']); 
        return obj;
    });

    let colSet = new Set(); 
    datosNorm.forEach(i => Object.keys(i).forEach(k => colSet.add(k)));
    let columnas = Array.from(colSet).sort((a, b) => obtenerIndiceOrden(a) - obtenerIndiceOrden(b));
    
    let trH = '<tr><th class="text-white text-center">ACCIONES</th>';
    columnas.forEach(col => { 
        trH += `<th class="text-white" onclick="cambiarOrden('${col}')">${col.replace(/_/g, ' ')}</th>`; 
    });
    trH += '</tr>'; 
    thead.innerHTML = trH;
    
    let htmlB = '';
    datosNorm.forEach(fila => {
        htmlB += `<tr><td class="text-center align-middle" style="white-space:nowrap;"><button class="btn btn-sm btn-warning py-0 px-1 me-1" onclick="editarRegistro('${fila.IDMAC}')"><i class="bi bi-pencil-square"></i></button><button class="btn btn-sm btn-danger py-0 px-1" onclick="borrarRegistro('${fila.IDMAC}')"><i class="bi bi-trash"></i></button></td>`;
        columnas.forEach(col => {
            let val = fila[col] !== undefined ? fila[col] : '';
            if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
            htmlB += `<td>${val}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;
}

// ==========================================
// EDICIÓN DE REGISTROS EXISTENTES
// ==========================================
window.editarRegistro = function(id) {
    let registroOriginal = datosGlobalesBd.find(i => String(i.IDMAC || generarIdMac(i.REMESA, i.MODULO)) === String(id));
    if (!registroOriginal) { alert("No se encontró el registro para editar."); return; }

    idmacEdicionActual = id;
    const contenedor = document.getElementById('contenedorInputsEdicion');
    contenedor.innerHTML = '';

    let registroNorm = {};
    for (let k in registroOriginal) { registroNorm[k.toUpperCase().trim()] = registroOriginal[k]; }

    let colSet = new Set();
    datosGlobalesBd.forEach(i => Object.keys(i).forEach(k => colSet.add(k.toUpperCase().trim())));
    let columnas = Array.from(colSet).sort((a, b) => obtenerIndiceOrden(a) - obtenerIndiceOrden(b));

    columnas.forEach(col => {
        let valorValido = registroNorm[col] !== undefined ? registroNorm[col] : '';
        let esLectura = (col === 'IDMAC'); 

        let divCol = document.createElement('div');
        divCol.className = 'col-md-4';
        divCol.innerHTML = `
            <label class="form-label fw-bold text-secondary" style="font-size: 11px;">${col.replace(/_/g, ' ')}</label>
            <input type="text" class="form-control form-control-sm input-editable-campo" data-campo="${col}" value="${valorValido}" ${esLectura ? 'readonly bg-light' : ''}>
        `;
        contenedor.appendChild(divCol);
    });

    const modalEl = document.getElementById('modalEditarBdTotales');
    if (modalEl) { new bootstrap.Modal(modalEl).show(); }
};

window.guardarEdicionBdTotales = function() {
    if (!idmacEdicionActual) return;
    const inputs = document.querySelectorAll('.input-editable-campo');
    let indexRegistro = datosGlobalesBd.findIndex(i => String(i.IDMAC || generarIdMac(i.REMESA, i.MODULO)) === String(idmacEdicionActual));
    
    if (indexRegistro === -1) { alert("Error: No se localizó el índice del registro."); return; }

    inputs.forEach(inp => {
        let campo = inp.getAttribute('data-campo');
        let valor = inp.value.trim();
        datosGlobalesBd[indexRegistro][campo] = valor;
    });

    let remActualizada = datosGlobalesBd[indexRegistro]['REMESA'] || datosGlobalesBd[indexRegistro]['remesa'] || '';
    let modActualizado = datosGlobalesBd[indexRegistro]['MODULO'] || datosGlobalesBd[indexRegistro]['modulo'] || '';
    datosGlobalesBd[indexRegistro]['IDMAC'] = generarIdMac(remActualizada, modActualizado);

    database.ref('bdtotales').set(datosGlobalesBd)
        .then(() => {
            alert("¡Registro actualizado y guardado correctamente en la nube!");
            const modalEl = document.getElementById('modalEditarBdTotales');
            let modalBootstrap = bootstrap.Modal.getInstance(modalEl);
            if (modalBootstrap) modalBootstrap.hide();
            ejecutarOrdenamiento(datosGlobalesBd);
        })
        .catch((error) => {
            console.error("Error al actualizar en Firebase:", error);
            alert("Hubo un error al guardar los cambios en Firebase.");
        });
};

// ==========================================
// CREAR NUEVO REGISTRO MANUALMENTE
// ==========================================
window.abrirModalNuevoRegistro = function() {
    const contenedor = document.getElementById('contenedorInputsNuevo');
    contenedor.innerHTML = '';

    let colSet = new Set();
    datosGlobalesBd.forEach(i => Object.keys(i).forEach(k => colSet.add(k.toUpperCase().trim())));
    if (colSet.size === 0) {
        ['ENT', 'DTTO', 'MODULO', 'REMESA', 'INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].forEach(c => colSet.add(c));
    }
    let columnas = Array.from(colSet).sort((a, b) => obtenerIndiceOrden(a) - obtenerIndiceOrden(b));

    columnas.forEach(col => {
        let esLectura = (col === 'IDMAC');
        let divCol = document.createElement('div');
        divCol.className = 'col-md-4';
        divCol.innerHTML = `
            <label class="form-label fw-bold text-success" style="font-size: 11px;">${col.replace(/_/g, ' ')}</label>
            <input type="text" class="form-control form-control-sm input-nuevo-campo" data-campo="${col}" value="" ${esLectura ? 'readonly bg-light placeholder="Se genera automático"' : ''}>
        `;
        contenedor.appendChild(divCol);
    });

    const modalEl = document.getElementById('modalNuevoBdTotales');
    if (modalEl) { new bootstrap.Modal(modalEl).show(); }
};

window.guardarNuevoRegistroManual = function() {
    const inputs = document.querySelectorAll('.input-nuevo-campo');
    let nuevoObj = {};

    inputs.forEach(inp => {
        let campo = inp.getAttribute('data-campo');
        let valor = inp.value.trim();
        nuevoObj[campo] = valor;
    });

    if (!nuevoObj['REMESA'] || !nuevoObj['MODULO']) {
        alert("Atención: Los campos 'REMESA' y 'MODULO' son obligatorios para crear el registro.");
        return;
    }

    nuevoObj['IDMAC'] = generarIdMac(nuevoObj['REMESA'], nuevoObj['MODULO']);
    datosGlobalesBd.push(nuevoObj);

    database.ref('bdtotales').set(datosGlobalesBd)
        .then(() => {
            alert("¡Nuevo registro creado y guardado con éxito en Firebase!");
            const modalEl = document.getElementById('modalNuevoBdTotales');
            let modalBootstrap = bootstrap.Modal.getInstance(modalEl);
            if (modalBootstrap) modalBootstrap.hide();
            ejecutarOrdenamiento(datosGlobalesBd);
        })
        .catch((error) => {
            console.error("Error al guardar nuevo registro en Firebase:", error);
            alert("Hubo un error al crear el registro en la nube.");
        });
};

// ==========================================
// SUBIR, DESCARGAR Y VACIAR RESPALDOS JSON
// ==========================================
window.subirRespaldoTotalesJSON = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contenido = JSON.parse(e.target.result);
            const datosNuevos = Array.isArray(contenido) ? contenido : Object.values(contenido);
            if(confirm(`¿Deseas fusionar/subir ${datosNuevos.length} registros a la BD Totales en Firebase?`)) {
                database.ref('bdtotales').set(datosNuevos)
                .then(() => {
                    alert("¡Respaldo JSON subido y cargado con éxito en Firebase!");
                    document.getElementById('inputSubirJson').value = '';
                })
                .catch(() => alert("Error al subir el archivo a Firebase."));
            } else {
                document.getElementById('inputSubirJson').value = '';
            }
        } catch(err) {
            alert("El archivo JSON no es válido.");
            document.getElementById('inputSubirJson').value = '';
        }
    };
    reader.readAsText(file);
};

window.vaciarBdTotales = function() {
    if(confirm("⚠️ ¿Estás COMPLETAMENTE SEGURO de vaciar toda la Base de Datos Totales? Esta acción borrará todos los registros en la nube.")) {
        database.ref('bdtotales').remove()
        .then(() => alert("La base de datos ha sido vaciada."))
        .catch(() => alert("Error al intentar vaciar la base de datos."));
    }
};

// ==========================================
// BORRAR REGISTRO INDIVIDUAL
// ==========================================
window.borrarRegistro = function(id) {
    if(confirm(`¿Estás seguro de eliminar el registro con ID ${id}?`)) {
        database.ref('bdtotales').set(datosGlobalesBd.filter(i => (i.IDMAC || generarIdMac(i.REMESA, i.MODULO)) !== id))
        .then(() => alert("Registro eliminado correctamente."))
        .catch(() => alert("Error al eliminar el registro."));
    }
};

window.descargarRespaldoTotalesJSON = function() {
    const jsonString = JSON.stringify(datosGlobalesBd, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `bdtotales_respaldo.json`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
};
