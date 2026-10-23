
const LABELS_VISUALES_GLOBAL = {
    "IDMAC": "IDMAC",
    "REMESA": "Remesa",
    "MODULO": "Módulo",
    "MODULOS": "Módulos",
    "FECHA": "Fecha",
    "DIA": "Día",
    "DÍA": "Día",
    "SEDES": "Sedes",
    "SEDE": "Sede",
    "INICIAL": "Inicial",
    "FINAL": "Final",
    "TOTAL_DE_FOLIOS": "Total de folios",
    "NO_UTILIZADOS": "No utilizados",
    "INSCRIPCIONES": "Inscripciones",
    "CORRECCION_DE_DATOS_PERSONALES": "Corrección de datos personales",
    "CAMBIO_DE_DOMICILIO": "Cambio de domicilio",
    "REPOSISION": "Reposición",
    "REPOSICION": "Reposición",
    "CORR__DE_DATOS_DIRECCION": "Corr. de datos dirección",
    "CORR_DE_DATOS_DIRECCION": "Corr. de datos dirección",
    "REINCORPORACION": "Reincorporación",
    "REEMPLAZO": "Reemplazo",
    "REIMPRESION": "Reimpresión",
    "TOTAL_DE_TRAMITES": "Total de trámites",
    "CANCELADOS": "Cancelados",
    "TOTAL_DE_ANEXOS_POR_RECHAZO": "Total de anexo de rechazo",
    "CPV_DEVUELTA_ENTREGA": "CPV devuelta entrega",
    "DISPONIBLES_AL_DIA_ANTERIOR": "Disponibles al día anterior",
    "RECIBIDAS": "Recibidas",
    "ENTREGADAS": "Entregadas",
    "RECIBO_Y_O_EXTRAVIO": "Recibo y/o extravío",
    "ANEXAS_A_FUAR": "Anexas a fuar",
    "DATOS_ERRONEOS": "Datos erróneos",
    "FOTO_MAL_IMPRESA": "Foto mal impresa",
    "RETIRADAS_POR_OTRA_CAUSA": "Retiradas por causa",
    "DISPONIBLES": "Disponibles",
    "RECHAZOS_DE_MAC_34": "34 Imagen inconsistente",
    "34_IMAGEN_INCONSISTENTE": "34 Imagen inconsistente",
    "RECHAZOS_DE_MAC_35": "35 Movimiento posterior",
    "35_MOVIMIENTO_POSTERIOR": "35 Movimiento posterior",
    "TOTAL_DE_MOVIMIENTOS": "Total de movimientos",
    "CIF_05": "Cif 05",
    "CIF-05": "Cif 05",
    "SOLICITUD_EXPEDICION": "Solicitud expedición",
    "SOLICITUD_RECTIFICACION": "Solicitud de rectificación",
    "DEMANDA_DE_JUICIO": "Demanda de juicio",
    "INICIALES_A": "Iniciales A",
    "INICIALES_S": "Iniciales S",
    "INICIALES_C": "Iniciales C",
    "ACTUALIZACION": "Actualización",
    "ACTUALIZACIÓN": "Actualización",
    "RECIBIDAS_DE_OTROS_TIPOS": "Recibidas de otros tipos",
    "IMPORTADAS": "Importadas",
    "EXPORTADAS": "Exportadas",
    "RESGUARDO": "Resguardo",
    "SOLICITU_DE_REIMPRESION": "Solicitud de reimpresión",
    "SOLICITUD_DE_REIMPRESION": "Solicitud de reimpresión",
    "SOBRANTES": "Sobrantes",
    "DUPLICADO": "Duplicado",
    "DUPLICADOS": "Duplicados",
    "DISPONIBLES_DE_SOL_DE_EXP": "Disponibles de sol de exp",
    "REIMPRE_FUERA_DEL_SISTEMA": "Reimpre fuera del sistema",
    "CREDEN_DEVUELTAS_POR_TERCEROS": "Devueltas por terceros",
    "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO": "Cred producto de registro duplicado",
    "CRED_PROD_CANJE_POR_NUEVA": "Cred prod canje por nueva",
    "DIAS_TRABAJADOS": "Días trabajados",
    "CONFIGURACION": "Configuración",
    "ENT": "Ent",
    "DTTO": "Dtto"
};

function obtenerNombreVisualGlobal(col) {
    if (!col) return '';
    let norm = String(col).trim().toUpperCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^A-Z0-9]/g, "_");
    if (LABELS_VISUALES_GLOBAL[norm]) return LABELS_VISUALES_GLOBAL[norm];
    // Fallback proper case
    let limpio = String(col).replace(/_/g, ' ').toLowerCase();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

// ==========================================
// 1. IMPORTACIONES FIREBASE (Modular V10)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac",
    storageBucket: "cifrasmac.firebasestorage.app",
    messagingSenderId: "916644687837",
    appId: "1:916644687837:web:03d346cc48a071af1ed034"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. CONFIGURACIÓN Y VARIABLES
// ==========================================

const ESTRUCTURA_DIAS = [
    { key: 'REMESA', num: 39 },
    { key: 'MODULO', num: 47 },
    { key: 'DIA', num: 1 },
    { key: 'FECHA', num: 2 },
    { key: 'SEDES', num: 4 },
    { key: 'HORAS_TRABAJADAS', num: 3 },
    { key: 'INICIAL', num: 5 },
    { key: 'FINAL', num: 6 },
    { key: 'TOTAL_DE_FOLIOS', num: 7 },
    { key: 'INSCRIPCIONES', num: 8 },
    { key: 'CORRECCION_DE_DATOS_PERSONALES', num: 9 },
    { key: 'CAMBIO_DE_DOMICILIO', num: 10 },
    { key: 'REPOSISION', num: 11 },
    { key: 'CORR__DE_DATOS_DIRECCION', num: 12 },
    { key: 'REINCORPORACION', num: 13 },
    { key: 'REEMPLAZO', num: 14 },
    { key: 'REIMPRESION', num: 15 },
    { key: 'TOTAL_DE_TRAMITES', num: 16 },
    { key: 'CANCELADOS', num: 17 },
    { key: 'TOTAL_DE_ANEXOS_POR_RECHAZO', num: 18 },
    { key: 'CPV_DEVUELTA_ENTREGA', num: 19 },
    { key: 'DISPONIBLES_AL_DIA_ANTERIOR', num: 20 },
    { key: 'ACTUALIZACION', num: 21 },
    { key: 'RECIBIDAS_DE_OTROS_TIPOS', num: 22 },
    { key: 'ENTREGADAS', num: 23 },
    { key: 'RECIBO_Y_O_EXTRAVIO', num: 24 },
    { key: 'ANEXAS_A_FUAR', num: 25 },
    { key: 'DATOS_ERRONEOS', num: 26 },
    { key: 'FOTO_MAL_IMPRESA', num: 27 },
    { key: 'SOLICITU_DE_REIMPRESION', num: 28 },
    { key: 'RETIRADAS_POR_OTRA_CAUSA', num: 29 },
    { key: 'DISPONIBLES', num: 30 },
    { key: 'CREDENCIALES_X_CANJE', num: 31 },
    { key: 'FICHAS_ENTREGADAS', num: 32 },
    { key: 'FICHAS_ATENDIDAS', num: 33 },
    { key: 'DIAS_TRABAJADOS', num: 34 },
    { key: 'CIF_05', num: 35 },
    { key: 'SOLICITUD_EXPEDICION', num: 36 },
    { key: 'SOLICITUD_RECTIFICACION', num: 37 },
    { key: 'DEMANDA_DE_JUICIO', num: 38 },
    { key: 'TOTAL_DE_MOVIMIENTOS', num: 40 },
    { key: 'CREDEN_DEVUELTAS_POR_TERCEROS', num: 41 },
    { key: 'RECHAZOS_DE_MAC_34', num: 42 },
    { key: 'RECHAZOS_DE_MAC_35', num: 43 },
    { key: 'CONFIGURACION', num: 44 },
    { key: 'ENT', num: 45 },
    { key: 'DTTO', num: 46 },
    { key: 'RESGUARDO', num: 48 },
    { key: 'SOLICITUD_DE_REIMPRESION', num: 49 },
    { key: 'CPV_DEVUELTA_ENTREGA_2', num: 50 },
    { key: 'SCRIPT_EJECUTADOS', num: 51 },
    { key: 'FOLIO_NEC', num: 52 },
    { key: 'NUMERO_DE_TRAMITES_APLICADOS', num: 53 },
    { key: 'NUMERO_DE_FICHAS_REQUISITADAS', num: 54 },
    { key: 'NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS', num: 55 },
    { key: 'TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS', num: 56 },
    { key: 'CREDENCIALES_RECIBIDAS', num: 57 },
    { key: 'CREDENCIALES_INCONSISTENTES', num: 58 },
    { key: 'CREDENCIALES_EN_RESGUARDO', num: 59 },
    { key: 'CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA', num: 60 },
    { key: 'TOTAL_DE_CREDENCIALES_ENTREGADAS', num: 61 },
    { key: 'TOTAL_DE_CREDENCIALES_SOLICITADAS', num: 62 },
    { key: 'IMPORTADAS', num: 63 },
    { key: 'EXPORTADAS', num: 64 },
    { key: 'REPOSICIONES_REIMPRESIONES', num: 65 },
    { key: 'MAL_IMPRESA', num: 66 },
    { key: 'ERROR_EN_CARTOGRAFIA', num: 67 },
    { key: 'DEFUNCION', num: 68 },
    { key: 'SUSPENSION', num: 69 },
    { key: 'DUPLICADO', num: 70 },
    { key: 'ERROR_EN_NUM_DE_EMISION', num: 71 },
    { key: 'PERDIDA_DE_VIGENCIA', num: 72 },
    { key: 'MOV_POST', num: 73 },
    { key: 'ANEXAS_A_SOLICITUD', num: 74 },
    { key: 'OTRAS_BAJAS', num: 75 }
];


let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};

let columnaOrdenActual = ''; 
let ordenAscendente = false; 

// ==========================================
// 3. SEMÁFORO DE CONEXIÓN FIREBASE
// ==========================================
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
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
// 4. GENERADOR DE CABECERA (SIN LÍNEA DE NÚMEROS)
// ==========================================
function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias');
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    trNumeros.className = 'num-row';
    
    ESTRUCTURA_DIAS.forEach((colObj) => {
        let col = colObj.key;
        
        let thT = document.createElement('th');
        thT.setAttribute('data-col', col);
        let nombreVisual = obtenerNombreVisualGlobal(col);
        thT.innerText = nombreVisual;
        
        if (anchosGuardados[col]) {
            thT.style.width = anchosGuardados[col];
            thT.style.minWidth = anchosGuardados[col];
        } else {
            thT.style.minWidth = "90px";
            if(col === "MODULO" || col === "REMESA" || col === "DIA" || col === "FECHA") thT.style.minWidth = "85px";
            if(col === "TOTAL_DE_FOLIOS" || col === "TOTAL_DE_TRAMITES") thT.style.minWidth = "120px";
            if(col === "SEDES") thT.style.minWidth = "140px";
        }
        if(col === "INICIAL" || col === "FINAL" || col === "TOTAL_DE_FOLIOS") thT.classList.add('bg-folios');
        
        trTitulos.appendChild(thT); 
        
        let thNum = document.createElement('th');
        thNum.innerText = colObj.num;
        trNumeros.appendChild(thNum);
    });
    
    thead.appendChild(trTitulos); 
    thead.appendChild(trNumeros);
const observer = new ResizeObserver(entries => {
        let cambiados = false;
        for (let entry of entries) {
            const colName = entry.target.getAttribute('data-col');
            const newWidth = entry.borderBoxSize[0].inlineSize + 'px';
            if(anchosGuardados[colName] !== newWidth) {
                anchosGuardados[colName] = newWidth;
                cambiados = true;
            }
        }
        if(cambiados) {
            localStorage.setItem('anchosColumnasDias', JSON.stringify(anchosGuardados));
            actualizarStickyLeft();
        }
    });

    const ths = trTitulos.querySelectorAll('th');
    ths.forEach(th => observer.observe(th));
}
// ==========================================
// 5. LECTURA Y ORDENAMIENTO INTELIGENTE
// ==========================================
function obtenerValorFila(fila, col) {
    if (col === "MODULO") return fila["MÓDULO"] || fila["Módulo"] || fila["Modulo"] || fila["MODULO"] || '';
    if (col === "DIA") return fila["DÍA"] || fila["Día"] || fila["Dia"] || fila["DIA"] || '';
    if (col === "FECHA") return fila["FECHA"] || fila["Fecha"] || fila["fecha"] || '';
    if (col === "REMESA") return fila["REMESA"] || fila["Remesa"] || fila["remesa"] || '';
    if (col === "SEDES") return fila["SEDE_DE_OPERACIÓN_DE_MÓDULO"] || fila["SEDE DE OPERACIÓN DE MÓDULO"] || fila["SEDES"] || fila["Sedes"] || '';
    
    return fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
}

window.cambiarOrdenDias = function(colClick) {
    if (columnaOrdenActual === colClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = colClick;
        ordenAscendente = false; 
    }
    construirHeaderTabla(); 
    procesarYMostrarDatos(); 
};

function cargarDatosDias() {
    const dbRef = ref(db, 'bd_madre');
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            procesarYMostrarDatos();
        } else {
            bdMadreGlobal = [];
            const tb = document.getElementById('cuerpoTablaDias');
            if(tb) tb.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la BD Madre.</td></tr>';
        }
    });
}

function procesarYMostrarDatos() {
    const tbody = document.getElementById('cuerpoTablaDias');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    const ordenDias = {
        "lunes": 1, "martes": 2, "miércoles": 3, "miercoles": 3, 
        "jueves": 4, "viernes": 5, "sábado": 6, "sabado": 6, "domingo": 7
    };

    let datosOrdenados = [...bdMadreGlobal].sort((a, b) => {
        if (columnaOrdenActual !== '') {
            let valA = String(obtenerValorFila(a, columnaOrdenActual)).trim();
            let valB = String(obtenerValorFila(b, columnaOrdenActual)).trim();
            
            let numA = parseFloat(valA);
            let numB = parseFloat(valB);
            
            if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                if (numA < numB) return ordenAscendente ? -1 : 1;
                if (numA > numB) return ordenAscendente ? 1 : -1;
            } else {
                let comp = valA.toUpperCase().localeCompare(valB.toUpperCase());
                if (comp !== 0) return ordenAscendente ? comp : -comp;
            }
        }
        
        // ORDEN POR DEFECTO: Remesa (Mayor a Menor) -> Módulo (Ascendente) -> Día (Lunes a Domingo)
        let remA = String(obtenerValorFila(a, "REMESA")).trim();
        let remB = String(obtenerValorFila(b, "REMESA")).trim();
        if (remA !== remB) {
            return remB.localeCompare(remA, undefined, { numeric: true });
        }
        
        let modA = String(obtenerValorFila(a, "MODULO")).trim();
        let modB = String(obtenerValorFila(b, "MODULO")).trim();
        if (modA !== modB) {
            return modA.localeCompare(modB, undefined, { numeric: true });
        }

        let diaA = String(obtenerValorFila(a, "DIA")).trim().toLowerCase();
        let diaB = String(obtenerValorFila(b, "DIA")).trim().toLowerCase();
        let valDiaA = ordenDias[diaA] !== undefined ? ordenDias[diaA] : 99;
        let valDiaB = ordenDias[diaB] !== undefined ? ordenDias[diaB] : 99;

        return valDiaA - valDiaB;
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        
        ESTRUCTURA_DIAS.forEach(colObj => {
            let col = colObj.key;
            let td = document.createElement('td');
            td.innerText = obtenerValorFila(fila, col);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });

    setTimeout(actualizarStickyLeft, 100);
}

// ==========================================
// 6. FUNCIÓN PARA COPIAR A EXCEL
// ==========================================
window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;

    const range = document.createRange();
    range.selectNode(tabla);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            alert("¡Tabla copiada! Ve a Excel y presiona Ctrl + V para pegarla.");
        } else {
            alert("Tu navegador bloqueó la copia al portapapeles.");
        }
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    selection.removeAllRanges();
};

// Iniciar
construirHeaderTabla();
cargarDatosDias();
