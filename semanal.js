
/**
 * Lógica para mostrar todos los días de los 3 módulos secuencialmente y calcular totales
 */

// Simulación de datos (Reemplaza esto con tu llamada a Firebase/LocalStorage)
const datosSemana = [
    // Módulo 050351
    { ent: 5, dtto: 3, modulo: '050351', inicial: 260503510000, final: 260503510100, totalFolios: 100, noUtiliza: 0, inscrip: 20, correcDatos: 1, cambioDom: 15, reposi: 50, corrDir: 0, reinco: 2, reempl: 0, reimpr: 0, totalTramit: 88, rechaz34: 0, rechaz35: 0, cancel: 0, totalMovim: 0, cif05: 0, solExp: 0, solRect: 0, demanJui: 0, iniciales: 300, actual: 0, recibidOtros: 0, import: 0, export: 0, entreg: 80, anexFuar: 0 },
    { ent: 5, dtto: 3, modulo: '050351', inicial: 260503510101, final: 260503510250, totalFolios: 150, noUtiliza: 0, inscrip: 15, correcDatos: 0, cambioDom: 20, reposi: 45, corrDir: 0, reinco: 5, reempl: 0, reimpr: 0, totalTramit: 85, rechaz34: 0, rechaz35: 0, cancel: 0, totalMovim: 0, cif05: 0, solExp: 0, solRect: 0, demanJui: 0, iniciales: 250, actual: 0, recibidOtros: 0, import: 0, export: 0, entreg: 60, anexFuar: 0 },
    
    // Módulo 050353
    { ent: 5, dtto: 3, modulo: '050353', inicial: 260503530000, final: 260503530150, totalFolios: 150, noUtiliza: 0, inscrip: 30, correcDatos: 2, cambioDom: 20, reposi: 60, corrDir: 0, reinco: 8, reempl: 0, reimpr: 0, totalTramit: 120, rechaz34: 0, rechaz35: 0, cancel: 0, totalMovim: 0, cif05: 0, solExp: 0, solRect: 0, demanJui: 0, iniciales: 400, actual: 0, recibidOtros: 0, import: 0, export: 0, entreg: 110, anexFuar: 0 },
    
    // Módulo 050354 (Datos exactos de tu foto)
    { ent: 5, dtto: 3, modulo: '050354', inicial: '260503540285', final: '260503540560', totalFolios: 275, noUtiliza: 0, inscrip: 55, correcDatos: 2, cambioDom: 49, reposi: 160, corrDir: 0, reinco: 9, reempl: 0, reimpr: 0, totalTramit: 275, rechaz34: 0, rechaz35: 0, cancel: 0, totalMovim: 0, cif05: 0, solExp: 0, solRect: 0, demanJui: 0, iniciales: 1128, actual: 0, recibidOtros: 0, import: 0, export: 0, entreg: 204, anexFuar: 0 }
];

// 1. Definir el orden estricto de los módulos a renderizar
const modulosEnOrden = ["050351", "050353", "050354"];
const cuerpoTabla = document.getElementById('cuerpoTablaSemanal');

let tablaHTML = "";

// 2. Inicializar los contadores para el GRAN TOTAL
let totales = {
    totalFolios: 0, noUtiliza: 0, inscrip: 0, correcDatos: 0, cambioDom: 0, reposi: 0, corrDir: 0, reinco: 0, reempl: 0, reimpr: 0, totalTramit: 0, rechaz34: 0, rechaz35: 0, cancel: 0, totalMovim: 0, cif05: 0, solExp: 0, solRect: 0, demanJui: 0, iniciales: 0, actual: 0, recibidOtros: 0, import: 0, export: 0, entreg: 0, anexFuar: 0
};

// 3. Procesar en orden y concatenar filas (+=)
modulosEnOrden.forEach(modulo => {
    // Filtrar los registros que pertenecen a este módulo
    let datosDelModulo = datosSemana.filter(d => d.modulo === modulo);
    
    // Iterar cada día/registro del módulo y agregarlo a la tabla
    datosDelModulo.forEach(dia => {
        tablaHTML += `
            <tr>
                <td>${dia.ent}</td>
                <td>${dia.dtto}</td>
                <td>${dia.modulo}</td>
                <td class="col-orange">${dia.inicial}</td>
                <td class="col-orange">${dia.final}</td>
                <td class="col-orange">${dia.totalFolios}</td>
                <td>${dia.noUtiliza}</td>
                <td>${dia.inscrip}</td>
                <td>${dia.correcDatos}</td>
                <td>${dia.cambioDom}</td>
                <td>${dia.reposi}</td>
                <td>${dia.corrDir}</td>
                <td>${dia.reinco}</td>
                <td>${dia.reempl}</td>
                <td>${dia.reimpr}</td>
                <td>${dia.totalTramit}</td>
                <td>${dia.rechaz34}</td>
                <td>${dia.rechaz35}</td>
                <td>${dia.cancel}</td>
                <td>${dia.totalMovim}</td>
                <td>${dia.cif05}</td>
                <td>${dia.solExp}</td>
                <td>${dia.solRect}</td>
                <td>${dia.demanJui}</td>
                <td>${dia.iniciales}</td>
                <td>${dia.actual}</td>
                <td>${dia.recibidOtros}</td>
                <td>${dia.import}</td>
                <td>${dia.export}</td>
                <td>${dia.entreg}</td>
                <td>${dia.anexFuar}</td>
            </tr>
        `;

        // 4. Sumar los valores al Gran Total
        totales.totalFolios += parseInt(dia.totalFolios) || 0;
        totales.noUtiliza += parseInt(dia.noUtiliza) || 0;
        totales.inscrip += parseInt(dia.inscrip) || 0;
        totales.correcDatos += parseInt(dia.correcDatos) || 0;
        totales.cambioDom += parseInt(dia.cambioDom) || 0;
        totales.reposi += parseInt(dia.reposi) || 0;
        totales.corrDir += parseInt(dia.corrDir) || 0;
        totales.reinco += parseInt(dia.reinco) || 0;
        totales.reempl += parseInt(dia.reempl) || 0;
        totales.reimpr += parseInt(dia.reimpr) || 0;
        totales.totalTramit += parseInt(dia.totalTramit) || 0;
        totales.rechaz34 += parseInt(dia.rechaz34) || 0;
        totales.rechaz35 += parseInt(dia.rechaz35) || 0;
        totales.cancel += parseInt(dia.cancel) || 0;
        totales.totalMovim += parseInt(dia.totalMovim) || 0;
        totales.cif05 += parseInt(dia.cif05) || 0;
        totales.solExp += parseInt(dia.solExp) || 0;
        totales.solRect += parseInt(dia.solRect) || 0;
        totales.demanJui += parseInt(dia.demanJui) || 0;
        // iniciales no se suma según formato estándar, o si se suma se quita, ajusta según necesidad
        totales.actual += parseInt(dia.actual) || 0;
        totales.recibidOtros += parseInt(dia.recibidOtros) || 0;
        totales.import += parseInt(dia.import) || 0;
        totales.export += parseInt(dia.export) || 0;
        totales.entreg += parseInt(dia.entreg) || 0;
        totales.anexFuar += parseInt(dia.anexFuar) || 0;
    });
});

// 5. Construir e insertar la fila del GRAN TOTAL al final de todo
tablaHTML += `
    <tr class="gran-total">
        <td colspan="3">GRAN TOTAL</td>
        <td colspan="2"></td> <!-- Inicial y final en blanco para totales -->
        <td class="col-orange">${totales.totalFolios}</td>
        <td>${totales.noUtiliza}</td>
        <td>${totales.inscrip}</td>
        <td>${totales.correcDatos}</td>
        <td>${totales.cambioDom}</td>
        <td>${totales.reposi}</td>
        <td>${totales.corrDir}</td>
        <td>${totales.reinco}</td>
        <td>${totales.reempl}</td>
        <td>${totales.reimpr}</td>
        <td>${totales.totalTramit}</td>
        <td>${totales.rechaz34}</td>
        <td>${totales.rechaz35}</td>
        <td>${totales.cancel}</td>
        <td>${totales.totalMovim}</td>
        <td>${totales.cif05}</td>
        <td>${totales.solExp}</td>
        <td>${totales.solRect}</td>
        <td>${totales.demanJui}</td>
        <td></td> <!-- Celda de Iniciales vacía en el total según tu imagen -->
        <td>${totales.actual}</td>
        <td>${totales.recibidOtros}</td>
        <td>${totales.import}</td>
        <td>${totales.export}</td>
        <td>${totales.entreg}</td>
        <td>${totales.anexFuar}</td>
    </tr>
`;

// 6. Inyectar todo en el DOM
cuerpoTabla.innerHTML = tablaHTML;
