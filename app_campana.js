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
// 2. CONFIGURACIÓN COLUMNAS DE CAMPAÑA
// ==========================================
// Orden solicitado: 45(ENT), 46(DTTO), 47(MÓDULO), y luego del 5 al 30.
const COLUMNAS_CAMPANA = [45, 46, 47, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

// Array maestro de los 75 nombres para extraer el texto
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

// Variables globales para la edición
let historialGlobal = {};
let remesaEnEdicion = "";
let datosRemesaEnEdicion = {}; // Copia profunda de la remesa seleccionada

// ==========================================
// 3. GENERADOR DE TABLAS (Vista y Modal)
// ==========================================
function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_CAMPANA.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        // Obtener el nombre correspondiente (índice col-1)
        thT.innerText = ENCABEZADOS[colOriginal - 1];
        
        let anchoCelda = "50px"; 
        if(colOriginal >= 45 && colOriginal <= 47) anchoCelda = "60px"; // ENT, DTTO, MOD
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; // Inicial/Final
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        if(colOriginal >= 5 && colOriginal <= 7) thT.classList.add('bg-folios');
        if(colOriginal >= 19 && colOriginal <= 30) thT.classList.add('bg-retiradas');
        if(colOriginal === 16) thT.style.backgroundColor = "#92d050"; 
        if(colOriginal === 17) thT.style.backgroundColor = "red"; 
        if(colOriginal === 18) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = colOriginal; thN.className = "table-light";
        
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    });
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

// Inicializar headers
construirHeaderTabla('#tablaCampana');
construirHeaderTabla('#tablaEditarRemesa');

// ==========================================
// 4. LECTURA Y RENDERIZADO
// ==========================================
function cargarDatosCampana() {
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
            document.querySelector('#tablaCampana tbody').innerHTML = "";
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
    let sumas = {
        "050351": Array(75).fill(0),
        "050353": Array(75).fill(0),
        "050354": Array(75).fill(0)
    };

    for (const remesa in historialGlobal) {
        let tablaTotalesRemesa = historialGlobal[remesa].totales; 
        if(!tablaTotalesRemesa) continue;
        
        // Sumar filas de módulos (índices 0, 1, 2 -> 51, 53, 54)
        [0, 1, 2].forEach(idx => {
            let modId = idx === 0 ? "050351" : (idx === 1 ? "050353" : "050354");
            for(let c = 0; c < 75; c++) {
                let valor = parseFloat(tablaTotalesRemesa[idx][c]);
                if(!isNaN(valor)) sumas[modId][c] += valor;
            }
        });
    }

    const tbody = document.querySelector('#tablaCampana tbody');
    tbody.innerHTML = "";
    const filasAMostrar = ["050351", "050353", "050354", "GRAN TOTAL"];

    filasAMostrar.forEach(fila => {
        let tr = document.createElement('tr');
        if (fila === "GRAN TOTAL") tr.classList.add('fila-totales');

        COLUMNAS_CAMPANA.forEach(colOriginal => {
            let td = document.createElement('td');
            
            if(colOriginal === 45) { // ENT
                td.innerText = fila === "GRAN TOTAL" ? "-" : "05";
            } else if (colOriginal === 46) { // DTTO
                td.innerText = fila === "GRAN TOTAL" ? "-" : "03";
            } else if (colOriginal === 47) { // MÓDULO
                td.innerText = fila === "GRAN TOTAL" ? "GRAN TOTAL" : fila.substring(4,6);
            } else {
                if(fila === "GRAN TOTAL") {
                    let totalCol = sumas["050351"][colOriginal-1] + sumas["050353"][colOriginal-1] + sumas["050354"][colOriginal-1];
                    td.innerText = totalCol === 0 ? "0" : totalCol;
                } else {
                    let valorSuma = sumas[fila][colOriginal-1];
                    td.innerText = valorSuma === 0 ? "0" : valorSuma;
                }
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// ==========================================
// 5. GESTOR DE REMESAS (LISTA, BORRAR, EDITAR)
// ==========================================
function renderListaRemesas() {
    const tbody = document.querySelector('#tablaListaRemesas tbody');
    tbody.innerHTML = "";
    
    Object.keys(historialGlobal).forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-primary">Remesa ${remesaId}</td>
            <td>
                <button class="btn btn-sm btn-primary px-3 me-2 btn-editar" data-id="${remesaId}"><i class="bi bi-pencil-square"></i> Ver / Editar</button>
                <button class="btn btn-sm btn-danger px-3 btn-borrar" data-id="${remesaId}"><i class="bi bi-trash"></i> Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Eventos Borrar
    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if(confirm(`¿Estás completamente seguro de borrar la Remesa ${id} de la Base de Datos? Esto restará sus cantidades del Reporte de Campaña.`)) {
                remove(ref(db, `historial_campanas/${id}`)).then(() => {
                    alert('Remesa eliminada.');
                    cargarDatosCampana();
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
    
    // Hacemos una copia independiente de los datos para editar
    datosRemesaEnEdicion = JSON.parse(JSON.stringify(historialGlobal[remesaId].totales));
    
    const tbody = document.querySelector('#tablaEditarRemesa tbody');
    tbody.innerHTML = "";
    
    const filasModulos = ["050351", "050353", "050354"];
    
    filasModulos.forEach((mod, idx) => {
        let tr = document.createElement('tr');
        
        COLUMNAS_CAMPANA.forEach(colOriginal => {
            let td = document.createElement('td');
            
            if(colOriginal === 45) td.innerText = "05";
            else if (colOriginal === 46) td.innerText = "03";
            else if (colOriginal === 47) td.innerText = mod.substring(4,6);
            else {
                // Aquí metemos un input para poder editar el valor original de esa remesa
                let valOriginal = datosRemesaEnEdicion[idx][colOriginal-1] || "0";
                td.innerHTML = `<input type="text" data-modidx="${idx}" data-colidx="${colOriginal-1}" value="${valOriginal}">`;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Mostrar modal (requiere Bootstrap JS)
    const modal = new bootstrap.Modal(document.getElementById('modalEditarRemesa'));
    modal.show();
}

document.getElementById('btnGuardarEdicion').addEventListener('click', () => {
    // 1. Recoger valores del Modal
    const inputs = document.querySelectorAll('#tablaEditarRemesa input');
    inputs.forEach(inp => {
        const modIdx = inp.getAttribute('data-modidx');
        const colIdx = inp.getAttribute('data-colidx');
        datosRemesaEnEdicion[modIdx][colIdx] = inp.value.trim();
    });

    // 2. Recalcular el Gran Total (fila 3) de esta remesa en base a los 3 módulos editados
    let filaGranTotal = Array(75).fill(0);
    // Para columnas de texto
    filaGranTotal[0] = "GRAN TOTAL";
    // Sumar numéricas
    for(let c=1; c<75; c++) {
        let sumaC = 0;
        [0,1,2].forEach(i => {
            let val = parseFloat(datosRemesaEnEdicion[i][c]);
            if(!isNaN(val)) sumaC += val;
        });
        filaGranTotal[c] = sumaC;
    }
    datosRemesaEnEdicion[3] = filaGranTotal; // Actualizamos el Gran Total de la remesa

    // 3. Guardar en BD
    // Ojo: En historial guardamos dentro de la propiedad "totales"
    const dbRef = ref(db, `historial_campanas/${remesaEnEdicion}/totales`);
    set(dbRef, datosRemesaEnEdicion).then(() => {
        alert('Edición guardada correctamente.');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarRemesa')).hide();
        cargarDatosCampana(); // Refrescar vista
    }).catch(err => {
        console.error(err);
        alert('Error al guardar edición.');
    });
});

// Iniciar al cargar la página
cargarDatosCampana();
