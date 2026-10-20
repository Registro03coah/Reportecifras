// ==========================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}
const database = firebase.database();

// ==========================================
// 2. COLUMNAS DE MONITOREO
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

// ==========================================
// 3. SEMÁFORO DE CONEXIÓN FIREBASE
// ==========================================
const connectedRef = database.ref(".info/connected");
connectedRef.on("value", (snap) => {
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
// 4. GENERADOR DE CABECERA Y MEMORIA DE ANCHOS
// ==========================================
// Cargar anchos desde la memoria del navegador
let anchosGuardados = JSON.parse(localStorage.getItem('anchosColumnasDias')) || {};

function construirHeaderTabla() {
    const thead = document.getElementById('cabeceraTablaDias');
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_REPORTE_DIAS.forEach((col, index) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        thT.setAttribute('data-col', col); // Identificador para guardar el ancho
        
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR. DE DATOS DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO Y/O EXTRAVIO')
                              .replace('TOTAL_DE_ANEXOS_POR_RECHAZO', 'TOTAL DE ANEXO DE RECHAZO')
                              .replace('RETIRADAS_POR_OTRA_CAUSA', 'RETIRADAS POR CAUSA')
                              .replace(/_/g, ' '); 
        
        if (col === "SEDES") nombreVisual = "SEDE DE OPERACIÓN DE MÓDULO";

        thT.innerText = nombreVisual;
        
        // Asignar el ancho si existe en memoria, si no, uno por defecto
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
        
        thN.innerText = index + 1; 
        thN.className = "table-light text-muted";
        
        trTitulos.appendChild(thT); 
        trNumeros.appendChild(thN);
    });
    
    thead.appendChild(trTitulos); 
    thead.appendChild(trNumeros);

    // Observador para guardar el grosor de la columna automáticamente si lo arrastras
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
            actualizarStickyLeft(); // Recalcula las columnas congeladas
        }
    });

    // Activar observador en los títulos
    const ths = trTitulos.querySelectorAll('th');
    ths.forEach(th => observer.observe(th));
}

// Lógica matemática para deslizar las columnas 2, 3 y 4 cuando se cambia el grosor
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

    // Aplica a la cabecera
    const headTrs = document.querySelectorAll('#cabeceraTablaDias tr');
    headTrs.forEach(tr => {
        const h = tr.querySelectorAll('th');
        if(h.length >= 4) { h[1].style.left = left1+'px'; h[2].style.left = left2+'px'; h[3].style.left = left3+'px'; }
    });

    // Aplica a las filas del cuerpo
    const trs = document.querySelectorAll('#cuerpoTablaDias tr');
    trs.forEach(tr => {
        const tds = tr.querySelectorAll('td');
        if(tds.length >= 4) { tds[1].style.left = left1+'px'; tds[2].style.left = left2+'px'; tds[3].style.left = left3+'px'; }
    });
}

// ==========================================
// 5. INTELIGENCIA DE BÚSQUEDA Y LECTURA
// ==========================================
// Esta función revisa si el dato viene con acentos o sin ellos, resolviendo el problema de blancos
function obtenerValorFila(fila, col) {
    if (col === "MODULO") return fila["MÓDULO"] || fila["Módulo"] || fila["Modulo"] || fila["MODULO"] || '';
    if (col === "DIA") return fila["DÍA"] || fila["Día"] || fila["Dia"] || fila["DIA"] || '';
    if (col === "FECHA") return fila["FECHA"] || fila["Fecha"] || fila["fecha"] || '';
    if (col === "REMESA") return fila["REMESA"] || fila["Remesa"] || fila["remesa"] || '';
    if (col === "SEDES") return fila["SEDE_DE_OPERACIÓN_DE_MÓDULO"] || fila["SEDE DE OPERACIÓN DE MÓDULO"] || fila["SEDES"] || fila["Sedes"] || '';
    
    return fila[col] !== undefined && fila[col] !== null ? fila[col] : '';
}

function cargarDatosDias() {
    database.ref('bd_madre').on('value', (snapshot) => {
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

    // Ordenamos inteligentemente usando nuestra función recolectora de acentos
    let datosOrdenados = [...bdMadreGlobal].sort((a, b) => {
        const modA = String(obtenerValorFila(a, "MODULO"));
        const modB = String(obtenerValorFila(b, "MODULO"));
        if (modA !== modB) return modA.localeCompare(modB);
        
        const remA = String(obtenerValorFila(a, "REMESA")).toUpperCase();
        const remB = String(obtenerValorFila(b, "REMESA")).toUpperCase();
        return remB.localeCompare(remA);
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        
        COLUMNAS_REPORTE_DIAS.forEach(col => {
            let td = document.createElement('td');
            // Sacamos el valor con la función inteligente que brinca los acentos
            td.innerText = obtenerValorFila(fila, col);
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });

    // Actualizamos las distancias congeladas tras dibujar la tabla
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
