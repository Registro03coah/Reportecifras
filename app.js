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
        // Si estamos en la tabla de Totales, la primera columna se llama "MÓDULO"
        if(isTotales && i === 1) tituloStr = "MÓDULO";
        
        thT.innerText = tituloStr;
        
        // Asignación inteligente de anchos para que las columnas de números sean super angostas
        let anchoCelda = "45px"; 
        if(i === 1) anchoCelda = "110px"; // Día o Módulo (más ancho)
        else if(i === 2) anchoCelda = "70px"; // Fecha
        else if(i === 4) anchoCelda = "85px"; // Sedes visitadas
        else if(i === 5 || i === 6) anchoCelda = "105px"; // Inicial y Final (13 dígitos)
        else if(i === 61 || i === 62) anchoCelda = "80px"; // MAC que recibe/entrega
        
        thT.style.width = anchoCelda;
        thT.style.minWidth = anchoCelda;
        thT.style.maxWidth = anchoCelda;
        
        if(i >= 5 && i <= 7) thT.classList.add('bg-folios');
        if(i >= 19 && i <= 30) thT.classList.add('bg-retiradas');
        if(i === 16) thT.style.backgroundColor = "#92d050"; 
        if(i === 17) thT.style.backgroundColor = "red"; 
        if(i === 18) thT.style.backgroundColor = "yellow"; 
        if(i >= 58 && i <= 60) thT.style.backgroundColor = "#e8e8f4"; 
        if(i === 61 || i === 62) thT.style.backgroundColor = "#9b9649"; 
        if(i === 63 || i === 64) thT.style.backgroundColor = "yellow"; 
        
        thN.innerText = i;
        thN.className = "table-light";
        
        // Si estamos en Totales y es col 2, 3 o 4, las ocultamos visualmente
        if(isTotales && i >= 2 && i <= 4) {
            thT.style.display = "none";
            thN.style.display = "none";
        }
        
        trTitulos.appendChild(thT);
        trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos);
    thead.appendChild(trNumeros);
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
            } else if (dia === "LINEA TOTALES") {
                if (c === 2 || c === 4) {
                    td.innerHTML = `<input type="text" readonly tabindex="-1">`;
                } else {
                    td.innerHTML = `<input type="text" value="" class="input-linea-totales">`;
                }
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
                let idCelda = `totales-${fila}-col-${c}`;
                td.innerHTML = `<input type="text" id="${idCelda}" readonly tabindex="-1" value="0">`;
            }
            
            // Ocultamos las celdas 2 a 4 visualmente, pero se mantienen para no romper el conteo
            if(c >= 2 && c <= 4) {
                td.style.display = "none";
            }
            
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

// Sincronización
function sincronizarTotales() {
    for(let c = 3; c <= TOTAL_COLUMNAS; c++) {
        if(c === 4) continue; 
        
        let granTotalColumna = 0;
        
        MODULOS.forEach(mod => {
            const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
            const filaTotalMod = tbodyMod.querySelectorAll('tr')[7]; 
            const inputMod = filaTotalMod.querySelectorAll('td')[c-1].querySelector('input');
            
            let valorStr = inputMod.value.trim().replace(/,/g, '');
            let valorNum = isNaN(parseFloat(valorStr)) ? 0 : parseFloat(valorStr);
            
            let inputDestino = document.getElementById(`totales-${mod}-col-${c}`);
            if (inputDestino) {
                inputDestino.value = valorNum === 0 && valorStr !== "0" ? valorStr || "0" : valorNum;
            }
            
            if(!isNaN(valorNum)) {
                granTotalColumna += valorNum;
            }
        });
        
        let inputGranTotal = document.getElementById(`totales-GRAN TOTAL-col-${c}`);
        if(inputGranTotal) {
            inputGranTotal.value = granTotalColumna;
        }
    }
}

MODULOS.forEach(mod => {
    generarEncabezados(`#tablaCaptura_${mod}`, false);
    generarCuerpoCaptura(`#tablaCaptura_${mod}`);
    
    const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
    tbodyMod.addEventListener('input', sincronizarTotales);
    
    document.getElementById(`pasteZone_${mod}`).addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('Text');
        const rows = pastedData.split('\n');
        const tableRows = tbodyMod.querySelectorAll('tr');

        let rowOffset = 0;
        
        rows.forEach((row, rowIndex) => {
            if (row.trim() === '') return;
            const columns = row.split('\t');
            
            if(rowIndex === 0 && (columns[0].toUpperCase().includes("DÍA") || columns[0] == "1")) {
                rowOffset++; return; 
            }

            const targetRow = tableRows[rowIndex - rowOffset];
            if (targetRow) {
                const inputs = targetRow.querySelectorAll('input');
                inputs.forEach((input, colIndex) => {
                    if (columns[colIndex] !== undefined) {
                        let val = columns[colIndex].trim();
                        if(!input.hasAttribute('readonly')) {
                            input.value = val;
                        }
                    }
                });
            }
        });
        
        alert(`Datos pegados con éxito en la tabla del Módulo ${mod}.`);
        sincronizarTotales(); 
    });
});

// Inicializar Totales (Mandamos true para que aplique los ocultamientos y cambio de nombre)
generarEncabezados('#tablaCaptura_totales', true);
generarCuerpoTotales();
