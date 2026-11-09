import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const COLUMNAS_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSISION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", 
    "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", 
    "INICIALES_S", "ACTUALIZACIÓN", "RECIBIDAS_DE_OTROS_TYPES", "IMPORTADAS", "EXPORTADAS", 
    "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", 
    "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"
];

function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) {
        let kUpper = key.toUpperCase().trim();
        let val = item[key];
        limpio[kUpper] = val;
        if (kUpper === 'MIN_5' || kUpper === 'FI') limpio['INICIAL'] = val;
        if (kUpper === 'MAX_6' || kUpper === 'FF') limpio['FINAL'] = val;
    }
    return limpio;
}

window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;
    const clone = tabla.cloneNode(true);
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
        alert("¡Tabla copiada con éxito! Lista para pegar en Excel.");
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

function pintarTablaDirecta(selectorTabla, listaRegistros) {
    const tabla = document.querySelector(selectorTabla);
    if (!tabla) return;
    
    let thead = tabla.querySelector('thead');
    let tbody = tabla.querySelector('tbody');
    
    thead.innerHTML = "";
    tbody.innerHTML = "";

    let trTitulos = document.createElement('tr');
    COLUMNAS_KEYS.forEach(colKey => {
        let th = document.createElement('th');
        th.innerText = colKey.replace(/_/g, ' ');
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) th.classList.add('bg-folios');
        trTitulos.appendChild(th);
    });
    thead.appendChild(trTitulos);

    if (!listaRegistros || listaRegistros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_KEYS.length}" class="text-center text-muted py-3">Sin registros para mostrar.</td></tr>`;
        return;
    }

    listaRegistros.forEach(reg => {
        let tr = document.createElement('tr');
        COLUMNAS_KEYS.forEach(colKey => {
            let td = document.createElement('td');
            let val = reg[colKey];
            td.innerText = (val !== undefined && val !== null && val !== "") ? val : "0";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

async function cargarReportesDirectos() {
    try {
        console.log("Consultando Firebase en nodo: bd_totales...");
        const snap = await get(ref(db, 'bd_totales'));
        
        if (!snap.exists()) {
            console.warn("¡El nodo bd_totales no existe o está vacío en Firebase!");
            return;
        }

        let dataRaw = snap.val();
        console.log("Datos crudos recibidos de Firebase:", dataRaw);

        let registros = (Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw)).map(normalizarObjeto);
        console.log("Registros normalizados:", registros);

        pintarTablaDirecta('#tablaSemanalReporte', registros);
        pintarTablaDirecta('#tablaCampanaReporte', registros);
        pintarTablaDirecta('#tablaAcumuladoReporte', registros);
        console.log("¡Tablas pintadas con éxito!");

    } catch (err) {
        console.error("Error al cargar los datos directos:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(cargarReportesDirectos, 1000);
});
