// ==========================================

// 1. IMPORTACIONES FIREBASE

// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



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



// EXTRAER REMESA (Columna 39 = Index 38)

function detectarRemesa() {

    let remesaDetectada = "";

    for(let mod of MODULOS) {

        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);

        const filas = tbody.querySelectorAll('tr');

        for(let i=0; i<7; i++) { // Buscamos en los días normales

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



// SINCRONIZAR Y ACTUALIZAR REMESA

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

// 3. LIMPIAR Y GUARDAR HISTORIAL FIREBASE

// ==========================================



// BOTÓN BORRAR

document.getElementById('btnBorrar').addEventListener('click', () => {

    if(confirm("¿Estás seguro de que deseas limpiar todas las tablas? (Se borrarán los datos en pantalla, no en la BD)")) {

        MODULOS.forEach(mod => {

            const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);

            tbody.querySelectorAll('input:not([readonly])').forEach(inp => inp.value = "");

        });

        sincronizarTotales(); // Reset a 0

        document.getElementById('inputRemesa').value = "";

    }

});



// BOTÓN GUARDAR

document.getElementById('btnGuardarBD').addEventListener('click', () => {

    const remesaActual = document.getElementById('inputRemesa').value.trim();

    

    if(!remesaActual) {

        alert("Atención: No se ha detectado el número de Remesa en la columna 39. Por favor, asegúrate de que al menos un día capturado tenga el número de remesa para poder guardar el historial de la campaña de forma correcta.");

        return; // Evita el guardado si no hay remesa, para no dañar el historial

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



    // Guardar en vaciado_actual (el de la semana vigente) y en historial_campanas/[Remesa]

    const dbRefActual = ref(db, 'vaciado_actual');

    const dbRefHistorial = ref(db, `historial_campanas/${remesaActual}`);

    

    Promise.all([

        set(dbRefActual, datosAGuardar),

        set(dbRefHistorial, datosAGuardar)

    ]).then(() => {

        alert(`¡Éxito! La información ha sido guardada y respaldada en la Campaña para la Remesa: ${remesaActual}.\nYa puedes limpiar la tabla para capturar la siguiente remesa.`);

    }).catch((error) => {

        console.error("Error al guardar en Firebase:", error);

        alert("Hubo un error al guardar los datos.");

    });

}); 
// ==========================================
// 4. ENVÍO AUTOMÁTICO DE FILAS DE MÓDULOS A "BDTOTALES"
// ==========================================
document.getElementById('btnGuardarBD').addEventListener('click', () => {
    const remesaActual = document.getElementById('inputRemesa').value.trim();
    if (!remesaActual) return; // Si no hay remesa, el flujo principal lo detiene

    let registrosTotalesParaBD = [];
    const tbodyTotales = document.querySelector('#tablaCaptura_totales tbody');
    if (!tbodyTotales) return;

    const filas = tbodyTotales.querySelectorAll('tr');

    // Recorremos solo las primeras 3 filas (050351, 050353, 050354), ignorando el GRAN TOTAL (fila 3)
    for (let i = 0; i < 3; i++) {
        const filaModulo = filas[i];
        if (!filaModulo) continue;

        let objFilaTotal = {};
        let textoModuloCelda = "";

        filaModulo.querySelectorAll('td').forEach((td, colIdx) => {
            const input = td.querySelector('input');
            let valorCelda = input ? input.value.trim() : "";
            
            // Si es la columna 1 (índice 0), trae texto como "Totales MAC 050351"
            if (colIdx === 0) {
                textoModuloCelda = valorCelda;
            }

            let claveColumna = NOMBRES_ESTANDAR_BD[colIdx] || `Col_${colIdx + 1}`;
            objFilaTotal[claveColumna] = valorCelda;
        });

        // Extraemos limpiamente el número de módulo (ej. "050351" de "Totales MAC 050351")
        let numeroModuloLimйы = textoModuloCelda.replace(/[^0-9]/g, ''); // Extrae solo los dígitos
        if (!numeroModuloLimйы) {
            // Respaldo por si acaso siempre usa el orden fijo
            const modulosFijo = ["050351", "050353", "050354"];
            numeroModuloLimйы = modulosFijo[i];
        }

        // Asignamos valores limpios al objeto
        objFilaTotal["MODULO"] = numeroModuloLimйы;
        objFilaTotal["REMESA"] = remesaActual;

        // Eliminamos DIA y FECHA por tratarse de un concentrado semanal
        delete objFilaTotal.DIA;
        delete objFilaTotal.FECHA;

        // CALCULAMOS EL IDMAC: Últimos 3 dígitos del módulo + Últimos 2 dígitos de la remesa
        const ultimos3Mod = String(numeroModuloLimйы).slice(-3); // Ej. "351"
        const ultimos2Rem = String(remesaActual).slice(-2); // Ej. "41"
        objFilaTotal.IDMAC = `${ultimos3Mod}${ultimos2Rem}`; // Ej. "35141"

        registrosTotalesParaBD.push(objFilaTotal);
    }

    // Guardamos en el nodo bdtotales de Firebase de forma independiente
    const dbRefTotales = ref(db, 'bdtotales');
    
    get(dbRefTotales).then((snapshot) => {
        let actualTotales = snapshot.val() || [];
        actualTotales = Array.isArray(actualTotales) ? actualTotales : Object.values(actualTotales);

        // Filtramos para evitar duplicados si se vuelve a guardar la misma remesa
        let totalesFiltrados = actualTotales.filter(item => String(item.REMESA) !== String(remesaActual));
        const fusionFinalTotales = [...totalesFiltrados, ...registrosTotalesParaBD];

        set(dbRefTotales, fusionFinalTotales).then(() => {
            console.log("✅ BD Totales actualizada exitosamente con los 3 módulos y su IDMAC.");
        }).catch(err => {
            console.error("Error al actualizar bdtotales:", err);
        });
    });
});
