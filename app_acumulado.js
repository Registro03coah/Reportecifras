import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_ACUMULADO_KEYS = [
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
    "DIAS_TRABAJADOS", "CONFIGURACION", "REMESA"
];

const MAPA_NUMEROS = {};
COLUMNAS_ACUMULADO_KEYS.forEach((col, index) => {
    MAPA_NUMEROS[col] = index + 1;
});
MAPA_NUMEROS["REMESA"] = 45; 
MAPA_NUMEROS["ENT"] = 46; 
MAPA_NUMEROS["DTTO"] = 47; 
MAPA_NUMEROS["MODULO"] = 48;

function obtenerNumeroColumna(key) { return MAPA_NUMEROS[key] || '-'; }

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
        alert("¡Tabla copiada con todo y la fila de totales! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

let bdtotalesGlobal = []; 
let bdMadreGlobal = [];

onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(sem) {
        sem.className = s.val() ? "badge bg-success text-white ms-2" : "badge bg-danger text-white ms-2";
        sem.innerHTML = s.val() ? '<i class="bi bi-check-circle"></i> ONLINE' : '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaAcumulado thead'); if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    COLUMNAS_ACUMULADO_KEYS.filter(c => c !== 'REMESA').forEach(col => {
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

function renderTabla() {
    const tbody = document.querySelector('#tablaAcumulado tbody'); if(!tbody) return; tbody.innerHTML = "";
    
    const contenedorTabla = document.querySelector('#tablaAcumulado')?.closest('.table-responsive');
    if(contenedorTabla) {
        contenedorTabla.style.maxHeight = "none";
        contenedorTabla.style.overflowY = "visible";
    }

    let dataF = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    let remesasDisponibles = [...new Set(dataF.map(x => obtenerValorFlexible(x, 'REMESA')))].filter(x => x !== "").sort((a, b) => {
        let numA = parseInt(a, 10) || 0;
        let numB = parseInt(b, 10) || 0;
        return numA - numB;
    });
    
    let rIniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
    let rFinVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : (parseInt(remesasDisponibles[0], 10) || 1);
    let remesaMaximaBD = remesasDisponibles.length > 0 ? (parseInt(remesasDisponibles[remesasDisponibles.length - 1], 10) || 999) : 999;
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesaMaximaBD;

    let inputFinEl = document.getElementById('inputAcumuladoFin');
    if(inputFinEl && !inputFinEl.value && remesaMaximaBD !== 999) {
        inputFinEl.placeholder = `Máx: ${remesaMaximaBD}`;
    }

    let registrosRango = dataF.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    });

    const ESTRUCTURA_21 = [
        { tipo: "NEGRO", modulo: "50351", inicial: "2605035108669", finalDefault: "2605035130714" },
        { tipo: "ROJO",  modulo: "50351", inicial: "2605035100001", final: "2605035108668" },
        { tipo: "ROJO",  modulo: "50351", inicial: "2505035125557", final: "2505035139930" },
        { tipo: "ROJO",  modulo: "50351", inicial: "25050351109053", final: "25050351125556" },
        { tipo: "ROJO",  modulo: "50351", inicial: "2505035100001", final: "2505035109052" },
        { tipo: "ROJO",  modulo: "50351", inicial: "24050351119618", final: "24050351132139" },
        { tipo: "ROJO",  modulo: "50351", inicial: "24050351109082", final: "24050351119617" },

        { tipo: "NEGRO", modulo: "50353", inicial: "2605035303086", finalDefault: "2605035312364" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2605035300001", final: "2605035303085" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2505035309689", final: "2505035316305" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2505035303324", final: "2505035309688" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2505035300001", final: "2505035303323" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2405035307991", final: "2405035313485" },
        { tipo: "ROJO",  modulo: "50353", inicial: "2405035303096", final: "2405035307990" },

        { tipo: "NEGRO", modulo: "50354", inicial: "2605035401973", finalDefault: "2605035406077" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2605035400001", final: "2605035401972" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2505035404268", final: "2505035408381" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2505035401417", final: "2505035404267" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2505035400001", final: "2505035401416" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2405035402884", final: "2405035405329" },
        { tipo: "ROJO",  modulo: "50354", inicial: "2405035400971", final: "2405035402883" }
    ];

    let acumuladorGranTotal = {};
    COLUMNAS_ACUMULADO_KEYS.forEach(col => { acumuladorGranTotal[col] = 0; });

    ['50351', '50353', '50354'].forEach(modTarget => {
        let regsMod = registrosRango.filter(r => String(obtenerValorFlexible(r, 'MODULO') || '').trim().includes(modTarget))
            .sort((a,b)=>parseInt(obtenerValorFlexible(a, 'REMESA')) - parseInt(obtenerValorFlexible(b, 'REMESA')));
        
        let uReg = regsMod.length > 0 ? regsMod[regsMod.length - 1] : null;
        let pReg = regsMod.length > 0 ? regsMod[0] : null; 
        let indexNegro = modTarget === '50351' ? 0 : (modTarget === '50353' ? 7 : 14);
        
        if(uReg && obtenerValorFlexible(uReg, 'FINAL')) {
            ESTRUCTURA_21[indexNegro].finalReal = obtenerValorFlexible(uReg, 'FINAL');
        } else {
            ESTRUCTURA_21[indexNegro].finalReal = ESTRUCTURA_21[indexNegro].finalDefault;
        }

        let sumasMod = {};
        COLUMNAS_ACUMULADO_KEYS.forEach(col => {
            if(!['ENT', 'DTTO', 'MODULO', 'INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS', 'CONFIGURACION', 'INICIALES_A', 'DISPONIBLES_TOTAL', 'REMESA'].includes(col)) {
                sumasMod[col] = 0;
            }
        });

        regsMod.forEach(r => {
            Object.keys(sumasMod).forEach(c => {
                let v = parseFloat(obtenerValorFlexible(r, c) || 0);
                if(!isNaN(v)) sumasMod[c] += v;
            });
        });

        if(uReg) {
            sumasMod['CONFIGURACION'] = obtenerValorFlexible(uReg, 'CONFIGURACION');
            sumasMod['DISPONIBLES_TOTAL'] = obtenerValorFlexible(uReg, 'DISPONIBLES_TOTAL');
        } else {
            sumasMod['CONFIGURACION'] = "";
            sumasMod['DISPONIBLES_TOTAL'] = "";
        }

        if(pReg) {
            sumasMod['INICIALES_A'] = obtenerValorFlexible(pReg, 'INICIALES_A');
        } else {
            sumasMod['INICIALES_A'] = "";
        }

        let totalTramites = (sumasMod['INSCRIPCIONES'] || 0) + 
                            (sumasMod['CORRECCION_DE_DATOS_PERSONALES'] || 0) + 
                            (sumasMod['CAMBIO_DE_DOMICILIO'] || 0) + 
                            (sumasMod['REPOSICION_REIMPRESIONES'] || 0) + 
                            (sumasMod['CORR_DE_DATOS_DIRECCION'] || 0) + 
                            (sumasMod['REINCORPORACION'] || 0) + 
                            (sumasMod['REEMPLAZO'] || 0);

        sumasMod['TOTAL_DE_TRAMITES'] = totalTramites;
        sumasMod['TOTAL_DE_MOVIMIENTOS'] = totalTramites - (sumasMod['CANCELADOS'] || 0);

        ESTRUCTURA_21[indexNegro].sumas = sumasMod;
    });

    ESTRUCTURA_21.forEach((item) => {
        let trDetalle = document.createElement('tr');
        let isNegro = (item.tipo === "NEGRO");

        let rIniStr = item.inicial;
        let rFinStr = isNegro ? item.finalReal : item.final;

        let rIniNum = parseFloat(rIniStr) || 0;
        let rFinNum = parseFloat(rFinStr) || 0;
        let foliosDet = (rFinNum >= rIniNum && rIniNum > 0) ? (rFinNum - rIniNum + 1) : 0;

        if (foliosDet > 0) {
            acumuladorGranTotal['TOTAL_DE_FOLIOS'] += foliosDet;
        }

        COLUMNAS_ACUMULADO_KEYS.filter(c => c !== 'REMESA').forEach(col => {
            let tdDet = document.createElement('td');
            let valDet = "";

            if(col === 'ENT') {
                valDet = "05";
                tdDet.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            } else if(col === 'DTTO') {
                valDet = "03";
                tdDet.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            } else if(col === 'MODULO') {
                valDet = item.modulo;
                tdDet.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            } else if(col === 'INICIAL') {
                valDet = rIniStr;
                tdDet.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            } else if(col === 'FINAL') {
                valDet = rFinStr;
                tdDet.className = isNegro ? "fw-bold" : "text-danger fw-bold";
            } else if(col === 'TOTAL_DE_FOLIOS') {
                valDet = foliosDet > 0 ? foliosDet : "";
                tdDet.className = isNegro ? "text-dark fw-bold" : "text-danger fw-bold";
            } else if(col === 'CONFIGURACION') {
                if(isNegro && item.sumas) valDet = item.sumas['CONFIGURACION'] !== undefined ? item.sumas['CONFIGURACION'] : "";
            } else if(col === 'INICIALES_A') {
                if(isNegro && item.sumas) valDet = item.sumas['INICIALES_A'] !== undefined ? item.sumas['INICIALES_A'] : "";
            } else if(col === 'DISPONIBLES_TOTAL') {
                if(isNegro && item.sumas) valDet = item.sumas['DISPONIBLES_TOTAL'] !== undefined ? item.sumas['DISPONIBLES_TOTAL'] : "";
            } else {
                if(isNegro && item.sumas && item.sumas[col] !== undefined) {
                    valDet = item.sumas[col];
                    acumuladorGranTotal[col] += (parseFloat(valDet) || 0);
                }
            }
            tdDet.innerText = valDet !== 0 ? valDet : "";
            trDetalle.appendChild(tdDet);
        });
        tbody.appendChild(trDetalle);
    });
    
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    COLUMNAS_ACUMULADO_KEYS.filter(c => c !== 'REMESA').forEach(col => {
        let td = document.createElement('td');
        if(col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if (['ENT', 'DTTO', 'INICIAL', 'FINAL', 'INICIALES_A', 'INICIALES_C', 'CONFIGURACION', 'DISPONIBLES_TOTAL'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = acumuladorGranTotal[col] || 0; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);

    // ==========================================
    // SINCRONIZACIÓN AUTOMÁTICA CON FIREBASE (Espejo para Reportesdto03)
    // ==========================================
    let tablaEl = document.getElementById('tablaAcumulado');
    if (tablaEl) {
        let theadEl = tablaEl.querySelector('thead');
        let tbodyEl = tablaEl.querySelector('tbody');
        if (theadEl && tbodyEl) {
            set(ref(db, 'configuracion/reportes_dto03/acumulado'), {
                htmlThead: theadEl.innerHTML,
                htmlTbody: tbodyEl.innerHTML
            });
        }
    }
}

// (Resto de funciones de modales, guardado de rangos y ajustes manuales se mantienen igual...)
