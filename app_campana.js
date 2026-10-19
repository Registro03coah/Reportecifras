// ==========================================
// 1. IMPORTACIONES FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. CONFIGURACIÓN DE TABLA CAMPAÑA (30 COLUMNAS)
// ==========================================
const TOTAL_COLUMNAS = 30; // Solo mostramos hasta la 30
const MODULOS = ["050351", "050353", "050354"];

const ENCABEZADOS = [
    "DÍA", "DD/MM/AA", "Horas trabajadas", "Sedes visitadas", "INICIAL", "FINAL", "TOTAL DE FOLIOS", 
    "INSCRIPCIONES", "CORRECCION DE DATOS PERSONALES", "CAMBIO DE DOMICILIO", "REPOSISION", 
    "CORR. DE DATOS DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL DE TRAMITES", 
    "CANCELADOS", "TOTAL DE ANEXO DE RECHAZO", "CPV devuelta entrega", "DISPONIBLES AL DIA ANTERIOR", 
    "RECIBIDAS", "RECIBIDAS DE OTROS TIPOS", "ENTREGADAS", "RECIBO Y/O EXTRAVIO", "ANEXAS A FUAR", 
    "DATOS ERRONEOS", "FOTO MAL IMPRESA", "REIMPRESION", "'RETIRADAS POR CAUSA", "DISPONIBLES"
];

function generarEncabezadosCampana() {
    const thead = document.querySelector('#tablaCampana thead');
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        let tituloStr = ENCABEZADOS[i-1] || `Columna ${i}`;
        if(i === 1) tituloStr = "MÓDULO"; // Según instrucción, la col 1 dice MÓDULO
        
        thT.innerText = tituloStr;
        
        let anchoCelda = "45px"; 
        if(i === 1) anchoCelda = "110px"; 
        else if(i === 2) anchoCelda = "70px"; 
        else if(i === 4) anchoCelda = "85px"; 
        else if(i === 5 || i === 6) anchoCelda = "105px"; 
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        // Mantener colores originales
        if(i >= 5 && i <= 7) thT.classList.add('bg-folios');
        if(i >= 19 && i <= 30) thT.classList.add('bg-retiradas');
        if(i === 16) thT.style.backgroundColor = "#92d050"; 
        if(i === 17) thT.style.backgroundColor = "red"; 
        if(i === 18) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = i; thN.className = "table-light";
        
        // Ocultamos visualmente 2 a 4 (Fechas y Sedes que no se suman)
        if(i >= 2 && i <= 4) {
            thT.style.display = "none"; thN.style.display = "none";
        }
        
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

// Inicializar tabla vacía
generarEncabezadosCampana();

// ==========================================
// 3. LECTURA Y PROCESAMIENTO DE FIREBASE
// ==========================================

function cargarDatosCampana() {
    const statusDiv = document.getElementById('statusCarga');
    const dbRef = ref(db, 'historial_campanas');
    
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const historial = snapshot.val();
            procesarYMostrarDatos(historial);
            statusDiv.className = "badge bg-success fs-6";
            statusDiv.innerHTML = '<i class="bi bi-check-circle"></i> Datos Actualizados';
        } else {
            statusDiv.className = "badge bg-secondary fs-6";
            statusDiv.innerHTML = 'No hay remesas guardadas aún.';
        }
    }).catch((error) => {
        console.error(error);
        statusDiv.className = "badge bg-danger fs-6";
        statusDiv.innerHTML = '<i class="bi bi-x-circle"></i> Error de conexión';
    });
}

function procesarYMostrarDatos(historial) {
    // Arrays para acumular las sumas de cada módulo (75 posiciones, aunque solo mostraremos 30)
    let sumas = {
        "050351": Array(75).fill(0),
        "050353": Array(75).fill(0),
        "050354": Array(75).fill(0),
        "GRAN TOTAL": Array(75).fill(0)
    };

    // Recorremos cada remesa (ej. remesa "1", "2", etc.)
    for (const remesa in historial) {
        let tablaTotalesRemesa = historial[remesa].totales; 
        if(!tablaTotalesRemesa) continue;
        
        // tablaTotalesRemesa[0] -> 050351
        // tablaTotalesRemesa[1] -> 050353
        // tablaTotalesRemesa[2] -> 050354
        
        // Iteramos sobre las filas de la matriz guardada
        tablaTotalesRemesa.forEach((fila, index) => {
            let modActual = "";
            if(index === 0) modActual = "050351";
            else if(index === 1) modActual = "050353";
            else if(index === 2) modActual = "050354";
            else return; // Saltamos la 4ta fila que era el gran total de esa remesa, lo calcularemos fresco

            // Sumamos columna por columna
            for(let c = 0; c < 75; c++) {
                let valor = parseFloat(fila[c]);
                if(!isNaN(valor)) {
                    sumas[modActual][c] += valor;
                }
            }
        });
    }

    // Dibujamos el tbody
    const tbody = document.querySelector('#tablaCampana tbody');
    tbody.innerHTML = ""; // Limpiamos

    const filasAMostrar = ["050351", "050353", "050354", "GRAN TOTAL"];

    filasAMostrar.forEach(fila => {
        let tr = document.createElement('tr');
        if (fila === "GRAN TOTAL") tr.classList.add('fila-totales');

        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            
            if(c === 1) {
                td.innerText = fila; // "050351", "050353"...
            } else if (c >= 2 && c <= 4) {
                td.innerText = "-"; // Ocultas visualmente de todos modos
                td.style.display = "none";
            } else {
                // Cálculo para Gran Total
                if(fila === "GRAN TOTAL") {
                    let totalCol = sumas["050351"][c-1] + sumas["050353"][c-1] + sumas["050354"][c-1];
                    td.innerText = totalCol === 0 ? "0" : totalCol;
                } else {
                    // Mostrar suma acumulada
                    let valorSuma = sumas[fila][c-1];
                    td.innerText = valorSuma === 0 ? "0" : valorSuma;
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

// Ejecutar carga
cargarDatosCampana();
