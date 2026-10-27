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

// ESTRUCTURA EXACTA HASTA DISPONIBLES_TOTAL (SIN COLUMNAS _2)
const ESTRUCTURA_DIAS = [ 
    { key: 'IDMAC', num: 0 },
    { key: 'REMESA', num: 39 }, 
    { key: 'MODULO', num: 47 }, 
    { key: 'DIA', num: 1 }, 
    { key: 'FECHA', num: 2 }, 
    { key: 'HORAS_TRABAJADAS', num: 3 }, 
    { key: 'SEDES', num: 4 }, 
    { key: 'INICIAL', num: 5 }, 
    { key: 'FINAL', num: 6 }, 
    { key: 'TOTAL_DE_FOLIOS', num: 7 }, 
    { key: 'INSCRIPCIONES', num: 8 }, 
    { key: 'CORRECCION_DE_DATOS_PERSONALES', num: 9 }, 
    { key: 'CAMBIO_DE_DOMICILIO', num: 10 }, 
    { key: 'REPOSICION', num: 11 }, 
    { key: 'CORR_DE_DATOS_DIRECCION', num: 12 }, 
    { key: 'REINCORPORACION', num: 13 }, 
    { key: 'REEMPLAZO', num: 14 }, 
    { key: 'REIMPRESION', num: 15 }, 
    { key: 'TOTAL_DE_TRAMITES', num: 16 }, 
    { key: 'CANCELADOS', num: 17 }, 
    { key: 'TOTAL_DE_ANEXOS_POR_RECHAZO', num: 18 }, 
    { key: 'CRED_PROD_CANJE_POR_NUEVA', num: 30 },
    { key: 'DISPONIBLES_AL_DIA_ANTERIOR', num: 19 }, 
    { key: 'ACTUALIZACION', num: 20 }, 
    { key: 'RECIBIDAS_DE_OTROS_TIPOS', num: 21 }, 
    { key: 'ENTREGADAS', num: 22 }, 
    { key: 'ROBO_Y_O_EXTRAVIO', num: 23 }, 
    { key: 'ANEXAS_A_FUAR', num: 24 }, 
    { key: 'DATOS_ERRONEOS', num: 25 }, 
    { key: 'FOTO_MAL_IMPRESA', num: 26 }, 
    { key: 'RETIRADA_POR_REIMPRESION', num: 27 }, 
    { key: 'RETIRADAS_POR_CAUSA', num: 28 }, 
    { key: 'DISPONIBLES_TOTAL', num: 29 }
];

let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};

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

function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias'); 
    if(!thead) return;
    thead.innerHTML = "";
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
     
    ESTRUCTURA_DIAS.forEach((colObj) => {
        let th = document.createElement('th'); 
        th.setAttribute('data-col', colObj.key);
        th.innerText = colObj.key.replace(/_/g, ' ');
        if (anchosGuardados[colObj.key]) { 
            th.style.width = anchosGuardados[colObj.key]; 
            th.style.minWidth = anchosGuardados[colObj.key]; 
        } else { 
            th.style.minWidth = "90px"; 
        }
        trT.appendChild(th);
         
        let thN = document.createElement('th'); 
        thN.innerText = colObj.num; 
        trN.appendChild(thN);
    });
    thead.appendChild(trT); 
    thead.appendChild(trN);
}

function obtenerValorFila(fila, colObj) {
    if (!fila) return '';
    const key = colObj.key;
    const num = colObj.num;

    if (fila[key] !== undefined && fila[key] !== null) return fila[key];
    if (num !== undefined) {
        if (fila[num] !== undefined && fila[num] !== null) return fila[num];
        if (fila[String(num)] !== undefined && fila[String(num)] !== null) return fila[String(num)];
    }

    const cleanKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_./]/g, '');
    const foundKey = Object.keys(fila).find(k => {
        const cleanK = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_./]/g, '');
        return cleanK === cleanKey;
    });

    if (foundKey && fila[foundKey] !== undefined && fila[foundKey] !== null) return fila[foundKey];

    return '';
}

function actualizarContadores(datosMostrados) {
    const lblLineas = document.getElementById('lblTotalLineas');
    const lblRemesas = document.getElementById('lblTotalRemesas');
     
    const total = Array.isArray(datosMostrados) ? datosMostrados.length : 0;
     
    if (lblLineas) {
        lblLineas.innerText = total;
    }

    if (lblRemesas) {
        const remesasUnicas = new Set();
        if (Array.isArray(datosMostrados)) {
            datosMostrados.forEach(fila => {
                const objRemesa = ESTRUCTURA_DIAS.find(c => c.key === 'REMESA') || { key: 'REMESA', num: 39 };
                let valRemesa = obtenerValorFila(fila, objRemesa);
                if (valRemesa !== undefined && valRemesa !== null && String(valRemesa).trim() !== "") {
                    remesasUnicas.add(String(valRemesa).trim());
                }
            });
        }
        lblRemesas.innerText = remesasUnicas.size;
    }
}

function procesarYMostrarDatos(datosAProcesar = bdMadreGlobal) {
    const tbody = document.getElementById('cuerpoTablaDias'); 
    if(!tbody) return;
    tbody.innerHTML = "";
     
    actualizarContadores(datosAProcesar);
     
    if (datosAProcesar.length === 0) return;
     
    // ORDENAMIENTO: Remesa descendente (mayor a menor), y Módulo ascendente (050351, 050353, 050354)
    let datosOrdenados = [...datosAProcesar].sort((a, b) => {
        const objRemesa = ESTRUCTURA_DIAS.find(c => c.key === 'REMESA') || { key: 'REMESA', num: 39 };
        const objModulo = ESTRUCTURA_DIAS.find(c => c.key === 'MODULO') || { key: 'MODULO', num: 47 };

        let remA = String(obtenerValorFila(a, objRemesa)).trim();
        let remB = String(obtenerValorFila(b, objRemesa)).trim();
        if (remA !== remB) {
            return remB.localeCompare(remA, undefined, { numeric: true }); // Mayor a menor (descendente)
        }

        let modA = String(obtenerValorFila(a, objModulo)).trim();
        let modB = String(obtenerValorFila(b, objModulo)).trim();
        return modA.localeCompare(modB, undefined, { numeric: true }); // Orden de módulos específico
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_DIAS.forEach(colObj => {
            let td = document.createElement('td');
            let val = obtenerValorFila(fila, colObj);
            if(typeof val === 'string' && val.includes('T00:00:00')) {
                val = val.split('T')[0];
            }
            td.innerText = val !== undefined && val !== null ? val : '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Lógica del buscador en tiempo real
document.addEventListener("DOMContentLoaded", () => {
    const inputBuscador = document.getElementById('inputBuscadorDias');
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', (e) => {
            const textoFiltro = e.target.value.toLowerCase().trim();
            if (textoFiltro === "") {
                procesarYMostrarDatos(bdMadreGlobal);
                return;
            }
            const filtrados = bdMadreGlobal.filter(fila => {
                return ESTRUCTURA_DIAS.some(colObj => {
                    let val = String(obtenerValorFila(fila, colObj)).toLowerCase();
                    return val.includes(textoFiltro);
                });
            });
            procesarYMostrarDatos(filtrados);
        });
    }
});

// Inicialización de la cabecera
construirHeaderTabla();

// Conexión de Firebase
onValue(ref(db, ".info/connected"), (snap) => {
    const sem = document.getElementById("semaforoConexion");
    if(!sem) return;
    if (snap.val() === true) { 
        sem.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill online-glow"; 
        sem.innerHTML = 'ONLINE'; 
    } else { 
        sem.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill offline-glow"; 
        sem.innerHTML = 'OFFLINE'; 
    }
});

onValue(ref(db, 'bd_madre'), (snapshot) => {
    if (snapshot.exists()) { 
        const data = snapshot.val();
        bdMadreGlobal = Array.isArray(data) ? data : Object.values(data); 
        console.log("✅ Datos cargados en bdMadreGlobal:", bdMadreGlobal.length);
        procesarYMostrarDatos(bdMadreGlobal);
    } else {
        console.warn("⚠️ La ruta bd_madre está vacía o no existe en Firebase.");
        bdMadreGlobal = [];
        procesarYMostrarDatos(bdMadreGlobal);
    }
}, (error) => {
    console.error("❌ Error al conectar con Firebase:", error);
});
