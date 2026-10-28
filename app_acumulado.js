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
    "SOLICITUD_DE_RECTIFICACION", "DEMANDA_DE_JUICIO", "INICIALES_C", "ACTUALIZACION", 
    "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", 
    "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "ROBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_CAUSA", "SOBRANTES", "DUPLICADOS", "DISPONIBLES_TOTAL", 
    "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", 
    "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", 
    "DIAS_TRABAJADOS", "CONFIGURACION"
];

// MAPA_NUMEROS sincronizado 1 a 1 con tu nuevo orden de columnas
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
    
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
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
    
    let dataF = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    let remesasDisponibles = [...new Set(dataF.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)))].filter(x => !isNaN(x)).sort((a, b) => a - b);
    
    let rIniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
    let rFinVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : (remesasDisponibles[0] || 1);
    let remesaMaximaBD = remesasDisponibles.length > 0 ? remesasDisponibles[remesasDisponibles.length - 1] : 999;
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
        let indexNegro = modTarget === '50351' ? 0 : (modTarget === '50353' ? 7 : 14);
        
        if(uReg && obtenerValorFlexible(uReg, 'FINAL')) {
            ESTRUCTURA_21[indexNegro].finalReal = obtenerValorFlexible(uReg, 'FINAL');
        } else {
            ESTRUCTURA_21[indexNegro].finalReal = ESTRUCTURA_21[indexNegro].finalDefault;
        }

        let camposTrámites = [
            'INSCRIPCIONES', 'CORRECCION_DE_DATOS_PERSONALES', 'CAMBIO_DE_DOMICILIO', 
            'REPOSICION_REIMPRESIONES', 'CORR_DE_DATOS_DIRECCION', 'REINCORPORACION', 
            'REEMPLAZO', 'CANCELADOS'
        ];

        let sumasMod = {};
        camposTrámites.forEach(c => { sumasMod[c] = 0; });

        regsMod.forEach(r => {
            camposTrámites.forEach(c => {
                let v = parseFloat(obtenerValorFlexible(r, c) || 0);
                if(!isNaN(v)) sumasMod[c] += v;
            });
        });

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
        let foliosDet = 0;
        if (rFinNum >= rIniNum && rIniNum > 0) {
            foliosDet = rFinNum - rIniNum + 1;
        } else if (item.inicial === "24050351109082" || item.inicial === "25050351109053") {
            foliosDet = Math.abs(rFinNum - rIniNum) + 1; 
        }

        COLUMNAS_ACUMULADO_KEYS.forEach(col => {
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
                if(isNegro) {
                    tdDet.className = "text-dark fw-bold";
                    acumuladorGranTotal[col] += foliosDet;
                } else {
                    tdDet.className = "text-danger fw-bold";
                }
            } else {
                if(isNegro && item.sumas && item.sumas[col] !== undefined) {
                    valDet = item.sumas[col];
                    acumuladorGranTotal[col] += valDet;
                } else {
                    valDet = "";
                }
            }
            tdDet.innerText = valDet !== 0 ? valDet : "";
            trDetalle.appendChild(tdDet);
        });
        tbody.appendChild(trDetalle);
    });
    
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        let td = document.createElement('td');
        if(col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if (['ENT', 'DTTO', 'INICIAL', 'FINAL', 'INICIALES_C', 'CONFIGURACION'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = acumuladorGranTotal[col] || 0; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

const dbRefConfigAcumulado = ref(db, 'configuracion/acumulado');
onValue(dbRefConfigAcumulado, (snapshot) => {
    if (snapshot.exists()) {
        const config = snapshot.val();
        if (config.inicio !== undefined && document.getElementById('inputAcumuladoInicio')) document.getElementById('inputAcumuladoInicio').value = config.inicio;
        if (config.fin !== undefined && document.getElementById('inputAcumuladoFin')) document.getElementById('inputAcumuladoFin').value = config.fin;
    }
    renderTabla();
});

const btnGuardarAcumulado = document.getElementById('btnGuardarAcumulado');
if(btnGuardarAcumulado) {
    btnGuardarAcumulado.addEventListener('click', () => {
        let iniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
        let finVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

        set(dbRefConfigAcumulado, {
            inicio: iniVal,
            fin: finVal
        }).then(() => {
            alert("¡Rango de acumulado guardado en la nube y sincronizado!");
            renderTabla();
        }).catch((error) => {
            console.error("Error al guardar configuración en Firebase:", error);
            alert("Hubo un error al guardar el rango en la nube.");
        });
    });
}

construirHeaderTabla();

Promise.all([get(ref(db, 'bd_madre')), get(ref(db, 'bdtotales'))]).then(([sM, sT]) => {
    let aM = sM.exists() ? (Array.isArray(sM.val())?sM.val():Object.values(sM.val())).map(normalizarObj) : [];
    let aT = sT.exists() ? (Array.isArray(sT.val())?sT.val():Object.values(sT.val())).map(normalizarObj) : [];
    bdtotalesGlobal = aT;
    bdMadreGlobal = aM;

    let todasRemesas = [...new Set([...aT, ...aM].map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)))].filter(x => !isNaN(x)).sort((a, b) => a - b);
    
    if(todasRemesas.length > 0) {
        let remesaMax = todasRemesas[todasRemesas.length - 1];
        let inputFin = document.getElementById('inputAcumuladoFin');
        if(inputFin) {
            inputFin.placeholder = `Máx: ${remesaMax}`;
        }

        get(dbRefConfigAcumulado).then((snap) => {
            if (!snap.exists() || !snap.val().inicio) {
                set(dbRefConfigAcumulado, {
                    inicio: String(todasRemesas[0]),
                    fin: ""
                });
            }
        });
    }

    renderTabla();
});

function normalizarObj(i) { let l={}; for(let k in i) l[k.toUpperCase().trim()] = i[k]; return l; }
