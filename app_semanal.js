// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (REPORTE SEMANAL)
// ==========================================
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

// ORDEN EXACTO BASADO EN TU IMAGEN DE REFERENCIA PARA EL REPORTE SEMANAL
const COLUMNAS_SEMANAL_KEYS = [
    "ENT", "DTTO", "MODULO", "REMESA", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", 
    "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", 
    "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", 
    "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION", 
    "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", 
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", 
    "TOTAL_DE_TRAMITES", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", 
    "TOTAL_DE_MOVIMIENTOS", "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", 
    "DEMANDA_DE_JUICIO", "INICIALES_A", "INICIALES_S", "INICIALES_C", "ACTUALIZACIÓN", 
    "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS"
];

let bdMadreGlobal = [];
let bdtotalesGlobal = [];

// ==========================================
// 2. SEMÁFORO DE CONEXIÓN FIREBASE
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

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    
    COLUMNAS_SEMANAL_KEYS.forEach((colKey) => {
        let thT = document.createElement('th');
        let nombreVisual = colKey.replace(/_/g, ' ')
                                  .replace('SOLICITU DE', 'SOLICITUD DE')
                                  .replace('DUPLICADO', 'DUPLICADOS')
                                  .replace('DISPONIBLES', 'DISPONIBLES TOTAL')
                                  .replace('CORR  DE', 'CORR DE');
        
        thT.innerText = nombreVisual;
        thT.style.height = "50px";
        thT.style.verticalAlignment = "middle";
        thT.style.fontSize = "11px";
        
        let anchoCelda = "90px"; 
        if(['MODULO', 'REMESA', 'ENT', 'DTTO'].includes(colKey)) anchoCelda = "70px"; 
        else if(['INICIAL', 'FINAL'].includes(colKey)) anchoCelda = "110px";
        
        thT.style.width = anchoCelda; 
        thT.style.minWidth = anchoCelda;
        
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) {
            thT.classList.add('bg-folios');
        }
        
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

// ==========================================
// 3. CARGA DE DATOS Y GESTIÓN DE REMESA
// ==========================================
function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) {
        limpio[key.toUpperCase().trim()] = item[key];
    }
    return limpio;
}

function cargarDatosSemanal() {
    construirHeaderTabla('#tablaSemanal');
    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        if (snapMadre.exists()) {
            const dataRaw = snapMadre.val();
            let arr = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            bdMadreGlobal = arr.map(normalizarObjeto);
        } else {
            bdMadreGlobal = [];
        }

        if (snapTotales.exists()) {
            const dataTotalesRaw = snapTotales.val();
            let arr = Array.isArray(dataTotalesRaw) ? dataTotalesRaw : Object.values(dataTotalesRaw);
            bdtotalesGlobal = arr.map(normalizarObjeto);
        } else {
            bdtotalesGlobal = [];
        }

        inicializarFiltroRemesa();
        renderTablaSemanal();
    }).catch(err => console.error("Error al leer la base de datos:", err));
}

function inicializarFiltroRemesa() {
    const inputRemesa = document.getElementById('inputRemesaFiltro');
    if (inputRemesa) {
        inputRemesa.removeEventListener('input', renderTablaSemanal);
        inputRemesa.addEventListener('input', renderTablaSemanal);
    }
}

function obtenerRemesaSeleccionada() {
    const inputRemesa = document.getElementById('inputRemesaFiltro');
    let remesaEscrita = inputRemesa ? inputRemesa.value.trim() : "";

    if (remesaEscrita !== "") return remesaEscrita;

    let remesasDisponibles = new Set();
    [...bdMadreGlobal, ...bdtotalesGlobal].forEach(f => {
        let r = String(f['REMESA'] || '').trim();
        if(r) remesasDisponibles.add(r);
    });

    if (remesasDisponibles.size > 0) {
        let listaRemesas = Array.from(remesasDisponibles).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        return listaRemesas[0]; 
    }
    return "";
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    let remesaActiva = obtenerRemesaSeleccionada();
    const lblRemesaActual = document.getElementById('lblRemesaActiva');
    if(lblRemesaActual) {
        lblRemesaActual.innerText = remesaActiva ? `Remesa en vista: ${remesaActiva}` : "Sin remesa detectada";
    }

    if (!remesaActiva) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_SEMANAL_KEYS.length}" class="text-center py-4 text-muted">No se encontró ninguna remesa.</td></tr>`;
        return;
    }

    let registrosTotalesRemesa = bdtotalesGlobal.filter(item => String(item['REMESA'] || '').trim() === String(remesaActiva));

    if (registrosTotalesRemesa.length > 0) {
        registrosTotalesRemesa.forEach(reg => {
            let tr = document.createElement('tr');
            COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
                let td = document.createElement('td');
                td.innerText = reg[colKey] !== undefined && reg[colKey] !== null ? reg[colKey] : "0";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        renderGranTotalDesdeRegistros(tbody, registrosTotalesRemesa, remesaActiva);
    } else {
        let filasRemesa = bdMadreGlobal.filter(item => String(item['REMESA'] || '').trim() === String(remesaActiva));
        if (filasRemesa.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${COLUMNAS_SEMANAL_KEYS.length}" class="text-center py-4 text-muted">No hay registros para la remesa: ${remesaActiva}</td></tr>`;
            return;
        }

        let modulosMap = {};
        filasRemesa.forEach(f => {
            let mod = String(f['MODULO'] || 'General').trim();
            if (!modulosMap[mod]) modulosMap[mod] = [];
            modulosMap[mod].push(f);
        });

        Object.keys(modulosMap).sort().forEach(modNombre => {
            let tr = document.createElement('tr');
            let registrosMod = modulosMap[modNombre];

            COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
                let td = document.createElement('td');
                if (colKey === "MODULO") td.innerText = modNombre;
                else if (colKey === "REMESA") td.innerText = remesaActiva;
                else if (colKey === "INICIAL" || colKey === "FINAL") td.innerText = "";
                else {
                    let sumaCol = 0;
                    registrosMod.forEach(reg => {
                        let val = parseFloat(reg[colKey] || 0);
                        if (!isNaN(val)) sumaCol += val;
                    });
                    td.innerText = sumaCol;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        renderGranTotalDesdeRegistros(tbody, filasRemesa, remesaActiva);
    }
}

function renderGranTotalDesdeRegistros(tbody, listaRegistros, remesaId) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
        let td = document.createElement('td');
        if (colKey === "MODULO") td.innerText = "GRAN TOTAL";
        else if (colKey === "REMESA") td.innerText = remesaId;
        else if (colKey === "INICIAL" || colKey === "FINAL") td.innerText = ""; // Sin sumas en INICIAL/FINAL
        else {
            let sumaTotalRemesa = 0;
            listaRegistros.forEach(reg => {
                let val = parseFloat(reg[colKey] || 0);
                if (!isNaN(val)) sumaTotalRemesa += val;
            });
            td.innerText = sumaTotalRemesa;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

// Iniciar
cargarDatosSemanal();
