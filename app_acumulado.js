// ==========================================
// 1. CONFIGURACIÓN FIREBASE (BD MADRE)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const COLUMNAS_ACUMULADO = [];
for(let i = 1; i <= 75; i++) {
    if(i !== 3) COLUMNAS_ACUMULADO.push(i);
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
let valoresInicialesGlobal = { "050351": 0, "050353": 0, "050354": 0 };

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaAcumulado thead');
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_ACUMULADO.forEach((colOriginal) => {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        thT.innerText = ENCABEZADOS[colOriginal - 1] || `Col ${colOriginal}`;
        
        let anchoCelda = "50px"; 
        if(colOriginal >= 45 && colOriginal <= 47) anchoCelda = "60px"; 
        else if(colOriginal === 5 || colOriginal === 6) anchoCelda = "105px"; 
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        if(colOriginal >= 5 && colOriginal <= 7) thT.classList.add('bg-folios');
        if(colOriginal >= 19 && colOriginal <= 30) thT.classList.add('bg-retiradas');
        
        thN.innerText = colOriginal; thN.className = "table-light";
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    });
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

construirHeaderTabla();

function cargarDatosAcumulado() {
    const statusDiv = document.getElementById('statusAcumulado');
    
    // Cargar iniciales guardadas en Firebase
    get(ref(db, 'config_acumulado_iniciales')).then(snap => {
        if(snap.exists()) {
            valoresInicialesGlobal = snap.val();
            document.getElementById('ini_050351').value = valoresInicialesGlobal["050351"] || 0;
            document.getElementById('ini_050353').value = valoresInicialesGlobal["050353"] || 0;
            document.getElementById('ini_050354').value = valoresInicialesGlobal["050354"] || 0;
        }
    });

    // Cargar la BD Madre
    get(ref(db, 'bd_madre')).then((snapshot) => {
        if (snapshot.exists()) {
            const dataRaw = snapshot.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            renderTablaAcumulado();
            if(statusDiv) {
                statusDiv.className = "badge bg-success fs-6";
                statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Sincronizado';
            }
        } else {
            bdMadreGlobal = [];
            if(statusDiv) {
                statusDiv.className = "badge bg-secondary fs-6";
                statusDiv.innerHTML = 'Sin datos en BD Principal';
            }
        }
    }).catch(err => console.error("Error al cargar acumulado:", err));
}

function renderTablaAcumulado() {
    const tbody = document.querySelector('#tablaAcumulado tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    if(bdMadreGlobal.length === 0) return;

    let modulosMap = {};
    bdMadreGlobal.forEach(fila => {
        let mod = fila['Módulo'] || fila['Modulo'] || 'General';
        if (!modulosMap[mod]) modulosMap[mod] = [];
        modulosMap[mod].push(fila);
    });

    let granTotalAcumulado = {};

    Object.keys(modulosMap).sort().forEach(modNombre => {
        let registrosMod = modulosMap[modNombre];
        let tr = document.createElement('tr');
        let numModuloLimpio = modNombre.replace("Módulo ", "").trim();

        COLUMNAS_ACUMULADO.forEach(colOriginal => {
            let td = document.createElement('td');
            let nombreColKey = ENCABEZADOS[colOriginal - 1];

            if(colOriginal === 45) {
                td.innerText = "05";
            } else if(colOriginal === 46) {
                td.innerText = "03";
            } else if(colOriginal === 47) {
                td.innerText = numModuloLimpio;
            } else {
                let sumaCol = 0;
                registrosMod.forEach(reg => {
                    let val = parseFloat(reg[nombreColKey] || reg[`Columna ${colOriginal}`] || 0);
                    if (!isNaN(val)) sumaCol += val;
                });

                // Si es la columna INICIAL (ej. Columna 5) sumamos el valor inicial configurado
                if (colOriginal === 5) {
                    let baseInicial = parseFloat(valoresInicialesGlobal[numModuloLimpio] || 0);
                    sumaCol += baseInicial;
                }

                td.innerText = sumaCol;

                if (!granTotalAcumulado[colOriginal]) granTotalAcumulado[colOriginal] = 0;
                granTotalAcumulado[colOriginal] += sumaCol;
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // Fila de Gran Total Global Acumulado
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    COLUMNAS_ACUMULADO.forEach(colOriginal => {
        let td = document.createElement('td');
        if(colOriginal === 45) td.innerText = "-";
        else if(colOriginal === 46) td.innerText = "-";
        else if(colOriginal === 47) td.innerText = "TOTAL GENERAL";
        else {
            td.innerText = granTotalAcumulado[colOriginal] || 0;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

// Botón Guardar Iniciales
document.getElementById('btnGuardarIniciales').addEventListener('click', () => {
    valoresInicialesGlobal = {
        "050351": parseFloat(document.getElementById('ini_050351').value) || 0,
        "050353": parseFloat(document.getElementById('ini_050353').value) || 0,
        "050354": parseFloat(document.getElementById('ini_050354').value) || 0
    };

    set(ref(db, 'config_acumulado_iniciales'), valoresInicialesGlobal).then(() => {
        alert('Valores iniciales guardados y aplicados correctamente.');
        renderTablaAcumulado();
    });
});

cargarDatosAcumulado();
