// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// ==========================================
// 2. COLUMNAS ESTANDARIZADAS (ORDEN ESPECÍFICO PARA REPORTE DÍAS)
// ==========================================
// Observa el inicio: MODULO, REMESA, DIA, FECHA, SEDES...
const COLUMNAS_REPORTE_DIAS = [
    "MODULO", "REMESA", "DIA", "FECHA", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
    "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR",
    "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "LIBRE2", "RETIRADAS_POR_OTRA_CAUSA", "DISPONIBLES",
    "credenciales_x_canje", "fichas_Entregadas", "fichas_atendidas", "Dias_trabajados",
    "SOLICITUD_EXPEDICION_O_RECTIFICACION", "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITU_DE_REIMPRESION",
    "DEMANDA_DE_JUICIO", "Total_de_movimientos", "DEVUELTAS_POR_TERCEROS", "34_Imagen_inconsistente",
    "35_Movimiento_posterior", "CONFIGURACION", "ENT", "DTTO", "RESGUARDO", "SOLICITUD_DE_NUM_DE_EMISION",
    "LIBRE1", "Sript_ejecutado_VIGENCIA", "FOLIO_NEC_POST", "cartografia_SOLICITUD", "lotes_de_credenciales",
    "registradas_por_dia", "faltantes", "observaciones", "sin_nombre1", "sin_nombre2", "sin_nombre3",
    "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA", "IMPORTADAS", "EXPORTADAS", "REPOSISION_+_REIMPRESIONES",
    "MAL_IMPRESAS", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION",
    "PERDIDA_DE_VIGENCIA", "MOY_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

let bdMadreGlobal = [];

// ==========================================
// 3. SEMÁFORO DE CONEXIÓN FIREBASE
// ==========================================
const connectedRef = database.ref(".info/connected");
connectedRef.on("value", (snap) => {
    const semaforo = document.getElementById("semaforoConexion");
    if(!semaforo) return;
    
    if (snap.val() === true) {
        semaforo.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill online-glow";
        semaforo.innerHTML = '<i class="bi bi-wifi"></i> ONLINE';
    } else {
        semaforo.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill offline-glow";
        semaforo.innerHTML = '<i class="bi bi-wifi-off"></i> OFFLINE';
    }
});

// ==========================================
// 4. GENERADOR DE CABECERA DE TABLA
// ==========================================
function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias');
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_REPORTE_DIAS.forEach((col, index) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        
        thT.innerText = nombreVisual;
        thT.style.minWidth = "85px";
        
        if(col === "MODULO" || col === "REMESA") thT.style.minWidth = "70px";
        if(col === "DIA" || col === "FECHA") thT.style.minWidth = "85px";
        if(col === "TOTAL_DE_FOLIOS" || col === "TOTAL_DE_TRAMITES") thT.style.minWidth = "110px";

        if(col === "INICIAL" || col === "FINAL" || col === "TOTAL_DE_FOLIOS") thT.classList.add('bg-folios');
        
        thN.innerText = index + 1; 
        thN.className = "table-light text-muted";
        
        trTitulos.appendChild(thT); 
        trNumeros.appendChild(thN);
    });
    
    thead.appendChild(trTitulos); 
    thead.appendChild(trNumeros);
}
construirHeaderTabla();

// ==========================================
// 5. LECTURA Y RENDERIZADO DESDE BD MADRE
// ==========================================
function cargarDatosDias() {
    database.ref('bd_madre').on('value', (snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            procesarYMostrarDatos();
            renderListaRemesas();
        } else {
            bdMadreGlobal = [];
            const tb = document.getElementById('cuerpoTablaDias');
            if(tb) tb.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la BD.</td></tr>';
            const tbRem = document.getElementById('cuerpoListaRemesas');
            if(tbRem) tbRem.innerHTML = '<tr><td colspan="2">No hay remesas guardadas</td></tr>';
        }
    });
}

function procesarYMostrarDatos() {
    const tbody = document.getElementById('cuerpoTablaDias');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    // Ordenar por Módulo y luego por Remesa descendente
    let datosOrdenados = [...bdMadreGlobal].sort((a, b) => {
        const modA = String(a.MODULO || '');
        const modB = String(b.MODULO || '');
        if (modA !== modB) return modA.localeCompare(modB);
        
        const remA = String(a.REMESA || '').toUpperCase();
        const remB = String(b.REMESA || '').toUpperCase();
        return remB.localeCompare(remA);
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        
        COLUMNAS_REPORTE_DIAS.forEach(col => {
            let td = document.createElement('td');
            let val = fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
            td.innerText = val;
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// ==========================================
// 6. GESTOR DE REMESAS Y ELIMINACIÓN
// ==========================================
function renderListaRemesas() {
    const tbody = document.getElementById('cuerpoListaRemesas');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    let remesasUnicas = [...new Set(bdMadreGlobal.map(f => String(f.REMESA || 'S/N')))].sort((a, b) => b.localeCompare(a));

    remesasUnicas.forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-success align-middle">Remesa ${remesaId}</td>
            <td class="align-middle">
                <button class="btn btn-sm btn-danger px-3" onclick="borrarRemesaCompleta('${remesaId}')">
                    <i class="bi bi-trash"></i> Eliminar Remesa Completa
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.borrarRemesaCompleta = function(remesaId) {
    if(confirm(`🚨 ¿Estás seguro de borrar TODO lo relacionado a la Remesa ${remesaId}?`)) {
        let nuevoBd = bdMadreGlobal.filter(f => String(f.REMESA || 'S/N') !== String(remesaId));
        database.ref('bd_madre').set(nuevoBd).then(() => {
            alert(`La Remesa ${remesaId} ha sido eliminada exitosamente.`);
        }).catch(error => {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al eliminar la remesa de la base de datos.");
        });
    }
};

// ==========================================
// 7. FUNCIÓN PARA COPIAR A EXCEL
// ==========================================
window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) {
        alert("No se encontró la tabla.");
        return;
    }

    // Crea un rango y selecciona la tabla
    const range = document.createRange();
    range.selectNode(tabla);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        // Ejecuta el comando de copiado
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            alert("¡Tabla copiada! Ve a Excel y presiona Ctrl + V (o clic derecho > Pegar) para pegarla.");
        } else {
            alert("No se pudo copiar la tabla. Tu navegador podría no soportar esta función.");
        }
    } catch (err) {
        console.error('Error al intentar copiar:', err);
        alert("Error al intentar copiar.");
    }

    // Limpia la selección para que no se quede todo sombreado en azul
    selection.removeAllRanges();
};

// Iniciar lectura
cargarDatosDias();
