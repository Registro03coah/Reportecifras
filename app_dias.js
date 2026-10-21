/ ==========================================
// 1. IMPORTACIONES FIREBASE (Modular V10)
// ==========================================
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

// ==========================================
// 2. CONFIGURACIÓN Y VARIABLES
// ==========================================
const COLUMNAS_REPORTE_DIAS = [
    "MODULO", "DIA", "FECHA", "REMESA", "SEDES", 
    "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "INSCRIPCIONES", 
    "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", 
    "TOTAL_DE_TRAMITES", "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", 
    "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR", "RECIBIDAS", 
    "ENTREGADAS", "RECIBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR", "DATOS_ERRONEOS", 
    "FOTO_MAL_IMPRESA", "RETIRADAS_POR_OTRA_CAUSA", "DISPONIBLES"
];

let bdMadreGlobal = [];
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};

let columnaOrdenActual = ''; 
let ordenAscendente = false; 

// ==========================================
// 3. SEMÁFORO DE CONEXIÓN FIREBASE
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

// ==========================================
// 4. GENERADOR DE CABECERA Y FLECHITAS
// ==========================================
function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias');
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_REPORTE_DIAS.forEach((col, index) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        thT.setAttribute('data-col', col);
        
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR. DE DATOS DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO Y/O EXTRAVIO')
                              .replace('TOTAL_DE_ANEXOS_POR_RECHAZO', 'TOTAL DE ANEXO DE RECHAZO')
                              .replace('RETIRADAS_POR_OTRA_CAUSA', 'RETIRADAS POR CAUSA')
                              .replace(/_/g, ' '); 
        
        if (col === "SEDES") nombreVisual = "SEDE DE OPERACIÓN DE MÓDULO";

        thT.innerText = nombreVisual;
        
        if (anchosGuardados[col]) {
            thT.style.width = anchosGuardados[col];
            thT.style.minWidth = anchosGuardados[col];
        } else {
            thT.style.minWidth = "90px";
            if(col === "MODULO" || col === "REMESA" || col === "DIA" || col === "FECHA") thT.style.minWidth = "85px";
            if(col === "TOTAL_DE_FOLIOS" || col === "TOTAL_DE_TRAMITES") thT.style.minWidth = "120px";
            if(col === "SEDES") thT.style.minWidth = "140px";
        }

        if(col === "INICIAL" || col === "FINAL" || col === "TOTAL_DE_FOLIOS") thT.classList.add('bg-folios');
        
        thN.className = "table-light text-dark text-center fw-bold";
        thN.style.cursor = "pointer";
        thN.title = "Clic para ordenar por esta columna";
        thN.onclick = () => window.cambiarOrdenDias(col);
        
        let contenidoHtml = `${index + 1} `;
        
        if (columnaOrdenActual === col) {
            contenidoHtml += ordenAscendente 
                           ? '<i class="bi bi-caret-up-fill text-primary ms-1"></i>' 
                           : '<i class="bi bi-caret-down-fill text-primary ms-1"></i>';
        } else {
            contenidoHtml += '<i class="bi bi-arrow-down-up text-secondary opacity-25 ms-1" style="font-size: 0.8em;"></i>';
        }
        
        thN.innerHTML = contenidoHtml;
        
        trTitulos.appendChild(thT); 
        trNumeros.appendChild(thN);
    });
    
    thead.appendChild(trTitulos); 
    thead.appendChild(trNumeros);

    const observer = new ResizeObserver(entries => {
        let cambiados = false;
        for (let entry of entries) {
            const colName = entry.target.getAttribute('data-col');
            const newWidth = entry.borderBoxSize[0].inlineSize + 'px';
            if(anchosGuardados[colName] !== newWidth) {
                anchosGuardados[colName] = newWidth;
                cambiados = true;
            }
        }
        if(cambiados) {
            localStorage.setItem('anchosColumnasDias', JSON.stringify(anchosGuardados));
            actualizarStickyLeft();
        }
    });

    const ths = trTitulos.querySelectorAll('th');
    ths.forEach(th => observer.observe(th));
}

function actualizarStickyLeft() {
    const table = document.getElementById('tablaDias');
    if(!table) return;
    
    const ths = document.querySelectorAll('#cabeceraTablaDias tr:first-child th');
    if (ths.length < 4) return;
    
    let w0 = ths[0].getBoundingClientRect().width;
    let w1 = ths[1].getBoundingClientRect().width;
    let w2 = ths[2].getBoundingClientRect().width;
    
    let left1 = w0;
    let left2 = w0 + w1;
    let left3 = w0 + w1 + w2;

    const headTrs = document.querySelectorAll('#cabeceraTablaDias tr');
    headTrs.forEach(tr => {
        const h = tr.querySelectorAll('th');
        if(h.length >= 4) { h[1].style.left = left1+'px'; h[2].style.left = left2+'px'; h[3].style.left = left3+'px'; }
    });

    const trs = document.querySelectorAll('#cuerpoTablaDias tr');
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if(tds.length >= 4) { tds[1].style.left = left1+'px'; tds[2].style.left = left2+'px'; tds[3].style.left = left3+'px'; }
    });
}

// ==========================================
// 5. LECTURA Y ORDENAMIENTO INTELIGENTE
// ==========================================
function obtenerValorFila(fila, col) {
    if (col === "MODULO") return fila["MÓDULO"] || fila["Módulo"] || fila["Modulo"] || fila["MODULO"] || '';
    if (col === "DIA") return fila["DÍA"] || fila["Día"] || fila["Dia"] || fila["DIA"] || '';
    if (col === "FECHA") return fila["FECHA"] || fila["Fecha"] || fila["fecha"] || '';
    if (col === "REMESA") return fila["REMESA"] || fila["Remesa"] || fila["remesa"] || '';
    if (col === "SEDES") return fila["SEDE_DE_OPERACIÓN_DE_MÓDULO"] || fila["SEDE DE OPERACIÓN DE MÓDULO"] || fila["SEDES"] || fila["Sedes"] || '';
    
    return fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
}

window.cambiarOrdenDias = function(colClick) {
    if (columnaOrdenActual === colClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = colClick;
        ordenAscendente = false; 
    }
    construirHeaderTabla(); 
    procesarYMostrarDatos(); 
};

function cargarDatosDias() {
    const dbRef = ref(db, 'bd_madre');
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            procesarYMostrarDatos();
        } else {
            bdMadreGlobal = [];
            const tb = document.getElementById('cuerpoTablaDias');
            if(tb) tb.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la BD Madre.</td></tr>';
        }
    });
}

function procesarYMostrarDatos() {
    const tbody = document.getElementById('cuerpoTablaDias');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    // Diccionario cronológico de días para ordenarlos perfecto de Lunes a Domingo
    const ordenDias = {
        "lunes": 1, "martes": 2, "miércoles": 3, "miercoles": 3, 
        "jueves": 4, "viernes": 5, "sábado": 6, "sabado": 6, "domingo": 7
    };

    let datosOrdenados = [...bdMadreGlobal].sort((a, b) => {
        // 1. Si el usuario dio clic en una columna para ordenar por ella específicamente
        if (columnaOrdenActual !== '') {
            let valA = String(obtenerValorFila(a, columnaOrdenActual)).trim();
            let valB = String(obtenerValorFila(b, columnaOrdenActual)).trim();
            
            let numA = parseFloat(valA);
            let numB = parseFloat(valB);
            
            if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                if (numA < numB) return ordenAscendente ? -1 : 1;
                if (numA > numB) return ordenAscendente ? 1 : -1;
            } else {
                let comp = valA.toUpperCase().localeCompare(valB.toUpperCase());
                if (comp !== 0) return ordenAscendente ? comp : -comp;
            }
        }
        
        // 2. ORDEN POR DEFECTO: Remesa (Mayor a Menor) -> Módulo (Ascendente) -> Día (Lunes a Domingo)
        let remA = String(obtenerValorFila(a, "REMESA")).trim();
        let remB = String(obtenerValorFila(b, "REMESA")).trim();
        if (remA !== remB) {
            return remB.localeCompare(remA, undefined, { numeric: true }); // Mayor a menor
        }
        
        let modA = String(obtenerValorFila(a, "MODULO")).trim();
        let modB = String(obtenerValorFila(b, "MODULO")).trim();
        if (modA !== modB) {
            return modA.localeCompare(modB, undefined, { numeric: true }); // Menor a mayor
        }

        let diaA = String(obtenerValorFila(a, "DIA")).trim().toLowerCase();
        let diaB = String(obtenerValorFila(b, "DIA")).trim().toLowerCase();
        let valDiaA = ordenDias[diaA] !== undefined ? ordenDias[diaA] : 99;
        let valDiaB = ordenDias[diaB] !== undefined ? ordenDias[diaB] : 99;

        return valDiaA - valDiaB; // Lunes a Domingo
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        
        COLUMNAS_REPORTE_DIAS.forEach(col => {
            let td = document.createElement('td');
            td.innerText = obtenerValorFila(fila, col);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });

    setTimeout(actualizarStickyLeft, 100);
}

// ==========================================
// 6. FUNCIÓN PARA COPIAR A EXCEL
// ==========================================
window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;

    const range = document.createRange();
    range.selectNode(tabla);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        const exitoso = document.execCommand('copy');
        if (exitoso) {
            alert("¡Tabla copiada! Ve a Excel y presiona Ctrl + V para pegarla.");
        } else {
            alert("Tu navegador bloqueó la copia al portapapeles.");
        }
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    selection.removeAllRanges();
};

// Iniciar
construirHeaderTabla();
cargarDatosDias();
