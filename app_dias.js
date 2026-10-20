// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac"
};

// Inicializamos Firebase v8
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// ==========================================
// 2. COLUMNAS ESTANDARIZADAS (El mismo idioma que bd_madre)
// ==========================================
const COLUMNAS_REPORTE = [
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
// 3. GENERADOR DE CABECERA DE TABLA
// ==========================================
function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias');
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_REPORTE.forEach((col, index) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        
        thT.innerText = nombreVisual;
        thT.style.minWidth = "85px";
        
        // Ajustes de ancho específicos
        if(col === "MODULO" || col === "REMESA") thT.style.minWidth = "100px";
        if(col === "TOTAL_DE_FOLIOS" || col === "TOTAL_DE_TRAMITES") thT.style.minWidth = "110px";

        // Colores para identificar bloques como en tu diseño original
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
// 4. LECTURA Y RENDERIZADO DESDE BD MADRE
// ==========================================
function cargarDatosDias() {
    const statusDiv = document.getElementById('statusCarga');
    if(statusDiv) {
        statusDiv.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Cargando BD Madre...';
        statusDiv.className = "badge bg-warning text-dark fs-6 me-2";
    }
    
    // Usamos .on() para que se actualice en tiempo real si cambias algo en bd_madre
    database.ref('bd_madre').on('value', (snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            
            procesarYMostrarDatos();
            renderListaRemesas();
            
            if(statusDiv) {
                statusDiv.className = "badge bg-success fs-6 me-2";
                statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Sincronizado';
            }
        } else {
            bdMadreGlobal = [];
            const tb = document.getElementById('cuerpoTablaDias');
            if(tb) tb.innerHTML = '<tr><td colspan="100%" class="text-center py-4">No hay remesas guardadas en la Base de Datos.</td></tr>';
            const tbRem = document.getElementById('cuerpoListaRemesas');
            if(tbRem) tbRem.innerHTML = '<tr><td colspan="2">No hay remesas guardadas</td></tr>';
            
            if(statusDiv) {
                statusDiv.className = "badge bg-secondary fs-6 me-2";
                statusDiv.innerHTML = 'Sin datos';
            }
        }
    });
}

function procesarYMostrarDatos() {
    const tbody = document.getElementById('cuerpoTablaDias');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    // Ordenar por Módulo y luego por Remesa de forma descendente (las más nuevas primero)
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
        
        COLUMNAS_REPORTE.forEach(col => {
            let td = document.createElement('td');
            let val = fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
            td.innerText = val;
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

// ==========================================
// 5. GESTOR DE REMESAS Y ELIMINACIÓN
// ==========================================
function renderListaRemesas() {
    const tbody = document.getElementById('cuerpoListaRemesas');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    // Extraer remesas únicas
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
    if(confirm(`🚨 ¿Estás completamente seguro de borrar TODO lo relacionado a la Remesa ${remesaId}? Esto lo borrará de BD Madre.`)) {
        
        // Filtramos para conservar todos los registros que NO sean de esa remesa
        let nuevoBd = bdMadreGlobal.filter(f => String(f.REMESA || 'S/N') !== String(remesaId));
        
        database.ref('bd_madre').set(nuevoBd).then(() => {
            alert(`La Remesa ${remesaId} ha sido eliminada exitosamente.`);
            // No necesitamos recargar porque la función .on() lo hará automáticamente
        }).catch(error => {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al eliminar la remesa de la base de datos.");
        });
    }
};

// Iniciar lectura
cargarDatosDias();

// ==========================================
// 6. RESPALDO Y RESTAURACIÓN (JSON)
// ==========================================
const btnDescargar = document.getElementById('btnDescargarJSON');
if(btnDescargar) {
    btnDescargar.addEventListener('click', () => {
        if(bdMadreGlobal.length === 0) {
            alert("No hay datos para respaldar.");
            return;
        }
        const jsonString = JSON.stringify(bdMadreGlobal, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let hoy = new Date();
        let fechaTxt = hoy.getFullYear() + "-" + (hoy.getMonth()+1).toString().padStart(2, '0') + "-" + hoy.getDate().toString().padStart(2, '0');
        a.download = `bd_madre_respaldo_${fechaTxt}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

const inputSubir = document.getElementById('inputSubirJSON');
if(inputSubir) {
    inputSubir.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                if(confirm("¿Estás seguro de subir este respaldo? Sobrescribirá toda la Base de Datos Principal en la nube.")) {
                    database.ref('bd_madre').set(jsonData).then(() => {
                        alert('Base de Datos Principal actualizada con éxito desde el respaldo.');
                        document.getElementById('inputSubirJSON').value = ''; 
                    });
                }
            } catch(err) {
                alert('El archivo JSON no es válido.');
            }
        };
        reader.readAsText(file);
    });
}
