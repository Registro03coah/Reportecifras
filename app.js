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

function generarEncabezados(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        thT.innerText = ENCABEZADOS[i-1] || `Columna ${i}`;
        
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
        
        trTitulos.appendChild(thT);
        trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos);
    thead.appendChild(trNumeros);
}

function generarCuerpo(selectorTabla) {
    const tbody = document.querySelector(`${selectorTabla} tbody`);
    
    DIAS.forEach((dia) => {
        let tr = document.createElement('tr');
        
        if (dia === "LINEA TOTALES") {
            tr.classList.add('fila-totales');
        }

        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            
            if(c === 1) {
                td.innerHTML = `<input type="text" value="${dia}" readonly tabindex="-1">`;
            } else if (dia === "LINEA TOTALES") {
                if (c === 2 || c === 4) {
                    td.innerHTML = `<input type="text" readonly tabindex="-1">`;
                } else {
                    td.innerHTML = `<input type="text" value="">`;
                }
            } else {
                td.innerHTML = `<input type="text" value="">`;
            }
            
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

// Inicializar tablas para los 3 módulos
MODULOS.forEach(mod => {
    generarEncabezados(`#tablaCaptura_${mod}`);
    generarCuerpo(`#tablaCaptura_${mod}`);
    
    // Configurar el evento de pegado para cada zona
    document.getElementById(`pasteZone_${mod}`).addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('Text');
        const rows = pastedData.split('\n');
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        const tableRows = tbody.querySelectorAll('tr');

        let rowOffset = 0;
        
        rows.forEach((row, rowIndex) => {
            if (row.trim() === '') return;
            const columns = row.split('\t');
            
            // Detectar si copiaron títulos
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
    });
});
