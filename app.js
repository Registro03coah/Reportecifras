// Hemos limpiado el código de Firebase por el momento para concentrarnos 
// exclusivamente en el comportamiento de la tabla, los colores, y el copiado/pegado.

const TOTAL_COLUMNAS = 75;
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo", "LINEA TOTALES"];

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
    // --- Nuevos encabezados desde el 58 hasta el 75 ---
    "sin nombre1", "sin nombre2", "sin nombre3", "MAC QUE RECIBE", "MAC QUE ENTREGA", 
    "IMPORTADAS", "EXPORTADAS", "REPOSISION + REIMPRESIONES", "MAL IMPRESA", "ERROR EN CARTOGRAFIA", 
    "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR EN NUM. DE EMISION", "PERDIDA DE VIGENCIA", 
    "MOV.POST.", "ANEXAS A SOLICITUD", "OTRAS BAJAS"
];

function generarEncabezados() {
    const thead = document.querySelector('#tablaCaptura thead');
    let trTitulos = document.createElement('tr');
    let trNumeros = document.createElement('tr');
    
    for(let i = 1; i <= TOTAL_COLUMNAS; i++) {
        let thT = document.createElement('th');
        let thN = document.createElement('th');
        
        thT.innerText = ENCABEZADOS[i-1] || `Columna ${i}`;
        
        // Estilos de color de acuerdo a tu Excel original
        if(i >= 5 && i <= 7) thT.classList.add('bg-folios');
        if(i >= 19 && i <= 30) thT.classList.add('bg-retiradas');
        if(i === 16) thT.style.backgroundColor = "#92d050"; 
        if(i === 17) thT.style.backgroundColor = "red"; 
        if(i === 18) thT.style.backgroundColor = "yellow"; 
        
        // Estilos de color para los nuevos encabezados (58 a 75)
        if(i >= 58 && i <= 60) thT.style.backgroundColor = "#e8e8f4"; // Ligeramente morado/gris (sin nombres)
        if(i === 61 || i === 62) thT.style.backgroundColor = "#9b9649"; // Dorado/mostaza (MAC QUE RECIBE/ENTREGA)
        if(i === 63 || i === 64) thT.style.backgroundColor = "yellow"; // Amarillo (IMPORTADAS/EXPORTADAS)
        
        thN.innerText = i;
        thN.className = "table-light";
        
        trTitulos.appendChild(thT);
        trNumeros.appendChild(thN);
    }
    thead.appendChild(trTitulos);
    thead.appendChild(trNumeros);
}

function generarCuerpo() {
    const tbody = document.querySelector('#tablaCaptura tbody');
    
    DIAS.forEach((dia) => {
        let tr = document.createElement('tr');
        
        // Si es la fila de totales, le ponemos la clase especial
        if (dia === "LINEA TOTALES") {
            tr.classList.add('fila-totales');
        }

        for(let c = 1; c <= TOTAL_COLUMNAS; c++) {
            let td = document.createElement('td');
            
            if(c === 1) {
                // Nombre del día (Lunes, Martes... LINEA TOTALES)
                td.innerHTML = `<input type="text" value="${dia}" readonly tabindex="-1">`;
            } else if (dia === "LINEA TOTALES") {
                // --- REGLAS ESPECIALES PARA LA LÍNEA DE TOTALES ---
                if (c === 2) {
                    // Columna 2 (Fecha) en totales va vacía y bloqueada
                    td.innerHTML = `<input type="text" readonly tabindex="-1">`;
                } else if (c === 4) {
                    // Columna 4 (Sedes visitadas) en totales va vacía y bloqueada
                    td.innerHTML = `<input type="text" readonly tabindex="-1">`;
                } else {
                    // Las demás reciben su dato copiado del excel en negrita
                    td.innerHTML = `<input type="text" value="">`;
                }
            } else {
                // Filas normales (Lunes a Domingo)
                td.innerHTML = `<input type="text" value="">`;
            }
            
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
}

// Ejecutamos las funciones visuales
generarEncabezados();
generarCuerpo();

// LÓGICA DE PEGADO DESDE EXCEL
document.getElementById('pasteZone').addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('Text');
    const rows = pastedData.split('\n');
    const tbody = document.querySelector('#tablaCaptura tbody');
    const tableRows = tbody.querySelectorAll('tr');

    let rowOffset = 0;
    
    rows.forEach((row, rowIndex) => {
        if (row.trim() === '') return;
        const columns = row.split('\t');
        
        // Detectar y saltar si copiaste también los títulos desde Excel
        if(rowIndex === 0 && (columns[0].toUpperCase().includes("DÍA") || columns[0] == "1")) {
            rowOffset++; return; 
        }

        const targetRow = tableRows[rowIndex - rowOffset];
        if (targetRow) {
            const inputs = targetRow.querySelectorAll('input');
            inputs.forEach((input, colIndex) => {
                if (columns[colIndex] !== undefined) {
                    let val = columns[colIndex].trim();
                    
                    // Solo insertamos el valor si la celda no está marcada como "readonly"
                    // (Esto protege el nombre del día, la fecha de los totales y la sede en los totales)
                    if(!input.hasAttribute('readonly')) {
                        input.value = val;
                    }
                }
            });
        }
    });
    
    alert("Datos de Excel pegados con éxito en las 8 filas (Lunes a Domingo + Totales).");
});