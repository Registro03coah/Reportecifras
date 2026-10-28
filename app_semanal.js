/**
 * Sistema de Reportes Diarios - Módulos MAC (Nube)
 * Versión: 11.1
 */

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

const ESTRUCTURA_SEMANAL = [
    { key: 'Ent', num: 45 },
    { key: 'Dtto', num: 46 },
    { key: 'Módulo', num: 47 },
    { key: 'Remesa', num: 39 },
    { key: 'Inicial', num: 5 },
    { key: 'Final', num: 6 },
    { key: 'Total_de_folios', num: 7 },
    { key: 'no_utilizados', num: 88 },
    { key: 'Inscripciones', num: 8 },
    { key: 'Corrección_de_datos_personales', num: 9 },
    { key: 'Cambio_de_domicilio', num: 10 },
    { key: 'Reposición', num: 11 },
    { key: 'Corr._de_datos_dirección', num: 12 },
    { key: 'Reincorporación', num: 13 },
    { key: 'Reemplazo', num: 14 },
    { key: 'ReimpresiOn', num: 15 },
    { key: 'Total_de_trámites', num: 16 },
    { key: 'Rechazos_de_MAC_34', num: 42 },
    { key: 'Rechazos_de_MAC_35', num: 43 },
    { key: 'Cancelados', num: 17 },
    { key: 'Total_de_movimientos', num: 40 },
    { key: 'Cif-05', num: 35 },
    { key: 'SOLICITUD_EXPEDICION_ORDINARIA', num: 36 },
    { key: 'SOLICITUD_DE_RECTIFICACION', num: 37 },
    { key: 'Demanda_de_juicio', num: 38 },
    { key: 'Iniciales_S', num: 78 },
    { key: 'Actualización', num: 21 },
    { key: 'Recibidas_de_otros_tipos', num: 22 },
    { key: 'Importadas', num: 63 },
    { key: 'Exportadas', num: 64 },
    { key: 'Entregadas', num: 23 },
    { key: 'Anexas_a_fuar', num: 25 },
    { key: 'Resguardo', num: 48 },
    { key: 'Solicitud_de_reimpresión', num: 28 },
    { key: 'ROBO_Y_O_EXTRAVIO', num: 24 },
    { key: 'Retiradas_por_causa', num: 29 },
    { key: 'SobranteS', num: 80 },
    { key: 'DuplicadoS', num: 70 },
    { key: 'DISPONIBLES_TOTAL', num: 30 },
    { key: 'Disponibles_de_sol_de_exp', num: 81 },
    { key: 'Reimpre_fuera_del_sistema', num: 82 },
    { key: 'creden_devueltas_por_terceros', num: 83 },
    { key: 'cred_producto_de_registro_duplicado', num: 84 },
    { key: 'CRED_PROD_CANJE_POR_NUEVA', num: 31 },
    { key: 'Días_trabajados', num: 34 },
    { key: 'Configuración', num: 44 }
];

let bdTotalesGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasSemanal')) || {};

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
        alert("¡Tabla copiada al portapapeles! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaSemanal'); 
    if(!thead) return;
    thead.innerHTML = "";
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    ESTRUCTURA_SEMANAL.forEach((colObj) => {
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

function obtenerUltimaRemesa(datos) {
    if (!datos || datos.length === 0) return null;
    let remesas = new Set();
    const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
    
    datos.forEach(fila => {
        let val = obtenerValorFila(fila, objRemesa);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
            remesas.add(String(val).trim());
        }
    });

    if (remesas.size === 0) return null;

    let listaRemesas = Array.from(remesas);
    listaRemesas.sort((a, b) => {
        let numA = parseFloat(a);
        let numB = parseFloat(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

    return listaRemesas[listaRemesas.length - 1];
}

function actualizarContadoresGlobales(datosMostrados, remesaActiva) {
    const contadorInfo = document.getElementById('contadorInfo');
    const totalLineas = bdTotalesGlobal.length;
    
    const remesasUnicasTotales = new Set();
    const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
    
    bdTotalesGlobal.forEach(fila => {
        let valRemesa = obtenerValorFila(fila, objRemesa);
        if (valRemesa !== undefined && valRemesa !== null && String(valRemesa).trim() !== "") {
            remesasUnicasTotales.add(String(valRemesa).trim());
        }
    });

    if (contadorInfo) {
        contadorInfo.innerHTML = `
            <i class="bi bi-collection-fill text-info"></i> Líneas: <span>${totalLineas}</span> | 
            <i class="bi bi-tags-fill text-warning"></i> Remesas Totales: <span>${remesasUnicasTotales.size}</span> | 
            <i class="bi bi-filter-circle-fill text-success"></i> Filtro: <span>${remesaActiva}</span>
        `;
    }

    // Reflejar la versión en el pie de página
    const footerVersion = document.getElementById('footerVersion');
    if (footerVersion) {
        footerVersion.innerText = "11.1";
    }
}

function procesarYMostrarDatosConFiltroRemesa() {
    const inputRemesa = document.getElementById('remesaFiltroInput'); 
    let remesaEscrita = inputRemesa ? inputRemesa.value.trim() : '';

    if (inputRemesa) localStorage.setItem('remesaUnicaSemanal_v11', remesaEscrita);

    const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
    let ultimaRemesaGlobal = obtenerUltimaRemesa(bdTotalesGlobal);

    let remesaEfectiva = remesaEscrita !== "" ? remesaEscrita : ultimaRemesaGlobal;

    let datosFiltrados = bdTotalesGlobal.filter(fila => {
        let valRemesa = String(obtenerValorFila(fila, objRemesa)).trim();
        return valRemesa === String(remesaEfectiva);
    });

    renderizarTablaConTotales(datosFiltrados, datosFiltrados[0]);
    actualizarContadoresGlobales(datosFiltrados, remesaEfectiva || 'N/A');
}

function renderizarTablaConTotales(datos, primeraFila) {
    const tbody = document.getElementById('cuerpoTablaSemanal'); 
    if(!tbody) return;
    tbody.innerHTML = "";
    
    if (!datos || datos.length === 0) return;

    let sumatoriasTotales = {};
    ESTRUCTURA_SEMANAL.forEach(colObj => {
        sumatoriasTotales[colObj.key] = 0;
    });

    datos.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_SEMANAL.forEach(colObj => {
            let td = document.createElement('td');
            let val = obtenerValorFila(fila, colObj);
            
            if(typeof val === 'string' && val.includes('T00:00:00')) {
                val = val.split('T')[0];
            }

            td.innerText = val;
            tr.appendChild(td);

            let numVal = parseFloat(val);
            if (!isNaN(numVal)) {
                sumatoriasTotales[colObj.key] += numVal;
            }
        });
        tbody.appendChild(tr);
    });

    // Fila de Totales con las reglas específicas de celdas en blanco, repetidas y sumadas
    let trTotales = document.createElement('tr');
    trTotales.className = 'fila-totales table-dark fw-bold';
    
    const columnasBlanco = ['Ent', 'Inicial', 'Final', 'Iniciales_S', 'Configuración'];
    const columnasRepetidas = ['Dtto', 'Remesa'];

    ESTRUCTURA_SEMANAL.forEach((colObj, index) => {
        let td = document.createElement('td');
        let nombreKeyNorm = colObj.key;

        if (index === 0) {
            td.innerText = "TOTALES";
        } else if (columnasBlanco.some(c => c.toLowerCase() === nombreKeyNorm.toLowerCase())) {
            td.innerText = ""; // Se quedan en blanco
        } else if (columnasRepetidas.some(c => c.toLowerCase() === nombreKeyNorm.toLowerCase())) {
            td.innerText = primeraFila ? obtenerValorFila(primeraFila, colObj) : ""; // Se repite el valor de la primera fila
        } else if (sumatoriasTotales[colObj.key] !== undefined && sumatoriasTotales[colObj.key] !== 0) {
            td.innerText = sumatoriasTotales[colObj.key]; // Demás columnas sumadas
        } else {
            td.innerText = "";
        }
        trTotales.appendChild(td);
    });
    tbody.appendChild(trTotales);
}

document.addEventListener("DOMContentLoaded", () => {
    const inputRemesa = document.getElementById('remesaFiltroInput');

    if (inputRemesa) {
        inputRemesa.value = localStorage.getItem('remesaUnicaSemanal_v11') || '';
        inputRemesa.addEventListener('input', () => {
            procesarYMostrarDatosConFiltroRemesa();
        });
    }

    const inputBuscador = document.getElementById('inputBuscadorSemanal');
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', (e) => {
            const textoFiltro = e.target.value.toLowerCase().trim();
            if (textoFiltro === "") {
                procesarYMostrarDatosConFiltroRemesa();
                return;
            }
            
            const filtrados = bdTotalesGlobal.filter(fila => {
                return ESTRUCTURA_SEMANAL.some(colObj => {
                    let val = String(obtenerValorFila(fila, colObj)).toLowerCase();
                    return val.includes(textoFiltro);
                });
            });
            renderizarTablaConTotales(filtrados, filtrados[0]);
        });
    }
});

construirHeaderTabla();

onValue(ref(db, ".info/connected"), (snap) => {
    const sem = document.getElementById("semaforoConexion");
    if(!sem) return;
    if (snap.val() === true) { 
        sem.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill"; 
        sem.innerHTML = 'ONLINE'; 
    } else { 
        sem.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill"; 
        sem.innerHTML = 'OFFLINE'; 
    }
});

onValue(ref(db, 'bdtotales'), (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        bdTotalesGlobal = Array.isArray(data) ? data : Object.values(data);
        procesarYMostrarDatosConFiltroRemesa();
    } else {
        bdTotalesGlobal = [];
        renderizarTablaConTotales([], null);
    }
}, (error) => {
    console.error("❌ Error al leer 'bdtotales':", error);
});
