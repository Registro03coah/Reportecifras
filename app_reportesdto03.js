import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS", 
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSICION_REIMPRESIONES", "CORR_DE_DATOS_DIRECCION", "REINCORPORACION", 
    "REEMPLAZO", "TOTAL_DE_TRAMITES", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", 
    "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", "CIF_05", "SOLICITUD_EXPEDICION_ORDINARIA", 
    "SOLICITUD_DE_RECTIFICACION", "DEMANDA_DE_JUICIO", "INICIALES_A", "ACTUALIZACION", 
    "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", 
    "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "ROBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_CAUSA", "SOBRANTES", "DUPLICADOS", "DISPONIBLES_TOTAL", 
    "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", 
    "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", 
    "DIAS_TRABAJADOS", "CONFIGURACION"
];

const MAPA_NUMEROS = {};
COLUMNAS_KEYS.forEach((col, index) => {
    MAPA_NUMEROS[col] = index + 1;
});
MAPA_NUMEROS["REMESA"] = 45; 
MAPA_NUMEROS["ENT"] = 46; 
MAPA_NUMEROS["DTTO"] = 47; 
MAPA_NUMEROS["MODULO"] = 48;

function obtenerNumeroColumna(key) { return MAPA_NUMEROS[key] || '-'; }

window.copiarTablaExcel = function(tablaId) {
    const contenedor = document.getElementById(tablaId);
    if (!contenedor) return;
    const clone = contenedor.cloneNode(true);
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
        alert("¡Todos los reportes copiados con éxito! Listos para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(sem) {
        sem.className = s.val() ? "badge bg-success text-white ms-2" : "badge bg-danger text-white ms-2";
        sem.innerHTML = s.val() ? '<i class="bi bi-check-circle"></i> ONLINE' : '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

function construirHeader(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`); if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    COLUMNAS_KEYS.forEach(col => {
        let th = document.createElement('th'); 
        th.innerText = col.replace(/_/g, ' '); 
        th.style.minWidth = ['MODULO','ENT','DTTO'].includes(col) ? "70px" : "90px";
        if(['INICIAL','FINAL','TOTAL_DE_FOLIOS'].includes(col)) th.classList.add('bg-folios');
        trT.appendChild(th);
        
        let thN = document.createElement('th'); 
        thN.innerText = obtenerNumeroColumna(col); 
        trN.appendChild(thN);
    });
    thead.appendChild(trT); 
    thead.appendChild(trN);
}

function limpiarStr(str) {
    return String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function obtenerValorFlexible(objetoRegistro, claveBuscada) {
    if (!objetoRegistro) return "";
    if (objetoRegistro[claveBuscada] !== undefined) return objetoRegistro[claveBuscada];
    let claveLimpiada = limpiarStr(claveBuscada);
    let llaveEncontrada = Object.keys(objetoRegistro).find(k => limpiarStr(k) === claveLimpiada);
    if (llaveEncontrada !== undefined) return objetoRegistro[llaveEncontrada];
    return "";
}

function renderizarTablaReporte(selectorTbody, registros) {
    const tbody = document.querySelector(selectorTbody);
    if (!tbody) return;
    tbody.innerHTML = "";

    let acumuladorTotales = {};
    COLUMNAS_KEYS.forEach(col => { acumuladorTotales[col] = 0; });
    let hayRegistrosValidos = false;

    registros.forEach(reg => {
        let tr = document.createElement('tr');
        let modVal = String(obtenerValorFlexible(reg, 'MODULO') || '');
        let isNegro = modVal.includes('50351') || modVal.includes('50353') || modVal.includes('50354');

        COLUMNAS_KEYS.forEach(col => {
            let td = document.createElement('td');
            let val = obtenerValorFlexible(reg, col);

            if (['ENT', 'DTTO', 'MODULO', 'INICIAL', 'FINAL'].includes(col)) {
                td.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            }

            if (['TOTAL_DE_FOLIOS', 'INSCRIPCIONES', 'CORRECCION_DE_DATOS_PERSONALES', 'CAMBIO_DE_DOMICILIO', 'REPOSICION_REIMPRESIONES', 'CORR_DE_DATOS_DIRECCION', 'REINCORPORACION', 'REEMPLAZO', 'TOTAL_DE_TRAMITES', 'RECHAZOS_DE_MAC_34', 'RECHAZOS_DE_MAC_35', 'CANCELADOS', 'TOTAL_DE_MOVIMIENTOS', 'CIF_05', 'SOLICITUD_EXPEDICION_ORDINARIA', 'SOLICITUD_DE_RECTIFICACION', 'DEMANDA_DE_JUICIO', 'INICIALES_A', 'ACTUALIZACION', 'RECIBIDAS_DE_OTROS_TIPOS', 'IMPORTADAS', 'EXPORTADAS', 'ENTREGADAS', 'ANEXAS_A_FUAR', 'RESGUARDO', 'SOLICITUD_DE_REIMPRESION', 'ROBO_Y_O_EXTRAVIO', 'RETIRADAS_POR_CAUSA', 'SOBRANTES', 'DUPLICADOS', 'DISPONIBLES_TOTAL', 'DISPONIBLES_DE_SOL_DE_EXP', 'REIMPRE_FUERA_DEL_SISTEMA', 'CREDEN_DEVUELTAS_POR_TERCEROS', 'CRED_PRODUCTO_DE_REGISTRO_DUPLICADO', 'CRED_PROD_CANJE_POR_NUEVA', 'DIAS_TRABAJADOS'].includes(col)) {
                let numVal = parseFloat(val) || 0;
                if (!isNaN(numVal) && val !== "") {
                    acumuladorTotales[col] += numVal;
                    hayRegistrosValidos = true;
                }
            }

            td.innerText = (val !== undefined && val !== "" && val !== 0) ? val : "";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Fila de Totales
    let trT = document.createElement('tr');
    trT.className = 'fila-totales fw-bold';
    COLUMNAS_KEYS.forEach(col => {
        let td = document.createElement('td');
        if (col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if (['ENT', 'DTTO', 'INICIAL', 'FINAL', 'INICIALES_A', 'INICIALES_C', 'CONFIGURACION'].includes(col)) {
            td.innerText = "";
        } else {
            td.innerText = hayRegistrosValidos ? (acumuladorTotales[col] || 0) : "";
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

// Inicializar cabeceras de las 3 tablas
construirHeader('#tablaSemanalReporte');
construirHeader('#tablaCampanaReporte');
construirHeader('#tablaAcumuladoReporte');

// Cargar datos desde Firebase (usando BD Totales y BD Madre según corresponda)
Promise.all([
    get(ref(db, 'bdtotales')),
    get(ref(db, 'bd_madre'))
]).then(([snapshotTotales, snapshotMadre]) => {
    let datosTotales = snapshotTotales.exists() ? (Array.isArray(snapshotTotales.val()) ? snapshotTotales.val() : Object.values(snapshotTotales.val())) : [];
    let datosMadre = snapshotMadre.exists() ? (Array.isArray(snapshotMadre.val()) ? snapshotMadre.val() : Object.values(snapshotMadre.val())) : [];

    let normalizar = (arr) => arr.map(i => { let l={}; for(let k in i) l[k.toUpperCase().trim()] = i[k]; return l; });

    let dataT = normalizar(datosTotales);
    let dataM = normalizar(datosMadre);

    // Semanal (ejemplo de últimos registros o filtrados por semana actual)
    let semanalRegistros = dataM.slice(-3); // Muestra los registros recientes o semanales nativos
    renderizarTablaReporte('#tablaSemanalReporte tbody', semanalRegistros);

    // Campaña (ejemplo de registros globales de campaña)
    let campanaRegistros = dataM.slice(-3); 
    renderizarTablaReporte('#tablaCampanaReporte tbody', campanaRegistros);

    // Acumulado (utiliza la BD Totales oficial)
    renderizarTablaReporte('#tablaAcumuladoReporte tbody', dataT);
});

function normalizarObj(i) { let l={}; for(let k in i) l[k.toUpperCase().trim()] = i[k]; return l; }
