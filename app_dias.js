import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ESTRUCTURA_DIAS = [ { key: 'Remesa', num: 39 }, { key: 'Módulo', num: 47 }, { key: 'Día', num: 1 }, { key: 'Fecha', num: 2 }, { key: 'Sedes', num: 4 }, { key: 'Horas_trabajadas', num: 3 }, { key: 'Inicial', num: 5 }, { key: 'Final', num: 6 }, { key: 'Total_de_folios', num: 7 }, { key: 'Inscripciones', num: 8 }, { key: 'Corrección_de_datos_personales', num: 9 }, { key: 'Cambio_de_domicilio', num: 10 }, { key: 'Reposición', num: 11 }, { key: 'Corr._de_datos_dirección', num: 12 }, { key: 'Reincorporación', num: 13 }, { key: 'Reemplazo', num: 14 }, { key: 'Reimpresión', num: 15 }, { key: 'Total_de_trámites', num: 16 }, { key: 'Cancelados', num: 17 }, { key: 'Total_de_anexos_por_rechazo', num: 18 }, { key: 'CPV_devuelta_entrega', num: 19 }, { key: 'Disponibles_al_día_anterior', num: 20 }, { key: 'Actualización', num: 21 }, { key: 'Recibidas_de_otros_tipos', num: 22 }, { key: 'Entregadas', num: 23 }, { key: 'Recibo_y/o_extravío', num: 24 }, { key: 'Anexas_a_fuar', num: 25 }, { key: 'Datos_erróneos', num: 26 }, { key: 'Foto_mal_impresa', num: 27 }, { key: 'Solicitud_de_reimpresión', num: 28 }, { key: 'Retiradas_por_otra_causa', num: 29 }, { key: 'Disponibles', num: 30 }, { key: 'Credenciales_x_canje', num: 31 }, { key: 'Fichas_entregadas', num: 32 }, { key: 'Fichas_atendidas', num: 33 }, { key: 'Días_trabajados', num: 34 }, { key: 'Cif_05', num: 35 }, { key: 'Solicitud_expedición', num: 36 }, { key: 'Solicitud_rectificación', num: 37 }, { key: 'Demanda_de_juicio', num: 38 }, { key: 'Total_de_movimientos', num: 40 }, { key: 'Creden._devueltas_por_terceros', num: 41 }, { key: 'Rechazos_de_MAC_34', num: 42 }, { key: 'Rechazos_de_MAC_35', num: 43 }, { key: 'Configuración', num: 44 }, { key: 'Ent', num: 45 }, { key: 'Dtto', num: 46 }, { key: 'Resguardo', num: 48 }, { key: 'Solicitud_de_reimpresión', num: 49 }, { key: 'CPV_devuelta_entrega_2', num: 50 }, { key: 'Script_ejecutados', num: 51 }, { key: 'Folio_NEC', num: 52 }, { key: 'Número_de_trámites_aplicados', num: 53 }, { key: 'Número_de_fichas_requisitadas', num: 54 }, { key: 'Número_de_archivos_de_transacción_aceptados', num: 55 }, { key: 'Total_de_archivos_de_transacción_procesados', num: 56 }, { key: 'Credenciales_recibidas', num: 57 }, { key: 'Credenciales_inconsistentes', num: 58 }, { key: 'Credenciales_en_resguardo', num: 59 }, { key: 'Credenciales_totales_en_SIIRFE_disponibles_para_entrega', num: 60 }, { key: 'Total_de_credenciales_entregadas', num: 61 }, { key: 'Total_de_credenciales_solicitadas', num: 62 }, { key: 'Importadas', num: 63 }, { key: 'Exportadas', num: 64 }, { key: 'Reposiciones_reimpresiones', num: 65 }, { key: 'Mal_impresa', num: 66 }, { key: 'Error_en_cartografía', num: 67 }, { key: 'Defunción', num: 68 }, { key: 'Suspensión', num: 69 }, { key: 'Duplicado', num: 70 }, { key: 'Error_en_núm._de_emisión', num: 71 }, { key: 'Pérdida_de_vigencia', num: 72 }, { key: 'Mov_post', num: 73 }, { key: 'Anexas_a_solicitud', num: 74 }, { key: 'Otras_bajas', num: 75 } ];
let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};
let columnaOrdenActual = ''; let ordenAscendente = false;

const MAPA_NUMEROS = { "Día": 1, "Fecha": 2, "Horas_trabajadas": 3, "Sedes": 4, "Inicial": 5, "Final": 6, "Total_de_folios": 7, "Inscripciones": 8, "Corrección_de_datos_personales": 9, "Cambio_de_domicilio": 10, "Reposición": 11, "Corr._de_datos_dirección": 12, "Reincorporación": 13, "Reemplazo": 14, "Reimpresión": 15, "Total_de_trámites": 16, "Cancelados": 17, "Total_de_anexos_por_rechazo": 18, "CPV_devuelta_entrega": 19, "Disponibles_al_día_anterior": 20, "Actualización": 21, "Recibidas_de_otros_tipos": 22, "Entregadas": 23, "Recibo_y/o_extravío": 24, "Anexas_a_fuar": 25, "Datos_erróneos": 26, "Foto_mal_impresa": 27, "Solicitud_de_reimpresión": 28, "Retiradas_por_otra_causa": 29, "Disponibles": 30, "Credenciales_x_canje": 31, "Fichas_entregadas": 32, "Fichas_atendidas": 33, "Días_trabajados": 34, "Cif_05": 35, "Solicitud_expedición": 36, "Solicitud_rectificación": 37, "Demanda_de_juicio": 38, "Remesa": 39, "Total_de_movimientos": 40, "Creden._devueltas_por_terceros": 41, "Rechazos_de_MAC_34": 42, "Rechazos_de_MAC_35": 43, "Configuración": 44, "Ent": 45, "Dtto": 46, "Módulo": 47, "Resguardo": 48, "Solicitud_de_reimpresión": 49, "CPV_devuelta_entrega_2": 50, "Script_ejecutados": 51, "Folio_NEC": 52, "Número_de_trámites_aplicados": 53, "Número_de_fichas_requisitadas": 54, "Número_de_archivos_de_transacción_aceptados": 55, "Total_de_archivos_de_transacción_procesados": 56, "Credenciales_recibidas": 57, "Credenciales_inconsistentes": 58, "Credenciales_en_resguardo": 59, "Credenciales_totales_en_SIIRFE_disponibles_para_entrega": 60, "Total_de_credenciales_entregadas": 61, "Total_de_credenciales_solicitadas": 62, "Importadas": 63, "Exportadas": 64, "Reposiciones_reimpresiones": 65, "Mal_impresa": 66, "Error_en_cartografía": 67, "Defunción": 68, "Suspensión": 69, "Duplicado": 70, "Error_en_núm._de_emisión": 71, "Pérdida_de_vigencia": 72, "Mov_post": 73, "Anexas_a_solicitud": 74, "Otras_bajas": 75, "Iniciales_C": 76, "Iniciales_A": 77, "Iniciales_S": 78, "IDMAC": 79 };
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
