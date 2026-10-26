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

// ESTRUCTURA DE COLUMNAS DE LA BD PRINCIPAL (EMPATADA Y LIMPIA PARA FIREBASE)
const ESTRUCTURA_BD_MADRE = [ 
    { key: 'IDMAC', num: 0 },
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
    { key: 'REPOSISION', num: 11 }, 
    { key: 'CORR_DE_DATOS_DIRECCION', num: 12 }, 
    { key: 'REINCORPORACION', num: 13 }, 
    { key: 'REEMPLAZO', num: 14 }, 
    { key: 'REIMPRESION', num: 15 }, 
    { key: 'TOTAL_DE_TRAMITES', num: 16 }, 
    { key: 'CANCELADOS', num: 17 }, 
    { key: 'TOTAL_DE_ANEXO_DE_RECHAZO', num: 18 }, 
    { key: 'CPV_DEVUELTA_ENTREGA', num: 19 }, 
    { key: 'DISPONIBLES_AL_DIA_ANTERIOR', num: 20 }, 
    { key: 'RECIBIDAS', num: 21 }, 
    { key: 'RECIBIDAS_DE_OTROS_TIPOS', num: 22 }, 
    { key: 'ENTREGADAS', num: 23 }, 
    { key: 'RECIBO_YO_EXTRAVIO', num: 24 }, 
    { key: 'ANEXAS_A_FUAR', num: 25 }, 
    { key: 'DATOS_ERRONEOS', num: 26 }, 
    { key: 'FOTO_MAL_IMPRESA', num: 27 }, 
    { key: 'REIMPRESION_2', num: 28 }, 
    { key: 'RETIRADAS_POR_CAUSA', num: 29 }, 
    { key: 'DISPONIBLES', num: 30 }, 
    { key: 'CREDENCIALES_X_CANJE', num: 31 }, 
    { key: 'FICHAS_ENTREGADAS', num: 32 }, 
    { key: 'FICHAS_ATENDIDAS', num: 33 }, 
    { key: 'DIAS_TRABAJADOS', num: 34 }, 
    { key: 'SOLICITUD_EXPEDICION_REPATRIADOS', num: 35 }, 
    { key: 'SOLICITUD_EXPEDICION_ORDINARIA', num: 36 }, 
    { key: 'SOLICITUD_DE_RECTIFICACION', num: 37 }, 
    { key: 'DEMANDA_DE_JUICIO', num: 38 }, 
    { key: 'REMESA', num: 39 }, 
    { key: 'TOTAL_DE_MOVIMIENTOS', num: 40 }, 
    { key: 'DEVUELTAS_POR_TERCEROS', num: 41 }, 
    { key: '34_IMAGEN_INCONSISTENTE', num: 42 }, 
    { key: '35_MOVIMIENTO_POSTERIOR', num: 43 }, 
    { key: 'CONFIGURACION', num: 44 }, 
    { key: 'ENT', num: 45 }, 
    { key: 'DTTO', num: 46 }, 
    { key: 'MODULO', num: 47 }, 
    { key: 'RESGUARDO', num: 48 }, 
    { key: 'SOLICITUD_DE_REIMPRESION', num: 49 }, 
    { key: 'CPV_DEVUELA_ENTREGA_2', num: 50 }, 
    { key: 'SCRIPT_EJECUTADO', num: 51 }, 
    { key: 'FOLIO_NEC', num: 52 }, 
    { key: 'CARTOGRAFIA', num: 53 }, 
    { key: 'LOTES_DE_CREDENCIALES', num: 54 }, 
    { key: 'REGISTRADAS_POR_DIA', num: 55 }, 
    { key: 'FALTANTES', num: 56 }, 
    { key: 'OBSERVACIONES', num: 57 }, 
    { key: 'SIN_NOMBRE1', num: 58 }, 
    { key: 'SIN_NOMBRE2', num: 59 }, 
    { key: 'SIN_NOMBRE3', num: 60 }, 
    { key: 'MAC_QUE_RECIBE', num: 61 }, 
    { key: 'MAC_QUE_ENTREGA', num: 62 }, 
    { key: 'IMPORTADAS', num: 63 }, 
    { key: 'EXPORTADAS', num: 64 }, 
    { key: 'REPOSISION_REIMPRESIONES', num: 65 }, 
    { key: 'MAL_IMPRESA', num: 66 }, 
    { key: 'ERROR_EN_CARTOGRAFIA', num: 67 }, 
    { key: 'DEFUNCION', num: 68 }, 
    { key: 'SUSPENSION', num: 69 }, 
    { key: 'DUPLICADO', num: 70 }, 
    { key: 'ERROR_EN_NUM_DE_EMISION', num: 71 }, 
    { key: 'PERDIDA_DE_VIGENCIA', num: 72 }, 
    { key: 'MOV_POST', num: 73 }, 
    { key: 'ANEXAS_A_SOLICITUD', num: 74 }, 
    { key: 'OTRAS_BAJAS', num: 75 } 
];

let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasBdMadre')) || {};

// Copiar tabla a Excel
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
        alert("¡Tabla copiada al portapapeles! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaBdMadre'); 
    if(!thead) return;
    thead.innerHTML = "";
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
     
    ESTRUCTURA_BD_MADRE.forEach((colObj) => {
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
    if (!fila) return '0';
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

    return '0'; // Rellenar celdas faltantes con 0 por defecto
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
                const objRemesa = ESTRUCTURA_BD_MADRE.find(c => c.key === 'REMESA') || { key: 'REMESA', num: 39 };
                let valRemesa = obtenerValorFila(fila, objRemesa);
                if (valRemesa !== undefined && valRemesa !== null && String(valRemesa).trim() !== "" && String(valRemesa).trim() !== "0") {
                    remesasUnicas.add(String(valRemesa).trim());
                }
            });
        }
        lblRemesas.innerText = remesasUnicas.size;
    }
}

function procesarYMostrarDatos(datosAProcesar = bdMadreGlobal) {
    const tbody = document.getElementById('cuerpoTablaBdMadre'); 
    if(!tbody) return;
    tbody.innerHTML = "";
     
    actualizarContadores(datosAProcesar);
     
    if (datosAProcesar.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${ESTRUCTURA_BD_MADRE.length}" class="text-center text-muted py-4 fw-bold">⚠️ No hay registros disponibles en la BD Principal (bd_madre).</td></tr>`;
        return;
    }
     
    datosAProcesar.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_BD_MADRE.forEach(colObj => {
            let td = document.createElement('td');
            let val = obtenerValorFila(fila, colObj);
            if(typeof val === 'string' && val.includes('T00:00:00')) {
                val = val.split('T')[0];
            }
            td.innerText = val !== undefined && val !== null ? val : '0';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Buscador en tiempo real
document.addEventListener("DOMContentLoaded", () => {
    const inputBuscador = document.getElementById('inputBuscadorBdMadre') || document.getElementById('inputBuscadorDias');
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', (e) => {
            const textoFiltro = e.target.value.toLowerCase().trim();
            if (textoFiltro === "") {
                procesarYMostrarDatos(bdMadreGlobal);
                return;
            }
            const filtrados = bdMadreGlobal.filter(fila => {
                return ESTRUCTURA_BD_MADRE.some(colObj => {
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

// Semáforo de conexión Firebase
onValue(ref(db, ".info/connected"), (snap) => {
    const sem = document.getElementById("semaforoConexion");
    if(!sem) return;
    if (snap.val() === true) { 
        sem.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill"; 
        sem.innerHTML = '<i class="bi bi-check-circle"></i> ONLINE'; 
    } else { 
        sem.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill"; 
        sem.innerHTML = '<i class="bi bi-x-circle"></i> OFFLINE'; 
    }
});

// Escuchar cambios en la BD Principal en tiempo real
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
