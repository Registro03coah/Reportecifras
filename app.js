
// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes",
    storageBucket: "sistema-mac-reportes.firebasestorage.app",
    messagingSenderId: "776250701305",
    appId: "1:776250701305:web:ac542564b7f7a136cef928"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. SISTEMA DE CONTADOR DE VERSIÓN
// ==========================================
function actualizarContadorVersion() {
    let buildVersion = localStorage.getItem('macs_build_version');
    buildVersion = buildVersion ? parseInt(buildVersion) + 1 : 1;
    localStorage.setItem('macs_build_version', buildVersion);
    document.getElementById('versionDisplay').innerText = `Versión 11.0.${buildVersion}`;
}
actualizarContadorVersion();

// ==========================================
// 3. GENERAR FILAS DEL FORMULARIO DE CAPTURA
// ==========================================
const conceptosFijos = [
    "Inscripciones",
    "Correcciones",
    "Cambio de Domicilio",
    "Reposiciones",
    "Reincorporaciones",
    "Reemplazos",
    "Entregas"
];

function generarFilasCaptura() {
    const tbody = document.querySelector('#tablaCaptura tbody');
    conceptosFijos.forEach((concepto, index) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="form-control fw-bold captura-concepto" value="${concepto}" readonly></td>
            <td><input type="number" class="form-control captura-lunes" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-martes" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-miercoles" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-jueves" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-viernes" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-sabado" value="0" min="0"></td>
            <td><input type="number" class="form-control captura-domingo" value="0" min="0"></td>
        `;
        tbody.appendChild(tr);
    });
}
generarFilasCaptura();

// ==========================================
// 4. LÓGICA DE COPIAR Y PEGAR DESDE EXCEL
// ==========================================
const pasteZone = document.getElementById('pasteZone');

pasteZone.addEventListener('paste', (e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('Text');
    
    // Dividir los datos pegados por filas y luego por columnas (tabuladores)
    const rows = pastedData.split('\n');
    const tbody = document.querySelector('#tablaCaptura tbody');
    const tableRows = tbody.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        if (row.trim() === '') return; // Saltar filas vacías
        const columns = row.split('\t');
        
        if (rowIndex < tableRows.length) {
            const inputs = tableRows[rowIndex].querySelectorAll('input[type="number"]');
            
            // Si el usuario pegó los conceptos también, ajustamos el índice
            let startIndex = 0;
            if (isNaN(parseInt(columns[0].trim())) && columns.length > 7) {
                 startIndex = 1; // Ignorar la primera columna si parece texto
            }

            inputs.forEach((input, colIndex) => {
                if (columns[startIndex + colIndex]) {
                    // Limpiar el dato y asignarlo
                    let val = parseInt(columns[startIndex + colIndex].trim().replace(/,/g, ''));
                    input.value = isNaN(val) ? 0 : val;
                }
            });
        }
    });
    
    alert("Datos pegados correctamente. Revisa que todo coincida.");
});

// ==========================================
// 5. GUARDAR DATOS EN FIREBASE
// ==========================================
document.getElementById('formularioCaptura').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const tipoReporte = document.getElementById('tipoReporte').value;
    const tbody = document.querySelector('#tablaCaptura tbody');
    const filas = tbody.querySelectorAll('tr');
    
    // Validar si es semanal (sobrescribir) o los otros (agregar al histórico)
    const dbRef = ref(db, `reportes/${tipoReporte}`);
    
    // Armar el arreglo de datos
    let datosAGuardar = [];
    filas.forEach(fila => {
        let concepto = fila.querySelector('.captura-concepto').value;
        let lunes = parseInt(fila.querySelector('.captura-lunes').value) || 0;
        let martes = parseInt(fila.querySelector('.captura-martes').value) || 0;
        let miercoles = parseInt(fila.querySelector('.captura-miercoles').value) || 0;
        let jueves = parseInt(fila.querySelector('.captura-jueves').value) || 0;
        let viernes = parseInt(fila.querySelector('.captura-viernes').value) || 0;
        let sabado = parseInt(fila.querySelector('.captura-sabado').value) || 0;
        let domingo = parseInt(fila.querySelector('.captura-domingo').value) || 0;
        
        datosAGuardar.push({ concepto, lunes, martes, miercoles, jueves, viernes, sabado, domingo });
    });

    if (tipoReporte === 'semanal') {
        // El semanal se reemplaza por completo cada vez
        set(dbRef, datosAGuardar)
            .then(() => alert("Reporte Semanal actualizado correctamente."))
            .catch(error => console.error("Error:", error));
    } else {
        // Campaña y Acumulado se agrega un nuevo registro (push)
        push(dbRef, datosAGuardar)
            .then(() => alert(`Datos agregados al reporte ${tipoReporte} correctamente.`))
            .catch(error => console.error("Error:", error));
    }
    
    // Limpiar formulario a ceros
    document.getElementById('formularioCaptura').reset();
    document.querySelectorAll('#tablaCaptura input[type="number"]').forEach(inp => inp.value = 0);
});

// ==========================================
// 6. LÓGICA PARA PINTAR LAS TABLAS DESDE FIREBASE
// ==========================================
function procesarYRenderizarDatos(idTabla, datosFirebase, sumarDatos = false) {
    const tbody = document.querySelector(`#${idTabla} tbody`);
    tbody.innerHTML = ''; 

    if (!datosFirebase || Object.keys(datosFirebase).length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No hay datos registrados aún.</td></tr>`;
        return;
    }

    let datosProcesados = [];

    if (sumarDatos) {
        let sumatoria = {};
        
        // Iteramos sobre las "llaves" generadas por el push de Firebase
        Object.values(datosFirebase).forEach(grupoDatos => {
             // Cada grupo es el arreglo que guardamos
             grupoDatos.forEach(row => {
                if (!sumatoria[row.concepto]) {
                    sumatoria[row.concepto] = { 
                        concepto: row.concepto, lunes: 0, martes: 0, miercoles: 0, jueves: 0, viernes: 0, sabado: 0, domingo: 0 
                    };
                }
                sumatoria[row.concepto].lunes += Number(row.lunes || 0);
                sumatoria[row.concepto].martes += Number(row.martes || 0);
                sumatoria[row.concepto].miercoles += Number(row.miercoles || 0);
                sumatoria[row.concepto].jueves += Number(row.jueves || 0);
                sumatoria[row.concepto].viernes += Number(row.viernes || 0);
                sumatoria[row.concepto].sabado += Number(row.sabado || 0);
                sumatoria[row.concepto].domingo += Number(row.domingo || 0);
             });
        });
        datosProcesados = Object.values(sumatoria);
    } else {
        // Para el semanal que es un set directo (arreglo plano)
        datosProcesados = Object.values(datosFirebase);
    }

    datosProcesados.forEach(fila => {
        let totalFila = Number(fila.lunes) + Number(fila.martes) + Number(fila.miercoles) + 
                        Number(fila.jueves) + Number(fila.viernes) + Number(fila.sabado) + Number(fila.domingo);
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold text-start">${fila.concepto}</td>
            <td>${fila.lunes}</td>
            <td>${fila.martes}</td>
            <td>${fila.miercoles}</td>
            <td>${fila.jueves}</td>
            <td>${fila.viernes}</td>
            <td>${fila.sabado}</td>
            <td>${fila.domingo}</td>
            <td class="table-success fw-bold">${totalFila}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Escuchadores de Firebase en tiempo real
onValue(ref(db, 'reportes/semanal'), (snapshot) => {
    procesarYRenderizarDatos('tablaSemanal', snapshot.val(), false); 
});

onValue(ref(db, 'reportes/campana'), (snapshot) => {
    procesarYRenderizarDatos('tablaCampana', snapshot.val(), true); 
});

onValue(ref(db, 'reportes/acumulado'), (snapshot) => {
    procesarYRenderizarDatos('tablaAcumulado', snapshot.val(), true); 
});
