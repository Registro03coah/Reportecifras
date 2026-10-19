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

function cargarDatosSemanal() {
    // CONSULTA DIRECTA A LA BD MADRE
    get(ref(db, 'bd_madre')).then((snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            renderTablaSemanal();
            renderListaRemesas();
        } else {
            bdMadreGlobal = [];
            const tb = document.querySelector('#tablaSemanal tbody');
            if(tb) tb.innerHTML = '<tr><td colspan="29" class="text-center py-3 text-muted">No hay registros en la Base de Datos Principal.</td></tr>';
            const tbList = document.querySelector('#tablaListaRemesas tbody');
            if(tbList) tbList.innerHTML = '<tr><td colspan="2">No hay remesas disponibles</td></tr>';
        }
    }).catch(err => console.error("Error al leer la BD Madre:", err));
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (bdMadreGlobal.length === 0) return;

    // Agrupar los datos por Remesa
    let remesasMap = {};
    bdMadreGlobal.forEach(fila => {
        let rem = fila['Remesa'] || fila['remesa'] || 'S/N';
        if (!remesasMap[rem]) remesasMap[rem] = [];
        remesasMap[rem].push(fila);
    });

    const remesasKeys = Object.keys(remesasMap).sort();

    remesasKeys.forEach(remesaId => {
        let filasRemesa = remesasMap[remesaId];
        
        // Agrupar por Módulo dentro de la remesa
        let modulosMap = {};
        filasRemesa.forEach(f => {
            let mod = f['Módulo'] || f['Modulo'] || 'General';
            if (!modulosMap[mod]) modulosMap[mod] = [];
            modulosMap[mod].push(f);
        });

        // Para cada módulo, sumamos los valores numéricos de la semana
        Object.keys(modulosMap).forEach(modNombre => {
            let tr = document.createElement('tr');
            let registrosMod = modulosMap[modNombre];

            COLUMNAS_SEMANAL.forEach(colOriginal => {
                let td = document.createElement('td');
                let nombreColKey = ENCABEZADOS[colOriginal - 1];

                if(colOriginal === 45) {
                    td.innerText = "05";
                } else if(colOriginal === 46) {
                    td.innerText = "03";
                } else if(colOriginal === 47) {
                    td.innerText = modNombre.replace("Módulo ", "").trim();
                } else {
                    // Sumar los valores de los días de ese módulo en la remesa
                    let sumaCol = 0;
                    registrosMod.forEach(reg => {
                        // Buscar la columna por su nombre exacto o índice
                        let val = parseFloat(reg[nombreColKey] || reg[`Columna ${colOriginal}`] || 0);
                        if (!isNaN(val)) sumaCol += val;
                    });
                    td.innerText = sumaCol;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Fila de Gran Total por Remesa
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
                filasRemesa.forEach(reg => {
                    let val = parseFloat(reg[nombreColKey] || reg[`Columna ${colOriginal}`] || 0);
                    if (!isNaN(val)) sumaTotalRemesa += val;
                });
                td.innerText = sumaTotalRemesa;
            }
            trGranTotal.appendChild(td);
        });
        tbody.appendChild(trGranTotal);
    });
}

function renderListaRemesas() {
    const tbody = document.querySelector('#tablaListaRemesas tbody');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    // Extraer remesas únicas
    let remesasUnicas = [...new Set(bdMadreGlobal.map(f => f['Remesa'] || f['remesa'] || 'S/N'))].sort();

    remesasUnicas.forEach(remesaId => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold fs-5 text-dark">Remesa ${remesaId}</td>
            <td>
                <span class="text-muted small">Administrada desde la Base de Datos Principal</span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

cargarDatosSemanal();
