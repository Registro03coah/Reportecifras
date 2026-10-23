import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ESTRUCTURA_DIAS = [ { key: 'REMESA', num: 39 }, { key: 'MODULO', num: 47 }, { key: 'DIA', num: 1 }, { key: 'FECHA', num: 2 }, { key: 'SEDES', num: 4 }, { key: 'HORAS_TRABAJADAS', num: 3 }, { key: 'INICIAL', num: 5 }, { key: 'FINAL', num: 6 }, { key: 'TOTAL_DE_FOLIOS', num: 7 }, { key: 'INSCRIPCIONES', num: 8 }, { key: 'CORRECCION_DE_DATOS_PERSONALES', num: 9 }, { key: 'CAMBIO_DE_DOMICILIO', num: 10 }, { key: 'REPOSISION', num: 11 }, { key: 'CORR__DE_DATOS_DIRECCION', num: 12 }, { key: 'REINCORPORACION', num: 13 }, { key: 'REEMPLAZO', num: 14 }, { key: 'REIMPRESION', num: 15 }, { key: 'TOTAL_DE_TRAMITES', num: 16 }, { key: 'CANCELADOS', num: 17 }, { key: 'TOTAL_DE_ANEXOS_POR_RECHAZO', num: 18 }, { key: 'CPV_DEVUELTA_ENTREGA', num: 19 }, { key: 'DISPONIBLES_AL_DIA_ANTERIOR', num: 20 }, { key: 'ACTUALIZACION', num: 21 }, { key: 'RECIBIDAS_DE_OTROS_TIPOS', num: 22 }, { key: 'ENTREGADAS', num: 23 }, { key: 'RECIBO_Y_O_EXTRAVIO', num: 24 }, { key: 'ANEXAS_A_FUAR', num: 25 }, { key: 'DATOS_ERRONEOS', num: 26 }, { key: 'FOTO_MAL_IMPRESA', num: 27 }, { key: 'SOLICITU_DE_REIMPRESION', num: 28 }, { key: 'RETIRADAS_POR_OTRA_CAUSA', num: 29 }, { key: 'DISPONIBLES', num: 30 }, { key: 'CREDENCIALES_X_CANJE', num: 31 }, { key: 'FICHAS_ENTREGADAS', num: 32 }, { key: 'FICHAS_ATENDIDAS', num: 33 }, { key: 'DIAS_TRABAJADOS', num: 34 }, { key: 'CIF_05', num: 35 }, { key: 'SOLICITUD_EXPEDICION', num: 36 }, { key: 'SOLICITUD_RECTIFICACION', num: 37 }, { key: 'DEMANDA_DE_JUICIO', num: 38 }, { key: 'TOTAL_DE_MOVIMIENTOS', num: 40 }, { key: 'CREDEN_DEVUELTAS_POR_TERCEROS', num: 41 }, { key: 'RECHAZOS_DE_MAC_34', num: 42 }, { key: 'RECHAZOS_DE_MAC_35', num: 43 }, { key: 'CONFIGURACION', num: 44 }, { key: 'ENT', num: 45 }, { key: 'DTTO', num: 46 }, { key: 'RESGUARDO', num: 48 }, { key: 'SOLICITUD_DE_REIMPRESION', num: 49 }, { key: 'CPV_DEVUELTA_ENTREGA_2', num: 50 }, { key: 'SCRIPT_EJECUTADOS', num: 51 }, { key: 'FOLIO_NEC', num: 52 }, { key: 'NUMERO_DE_TRAMITES_APLICADOS', num: 53 }, { key: 'NUMERO_DE_FICHAS_REQUISITADAS', num: 54 }, { key: 'NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS', num: 55 }, { key: 'TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS', num: 56 }, { key: 'CREDENCIALES_RECIBIDAS', num: 57 }, { key: 'CREDENCIALES_INCONSISTENTES', num: 58 }, { key: 'CREDENCIALES_EN_RESGUARDO', num: 59 }, { key: 'CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA', num: 60 }, { key: 'TOTAL_DE_CREDENCIALES_ENTREGADAS', num: 61 }, { key: 'TOTAL_DE_CREDENCIALES_SOLICITADAS', num: 62 }, { key: 'IMPORTADAS', num: 63 }, { key: 'EXPORTADAS', num: 64 }, { key: 'REPOSICIONES_REIMPRESIONES', num: 65 }, { key: 'MAL_IMPRESA', num: 66 }, { key: 'ERROR_EN_CARTOGRAFIA', num: 67 }, { key: 'DEFUNCION', num: 68 }, { key: 'SUSPENSION', num: 69 }, { key: 'DUPLICADO', num: 70 }, { key: 'ERROR_EN_NUM_DE_EMISION', num: 71 }, { key: 'PERDIDA_DE_VIGENCIA', num: 72 }, { key: 'MOV_POST', num: 73 }, { key: 'ANEXAS_A_SOLICITUD', num: 74 }, { key: 'OTRAS_BAJAS', num: 75 } ];
let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};
let columnaOrdenActual = ''; let ordenAscendente = false;

const MAPA_NUMEROS = { "DIA": 1, "FECHA": 2, "HORAS_TRABAJADAS": 3, "SEDES": 4, "INICIAL": 5, "FINAL": 6, "TOTAL_DE_FOLIOS": 7, "INSCRIPCIONES": 8, "CORRECCION_DE_DATOS_PERSONALES": 9, "CAMBIO_DE_DOMICILIO": 10, "REPOSISION": 11, "CORR__DE_DATOS_DIRECCION": 12, "REINCORPORACION": 13, "REEMPLAZO": 14, "REIMPRESION": 15, "TOTAL_DE_TRAMITES": 16, "CANCELADOS": 17, "TOTAL_DE_ANEXOS_POR_RECHAZO": 18, "CPV_DEVUELTA_ENTREGA": 19, "DISPONIBLES_AL_DIA_ANTERIOR": 20, "ACTUALIZACION": 21, "RECIBIDAS_DE_OTROS_TIPOS": 22, "ENTREGADAS": 23, "RECIBO_Y_O_EXTRAVIO": 24, "ANEXAS_A_FUAR": 25, "DATOS_ERRONEOS": 26, "FOTO_MAL_IMPRESA": 27, "SOLICITU_DE_REIMPRESION": 28, "RETIRADAS_POR_OTRA_CAUSA": 29, "DISPONIBLES": 30, "CREDENCIALES_X_CANJE": 31, "FICHAS_ENTREGADAS": 32, "FICHAS_ATENDIDAS": 33, "DIAS_TRABAJADOS": 34, "CIF_05": 35, "SOLICITUD_EXPEDICION": 36, "SOLICITUD_RECTIFICACION": 37, "DEMANDA_DE_JUICIO": 38, "REMESA": 39, "TOTAL_DE_MOVIMIENTOS": 40, "CREDEN_DEVUELTAS_POR_TERCEROS": 41, "RECHAZOS_DE_MAC_34": 42, "RECHAZOS_DE_MAC_35": 43, "CONFIGURACION": 44, "ENT": 45, "DTTO": 46, "MODULO": 47, "RESGUARDO": 48, "SOLICITUD_DE_REIMPRESION": 49, "CPV_DEVUELTA_ENTREGA_2": 50, "SCRIPT_EJECUTADOS": 51, "FOLIO_NEC": 52, "NUMERO_DE_TRAMITES_APLICADOS": 53, "NUMERO_DE_FICHAS_REQUISITADAS": 54, "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS": 55, "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS": 56, "CREDENCIALES_RECIBIDAS": 57, "CREDENCIALES_INCONSISTENTES": 58, "CREDENCIALES_EN_RESGUARDO": 59, "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA": 60, "TOTAL_DE_CREDENCIALES_ENTREGADAS": 61, "TOTAL_DE_CREDENCIALES_SOLICITADAS": 62, "IMPORTADAS": 63, "EXPORTADAS": 64, "REPOSICIONES_REIMPRESIONES": 65, "MAL_IMPRESA": 66, "ERROR_EN_CARTOGRAFIA": 67, "DEFUNCION": 68, "SUSPENSION": 69, "DUPLICADO": 70, "ERROR_EN_NUM_DE_EMISION": 71, "PERDIDA_DE_VIGENCIA": 72, "MOV_POST": 73, "ANEXAS_A_SOLICITUD": 74, "OTRAS_BAJAS": 75, "INICIALES_C": 76, "INICIALES_A": 77, "INICIALES_S": 78, "IDMAC": 79 };
function obtenerNumeroColumna(key) { return MAPA_NUMEROS[key] || '-'; }

window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;
    const clone = tabla.cloneNode(true);
    const totales = clone.querySelectorAll('.fila-totales');
    totales.forEach(t => t.remove()); 
    const div = document.createElement('div');
    div.appendChild(clone);
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNode(clone);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try {
        document.execCommand('copy');
        alert("¡Tabla copiada sin la fila de totales! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

onValue(ref(db, ".info/connected"), (snap) => {
    const sem = document.getElementById("semaforoConexion");
    if(!sem) return;
    if (snap.val() === true) { sem.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill"; sem.innerHTML = 'ONLINE'; }
    else { sem.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill"; sem.innerHTML = 'OFFLINE'; }
});
function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias'); if(!thead) return;
    thead.innerHTML = "";
    let trT = document.createElement('tr'); let trN = document.createElement('tr'); trN.className = 'num-row';
    ESTRUCTURA_DIAS.forEach((colObj) => {
        let th = document.createElement('th'); th.setAttribute('data-col', colObj.key);
        th.innerText = colObj.key.replace(/_/g, ' ');
        if (anchosGuardados[colObj.key]) { th.style.width = anchosGuardados[colObj.key]; th.style.minWidth = anchosGuardados[colObj.key]; }
        else { th.style.minWidth = "90px"; }
        trT.appendChild(th);
        let thN = document.createElement('th'); thN.innerText = colObj.num; trN.appendChild(thN);
    });
    thead.appendChild(trT); thead.appendChild(trN);
}
function obtenerValorFila(fila, col) {
    if (col === "MODULO") return fila["MODULO"] || fila["Módulo"] || fila["Modulo"] || '';
    if (col === "DIA") return fila["DIA"] || fila["Día"] || fila["Dia"] || '';
    if (col === "FECHA") return fila["FECHA"] || fila["Fecha"] || '';
    if (col === "REMESA") return fila["REMESA"] || fila["Remesa"] || '';
    if (col === "SEDES") return fila["SEDE_DE_OPERACIÓN_DE_MÓDULO"] || fila["SEDES"] || fila["Sedes"] || '';
    return fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
}
function procesarYMostrarDatos() {
    const tbody = document.getElementById('cuerpoTablaDias'); if(!tbody) return;
    tbody.innerHTML = "";
    if (bdMadreGlobal.length === 0) return;
    bdMadreGlobal.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_DIAS.forEach(colObj => {
            let td = document.createElement('td');
            let val = obtenerValorFila(fila, colObj.key);
            if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
            td.innerText = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}
construirHeaderTabla();
onValue(ref(db, 'bd_madre'), (snapshot) => {
    if (snapshot.exists()) { bdMadreGlobal = Array.isArray(snapshot.val()) ? snapshot.val() : Object.values(snapshot.val()); procesarYMostrarDatos(); }
});