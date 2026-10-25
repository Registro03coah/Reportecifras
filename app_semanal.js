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

// Estructura reducida únicamente con las columnas que aparecen en tu imagen
const ESTRUCTURA_SEMANAL = [
    { key: 'Ent', num: 45 },
    { key: 'Dtto', num: 46 },
    { key: 'Módulo', num: 47 },
    { key: 'Inicial', num: 5 },
    { key: 'Final', num: 6 },
    { key: 'Total_de_folios', num: 7 },
    { key: 'no_utilizados', num: 00 },
    { key: 'Inscripciones', num: 8 },
    { key: 'Corrección_de_datos_personales', num: 9 },
    { key: 'Cambio_de_domicilio', num: 10 },
    { key: 'Reposición', num: 11 },
    { key: 'Corr._de_datos_dirección', num: 12 },
    { key: 'Reincorporación', num: 13 },
    { key: 'Reemplazo', num: 14 },
    { key: 'Reimpresión', num: 15 },
    { key: 'Total_de_trámites', num: 16 },
    { key: 'Rechazos_de_MAC_34', num: 42 },
    { key: 'Rechazos_de_MAC_35', num: 43 },
    { key: 'Cancelados', num: 17 },
    { key: 'Total_de_movimientos', num: 40 },
    { key: 'Cif_05', num: 35 },
    { key: 'Solicitud_expedición', num: 36 },
    { key: 'Solicitud_rectificación', num: 37 },
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
    { key: 'Recibo_y_o_extravío', num: 24 },
    { key: 'Retiradas_por_otra_causa', num: 29 },
     { key: 'Sobrante', num: 80 },
    { key: 'Duplicado', num: 70 },
    { key: 'Disponibles', num: 30 },
     { key: 'Disponibles_de_sol_de_exp', num: 81 },
{ key: 'Reimpre_fuera_del_sistema', num: 82 },
    { key: 'creden_devueltas_por_terceros', num: 83 },
    { key: 'cred_producto_de_registro_duplicado', num: 84 },
    { key: 'Credenciales_x_canje', num: 31 },
     { key: 'Días_trabajados', num: 34 },
    { key: 'Configuración', num: 44 },    
];

let bdTotalesGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasSemanal')) || {};

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

function actualizarContadoresGlobales(datosMostrados) {
    const contadorInfo = document.getElementById('contadorInfo');
    const totalLineas = bdTotalesGlobal.length;
    
    const remesasUnicasTotales = new Set();
    bdTotalesGlobal.forEach(fila => {
        const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
        let valRemesa = obtenerValorFila(fila, objRemesa);
        if (valRemesa !== undefined && valRemesa !== null && String(valRemesa).trim() !== "") {
            remesasUnicasTotales.add(String(valRemesa).trim());
        }
    });

    let remesaActual = "N/A";
    if (datosMostrados && datosMostrados.length > 0) {
        const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
        let primeraRemesaMostrada = obtenerValorFila(datosMostrados[0], objRemesa);
        if (primeraRemesaMostrada !== undefined && primeraRemesaMostrada !== null && String(primeraRemesaMostrada).trim() !== "") {
            remesaActual = String(primeraRemesaMostrada).trim();
        }
    }

    if (contadorInfo) {
        contadorInfo.innerHTML = `
            <i class="bi bi-collection-fill text-info"></i> Líneas: <span>${totalLineas}</span> | 
            <i class="bi bi-tags-fill text-warning"></i> Remesas: <span>${remesasUnicasTotales.size}</span> | 
            <i class="bi bi-star-fill text-success"></i> Remesa Actual: <span>${remesaActual}</span>
        `;
    }
}

function procesarYMostrarDatos(datosAProcesar) {
    const tbody = document.getElementById('cuerpoTablaSemanal'); 
    if(!tbody) return;
    tbody.innerHTML = "";
    
    actualizarContadoresGlobales(datosAProcesar);
    
    if (!datosAProcesar || datosAProcesar.length === 0) return;
    
    datosAProcesar.forEach(fila => {
        let tr = document.createElement('tr');
        ESTRUCTURA_SEMANAL.forEach(colObj => {
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

// Configuración del Buscador
document.addEventListener("DOMContentLoaded", () => {
    const inputBuscador = document.getElementById('inputBuscadorSemanal');
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', (e) => {
            const textoFiltro = e.target.value.toLowerCase().trim();
            if (textoFitle === "") { // Nota: dejamos el manejo limpio
                // ...
            }
            if (textoFiltro === "") {
                const ultimaRemesa = obtenerUltimaRemesa(bdTotalesGlobal);
                if (ultimaRemesa) {
                    const filtrados = bdTotalesGlobal.filter(fila => {
                        const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
                        let val = obtenerValorFila(fila, objRemesa);
                        return String(val).trim() === String(ultimaRemesa);
                    });
                    procesarYMostrarDatos(filtrados);
                } else {
                    procesarYMostrarDatos(bdTotalesGlobal);
                }
                return;
            }
            
            const filtrados = bdTotalesGlobal.filter(fila => {
                return ESTRUCTURA_SEMANAL.some(colObj => {
                    let val = String(obtenerValorFila(fila, colObj)).toLowerCase();
                    return val.includes(textoFiltro);
                });
            });
            procesarYMostrarDatos(filtrados);
        });
    }
});

// Construir la cabecera fija de inmediato
construirHeaderTabla();

// Conexión Firebase Semáforo
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

// Lectura de la base de datos exacta 'bdtotales'
onValue(ref(db, 'bdtotales'), (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        bdTotalesGlobal = Array.isArray(data) ? data : Object.values(data);
        
        const ultimaRemesa = obtenerUltimaRemesa(bdTotalesGlobal);
        if (ultimaRemesa) {
            const datosUltimaRemesa = bdTotalesGlobal.filter(fila => {
                const objRemesa = ESTRUCTURA_SEMANAL.find(c => c.key === 'Remesa') || { key: 'Remesa', num: 39 };
                let val = obtenerValorFila(fila, objRemesa);
                return String(val).trim() === String(ultimaRemesa);
            });
            procesarYMostrarDatos(datosUltimaRemesa);
        } else {
            procesarYMostrarDatos(bdTotalesGlobal);
        }
    } else {
        bdTotalesGlobal = [];
        procesarYMostrarDatos(bdTotalesGlobal);
    }
}, (error) => {
    console.error("❌ Error al leer 'bdtotales':", error);
});
