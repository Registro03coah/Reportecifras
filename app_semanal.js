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

let historialGlobal = {};
let remesaEnEdicion = "";
let datosRemesaEnEdicion = {};

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_SEMANAL.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        thT.innerText = ENCABEZADOS[colOriginal - 1];
        
        let anchoCelda = "50px"; 
        if(colOriginal >= 45 && colOriginal <= 47) anchoCelda = "60px"; 
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; 
        
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

construirHeaderTabla('#tablaSemanal');
construirHeaderTabla('#tablaEditarRemesa');

function cargarDatosSemanal() {
    get(ref(db, 'historial_campanas')).then((snapshot) => {
        if (snapshot.exists()) {
            historialGlobal = snapshot.val();
            renderTablaSemanal();
            renderListaRemesas();
        } else {
            historialGlobal = {};
            const tb = document.querySelector('#tablaSemanal tbody');
            if(tb) tb.innerHTML = '<tr><td colspan="29" class="text-center py-3 text-muted">No hay remesas guardadas aún.</td></tr>';
            const tbList = document.querySelector('#tablaListaRemesas tbody');
            if(tbList) tbList.innerHTML = '<tr><td colspan="2">No hay remesas guardadas</td></tr>';
        }
    }).catch(err => console.error(err));
}

function obtenerTotalesRemesa(remesaData) {
    if (remesaData.totales) return remesaData.totales;
    // Si no tiene .totales explícito, intentamos extraer o calcular de los módulos 050351, 050353, 050354 si existen
    let modulos = ["050351", "050353", "050354"];
    let matrizTotales = [];
    
    modulos.forEach(mod => {
        if (remesaData[mod] && Array.isArray(remesaData[mod])) {
            // Suponiendo que el último elemento o la última fila es la de totales del módulo
            let filasMod = remesaData[mod];
            let filaTot = filasMod[filasMod.length - 1] || Array(75).fill("0");
            matrizTotales.push(filaTot);
        } else {
            matrizTotales.push(Array(75).fill("0"));
        }
    });

    // Fila 4: Gran Total
    let filaGranTotal = Array(75).fill("0");
    filaGranTotal[0] = "GRAN TOTAL";
    for(let c=1; c<75; c++) {
        let suma = 0;
        [0,1,2].forEach(i => {
            let v = parseFloat(matrizTotales[i][c]);
            if(!isNaN(v)) suma += v;
        });
        filaGranTotal[c] = suma;
    }
    matrizTotales.push(filaGranTotal);
    return matrizTotales;
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    const remesasKeys = Object.keys(historialGlobal).sort((a,b) => parseInt(a) - parseInt(b));

    remesasKeys.forEach(remesaId => {
        let remesaData = historialGlobal[remesaId];
        if(!remesaData) return;

        let tablaTotalesRemesa = obtenerTotalesRemesa(remesaData);
        const filasModulos = ["050351", "050353", "050354", "GRAN TOTAL"];

        filasModulos.forEach((mod, idx) => {
            let tr = document.createElement('tr');
            if (mod === "GRAN TOTAL") tr.classList.add('fila-totales');

            COLUMNAS_SEMANAL.forEach(colOriginal => {
                let td = document.createElement('td');
                
                if(colOriginal === 45) td.innerText = mod === "GRAN TOTAL" ? "-" : "05";
                else if(colOriginal === 46) td.innerText = mod === "GRAN TOTAL" ? "-" : "03";
                else if(colOriginal === 47) td.innerText = mod === "GRAN TOTAL" ? `REMESA ${remesaId}` : mod.substring(4,6);
                else {
                    let val = tablaTotalesRemesa[idx] ? (tablaTotalesRemesa[idx][colOriginal-1] || "0") : "0";
                    td.innerText = val;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    });
}

function renderListaRemesas() {
    const tbody = document.querySelector('#tablaListaRemesas tbody');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    Object.keys(historialGlobal).forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-warning text-dark">Remesa ${remesaId}</td>
            <td>
                <button class="btn btn-sm btn-warning px-3 me-2 fw-bold btn-editar" data-id="${remesaId}"><i class="bi bi-pencil-square"></i> Ver / Editar</button>
                <button class="btn btn-sm btn-danger px-3 btn-borrar" data-id="${remesaId}"><i class="bi bi-trash"></i> Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-borrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').getAttribute('data-id');
            if(confirm(`¿Borrar la Remesa ${id}? Esto la eliminará de todos los reportes.`)) {
                remove(ref(db, `historial_campanas/${id}`)).then(() => {
                    alert('Remesa eliminada.');
                    cargarDatosSemanal();
                });
            }
        });
    });

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
    datosRemesaEnEdicion = JSON.parse(JSON.stringify(obtenerTotalesRemesa(historialGlobal[remesaId])));
    
    const tbody = document.querySelector('#tablaEditarRemesa tbody');
    tbody.innerHTML = "";
    
    const modulos = ["050351", "050353", "050354"];
    
    modulos.forEach((mod, idx) => {
        let tr = document.createElement('tr');
        COLUMNAS_SEMANAL.forEach(colOriginal => {
            let td = document.createElement('td');
            if(colOriginal === 45) td.innerText = "05";
            else if(colOriginal === 46) td.innerText = "03";
            else if(colOriginal === 47) td.innerText = mod.substring(4,6);
            else {
                let val = datosRemesaEnEdicion[idx] ? (datosRemesaEnEdicion[idx][colOriginal-1] || "0") : "0";
                td.innerHTML = `<input type="text" data-modidx="${idx}" data-colidx="${colOriginal-1}" value="${val}">`;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    new bootstrap.Modal(document.getElementById('modalEditarRemesa')).show();
}

document.getElementById('btnGuardarEdicion').addEventListener('click', () => {
    const inputs = document.querySelectorAll('#tablaEditarRemesa input');
    inputs.forEach(inp => {
        const m = inp.getAttribute('data-modidx');
        const c = inp.getAttribute('data-colidx');
        if(datosRemesaEnEdicion[m]) {
            datosRemesaEnEdicion[m][c] = inp.value.trim() || "0";
        }
    });

    let filaTotal = Array(75).fill("0");
    filaTotal[0] = "GRAN TOTAL";
    for(let c=1; c<75; c++) {
        let suma = 0;
        [0,1,2].forEach(i => {
            if(datosRemesaEnEdicion[i]) {
                let v = parseFloat(datosRemesaEnEdicion[i][c]);
                if(!isNaN(v)) suma += v;
            }
        });
        filaTotal[c] = suma;
    }
    datosRemesaEnEdicion[3] = filaTotal;

    set(ref(db, `historial_campanas/${remesaEnEdicion}/totales`), datosRemesaEnEdicion).then(() => {
        alert('Remesa actualizada en todos los reportes.');
        bootstrap.Modal.getInstance(document.getElementById('modalEditarRemesa')).hide();
        cargarDatosSemanal();
    });
});

cargarDatosSemanal();
