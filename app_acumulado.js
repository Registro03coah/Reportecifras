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

const COLUMNAS_ACUMULADO = [45, 46, 47, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

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

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaAcumulado thead');
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    COLUMNAS_ACUMULADO.forEach((colOriginal) => {
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

construirHeaderTabla();

function obtenerTotalesRemesa(remesaData) {
    if (remesaData.totales) return remesaData.totales;
    let modulos = ["050351", "050353", "050354"];
    let matrizTotales = [];
    
    modulos.forEach(mod => {
        if (remesaData[mod] && Array.isArray(remesaData[mod])) {
            let filasMod = remesaData[mod];
            let filaTot = filasMod[filasMod.length - 1] || Array(75).fill("0");
            matrizTotales.push(filaTot);
        } else {
            matrizTotales.push(Array(75).fill("0"));
        }
    });

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

function cargarAcumuladoGlobal() {
    get(ref(db, 'historial_campanas')).then((snapshot) => {
        if (snapshot.exists()) {
            const historialGlobal = snapshot.val();
            
            let sumasAcumuladas = {
                "050351": Array(75).fill(0),
                "050353": Array(75).fill(0),
                "050354": Array(75).fill(0)
            };

            for (const remesa in historialGlobal) {
                let remesaData = historialGlobal[remesa];
                if(!remesaData) continue;
                let tablaTotalesRemesa = obtenerTotalesRemesa(remesaData);
                
                [0, 1, 2].forEach(idx => {
                    let modId = idx === 0 ? "050351" : (idx === 1 ? "050353" : "050354");
                    for(let c = 0; c < 75; c++) {
                        let valor = parseFloat(tablaTotalesRemesa[idx][c]);
                        if(!isNaN(valor)) sumasAcumuladas[modId][c] += valor;
                    }
                });
            }

            const tbody = document.querySelector('#tablaAcumulado tbody');
            if(!tbody) return;
            tbody.innerHTML = "";
            const filasAMostrar = ["050351", "050353", "050354", "GRAN TOTAL"];

            filasAMostrar.forEach(fila => {
                let tr = document.createElement('tr');
                if (fila === "GRAN TOTAL") tr.classList.add('fila-totales');

                COLUMNAS_ACUMULADO.forEach(colOriginal => {
                    let td = document.createElement('td');
                    if(colOriginal === 45) td.innerText = fila === "GRAN TOTAL" ? "-" : "05";
                    else if (colOriginal === 46) td.innerText = fila === "GRAN TOTAL" ? "-" : "03";
                    else if (colOriginal === 47) td.innerText = fila === "GRAN TOTAL" ? "GRAN TOTAL" : fila.substring(4,6);
                    else {
                        if(fila === "GRAN TOTAL") {
                            let totalCol = sumasAcumuladas["050351"][colOriginal-1] + sumasAcumuladas["050353"][colOriginal-1] + sumasAcumuladas["050354"][colOriginal-1];
                            td.innerText = totalCol === 0 ? "0" : totalCol;
                        } else {
                            let valorSuma = sumasAcumuladas[fila][colOriginal-1];
                            td.innerText = valorSuma === 0 ? "0" : valorSuma;
                        }
                    }
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });

        } else {
            const tb = document.querySelector('#tablaAcumulado tbody');
            if(tb) tb.innerHTML = '<tr><td colspan="29" class="text-center py-3 text-muted">No hay datos históricos para acumular.</td></tr>';
        }
    }).catch(err => console.error(err));
}

cargarAcumuladoGlobal();
