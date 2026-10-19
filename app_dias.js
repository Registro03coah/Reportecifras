// ==========================================
// 1. IMPORTACIONES FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes"
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

const MODULOS = ["050351", "050353", "050354"];
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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

let historialGlobal = {};
let remesaEnEdicion = "";
let datosRemesaEnEdicion = {};

// ==========================================
// 3. GENERADOR DE TABLAS (Vista y Modal)
// ==========================================
function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_DIAS.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        thT.innerText = ENCABEZADOS[colOriginal - 1];
        
        let anchoCelda = "50px"; 
        if(colOriginal === 47 || colOriginal === 39) anchoCelda = "70px"; // Mod, Remesa
        else if(colOriginal === 1) anchoCelda = "85px"; // Día
        else if(colOriginal === 2) anchoCelda = "75px"; // Fecha
        else if(colOriginal === 4) anchoCelda = "85px"; // Sedes
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; // Inicial/Final
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
MODULOS.forEach(mod => construirHeaderTabla(`#tablaEditar_${mod}`));

// ==========================================
// 4. LECTURA Y RENDERIZADO
// ==========================================
function cargarDatosDias() {
    const statusDiv = document.getElementById('statusCarga');
    statusDiv.innerHTML = '<i class="bi bi-arrow-repeat spin"></i> Cargando...';
    
    get(ref(db, 'historial_campanas')).then((snapshot) => {
        if (snapshot.exists()) {
            historialGlobal = snapshot.val();
            procesarYMostrarDatos();
            renderListaRemesas();
            statusDiv.className = "badge bg-success fs-6";
            statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Datos Actualizados';
        } else {
            historialGlobal = {};
            document.querySelector('#tablaDias tbody').innerHTML = "";
            document.querySelector('#tablaListaRemesas tbody').innerHTML = '<tr><td colspan="2">No hay remesas guardadas</td></tr>';
            statusDiv.className = "badge bg-secondary fs-6";
            statusDiv.innerHTML = 'No hay remesas guardadas aún.';
        }
    }).catch((error) => {
        console.error(error);
        statusDiv.className = "badge bg-danger fs-6";
        statusDiv.innerHTML = '<i class="bi bi-x-circle"></i> Error de conexión';
    });
}

function procesarYMostrarDatos() {
    const tbody = document.querySelector('#tablaDias tbody');
    tbody.innerHTML = "";

    // Para cada remesa, mostrar los 7 días de cada módulo
    for (const remesa in historialGlobal) {
        MODULOS.forEach(mod => {
            let datosMod = historialGlobal[remesa][mod];
            if(!datosMod) return;

            // Recorrer 7 días (índices 0 al 6)
            for(let d = 0; d < 7; d++) {
                let fila = datosMod[d];
                let tr = document.createElement('tr');
                
                COLUMNAS_DIAS.forEach(colOriginal => {
                    let td = document.createElement('td');
                    if (colOriginal === 47) td.innerText = mod.substring(4,6); // Módulo
                    else if (colOriginal === 39) td.innerText = remesa; // Remesa
                    else if (colOriginal === 1) td.innerText = DIAS_SEMANA[d] || fila[0]; // Día
                    else td.innerText = fila[colOriginal-1] || "";
                    
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            }
        });
    }
}

// ==========================================
// 5. GESTOR DE REMESAS (LISTA, BORRAR, EDITAR DÍAS)
// ==========================================
function renderListaRemesas() {
    const tbody = document.querySelector('#tablaListaRemesas tbody');
    tbody.innerHTML = "";
    
    Object.keys(historialGlobal).forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-success">Remesa ${remesaId}</td>
            <td>
                <button class="btn btn-sm btn-success px-3 me-2 btn-editar" data-id="${remesaId}"><i class="bi bi-pencil-square"></i> Editar Días</button>
                <button class="btn btn-sm btn-danger px-3 btn-borrar" data-id="${remesaId}"><i class="bi bi-trash"></i> Eliminar Remesa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Eventos Borrar
    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if(confirm(`¿Estás completamente seguro de borrar la Remesa ${id}? Se eliminará del Reporte de Días y del Reporte de Campaña.`)) {
                remove(ref(db, `historial_campanas/${id}`)).then(() => {
                    alert('Remesa eliminada exitosamente.');
                    cargarDatosDias();
                });
            }
        });
    });

    // Eventos Editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            abrirModalEdicion(id);
        });
    });
}

function abrirModalEdicion(remesaId) {
    remesaEnEdicion = remesaId;
    document.getElementById('lblRemesaEdit').innerText = remesaId;
    
    // Copia profunda
    datosRemesaEnEdicion = JSON.parse(JSON.stringify(historialGlobal[remesaId]));
    
    MODULOS.forEach(mod => {
        const tbody = document.querySelector(`#tablaEditar_${mod} tbody`);
        tbody.innerHTML = "";
        
        for(let d = 0; d < 7; d++) {
            let tr = document.createElement('tr');
            
            COLUMNAS_DIAS.forEach(colOriginal => {
                let td = document.createElement('td');
                if (colOriginal === 47) td.innerText = mod.substring(4,6);
                else if (colOriginal === 39) td.innerText = remesaId;
                else if (colOriginal === 1) td.innerText = DIAS_SEMANA[d];
                else {
                    let valOriginal = datosRemesaEnEdicion[mod][d][colOriginal-1] || "";
                    td.innerHTML = `<input type="text" data-mod="${mod}" data-row="${d}" data-col="${colOriginal-1}" value="${valOriginal}">`;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    });

    const modal = new bootstrap.Modal(document.getElementById('modalEditarDias'));
    modal.show();
}

document.getElementById('btnGuardarEdicion').addEventListener('click', () => {
    // Recoger valores de los inputs y actualizar la copia
    MODULOS.forEach(mod => {
        const inputs = document.querySelectorAll(`#tablaEditar_${mod} input`);
        inputs.forEach(inp => {
            const r = inp.getAttribute('data-row');
            const c = inp.getAttribute('data-col');
            datosRemesaEnEdicion[mod][r][c] = inp.value.trim();
        });
    });

    // Guardar la remesa editada en la BD
    const dbRef = ref(db, `historial_campanas/${remesaEnEdicion}`);
    set(dbRef, datosRemesaEnEdicion).then(() => {
        alert('Días editados guardados correctamente.');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarDias')).hide();
        cargarDatosDias();
    }).catch(err => {
        console.error(err);
        alert('Error al guardar edición.');
    });
});

cargarDatosDias();

// ==========================================
// 6. RESPALDO Y RESTAURACIÓN (JSON)
// ==========================================
document.getElementById('btnDescargarJSON').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historialGlobal, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `respaldo_mac_remesas_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

document.getElementById('inputSubirJSON').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const jsonData = JSON.parse(event.target.result);
            if(confirm("¿Estás seguro de subir este respaldo? Sobrescribirá las remesas en la base de datos y actualizará todos los reportes (Días, Semanal, Campaña).")) {
                set(ref(db, 'historial_campanas'), jsonData).then(() => {
                    alert('Datos subidos y sincronizados con éxito en todos los reportes.');
                    cargarDatosDias();
                });
            }
        } catch(err) {
            alert('El archivo JSON no es válido.');
        }
    };
    reader.readAsText(file);
});
