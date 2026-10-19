// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (BD MADRE)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. CONFIGURACIÓN COLUMNAS DE DÍAS
// ==========================================
// Orden: 47, 39, 1, 2, 4, 5...75 (omitiendo 3)
const COLUMNAS_DIAS = [47, 39, 1, 2, 4];
for(let i=5; i<=75; i++) {
    if(i !== 39 && i !== 47) {
        COLUMNAS_DIAS.push(i);
    }
}

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

// ==========================================
// 3. GENERADOR DE TABLAS
// ==========================================
function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_DIAS.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        thT.innerText = ENCABEZADOS[colOriginal - 1] || `Col ${colOriginal}`;
        
        let anchoCelda = "50px"; 
        if(colOriginal === 47 || colOriginal === 39) anchoCelda = "70px"; 
        else if(colOriginal === 1) anchoCelda = "85px"; 
        else if(colOriginal === 2) anchoCelda = "75px"; 
        else if(colOriginal === 4) anchoCelda = "85px"; 
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; 
        else if(colOriginal === 61 || colOriginal === 62) anchoCelda = "80px"; 
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        if(colOriginal >= 5 && colOriginal <= 7) thT.classList.add('bg-folios');
        if(colOriginal >= 19 && colOriginal <= 30) thT.classList.add('bg-retiradas');
        if(colOriginal === 16) thT.style.backgroundColor = "#92d050"; 
        if(colOriginal === 17) thT.style.backgroundColor = "red"; 
        if(colOriginal === 18) thT.style.backgroundColor = "yellow"; 
        if(colOriginal >= 58 && colOriginal <= 60) thT.style.backgroundColor = "#e8e8f4"; 
        if(colOriginal === 61 || colOriginal === 62) thT.style.backgroundColor = "#9b9649"; 
        if(colOriginal === 63 || colOriginal === 64) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = colOriginal; thN.className = "table-light";
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    });
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

construirHeaderTabla('#tablaDias');

// ==========================================
// 4. LECTURA Y RENDERIZADO DESDE BD MADRE
// ==========================================
function cargarDatosDias() {
    const statusDiv = document.getElementById('statusCarga');
    if(statusDiv) {
        statusDiv.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Cargando...';
    }
    
    get(ref(db, 'bd_madre')).then((snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            procesarYMostrarDatos();
            renderListaRemesas();
            if(statusDiv) {
                statusDiv.className = "badge bg-success fs-6";
                statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Datos Actualizados';
            }
        } else {
            bdMadreGlobal = [];
            const tb = document.querySelector('#tablaDias tbody');
            if(tb) tb.innerHTML = "";
            const tbRem = document.querySelector('#tablaListaRemesas tbody');
            if(tbRem) tbRem.innerHTML = '<tr><td colspan="2">No hay remesas guardadas</td></tr>';
            if(statusDiv) {
                statusDiv.className = "badge bg-secondary fs-6";
                statusDiv.innerHTML = 'No hay remesas guardadas aún.';
            }
        }
    }).catch((error) => {
        console.error("Error al leer la BD Madre:", error);
        if(statusDiv) {
            statusDiv.className = "badge bg-danger fs-6";
            statusDiv.innerHTML = '<i class="bi bi-x-circle"></i> Error de conexión';
        }
    });
}

function procesarYMostrarDatos() {
    const tbody = document.querySelector('#tablaDias tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    // Ordenar por Módulo y Remesa
    let datosOrdenados = [...bdMadreGlobal].sort((a, b) => {
        const modA = a['Módulo'] || a['Modulo'] || '';
        const modB = b['Módulo'] || b['Modulo'] || '';
        if (modA !== modB) return modA.localeCompare(modB);
        const remA = a['Remesa'] || a['remesa'] || '';
        const remB = b['Remesa'] || b['remesa'] || '';
        if (remA !== remB) return remA.localeCompare(remB);
        return 0;
    });

    datosOrdenados.forEach(fila => {
        let tr = document.createElement('tr');
        
        COLUMNAS_DIAS.forEach(colOriginal => {
            let td = document.createElement('td');
            let nombreColKey = ENCABEZADOS[colOriginal - 1];

            if (colOriginal === 47) {
                let modVal = fila['Módulo'] || fila['Modulo'] || '';
                td.innerText = String(modVal).replace("Módulo ", "").trim();
            } else if (colOriginal === 39) {
                td.innerText = fila['Remesa'] || fila['remesa'] || '';
            } else if (colOriginal === 1) {
                td.innerText = fila['DÍA'] || fila['Dia'] || '';
            } else {
                let val = fila[nombreColKey] ?? fila[`Columna ${colOriginal}`] ?? fila[colOriginal-1] ?? '';
                td.innerText = val;
            }
            
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ==========================================
// 5. GESTOR DE REMESAS Y ELIMINACIÓN
// ==========================================
function renderListaRemesas() {
    const tbody = document.querySelector('#tablaListaRemesas tbody');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    let remesasUnicas = [...new Set(bdMadreGlobal.map(f => f['Remesa'] || f['remesa'] || 'S/N'))].sort();

    remesasUnicas.forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-success">Remesa ${remesaId}</td>
            <td>
                <button class="btn btn-sm btn-danger px-3 btn-borrar" data-id="${remesaId}"><i class="bi bi-trash"></i> Eliminar Remesa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if(confirm(`¿Estás completamente seguro de borrar la Remesa ${id} de la Base de Datos Principal?`)) {
                let nuevoBd = bdMadreGlobal.filter(f => (f['Remesa'] || f['remesa'] || 'S/N') !== id);
                set(ref(db, 'bd_madre'), nuevoBd).then(() => {
                    alert('Remesa eliminada exitosamente de la BD Principal.');
                    cargarDatosDias();
                });
            }
        });
    });
}

cargarDatosDias();

// ==========================================
// 6. RESPALDO Y RESTAURACIÓN (JSON)
// ==========================================
const btnDescargar = document.getElementById('btnDescargarJSON');
if(btnDescargar) {
    btnDescargar.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bdMadreGlobal, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `respaldo_bd_madre_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

const inputSubir = document.getElementById('inputSubirJSON');
if(inputSubir) {
    inputSubir.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                if(confirm("¿Estás seguro de subir este respaldo? Sobrescribirá la Base de Datos Principal en Firebase.")) {
                    set(ref(db, 'bd_madre'), jsonData).then(() => {
                        alert('Base de Datos Principal actualizada con éxito.');
                        cargarDatosDias();
                    });
                }
            } catch(err) {
                alert('El archivo JSON no es válido.');
            }
        };
        reader.readAsText(file);
    });
}
