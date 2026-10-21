// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (BD MADRE Y BD TOTALES)
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

const COLUMNAS_SEMANAL = [45, 46, 47, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

const ENCABEZADOS = [
    "DÍA", "DD/MM/AA", "Horas trabajadas", "Sedes visitadas", "INICIAL", "FINAL", "TOTAL DE FOLIOS", 
    "INSCRIPCIONES", "CORRECCION DE DATOS PERSONALES", "CAMBIO DE DOMICILIO", "REPOSISION", 
    "CORR. DE DATOS DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL DE TRAMITES", 
    "CANCELADOS", "TOTAL DE ANEXO DE RECHAZO", "CPV devuelta entrega", "DISPONIBLES AL DIA ANTERIOR", 
    "RECIBIDAS", "RECIBIDAS DE OTROS TIPOS", "ENTREGADAS", "RECIBO Y/O EXTRAVIO", "ANEXAS A FUAR", 
    "DATOS ERRONEOS", "FOTO MAL IMPRESA", "REIMPRESION", "'RETIRADAS POR CAUSA", "DISPONIBLES", 
    "credenciales x canje", "fichas Entregadas", "fichas atendidas", "Dias trabajados", 
    "SOLICITUD EXPEDICIÓN REPATRIADOS", "SOLICITUD EXPEDICIÓN ORDINARIA", "SOLICITU DE RECTIFICACIÓN", 
    "DEMANDA DE JUICIO", "REMESA", "Total de movimientos", "DEVUELTAS POR TERCEROS:", 
    "34 Imagen inconsistente", "35 Movimiento posterior", "CONFIGURACION", "ENT", "DTTO", 
    "MÓDULO", "RESGUARDO", "SOLICITUD DE REIMPRESION", "CPV devuelta entrega", "ript ejecutad", 
    "FOLIO NEC", "cartografia", "lotes de credenciales", "registradas por dia", "faltantes", "observaciones",
    "sin nombre1", "sin nombre2", "sin nombre3", "MAC QUE RECIBE", "MAC QUE ENTREGA", 
    "IMPORTADAS", "EXPORTADAS", "REPOSISION + REIMPRESIONES", "MAL IMPRESA", "ERROR EN CARTOGRAFIA", 
    "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR EN NUM. DE EMISION", "PERDIDA DE VIGENCIA", 
    "MOV.POST.", "ANEXAS A SOLICITUD", "OTRAS BAJAS"
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
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_SEMANAL.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        thT.innerText = ENCABEZADOS[colOriginal - 1] || `Col ${colOriginal}`;
        thT.style.height = "50px";
        thT.style.verticalAlignment = "middle";
        
        let anchoCelda = "50px"; 
        if(colOriginal >= 45 && colOriginal <= 47) anchoCelda = "60px"; 
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; 
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        if(colOriginal >= 5 && colOriginal <= 7) thT.classList.add('bg-folios');
        if(colOriginal >= 19 && colOriginal <= 30) thT.classList.add('bg-retiradas');
        if(colOriginal === 16) thT.style.backgroundColor = "#92d050"; 
        if(colOriginal === 17) thT.style.backgroundColor = "red"; 
        if(colOriginal === 18) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = colOriginal; thN.className = "table-light text-center";
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    });
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

construirHeaderTabla('#tablaSemanal');

// ==========================================
// 3. CARGA DE DATOS Y GESTIÓN DE REMESA
// ==========================================
function cargarDatosSemanal() {
    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        if (snapMadre.exists()) {
            const dataRaw = snapMadre.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
        } else {
            bdMadreGlobal = [];
        }

        if (snapTotales.exists()) {
            const dataTotalesRaw = snapTotales.val();
            bdtotalesGlobal = Array.isArray(dataTotalesRaw) ? dataTotalesRaw : Object.values(dataTotalesRaw);
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

    if (remesaEscrita !== "") {
        return remesaEscrita;
    }

    // Si no escribe nada, obtenemos la remesa más alta / última registrada
    let remesasDisponibles = new Set();
    bdMadreGlobal.forEach(f => {
        let r = String(f['REMESA'] || f['Remesa'] || f['remesa'] || '').trim();
        if(r) remesasDisponibles.add(r);
    });
    bdtotalesGlobal.forEach(f => {
        let r = String(f['REMESA'] || f['Remesa'] || f['remesa'] || '').trim();
        if(r) remesasDisponibles.add(r);
    });

    if (remesasDisponibles.size > 0) {
        let listaRemesas = Array.from(remesasDisponibles).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        return listaRemesas[0]; // La última remesa registrada
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
        tbody.innerHTML = '<tr><td colspan="29" class="text-center py-4 text-muted">No se encontró ninguna remesa registrada o escrita.</td></tr>';
        return;
    }

    // Intentamos cargar primero desde bdtotales si existe para esa remesa exacta
    let registrosTotalesRemesa = bdtotalesGlobal.filter(item => String(item.REMESA || item.Remesa || '').trim() === String(remesaActiva));

    if (registrosTotalesRemesa.length > 0) {
        // Renderizamos directo desde la BD Totales por cada módulo
        registrosTotalesRemesa.forEach(reg => {
            let tr = document.createElement('tr');
            let modNum = String(reg['MODULO'] || reg['Módulo'] || reg['Modulo'] || '').replace(/[^0-9]/g, '');
            let modUltimos3 = modNum.slice(-3);

            COLUMNAS_SEMANAL.forEach(colOriginal => {
                let td = document.createElement('td');
                let nombreColKey = ENCABEZADOS[colOriginal - 1];

                if(colOriginal === 45) {
                    td.innerText = "05";
                } else if(colOriginal === 46) {
                    td.innerText = "03";
                } else if(colOriginal === 47) {
                    td.innerText = modUltimos3 || modNum;
                } else {
                    td.innerText = reg[nombreColKey] || reg[`Columna ${colOriginal}`] || "0";
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Fila de Gran Total sumando los módulos de bdtotales
        renderGranTotalDesdeRegistros(tbody, registrosTotalesRemesa, remesaActiva);

    } else {
        // Si no está en bdtotales, agrupamos y sumamos desde la BD Madre
        let filasRemesa = bdMadreGlobal.filter(item => String(item.REMESA || item.Remesa || '').trim() === String(remesaActiva));

        if (filasRemesa.length === 0) {
            tbody.innerHTML = `<tr><td colspan="29" class="text-center py-4 text-muted">No hay registros para la remesa: ${remesaActiva}</td></tr>`;
            return;
        }

        let modulosMap = {};
        filasRemesa.forEach(f => {
            let mod = String(f['MÓDULO'] || f['Módulo'] || f['Modulo'] || f['MODULO'] || 'General').trim();
            if (!modulosMap[mod]) modulosMap[mod] = [];
            modulosMap[mod].push(f);
        });

        Object.keys(modulosMap).sort().forEach(modNombre => {
            let tr = document.createElement('tr');
            let registrosMod = modulosMap[modNombre];
            let modLim = modNombre.replace(/[^0-9]/g, '');
            let mod3 = modLim.slice(-3);

            COLUMNAS_SEMANAL.forEach(colOriginal => {
                let td = document.createElement('td');
                let nombreColKey = ENCABEZADOS[colOriginal - 1];

                if(colOriginal === 45) {
                    td.innerText = "05";
                } else if(colOriginal === 46) {
                    td.innerText = "03";
                } else if(colOriginal === 47) {
                    td.innerText = mod3 || modNombre;
                } else {
                    let sumaCol = 0;
                    registrosMod.forEach(reg => {
                        let val = parseFloat(reg[nombreColKey] || reg[`Columna ${colOriginal}`] || 0);
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
    
    COLUMNAS_SEMANAL.forEach(colOriginal => {
        let td = document.createElement('td');
        let nombreColKey = ENCABEZADOS[colOriginal - 1];

        if(colOriginal === 45) td.innerText = "-";
        else if(colOriginal === 46) td.innerText = "-";
        else if(colOriginal === 47) td.innerText = `REMESA ${remesaId}`;
        else {
            let sumaTotalRemesa = 0;
            listaRegistros.forEach(reg => {
                let val = parseFloat(reg[nombreColKey] || reg[`Columna ${colOriginal}`] || 0);
                if (!isNaN(val)) sumaTotalRemesa += val;
            });
            td.innerText = sumaTotalRemesa;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

// Iniciar carga de datos
cargarDatosSemanal();
```

### Paso para tu archivo HTML (`reporte_semanal.html` o similar):
Asegúrate de agregar un campo de texto (input) con el identificador `inputRemesaFiltro` y un espacio para el semáforo de conexión arriba de tu tabla:

```html
<div class="row align-items-center mb-3">
    <div class="col-md-4">
        <label for="inputRemesaFiltro" class="form-label fw-bold">Escribe o filtra por Remesa:</label>
        <input type="text" id="inputRemesaFiltro" class="form-control" placeholder="Ej. 202643 (Déjalo vacío para ver la última)">
    </div>
    <div class="col-md-4">
        <span id="lblRemesaActiva" class="badge bg-secondary fs-6">Cargando remesa...</span>
    </div>
    <div class="col-md-4 text-end">
        <div id="semaforoConexion" class="badge bg-secondary">Conectando...</div>
    </div>
</div>
