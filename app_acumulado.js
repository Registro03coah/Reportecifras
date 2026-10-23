import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const COLUMNAS_ACUMULADO_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSISION_REIMPRESIONES", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", 
    "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", 
    "INICIALES_A", "ACTUALIZACIÓN", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "ANEXAS_A_FUAR", 
    "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", 
    "SOBRANTES", "DUPLICADO", "DISPONIBLES", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", 
    "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"
];

const HISTORIAL_ROJOS = {
    "50351": [
        { i: "2605035100001", f: "2605035108668" },
        { i: "2505035125557", f: "2505035139930" },
        { i: "2505035109053", f: "2505035125556" },
        { i: "2505035100001", f: "2505035109052" },
        { i: "2405035119618", f: "2405035132139" },
        { i: "2405035109082", f: "2405035119617" }
    ],
    "50353": [
        { i: "2605035300001", f: "2605035303085" },
        { i: "2505035309689", f: "2505035316305" },
        { i: "2505035303324", f: "2505035309688" },
        { i: "2505035300001", f: "2505035303323" },
        { i: "2405035307991", f: "2405035313485" },
        { i: "2405035303096", f: "2405035307990" }
    ],
    "50354": [
        { i: "2605035400001", f: "2605035401972" },
        { i: "2505035404268", f: "2505035408381" },
        { i: "2505035401417", f: "2505035404267" },
        { i: "2505035400001", f: "2505035401416" },
        { i: "2405035402884", f: "2405035405329" },
        { i: "2405035400971", f: "2405035402883" }
    ]
};

const INICIAL_ACTUAL = {
    "50351": "2605035108669",
    "50353": "2605035303086",
    "50354": "2605035401973"
};

const MODULOS_ORDEN = ["50351", "50353", "50354"];
let dataGlobalAcumulado = [];

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

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    
    COLUMNAS_ACUMULADO_KEYS.forEach((colKey) => {
        let thT = document.createElement('th');
        let nombreVisual = colKey.replace(/_/g, ' ')
                                  .replace('SOLICITU DE', 'SOLICITUD DE')
                                  .replace('DUPLICADO', 'DUPLICADOS')
                                  .replace('CORR  DE', 'CORR DE')
                                  .replace('CREDEN DEVUELTAS POR TERCEROS', 'DEVUELTAS POR TERCEROS');
        
        thT.innerText = nombreVisual;
        
        let anchoCelda = "90px"; 
        if(['MODULO', 'ENT', 'DTTO'].includes(colKey)) anchoCelda = "70px"; 
        else if(['INICIAL', 'FINAL'].includes(colKey)) anchoCelda = "130px";
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda;
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) thT.classList.add('bg-folios');
        
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
    return limpio;
}

function cargarDatosAcumulado() {
    construirHeaderTabla('#tablaAcumulado');

    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        let arrMadre = snapMadre.exists() ? (Array.isArray(snapMadre.val()) ? snapMadre.val() : Object.values(snapMadre.val())).map(normalizarObjeto) : [];
        let arrTotales = snapTotales.exists() ? (Array.isArray(snapTotales.val()) ? snapTotales.val() : Object.values(snapTotales.val())).map(normalizarObjeto) : [];
        
        dataGlobalAcumulado = [...arrTotales, ...arrMadre];
        renderTablaAcumulado();
    }).catch(err => console.error("Error al leer datos:", err));
}

function renderTablaAcumulado() {
    const tbody = document.querySelector('#tablaAcumulado tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    let modulosMap = { "50351": [], "50353": [], "50354": [] };
    
    dataGlobalAcumulado.forEach(f => {
        let modRaw = String(f['MODULO'] || '').trim();
        let mod = modRaw.replace(/^0+/, ''); 
        if (modulosMap[mod]) modulosMap[mod].push(f);
    });

    let sumaGranTotalFolios = 0;

    MODULOS_ORDEN.forEach(modNombre => {
        let registrosMod = modulosMap[modNombre].sort((a, b) => String(a['REMESA']).localeCompare(String(b['REMESA'])));
        
        let trNegra = document.createElement('tr');
        let maxFinal = 0;
        registrosMod.forEach(r => {
            let val = Number(r["FINAL"]);
            if (!isNaN(val) && val > maxFinal) maxFinal = val;
        });
        
        let cIniActual = Number(INICIAL_ACTUAL[modNombre]);
        let foliosNegra = (maxFinal > 0 && cIniActual > 0) ? (maxFinal - cIniActual + 1) : 0;
        sumaGranTotalFolios += foliosNegra;

        COLUMNAS_ACUMULADO_KEYS.forEach(colKey => {
            let td = document.createElement('td');

            if (colKey === "ENT") td.innerText = "05";
            else if (colKey === "DTTO") td.innerText = "03";
            else if (colKey === "MODULO") td.innerText = modNombre;
            else if (colKey === "INICIAL") td.innerText = INICIAL_ACTUAL[modNombre];
            else if (colKey === "FINAL") td.innerText = maxFinal > 0 ? maxFinal : "";
            else if (colKey === "TOTAL_DE_FOLIOS") td.innerText = foliosNegra;
            else if (colKey === "INICIALES_A") {
                td.innerText = registrosMod.length > 0 ? (registrosMod[0][colKey] || "0") : "0";
            } else if (colKey === "CONFIGURACION") {
                td.innerText = registrosMod.length > 0 ? (registrosMod[registrosMod.length - 1][colKey] || "0") : "0";
            } else if (colKey === "REPOSISION_REIMPRESIONES") {
                let sumaCol = 0;
                registrosMod.forEach(reg => {
                    let r1 = parseFloat(reg["REPOSISION"] || 0);
                    let r2 = parseFloat(reg["REIMPRESION"] || 0);
                    if (!isNaN(r1)) sumaCol += r1;
                    if (!isNaN(r2)) sumaCol += r2;
                });
                td.innerText = sumaCol;
            } else {
                let sumaCol = 0;
                registrosMod.forEach(reg => {
                    let val = parseFloat(reg[colKey] || 0);
                    if (!isNaN(val)) sumaCol += val;
                });
                td.innerText = sumaCol;
            }
            trNegra.appendChild(td);
        });
        tbody.appendChild(trNegra);

        let historial = HISTORIAL_ROJOS[modNombre] || [];
        historial.forEach(rango => {
            let trRoja = document.createElement('tr');
            trRoja.classList.add('fila-historica');
            
            let cIniHist = Number(rango.i);
            let cFinHist = Number(rango.f);
            let foliosRoja = (cFinHist - cIniHist + 1);
            sumaGranTotalFolios += foliosRoja;

            COLUMNAS_ACUMULADO_KEYS.forEach(colKey => {
                let td = document.createElement('td');
                if (colKey === "ENT") td.innerText = "05";
                else if (colKey === "DTTO") td.innerText = "03";
                else if (colKey === "MODULO") td.innerText = modNombre;
                else if (colKey === "INICIAL") td.innerText = rango.i;
                else if (colKey === "FINAL") td.innerText = rango.f;
                else if (colKey === "TOTAL_DE_FOLIOS") td.innerText = foliosRoja;
                else td.innerText = "";
                
                trRoja.appendChild(td);
            });
            tbody.appendChild(trRoja);
        });
    });

    renderGranTotalAcumulado(tbody, modulosMap, sumaGranTotalFolios);
}

function renderGranTotalAcumulado(tbody, modulosMap, sumaGlobalFolios) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    let todosLosRegistros = [];
    MODULOS_ORDEN.forEach(m => todosLosRegistros = todosLosRegistros.concat(modulosMap[m]));
    
    COLUMNAS_ACUMULADO_KEYS.forEach(colKey => {
        let td = document.createElement('td');

        if (colKey === "MODULO") td.innerText = "TOTAL";
        else if (["ENT", "DTTO", "INICIAL", "FINAL", "INICIALES_A", "CONFIGURACION"].includes(colKey)) {
            td.innerText = ""; 
        } else if (colKey === "TOTAL_DE_FOLIOS") {
            td.innerText = sumaGlobalFolios;
        } else if (colKey === "REPOSISION_REIMPRESIONES") {
            let sumaTotal = 0;
            todosLosRegistros.forEach(reg => {
                let r1 = parseFloat(reg["REPOSISION"] || 0);
                let r2 = parseFloat(reg["REIMPRESION"] || 0);
                if (!isNaN(r1)) sumaTotal += r1;
                if (!isNaN(r2)) sumaTotal += r2;
            });
            td.innerText = sumaTotal;
        } else {
            let sumaTotal = 0;
            todosLosRegistros.forEach(reg => {
                let val = parseFloat(reg[colKey] || 0);
                if (!isNaN(val)) sumaTotal += val;
            });
            td.innerText = sumaTotal;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

cargarDatosAcumulado();
