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

const ESTRUCTURA_DIAS = [ 
    { key: 'Remesa', num: 39 }, { key: 'Módulo', num: 47 }, { key: 'Día', num: 1 }, { key: 'Fecha', num: 2 }, 
    { key: 'Sedes', num: 4 }, { key: 'Horas_trabajadas', num: 3 }, { key: 'Inicial', num: 5 }, { key: 'Final', num: 6 }, 
    { key: 'Total_de_folios', num: 7 }, { key: 'Inscripciones', num: 8 }, { key: 'Corrección_de_datos_personales', num: 9 }, 
    { key: 'Cambio_de_domicilio', num: 10 }, { key: 'Reposición', num: 11 }, { key: 'Corr._de_datos_dirección', num: 12 }, 
    { key: 'Reincorporación', num: 13 }, { key: 'Reemplazo', num: 14 }, { key: 'Reimpresión', num: 15 }, 
    { key: 'Total_de_trámites', num: 16 }, { key: 'Cancelados', num: 17 }, { key: 'Total_de_anexos_por_rechazo', num: 18 }, 
    { key: 'CPV_devuelta_entrega', num: 19 }, { key: 'Disponibles_al_día_anterior', num: 20 }, { key: 'Actualización', num: 21 }, 
    { key: 'Recibidas_de_otros_tipos', num: 22 }, { key: 'Entregadas', num: 23 }, { key: 'Recibo_y/o_extravío', num: 24 }, 
    { key: 'Anexas_a_fuar', num: 25 }, { key: 'Datos_erróneos', num: 26 }, { key: 'Foto_mal_impresa', num: 27 }, 
    { key: 'Solicitud_de_reimpresión', num: 28 }, { key: 'Retiradas_por_otra_causa', num: 29 }, { key: 'Disponibles', num: 30 }, 
    { key: 'Credenciales_x_canje', num: 31 }, { key: 'Fichas_entregadas', num: 32 }, { key: 'Fichas_atendidas', num: 33 }, 
    { key: 'Días_trabajados', num: 34 }, { key: 'Cif_05', num: 35 }, { key: 'Solicitud_expedición', num: 36 }, 
    { key: 'Solicitud_rectificación', num: 37 }, { key: 'Demanda_de_juicio', num: 38 }, { key: 'Total_de_movimientos', num: 40 }, 
    { key: 'Creden._devueltas_por_terceros', num: 41 }, { key: 'Rechazos_de_MAC_34', num: 42 }, { key: 'Rechazos_de_MAC_35', num: 43 }, 
    { key: 'Configuración', num: 44 }, { key: 'Ent', num: 45 }, { key: 'Dtto', num: 46 }, { key: 'Resguardo', num: 48 }, 
    { key: 'Solicitud_de_reimpresión', num: 49 }, { key: 'CPV_devuelta_entrega_2', num: 50 }, { key: 'Script_ejecutados', num: 51 }, 
    { key: 'Folio_NEC', num: 52 }, { key: 'Número_de_trámites_aplicados', num: 53 }, { key: 'Número_de_fichas_requisitadas', num: 54 }, 
    { key: 'Número_de_archivos_de_transacción_aceptados', num: 55 }, { key: 'Total_de_archivos_de_transacción_procesados', num: 56 }, 
    { key: 'Credenciales_recibidas', num: 57 }, { key: 'Credenciales_inconsistentes', num: 58 }, { key: 'Credenciales_en_resguardo', num: 59 }, 
    { key: 'Credenciales_totales_en_SIIRFE_disponibles_para_entrega', num: 60 }, { key: 'Total_de_credenciales_entregadas', num: 61 }, 
    { key: 'Total_de_credenciales_solicitadas', num: 62 }, { key: 'Importadas', num: 63 }, { key: 'Exportadas', num: 64 }, 
    { key: 'Reposiciones_reimpresiones', num: 65 }, { key: 'Mal_impresa', num: 66 }, { key: 'Error_en_cartografía', num: 67 }, 
    { key: 'Defunción', num: 68 }, { key: 'Suspensión', num: 69 }, { key: 'Duplicado', num: 70 }, { key: 'Error_en_núm._de_emisión', num: 71 }, 
    { key: 'Pérdida_de_vigencia', num: 72 }, { key: 'Mov_post', num: 73 }, { key: 'Anexas_a_solicitud', num: 74 }, { key: 'Otras_bajas', num: 75 } 
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
    } else {
        console.warn("⚠️ No se encontró el elemento HTML con id 'lblTotalLineas'");
    }

    if (lblRemesas) {
        const remesasUnicas = new Set();
        if (Array.isArray(datosMostrados)) {
            datosMostrados.forEach(fila => {
                const objRemesa = ESTRUCTURA_DIAS.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
                let valRemesa = obtenerValorFila(fila, objRemesa);
                if (valRemesa !== undefined && valRemesa !== null && String(valRemesa).trim() !== "") {
                    remesasUnicas.add(String(valRemesa).trim());
                }
            });
        }
        lblRemesas.innerText = remesasUnicas.size;
    } else {
        console.warn("⚠️ No se encontró el elemento HTML con id 'lblTotalRemesas'");
    }
}

function procesarYMostrarDatos(datosAProcesar = bdMadreGlobal) {
    const tbody = document.getElementById('cuerpoTablaDias'); 
    if(!tbody) return;
    tbody.innerHTML = "";
    
    actualizarContadores(datosAProcesar);
    
    if (datosAProcesar.length === 0) return;
    
    datosAProcesar.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_DIAS.forEach(colObj => {
            let td = document.createElement('td');
            let val = obtenerValorFila(fila, colObj);
            if(typeof val === 'string' && val.includes('T00:00:00')) {
                val = val.split('T')[0];
            }
            td.innerText = val;
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
