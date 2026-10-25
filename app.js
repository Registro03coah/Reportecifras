// ==========================================
// 1. IMPORTACIONES FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac",
    storageBucket: "cifrasmac.firebasestorage.app",
    messagingSenderId: "916644687837",
    appId: "1:916644687837:web:03d346cc48a071af1ed034"
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

const NOMBRES_ESTANDAR_BD = [...ENCABEZADOS];

function generarEncabezados(selectorTabla, isTotales = false) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if (!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    trNumeros.className = "num-row";
    
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
    if (!tbody) return;
    tbody.innerHTML = "";
    DIAS.forEach((dia) => {
        let tr = document.createElement('tr');
        if (dia === "LINEA TOTALES") tr.classList.add('fila-totales');
        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            if(c === 1) {
                td.className = "col-dia";
                td.innerHTML = `<input type="text" value="${dia}" readonly tabindex="-1" class="form-control form-control-sm border-0 bg-transparent fw-bold">`;
            } else if (dia === "LINEA TOTALES" && (c === 2 || c === 4)) {
                td.innerHTML = `<input type="text" readonly tabindex="-1" class="form-control form-control-sm border-0 bg-transparent">`;
            } else {
                td.innerHTML = `<input type="text" value="" class="form-control form-control-sm border-0 text-center">`;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

function generarCuerpoTotales() {
    const tbody = document.querySelector(`#tablaCaptura_totales tbody`);
    if (!tbody) return;
    tbody.innerHTML = "";
    const filasConcentrado = ["050351", "050353", "050354", "GRAN TOTAL"];
    filasConcentrado.forEach((fila) => {
        let tr = document.createElement('tr');
        if (fila === "GRAN TOTAL") tr.classList.add('fila-totales');
        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            if(c === 1) {
                td.className = "col-dia";
                let textoFila = (fila === "GRAN TOTAL") ? fila : `Totales MAC ${fila}`;
                td.innerHTML = `<input type="text" value="${textoFila}" readonly tabindex="-1" class="form-control form-control-sm border-0 bg-transparent fw-bold">`;
            } else if (c === 2 || c === 4) {
                td.innerHTML = `<input type="text" readonly tabindex="-1" class="form-control form-control-sm border-0 bg-transparent">`;
            } else {
                td.innerHTML = `<input type="text" id="totales-${fila}-col-${c}" readonly tabindex="-1" value="0" class="form-control form-control-sm border-0 text-center fw-bold">`;
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
        if (!tbody) continue;
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
    if(inputRemesa) inputRemesa.innerText = remesaDetectada || "S/N";
    const hiddenRemesa = document.getElementById('hiddenRemesaVal');
    if(hiddenRemesa) hiddenRemesa.value = remesaDetectada;
}

function sincronizarTotales() {
    for(let c = 3; c <= TOTAL_COLUMNAS; c++) {
        if(c === 4) continue; 
        let granTotalColumna = 0;
        
        MODULOS.forEach(mod => {
            const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
            if (!tbodyMod) return;
            const filaTotalMod = tbodyMod.querySelectorAll('tr')[7]; 
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

// Inicialización de tablas y eventos por módulo
MODULOS.forEach(mod => {
    generarEncabezados(`#tablaCaptura_${mod}`, false);
    generarCuerpoCaptura(`#tablaCaptura_${mod}`);
    
    const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
    if (tbodyMod) {
        tbodyMod.addEventListener('input', () => {
            sincronizarTotales();
        });
    }
    
    const pasteZone = document.getElementById(`pasteZone_${mod}`);
    if (pasteZone) {
        pasteZone.addEventListener('paste', (e) => {
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
            sincronizarTotales(); 
        });
    }
});

generarEncabezados('#tablaCaptura_totales', true);
generarCuerpoTotales();

// Función global de cambio de pestañas
window.cambiarModulo = function(mod) {
    ["050351", "050353", "050354", "TOTALES"].forEach(m => {
        const btn = document.getElementById(`btn-tab-${m}`);
        const container = document.getElementById(`container_${m}`);
        const pasteZone = document.getElementById(`pasteZone_${m}`);
        
        if (btn) {
            if (m === mod) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
        if (container) {
            if (m === mod) {
                container.classList.remove('d-none');
            } else {
                container.classList.add('d-none');
            }
        }
        if (pasteZone) {
            if (m === mod && m !== 'TOTALES') {
                pasteZone.classList.remove('d-none');
            } else {
                pasteZone.classList.add('d-none');
            }
        }
    });

    const lblModuloActivo = document.getElementById('lblModuloActivo');
    const lblModuloPegado = document.getElementById('lblModuloPegado');
    const panelAccionesTotales = document.getElementById('panelAccionesTotales');
    
    if (lblModuloActivo) lblModuloActivo.innerText = mod;
    if (lblModuloPegado) lblModuloPegado.innerText = mod;
    
    if (panelAccionesTotales) {
        if (mod === 'TOTALES') {
            panelAccionesTotales.classList.remove('d-none');
            panelAccionesTotales.classList.add('d-flex');
        } else {
            panelAccionesTotales.classList.add('d-none');
            panelAccionesTotales.classList.remove('d-flex');
        }
    }
};

// ==========================================
// 3. LIMPIAR TABLAS
// ==========================================
document.getElementById('btnBorrar').addEventListener('click', () => {
    if(confirm("¿Estás seguro de que deseas limpiar todas las tablas? (Se borrarán los datos en pantalla, no en la BD)")) {
        MODULOS.forEach(mod => {
            const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
            if (tbody) tbody.querySelectorAll('input:not([readonly])').forEach(inp => inp.value = "");
        });
        sincronizarTotales();
        const inputRemesa = document.getElementById('inputRemesa');
        if (inputRemesa) inputRemesa.innerText = "S/N";
        const hiddenRemesa = document.getElementById('hiddenRemesaVal');
        if (hiddenRemesa) hiddenRemesa.value = "";
    }
});

// ==========================================
// 4. BOTÓN UNIFICADO: GUARDAR BASES (BD MADRE / CAMPAÑAS Y BD TOTALES)
// ==========================================
document.getElementById('btnGuardarBD').addEventListener('click', () => {
    const remesaActual = document.getElementById('hiddenRemesaVal').value.trim() || document.getElementById('inputRemesa').innerText.trim();
    
    if(!remesaActual || remesaActual === "S/N") {
        alert("Atención: No se ha detectado el número de Remesa en la columna 39. Por favor, asegúrate de que al menos un día capturado tenga el número de remesa.");
        return;
    }

    const tablasNombres = [...MODULOS, "totales"];
    let datosAGuardar = {};
    
    tablasNombres.forEach(mod => {
        const tablaEl = document.querySelector(`#tablaCaptura_${mod}`);
        if (!tablaEl) return;
        const filas = tablaEl.querySelectorAll('tbody tr');
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
        alert(`¡Éxito! Ambas bases se guardaron correctamente:\n- Información de los módulos guardada en Campañas y BD Madre.\n- Totales consolidados guardados en BD Totales (con IDMAC) para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos en la nube.");
    });
});
