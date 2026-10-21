// ==========================================
// 1. IMPORTACIONES FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6jvnsXZwF2anOJo3VadfNvn7Fl6Z5efY",
    authDomain: "sistema-mac-reportes.firebaseapp.com",
    databaseURL: "https://sistema-mac-reportes-default-rtdb.firebaseio.com",
    projectId: "sistema-mac-reportes"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. CONFIGURACIÓN DE TABLAS Y ENCABEZADOS
// ==========================================
const TOTAL_COLUMNAS = 75;
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "LINEA TOTALES"];
const MODULOS = ["050351", "050353", "050354"];

const ENCABEZADOS = [
    "DIA", "FECHA", "Horas_trabajadas", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR_DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXO_DE_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
    "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_YO_EXTRAVIO", "ANEXAS_A_FUAR",
    "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "REIMPRESION_2", "RETIRADAS_POR_CAUSA", "DISPONIBLES",
    "credenciales_x_canje", "fichas_Entregadas", "fichas_atendidas", "Dias_trabajados",
    "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITUD_EXPEDICION_ORDINARIA", "SOLICITU_DE_RECTIFICACION",
    "DEMANDA_DE_JUICIO", "REMESA", "Total_de_movimientos", "DEVUELTAS_POR_TERCEROS",
    "34_Imagen_inconsistente", "35_Movimiento_posterior", "CONFIGURACION", "ENT", "DTTO",
    "MODULO", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "CPV_devuelta_entrega_2", "script_ejecutado",
    "FOLIO_NEC", "cartografia", "lotes_de_credenciales", "registradas_por_dia", "faltantes", "observaciones",
    "sin_nombre1", "sin_nombre2", "sin_nombre3", "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA",
    "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES", "MAL_IMPRESA", "ERROR_EN_CARTOGRAFIA",
    "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA",
    "MOV_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

const NOMBRES_ESTANDAR_BD = [
    "DIA", "FECHA", "Horas_trabajadas", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR_DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXO_DE_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
    "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_YO_EXTRAVIO", "ANEXAS_A_FUAR",
    "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "REIMPRESION_2", "RETIRADAS_POR_CAUSA", "DISPONIBLES",
    "credenciales_x_canje", "fichas_Entregadas", "fichas_atendidas", "Dias_trabajados",
    "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITUD_EXPEDICION_ORDINARIA", "SOLICITU_DE_RECTIFICACION",
    "DEMANDA_DE_JUICIO", "REMESA", "Total_de_movimientos", "DEVUELTAS_POR_TERCEROS",
    "34_Imagen_inconsistente", "35_Movimiento_posterior", "CONFIGURACION", "ENT", "DTTO",
    "MODULO", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "CPV_devuelta_entrega_2", "script_ejecutado",
    "FOLIO_NEC", "cartografia", "lotes_de_credenciales", "registradas_por_dia", "faltantes", "observaciones",
    "sin_nombre1", "sin_nombre2", "sin_nombre3", "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA",
    "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES", "MAL_IMPRESA", "ERROR_EN_CARTOGRAFIA",
    "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA",
    "MOV_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

function generarEncabezados(selectorTabla, isTotales = false) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        let tituloStr = ENCABEZADOS[i-1] || `Columna ${i}`;
        if(isTotales && i === 1) tituloStr = "MODULO";
        
        thT.innerText = tituloStr;
        
        let anchoCelda = "45px"; 
        if(i === 1) anchoCelda = "110px"; 
        else if(i === 2) anchoCelda = "70px"; 
        else if(i === 4) anchoCelda = "85px"; 
        else if(i === 5 || i === 6) anchoCelda = "105px"; 
        else if(i === 61 || i === 62) anchoCelda = "80px"; 
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda; thT.style.maxWidth = anchoCelda;
        
        if(i >= 5 && i <= 7) thT.classList.add('bg-folios');
        if(i >= 19 && i <= 30) thT.classList.add('bg-retiradas');
        if(i === 16) thT.style.backgroundColor = "#92d050"; 
        if(i === 17) thT.style.backgroundColor = "red"; 
        if(i === 18) thT.style.backgroundColor = "yellow"; 
        if(i >= 58 && i <= 60) thT.style.backgroundColor = "#e8e8f4"; 
        if(i === 61 || i === 62) thT.style.backgroundColor = "#9b9649"; 
        if(i === 63 || i === 64) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = i; thN.className = "table-light";
        
        if(isTotales && i >= 2 && i <= 4) {
            thT.style.display = "none"; thN.style.display = "none";
        }
        
        trTitulos.appendChild(thT); trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos); thead.appendChild(trNumeros);
}

function generarCuerpoCaptura(selectorTabla) {
    const tbody = document.querySelector(`${selectorTabla} tbody`);
    DIAS.forEach((dia) => {
        let tr = document.createElement('tr');
        if (dia === "LINEA TOTALES") tr.classList.add('fila-totales');
        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            if(c === 1) {
                td.innerHTML = `<input type="text" value="${dia}" readonly tabindex="-1">`;
            } else if (dia === "LINEA TOTALES" && (c === 2 || c === 4)) {
                td.innerHTML = `<input type="text" readonly tabindex="-1">`;
            } else {
                td.innerHTML = `<input type="text" value="">`;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function generarCuerpoTotales() {
    const tbody = document.querySelector(`#tablaCaptura_totales tbody`);
    const filasConcentrado = ["050351", "050353", "050354", "GRAN TOTAL"];
    filasConcentrado.forEach((fila) => {
        let tr = document.createElement('tr');
        if (fila === "GRAN TOTAL") tr.classList.add('fila-totales');
        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            if(c === 1) {
                let textoFila = (fila === "GRAN TOTAL") ? fila : `Totales MAC ${fila}`;
                td.innerHTML = `<input type="text" value="${textoFila}" readonly tabindex="-1">`;
            } else if (c === 2 || c === 4) {
                td.innerHTML = `<input type="text" readonly tabindex="-1">`;
            } else {
                td.innerHTML = `<input type="text" id="totales-${fila}-col-${c}" readonly tabindex="-1" value="0">`;
            }
            if(c >= 2 && c <= 4) td.style.display = "none";
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function detectarRemesa() {
    let remesaDetectada = "";
    for(let mod of MODULOS) {
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        const filas = tbody.querySelectorAll('tr');
        for(let i=0; i<7; i++) {
            let inp = filas[i].querySelectorAll('td')[38].querySelector('input');
            if(inp && inp.value.trim() !== "" && inp.value.trim() !== "0") {
                remesaDetectada = inp.value.trim();
                break;
            }
        }
        if(remesaDetectada) break;
    }
    const inputRemesa = document.getElementById('inputRemesa');
    if(inputRemesa) inputRemesa.value = remesaDetectada;
}

// NUEVA FUNCIÓN: Calcula la línea de totales por cada módulo 
function calcularTotalesDiarios(mod) {
    const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
    const filas = tbody.querySelectorAll('tr');
    const filaTotales = filas[7]; 

    for (let c = 1; c <= TOTAL_COLUMNAS; c++) {
        if (c === 1 || c === 2 || c === 4) continue;

        if (c === 5) {
            let primerInicial = "";
            for (let d = 0; d < 7; d++) {
                let val = filas[d].querySelectorAll('td')[c-1].querySelector('input').value;
                if (val.trim() !== "" && val.trim() !== "0") {
                    primerInicial = val;
                    break;
                }
            }
            filaTotales.querySelectorAll('td')[c-1].querySelector('input').value = primerInicial;
            continue;
        }

        if (c === 6) {
            let ultimoFinal = "";
            for (let d = 6; d >= 0; d--) {
                let val = filas[d].querySelectorAll('td')[c-1].querySelector('input').value;
                if (val.trim() !== "" && val.trim() !== "0") {
                    ultimoFinal = val;
                    break;
                }
            }
            filaTotales.querySelectorAll('td')[c-1].querySelector('input').value = ultimoFinal;
            continue;
        }

        let sumaColumna = 0;
        let tieneDatos = false;
        
        for (let d = 0; d < 7; d++) { 
            let inputCelda = filas[d].querySelectorAll('td')[c-1].querySelector('input');
            let valStr = inputCelda.value.replace(/,/g, '');
            if (valStr.trim() !== "") {
                let valor = parseFloat(valStr) || 0;
                sumaColumna += valor;
                tieneDatos = true;
            }
        }
        
        filaTotales.querySelectorAll('td')[c-1].querySelector('input').value = tieneDatos ? sumaColumna : "";
    }
}

function sincronizarTotales() {
    for(let c = 3; c <= TOTAL_COLUMNAS; c++) {
        if(c === 4) continue; 
        let granTotalColumna = 0;
        
        MODULOS.forEach(mod => {
            const filaTotalMod = document.querySelector(`#tablaCaptura_${mod} tbody`).querySelectorAll('tr')[7]; 
            const inputMod = filaTotalMod.querySelectorAll('td')[c-1].querySelector('input');
            let valorStr = inputMod.value.trim().replace(/,/g, '');
            let valorNum = isNaN(parseFloat(valorStr)) ? 0 : parseFloat(valorStr);
            
            let inputDestino = document.getElementById(`totales-${mod}-col-${c}`);
            if (inputDestino) inputDestino.value = valorNum === 0 && valorStr !== "0" ? valorStr || "0" : valorNum;
            if(!isNaN(valorNum)) granTotalColumna += valorNum;
        });
        
        let inputGranTotal = document.getElementById(`totales-GRAN TOTAL-col-${c}`);
        if(inputGranTotal) inputGranTotal.value = granTotalColumna;
    }
    detectarRemesa();
}

MODULOS.forEach(mod => {
    generarEncabezados(`#tablaCaptura_${mod}`, false);
    generarCuerpoCaptura(`#tablaCaptura_${mod}`);
    
    const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
    
    tbodyMod.addEventListener('input', () => {
        calcularTotalesDiarios(mod);
        sincronizarTotales();
    });
    
    document.getElementById(`pasteZone_${mod}`).addEventListener('paste', (e) => {
        e.preventDefault();
        const rows = (e.clipboardData || window.clipboardData).getData('Text').split('\n');
        const tableRows = tbodyMod.querySelectorAll('tr');
        let rowOffset = 0;
        
        rows.forEach((row, rowIndex) => {
            if (row.trim() === '') return;
            const columns = row.split('\t');
            if(rowIndex === 0 && (columns[0].toUpperCase().includes("DIA") || columns[0] == "1" || columns[0].toUpperCase().includes("DÍA"))) { rowOffset++; return; }
            const targetRow = tableRows[rowIndex - rowOffset];
            if (targetRow) {
                targetRow.querySelectorAll('input').forEach((input, colIndex) => {
                    if (columns[colIndex] !== undefined && !input.hasAttribute('readonly')) {
                        input.value = columns[colIndex].trim();
                    }
                });
            }
        });
        alert(`Datos pegados con éxito en la tabla del Módulo ${mod}.`);
        calcularTotalesDiarios(mod);
        sincronizarTotales(); 
    });
});

generarEncabezados('#tablaCaptura_totales', true);
generarCuerpoTotales();

// ==========================================
// 3. LIMPIAR TABLAS
// ==========================================
document.getElementById('btnBorrar').addEventListener('click', () => {
    if(confirm("¿Estás seguro de que deseas limpiar todas las tablas? (Se borrarán los datos en pantalla, no en la BD)")) {
        MODULOS.forEach(mod => {
            const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
            tbody.querySelectorAll('input:not([readonly])').forEach(inp => inp.value = "");
        });
        sincronizarTotales();
        document.getElementById('inputRemesa').value = "";
    }
});

// ==========================================
// 4. BOTÓN UNIFICADO: GUARDAR EN CAMPAÑAS Y EN BD TOTALES CON IDMAC
// ==========================================
document.getElementById('btnGuardarBD').addEventListener('click', () => {
    const remesaActual = document.getElementById('inputRemesa').value.trim();
    
    if(!remesaActual) {
        alert("Atención: No se ha detectado el número de Remesa en la columna 39. Por favor, asegúrate de que al menos un día capturado tenga el número de remesa.");
        return;
    }

    const tablasNombres = [...MODULOS, "totales"];
    let datosAGuardar = {};
    
    tablasNombres.forEach(mod => {
        const filas = document.querySelector(`#tablaCaptura_${mod} tbody`).querySelectorAll('tr');
        let datosTabla = [];
        filas.forEach(fila => {
            let filaArray = [];
            fila.querySelectorAll('td').forEach(td => {
                const input = td.querySelector('input');
                filaArray.push(input ? input.value : "");
            });
            datosTabla.push(filaArray);
        });
        datosAGuardar[mod] = datosTabla;
    });

    let registrosTotalesParaBD = [];
    const tbodyTotales = document.querySelector('#tablaCaptura_totales tbody');
    
    if (tbodyTotales) {
        const filasTotales = tbodyTotales.querySelectorAll('tr');
        for (let i = 0; i < 3; i++) {
            const filaModulo = filasTotales[i];
            if (!filaModulo) continue;

            let objFilaTotal = {};
            let textoModuloCelda = "";

            filaModulo.querySelectorAll('td').forEach((td, colIdx) => {
                const input = td.querySelector('input');
                let valorCelda = input ? input.value.trim() : "";
                
                if (colIdx === 0) {
                    textoModuloCelda = valorCelda;
                }

                let claveColumna = NOMBRES_ESTANDAR_BD[colIdx] || `Col_${colIdx + 1}`;
                objFilaTotal[claveColumna] = valorCelda;
            });

            let numeroModuloLimpio = textoModuloCelda.replace(/[^0-9]/g, '');
            if (!numeroModuloLimpio) {
                const modulosFijo = ["050351", "050353", "050354"];
                numeroModuloLimpio = modulosFijo[i];
            }

            objFilaTotal["MODULO"] = numeroModuloLimpio;
            objFilaTotal["REMESA"] = remesaActual;

            delete objFilaTotal.DIA;
            delete objFilaTotal.FECHA;

            const ultimos3Mod = String(numeroModuloLimpio).slice(-3);
            let remStr = String(remesaActual).trim();
            let r = remStr;
            
            if (/^\d{4}/.test(remStr)) {
                r = remStr.substring(4); 
            } else if (!remStr.includes('-')) {
                r = remStr.slice(-2);
            }
            
            objFilaTotal.IDMAC = `${ultimos3Mod}${r}`;
            registrosTotalesParaBD.push(objFilaTotal);
        }
    }

    const dbRefActual = ref(db, 'vaciado_actual');
    const dbRefHistorial = ref(db, `historial_campanas/${remesaActual}`);
    const dbRefTotales = ref(db, 'bdtotales');

    Promise.all([
        set(dbRefActual, datosAGuardar),
        set(dbRefHistorial, datosAGuardar),
        get(dbRefTotales).then((snapshot) => {
            let actualTotales = snapshot.val() || [];
            actualTotales = Array.isArray(actualTotales) ? actualTotales : Object.values(actualTotales);

            let totalesFiltrados = actualTotales.filter(item => String(item.REMESA) !== String(remesaActual));
            const fusionFinalTotales = [...totalesFiltrados, ...registrosTotalesParaBD];
            return set(dbRefTotales, fusionFinalTotales);
        })
    ]).then(() => {
        alert(`¡Éxito! Información guardada correctamente:\n- Respaldada en Campañas.\n- Consolidada en BD Totales (con IDMAC) para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos en la nube.");
    });
});
