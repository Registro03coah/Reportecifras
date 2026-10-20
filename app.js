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
// 2. CONFIGURACIÓN DE TABLAS
// ==========================================
const TOTAL_COLUMNAS = 75;
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "LINEA TOTALES"];
const MODULOS = ["050351", "050353", "050354"];

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

// Nombres estandarizados de columnas idénticos a bd_madre
const NOMBRES_ESTANDAR_BD = [
    "MODULO", "REMESA", "FECHA", "DIA", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
    "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR",
    "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "LIBRE2", "RETIRADAS_POR_OTRA_CAUSA", "DISPONIBLES",
    "credenciales_x_canje", "fichas_Entregadas", "fichas_atendidas", "Dias_trabajados",
    "SOLICITUD_EXPEDICION_O_RECTIFICACION", "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITU_DE_REIMPRESION",
    "DEMANDA_DE_JUICIO", "Total_de_movimientos", "DEVUELTAS_POR_TERCEROS", "34_Imagen_inconsistente",
    "35_Movimiento_posterior", "CONFIGURACION", "ENT", "DTTO", "RESGUARDO", "SOLICITUD_DE_NUM_DE_EMISION",
    "LIBRE1", "Sript_ejecutado_VIGENCIA", "FOLIO_NEC_POST", "cartografia_SOLICITUD", "lotes_de_credenciales",
    "registradas_por_dia", "faltantes", "observaciones", "sin_nombre1", "sin_nombre2", "sin_nombre3",
    "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA", "IMPORTADAS", "EXPORTADAS", "REPOSISION_+_REIMPRESIONES",
    "MAL_IMPRESAS", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION",
    "PERDIDA_DE_VIGENCIA", "MOY_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

function generarEncabezados(selectorTabla, isTotales = false) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        let tituloStr = ENCABEZADOS[i-1] || `Columna ${i}`;
        if(isTotales && i === 1) tituloStr = "MÓDULO";
        
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
    tbodyMod.addEventListener('input', sincronizarTotales);
    
    document.getElementById(`pasteZone_${mod}`).addEventListener('paste', (e) => {
        e.preventDefault();
        const rows = (e.clipboardData || window.clipboardData).getData('Text').split('\n');
        const tableRows = tbodyMod.querySelectorAll('tr');
        let rowOffset = 0;
        
        rows.forEach((row, rowIndex) => {
            if (row.trim() === '') return;
            const columns = row.split('\t');
            if(rowIndex === 0 && (columns[0].toUpperCase().includes("DÍA") || columns[0] == "1")) { rowOffset++; return; }
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
});

generarEncabezados('#tablaCaptura_totales', true);
generarCuerpoTotales();

// ==========================================
// 3. LIMPIAR Y GUARDAR EN BD_MADRE Y BDTOTALES
// ==========================================

document.getElementById('btnBorrar').addEventListener('click', () => {
    if(confirm("¿Estás seguro de que deseas limpiar todas las tablas?")) {
        MODULOS.forEach(mod => {
            const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
            tbody.querySelectorAll('input:not([readonly])').forEach(inp => inp.value = "");
        });
        sincronizarTotales();
        document.getElementById('inputRemesa').value = "";
    }
});

// BOTÓN GUARDAR LIMPIO (Sin afectar bd_madre)
document.getElementById('btnGuardarBD').addEventListener('click', () => {
    const remesaActual = document.getElementById('inputRemesa').value.trim();
    
    if(!remesaActual) {
        alert("Atención: No se ha detectado el número de Remesa en la columna 39.");
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

    const dbRefActual = ref(db, 'vaciado_actual');
    const dbRefHistorial = ref(db, `historial_campanas/${remesaActual}`);
    
    Promise.all([
        set(dbRefActual, datosAGuardar),
        set(dbRefHistorial, datosAGuardar)
    ]).then(() => {
        alert(`¡Éxito! Información guardada para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos.");
    });
});

    // 1. VALIDAR QUE LOS 3 MÓDULOS TENGAN DATOS EN SU LÍNEA DE TOTALES
    let datosModulosCompletos = {};
    let filasTotalesObjetos = [];

    for(let mod of MODULOS) {
        const filas = document.querySelectorAll(`#tablaCaptura_${mod} tbody tr`);
        const filaTotalHtml = filas[7]; // La fila 8 es la LINEA TOTALES
        
        let valoresFilaTotal = [];
        let estaVacia = true;

        filaTotalHtml.querySelectorAll('td').forEach((td, idx) => {
            const input = td.querySelector('input');
            let val = input ? input.value.trim() : "";
            if(idx > 0 && val !== "" && val !== "0") estaVacia = false;
            valoresFilaTotal.push(val);
        });

        if (estaVacia) {
            alert(`🚨 Faltan datos: La línea de totales del Módulo ${mod} está vacía. Debes llenar los 3 módulos antes de guardar.`);
            return;
        }
        datosModulosCompletos[mod] = filas;

        // Convertir la línea de totales a un objeto con las llaves estandarizadas
        let objTotal = {};
        valoresFilaTotal.forEach((val, idx) => {
            let key = NOMBRES_ESTANDAR_BD[idx] || `Col_${idx+1}`;
            objTotal[key] = val;
        });
        // Asegurar Módulo y Remesa
        objTotal["MODULO"] = mod;
        objTotal["REMESA"] = remesaActual;
        
        filasTotalesObjetos.push(objTotal);
    }

    // 2. RECOLECTAR TODOS LOS DÍAS DE LOS 3 MÓDULOS PARA BD_MADRE
    let todosLosDiasNuevos = [];
    MODULOS.forEach(mod => {
        const filas = document.querySelectorAll(`#tablaCaptura_${mod} tbody tr`);
        // Recorremos del 0 al 6 (los 7 días de la semana)
        for(let i = 0; i < 7; i++) {
            let valoresFilaDia = [];
            filas[i].querySelectorAll('td').forEach(td => {
                const input = td.querySelector('input');
                valoresFilaDia.push(input ? input.value.trim() : "");
            });

            let objDia = {};
            valoresFilaDia.forEach((val, idx) => {
                let key = NOMBRES_ESTANDAR_BD[idx] || `Col_${idx+1}`;
                objDia[key] = val;
            });
            objDia["MODULO"] = mod;
            objDia["REMESA"] = remesaActual;

            // Solo guardamos si el día tiene algún movimiento
            todosLosDiasNuevos.push(objDia);
        }
    });

    // 3. GENERAR REGISTROS PARA BDTOTALES CON EL IDMAC
    let registrosBdTotales = [];
    filasTotalesObjetos.forEach(totalesObj => {
        let nuevoTotal = { ...totalesObj };
        
        // No llevan día ni fecha en totales
        delete nuevoTotal.DIA;
        delete nuevoTotal.FECHA;

        // IDMAC = Últimos 3 dígitos del módulo + Últimos 2 dígitos de la remesa
        const modStr = String(nuevoTotal.MODULO).trim();
        const remStr = String(nuevoTotal.REMESA).trim();
        const ultimos3Mod = modStr.slice(-3);
        const ultimos2Rem = remStr.slice(-2);
        
        nuevoTotal.IDMAC = `${ultimos3Mod}${ultimos2Rem}`;

        registrosBdTotales.push(nuevoTotal);
    });

    try {
        // A. Actualizar BD_MADRE (fusionando y evitando duplicados exactos)
        const snapMadre = await get(ref(db, 'bd_madre'));
        let actualMadre = snapMadre.val() || [];
        actualMadre = Array.isArray(actualMadre) ? actualMadre : Object.values(actualMadre);
        
        // Filtramos fuera la remesa actual si ya existía para sobreescribirla limpia
        let madreFiltrada = actualMadre.filter(item => String(item.REMESA) !== String(remesaActual));
        const fusionMadre = [...madreFiltrada, ...todosLosDiasNuevos];
        await set(ref(db, 'bd_madre'), fusionMadre);

        // B. Actualizar BDTOTALES
        const snapTotales = await get(ref(db, 'bdtotales'));
        let actualTotales = snapTotales.val() || [];
        actualTotales = Array.isArray(actualTotales) ? actualTotales : Object.values(actualTotales);

        let totalesFiltrados = actualTotales.filter(item => String(item.REMESA) !== String(remesaActual));
        const fusionTotales = [...totalesFiltrados, ...registrosBdTotales];
        await set(ref(db, 'bdtotales'), fusionTotales);

        alert(`✅ ¡Vaciado exitoso!\n- Los días se guardaron en la BD Principal.\n- Los totales semanales se consolidaron en BD Totales con IDMAC.`);
        
    } catch (error) {
        console.error("Error al guardar en Firebase:", error);
        alert("❌ Hubo un error al guardar los datos en la nube.");
    }
});
