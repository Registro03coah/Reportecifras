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
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
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

function construirTablaHTML(selectorTabla, listaConsolidada, incluirGranTotal = true) {
    const tabla = document.querySelector(selectorTabla);
    if (!tabla) return;
    
    let thead = tabla.querySelector('thead');
    let tbody = tabla.querySelector('tbody');
    
    thead.innerHTML = "";
    tbody.innerHTML = "";

    // Cabecera
    let trTitulos = document.createElement('tr');
    COLUMNAS_KEYS.forEach(colKey => {
        let th = document.createElement('th');
        th.innerText = colKey.replace(/_/g, ' ');
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) th.classList.add('bg-folios');
        trTitulos.appendChild(th);
    });
    thead.appendChild(trTitulos);

    if (listaConsolidada.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_KEYS.length}" class="text-center text-muted py-3">No hay registros disponibles.</td></tr>`;
        return;
    }

    // Filas de datos
    listaConsolidada.forEach(reg => {
        let tr = document.createElement('tr');
        COLUMNAS_KEYS.forEach(colKey => {
            let td = document.createElement('td');
            td.innerText = reg[colKey] !== undefined ? reg[colKey] : "0";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Fila de Gran Total
    if (incluirGranTotal && listaConsolidada.length > 0) {
        let trGranTotal = document.createElement('tr');
        trGranTotal.classList.add('fila-totales');
        
        COLUMNAS_KEYS.forEach(colKey => {
            let td = document.createElement('td');
            if (colKey === "MODULO") {
                td.innerText = "GRAN TOTAL";
            } else if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
                td.innerText = "";
            } else {
                let sumaTotal = 0;
                listaConsolidada.forEach(reg => {
                    let val = parseFloat(reg[colKey] || 0);
                    if (!isNaN(val)) sumaTotal += val;
                });
                td.innerText = sumaTotal;
            }
            trGranTotal.appendChild(td);
        });
        tbody.appendChild(trGranTotal);
    }
}

async function cargarReportesDto03() {
    try {
        const snapMadre = await get(ref(db, 'bd_madre'));
        if (!snapMadre.exists()) return;

        let dataRaw = snapMadre.val();
        let bdMadre = (Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw)).map(normalizarObjeto);

        // 1. PROCESAR SECCIÓN SEMANAL (Remesa más reciente agrupada por Módulo)
        let remesasSet = new Set();
        bdMadre.forEach(f => {
            let r = String(f['REMESA'] || '').trim();
            if (r) remesasSet.add(r);
        });
        let listaRemesas = Array.from(remesasSet).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        let remesaMasReciente = listaRemesas[0] || "";

        let filasRemesa = bdMadre.filter(item => String(item['REMESA'] || '').trim() === remesaMasReciente);
        let modulosSemanalMap = {};
        filasRemesa.forEach(f => {
            let mod = String(f['MODULO'] || 'General').trim();
            if (!modulosSemanalMap[mod]) modulosSemanalMap[mod] = [];
            modulosSemanalMap[mod].push(f);
        });

        let listaSemanal = [];
        Object.keys(modulosSemanalMap).sort().forEach(modNombre => {
            let registrosMod = modulosSemanalMap[modNombre];
            let objConsolidado = { MODULO: modNombre };

            COLUMNAS_KEYS.forEach(colKey => {
                if (colKey !== "MODULO") {
                    if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
                        objConsolidado[colKey] = registrosMod[0][colKey] || "0";
                    } else {
                        let sumaCol = 0;
                        registrosMod.forEach(reg => {
                            let val = parseFloat(reg[colKey] || 0);
                            if (!isNaN(val)) sumaCol += val;
                        });
                        objConsolidado[colKey] = sumaCol;
                    }
                }
            });
            listaSemanal.push(objConsolidado);
        });
        construirTablaHTML('#tablaSemanalReporte', listaSemanal);


        // 2. PROCESAR SECCIÓN CAMPAÑA (Consolidado histórico agrupado por Módulo sumando todas las remesas)
        let modulosCampanaMap = {};
        bdMadre.forEach(f => {
            let mod = String(f['MODULO'] || 'General').trim();
            if (!modulosCampanaMap[mod]) modulosCampanaMap[mod] = [];
            modulosCampanaMap[mod].push(f);
        });

        let listaCampana = [];
        Object.keys(modulosCampanaMap).sort().forEach(modNombre => {
            let registrosMod = modulosCampanaMap[modNombre];
            let objConsolidado = { MODULO: modNombre };

            COLUMNAS_KEYS.forEach(colKey => {
                if (colKey !== "MODULO") {
                    if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
                        objConsolidado[colKey] = registrosMod[registrosMod.length - 1][colKey] || "0";
                    } else {
                        let sumaCol = 0;
                        registrosMod.forEach(reg => {
                            let val = parseFloat(reg[colKey] || 0);
                            if (!isNaN(val)) sumaCol += val;
                        });
                        objConsolidado[colKey] = sumaCol;
                    }
                }
            });
            listaCampana.push(objConsolidado);
        });
        construirTablaHTML('#tablaCampanaReporte', listaCampana);


        // 3. PROCESAR SECCIÓN ACUMULADO (Una sola línea sumando absolutamente todo el distrito)
        if (bdMadre.length > 0) {
            let objAcumulado = { MODULO: "TOTAL DISTRITO 03" };
            COLUMNAS_KEYS.forEach(colKey => {
                if (colKey !== "MODULO") {
                    if (["ENT", "DTTO", "CONFIGURACION"].includes(colKey)) {
                        objAcumulado[colKey] = bdMadre[0][colKey] || "0";
                    } else if (["INICIAL", "FINAL", "INICIALES_S"].includes(colKey)) {
                        objAcumulado[colKey] = "-";
                    } else {
                        let sumaTotalDistrito = 0;
                        bdMadre.forEach(reg => {
                            let val = parseFloat(reg[colKey] || 0);
                            if (!isNaN(val)) sumaTotalDistrito += val;
                        });
                        objAcumulado[colKey] = sumaTotalDistrito;
                    }
                }
            });
            construirTablaHTML('#tablaAcumuladoReporte', [objAcumulado], false);
        }

    } catch (error) {
        console.error("Error al procesar los reportes del Dtto 03:", error);
    }
}

// Cargar al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(cargarReportesDto03, 1000);
});
