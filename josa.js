// ==========================================
// LÓGICA REPORTE JOSA (BD MADRE & FECHAS)
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

let bdMadreGlobal = [];

// Conexión Firebase Semáforo
onValue(ref(db, ".info/connected"), (s) => {
    let sem = document.getElementById("semaforoConexion");
    if (sem) {
        sem.className = s.val() ? "badge bg-success text-white px-2 py-1" : "badge bg-danger text-white px-2 py-1";
        sem.innerHTML = s.val() ? '<i class="bi bi-wifi"></i> ONLINE' : '<i class="bi bi-wifi-off"></i> OFFLINE';
    }
});

function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
    return limpio;
}

function cargarDatosJosa() {
    get(ref(db, 'bd_madre')).then((snapshot) => {
        if (snapshot.exists()) {
            let dataRaw = snapshot.val();
            bdMadreGlobal = (Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw)).map(normalizarObjeto);
        } else {
            bdMadreGlobal = [];
        }
        inicializarEventosFechas();
    }).catch(err => console.error("Error al cargar bd_madre para JOSA:", err));
}

function inicializarEventosFechas() {
    const inputInicio = document.getElementById('inputFechaInicio');
    const inputFin = document.getElementById('inputFechaFin');

    if (inputInicio && inputFin) {
        inputInicio.addEventListener('change', procesarFiltroJosa);
        inputFin.addEventListener('change', procesarFiltroJosa);
    }
}

function procesarFiltroJosa() {
    const fechaInicio = document.getElementById('inputFechaInicio').value;
    const fechaFin = document.getElementById('inputFechaFin').value;
    const badgeRemesa = document.getElementById('badgeRemesa');

    if (!fechaInicio || !fechaFin) {
        badgeRemesa.innerText = "Seleccione fechas";
        return;
    }

    // Filtrar registros de bd_madre que estén dentro del rango de fechas (Fecha formato YYYY-MM-DD o similar)
    let registrosRango = bdMadreGlobal.filter(reg => {
        let fReg = String(reg['FECHA'] || '').trim();
        return fReg >= fechaInicio && fReg <= fechaFin;
    });

    // Detectar automáticamente la remesa de los registros encontrados
    let remesasSet = new Set();
    registrosRango.forEach(reg => {
        let rem = String(reg['REMESA'] || '').trim();
        if (rem) remesasSet.add(rem);
    });

    if (remesasSet.size > 0) {
        badgeRemesa.innerText = Array.from(remesasSet).join(', ');
    } else {
        badgeRemesa.innerText = "Sin remesa en fechas";
    }

    renderTablaGeneral(registrosRango);
    renderTablaModulos(registrosRango);
}

// TABLA 1: Sumatoria total de los 3 módulos juntos en un solo renglón
function renderTablaGeneral(registros) {
    const tbody = document.getElementById('tbodyJosaGeneral');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-muted py-3">No hay registros en el rango de fechas seleccionado.</td></tr>`;
        return;
    }

    const columnasSuma = [
        "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
        "REPOSICION_REIMPRESIONES", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", 
        "REEMPLAZO", "TOTAL_DE_TRAMITES", "ENTREGADAS", "CRED_PROD_CANJE_POR_NUEVA"
    ];

    let sumas = {};
    columnasSuma.forEach(col => sumas[col] = 0);

    registros.forEach(reg => {
        columnasSuma.forEach(col => {
            let val = parseFloat(reg[col] || reg[col.replace('CORR__', 'CORR_')] || 0);
            if (!isNaN(val)) sumas[col] += val;
        });
    });

    let tr = document.createElement('tr');
    tr.className = "fila-totales";
    
    // DTTO fijo 03
    let tdDtto = document.createElement('td');
    tdDtto.innerText = "03";
    tr.appendChild(tdDtto);

    columnasSuma.forEach(col => {
        let td = document.createElement('td');
        let claveReal = regTieneColumna(registros[0], col);
        let valorTotal = 0;
        registros.forEach(r => {
            let v = parseFloat(r[claveReal] || 0);
            if (!isNaN(v)) valorTotal += v;
        });
        td.innerText = valorTotal;
        tr.appendChild(td);
    });

    tbody.appendChild(tr);
}

// TABLA 2: Desglose por los 3 módulos y fila final de total
function renderTablaModulos(registros) {
    const tbody = document.getElementById('tbodyJosaModulos');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" class="text-muted py-3">No hay registros en el rango de fechas seleccionado.</td></tr>`;
        return;
    }

    const modulosList = ["50351", "50353", "50354"];
    const columnasMod = [
        "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
        "REPOSICION_REIMPRESIONES", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", 
        "REEMPLAZO", "TOTAL_DE_TRAMITES", "ENTREGADAS", "ACTUALIZACION", 
        "RETIRADAS_POR_CAUSA", "CRED_PROD_CANJE_POR_NUEVA"
    ];

    let granTotalMod = {};
    columnasMod.forEach(c => granTotalMod[c] = 0);

    modulosList.forEach(modNombre => {
        let regsMod = registros.filter(r => String(r['MODULO'] || '').trim().includes(modNombre));
        
        let trMod = document.createElement('tr');
        let tdMod = document.createElement('td');
        tdMod.className = "fw-bold text-primary";
        tdMod.innerText = modNombre;
        trMod.appendChild(tdMod);

        columnasMod.forEach(col => {
            let claveReal = regTieneColumna(registros[0], col);
            let sumaModCol = 0;
            regsMod.forEach(r => {
                let v = parseFloat(r[claveReal] || 0);
                if (!isNaN(v)) sumaModCol += v;
            });

            granTotalMod[col] += sumaModCol;

            let td = document.createElement('td');
            td.innerText = sumaModCol;
            trMod.appendChild(td);
        });

        tbody.appendChild(trMod);
    });

    // Renglón de Totales Finales
    let trTotal = document.createElement('tr');
    trTotal.className = "fila-totales";
    let tdLabel = document.createElement('td');
    tdLabel.innerText = "TOTAL";
    trTotal.appendChild(tdLabel);

    columnasMod.forEach(col => {
        let td = document.createElement('td');
        td.innerText = granTotalMod[col];
        trTotal.appendChild(td);
    });

    tbody.appendChild(trTotal);
}

function regTieneColumna(sampleObj, colKey) {
    if (!sampleObj) return colKey;
    if (sampleObj[colKey] !== undefined) return colKey;
    // Opciones flexibles para nombres de columnas con variantes de puntos o guiones bajos
    let altKey = colKey.replace('CORR__', 'CORR_');
    if (sampleObj[altKey] !== undefined) return altKey;
    let llaveEncontrada = Object.keys(sampleObj).find(k => k.toUpperCase().includes(colKey.replace(/_/g, '')));
    return llaveEncontrada !== undefined ? llaveEncontrada : colKey;
}

window.copiarTablaExcel = function(idTabla) {
    let tabla = document.getElementById(idTabla);
    if (!tabla) return;
    let rango = document.createRange();
    rango.selectNode(tabla);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(rango);
    try {
        document.execCommand('copy');
        alert("¡Tabla copiada al portapapeles! Ya puedes pegarla en Excel.");
    } catch (err) {
        alert("Error al copiar la tabla.");
    }
    window.getSelection().removeAllRanges();
}

// Inicializar carga al abrir
cargarDatosJosa();
