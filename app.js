import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const APP_VERSION = "11.3.0"; 
document.getElementById('versionDisplay').innerText = `Versión ${APP_VERSION}`;

const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const TOTAL_COLUMNAS = 75;
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Encabezados transcritos de tu imagen
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
    "FOLIO NEC", "cartografia", "lotes de credenciales", "registradas por dia", "faltantes", "observaciones"
];
// (Las columnas 58 a 75 quedan como "Columna X" hasta que las nombres si las necesitas)

function generarEncabezados(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        thT.innerText = ENCABEZADOS[i-1] || `Columna ${i}`;
        
        // Estilos de la imagen
        if(i >= 5 && i <= 7) thT.classList.add('bg-folios');
        if(i >= 19 && i <= 30) thT.classList.add('bg-retiradas');
        if(i === 16) thT.style.backgroundColor = "#92d050"; // Verde total trámites
        if(i === 17) thT.style.backgroundColor = "red"; // Rojo cancelados
        if(i === 18) thT.style.backgroundColor = "yellow"; // Amarillo
        
        thN.innerText = i;
        thN.className = "table-light";
        
        trTitulos.appendChild(thT);
        trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos);
    thead.appendChild(trNumeros);
}

generarEncabezados('#tablaCaptura');
generarEncabezados('#tablaSemanal');
generarEncabezados('#tablaCampana');
generarEncabezados('#tablaAcumulado');

const tbodyCaptura = document.querySelector('#tablaCaptura tbody');
DIAS_SEMANA.forEach((dia) => {
    let tr = document.createElement('tr');
    for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
        let td = document.createElement('td');
        if(c === 1) {
            td.innerHTML = `<input type="text" class="fw-bold text-center" value="${dia}" readonly>`;
        } else if(c === 2) {
            td.innerHTML = `<input type="text" class="form-control-sm text-center" placeholder="DD/MM/AA">`;
        } else {
            // Se cambia a tipo TEXT para que soporte datos como "MVA 050351" o folios de 13 dígitos
            td.innerHTML = `<input type="text" class="calc-input col-${c}" value="">`;
        }
        tr.appendChild(td);
    }
    tbodyCaptura.appendChild(tr);
});

const tfootCaptura = document.querySelector('#tablaCaptura tfoot');
let trTotal = document.createElement('tr');
trTotal.classList.add('table-success', 'fw-bold');
for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
    let td = document.createElement('td');
    if(c === 1) td.innerText = "LINEA TOTALES";
    else if(c === 2) td.innerText = "-";
    else td.innerHTML = `<span id="tot-cap-${c}"></span>`;
    trTotal.appendChild(td);
}
tfootCaptura.appendChild(trTotal);

// Recalcular totales: Ignora texto, solo suma si es número
tbodyCaptura.addEventListener('input', () => {
    for(let c = 3; c <= TOTAL_COLUMNAS; c++) {
        let suma = 0;
        let tieneDatos = false;
        document.querySelectorAll(`.col-${c}`).forEach(inp => {
            let val = inp.value.trim();
            if(val !== "" && !isNaN(val)) {
                suma += parseFloat(val);
                tieneDatos = true;
            }
        });
        document.getElementById(`tot-cap-${c}`).innerText = tieneDatos ? suma : "";
    }
});

// PEGAR DESDE EXCEL
document.getElementById('pasteZone').addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('Text');
    const rows = pastedData.split('\n');
    const tableRows = tbodyCaptura.querySelectorAll('tr');

    let rowOffset = 0;
    
    rows.forEach((row, rowIndex) => {
        if (row.trim() === '') return;
        const columns = row.split('\t');
        
        // Saltarse los encabezados si los copian
        if(rowIndex === 0 && (columns[0].toUpperCase().includes("DÍA") || columns[0] == "1")) {
            rowOffset++; return; 
        }

        const targetRow = tableRows[rowIndex - rowOffset];
        if (targetRow) {
            const inputs = targetRow.querySelectorAll('input');
            inputs.forEach((input, colIndex) => {
                if (columns[colIndex]) {
                    let val = columns[colIndex].trim().replace(/,/g, '');
                    if(colIndex === 0) return; // No sobreescribir día (Lunes, etc)
                    input.value = val; // Se pega tal cual para preservar "MVA 050351"
                }
            });
        }
    });
    
    tbodyCaptura.dispatchEvent(new Event('input'));
    alert("Datos pegados con éxito. Los folios y sedes se mantuvieron intactos.");
});

document.getElementById('formularioCaptura').addEventListener('submit', (e) => {
    e.preventDefault();
    const tipoReporte = document.getElementById('tipoReporte').value;
    const dbRef = ref(db, `reportes_v11/${tipoReporte}`);
    const filas = tbodyCaptura.querySelectorAll('tr');
    
    let datosAGuardar = [];
    filas.forEach(fila => {
        let filaArray = [];
        fila.querySelectorAll('input').forEach((input) => {
            filaArray.push(input.value);
        });
        datosAGuardar.push(filaArray);
    });

    if (tipoReporte === 'semanal') {
        set(dbRef, datosAGuardar).then(() => alert("Reporte Semanal actualizado."));
    } else {
        push(dbRef, datosAGuardar).then(() => alert(`Histórico agregado a ${tipoReporte}.`));
    }
});

function renderizarVisual(idTabla, datosFirebase, sumarDatos = false) {
    const tbody = document.querySelector(`#${idTabla} tbody`);
    const tfoot = document.querySelector(`#${idTabla} tfoot`);
    tbody.innerHTML = ''; tfoot.innerHTML = '';

    if (!datosFirebase) return;

    let matrizFinal = [];

    if (sumarDatos) {
        for(let f = 0; f < 7; f++) {
            matrizFinal.push(new Array(TOTAL_COLUMNAS).fill(""));
            matrizFinal[f][0] = DIAS_SEMANA[f]; 
            matrizFinal[f][1] = "Acumulado";   
        }

        Object.values(datosFirebase).forEach(cargaSemanal => {
            cargaSemanal.forEach((filaArray, rowIndex) => {
                if(rowIndex < 7) {
                    for(let colIndex = 2; colIndex < TOTAL_COLUMNAS; colIndex++) {
                        let val = filaArray[colIndex];
                        if(val && !isNaN(val)) {
                            matrizFinal[rowIndex][colIndex] = Number(matrizFinal[rowIndex][colIndex]) + Number(val);
                        } else if (val && isNaN(val)) {
                            // Si es texto (ej. MVA 050351), solo muestra el último registrado
                            matrizFinal[rowIndex][colIndex] = val; 
                        }
                    }
                }
            });
        });
    } else {
        matrizFinal = datosFirebase;
    }

    let totales = new Array(TOTAL_COLUMNAS).fill(0);
    
    matrizFinal.forEach(filaArray => {
        let tr = document.createElement('tr');
        for(let c = 0; c < TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            let valor = filaArray[c] || '';
            
            if(c < 2) {
                td.innerHTML = `<strong>${valor}</strong>`;
            } else {
                td.innerText = valor;
                if(valor !== "" && !isNaN(valor)) {
                    totales[c] += Number(valor);
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });

    let trTotal = document.createElement('tr');
    trTotal.className = "table-success fw-bold";
    for(let c = 0; c < TOTAL_COLUMNAS; c++) {
        let td = document.createElement('td');
        if(c === 0) td.innerText = "LINEA TOTALES";
        else if(c === 1) td.innerText = "-";
        else td.innerText = totales[c] > 0 ? totales[c] : "";
        trTotal.appendChild(td);
    }
    tfoot.appendChild(trTotal);
}

onValue(ref(db, 'reportes_v11/semanal'), snapshot => renderizarVisual('tablaSemanal', snapshot.val(), false));
onValue(ref(db, 'reportes_v11/campana'), snapshot => renderizarVisual('tablaCampana', snapshot.val(), true));
onValue(ref(db, 'reportes_v11/acumulado'), snapshot => renderizarVisual('tablaAcumulado', snapshot.val(), true));
