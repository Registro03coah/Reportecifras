// =========================================================
// CONFIGURACIÓN DE FIREBASE (cifrasmac)
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac",
    storageBucket: "cifrasmac.firebasestorage.app",
    messagingSenderId: "916644687837",
    appId: "1:916644687837:web:03d346cc48a071af1ed034"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}

const database = firebase.database();

let moduloSeleccionado = '050351';
let datosMesaTrabajo = {
    '050351': [],
    '050353': [],
    '050354': []
};

// HELPER: CÁLCULO DE IDMAC PARA BDTOTALES
function generarIdMac(remesa, modulo) {
    let modStr = String(modulo || '').replace(/\D/g, '');
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';

    let remStr = String(remesa || '').trim();
    let remMatch = remStr.match(/(\d+)\s*(-?\s*bis\d*)?/i);
    let numPart = '0000';
    let suffix = '';

    if (remMatch) {
        let n = remMatch[1];
        numPart = n.length >= 4 ? n.slice(-4) : n.padStart(4, '0');
        if (remMatch[2]) {
            suffix = remMatch[2].replace(/\s+/g, '');
            if (!suffix.startsWith('-')) suffix = '-' + suffix;
        }
    }

    return `${modDigits}${numPart}${suffix}`;
}

// ESTRUCTURA DE 84 COLUMNAS (FECHA, HORAS_TRABAJADAS y SEDES REORDENADAS AL FINAL)
let ESTRUCTURA_COLUMNAS = [
    { pos: 1, key: 'DIA', label: 'DIA' },
    { pos: 5, key: 'INICIAL', label: 'INICIAL' },
    { pos: 6, key: 'FINAL', label: 'FINAL' },
    { pos: 7, key: 'TOTAL_DE_FOLIOS', label: 'TOTAL_DE_FOLIOS' },
    { pos: 8, key: 'INSCRIPCIONES', label: 'INSCRIPCIONES' },
    { pos: 9, key: 'CORRECCION_DE_DATOS_PERSONALES', label: 'CORRECCION_DE_DATOS_PERSONALES' },
    { pos: 10, key: 'CAMBIO_DE_DOMICILIO', label: 'CAMBIO_DE_DOMICILIO' },
    { pos: 11, key: 'REPOSISION', label: 'REPOSICION' },
    { pos: 12, key: 'CORR__DE_DATOS_DIRECCION', label: 'CORR_DE_DATOS_DIRECCION' },
    { pos: 13, key: 'REINCORPORACION', label: 'REINCORPORACION' },
    { pos: 14, key: 'REEMPLAZO', label: 'REEMPLAZO' },
    { pos: 15, key: 'REIMPRESION', label: 'REIMPRESION' },
    { pos: 16, key: 'TOTAL_DE_TRAMITES', label: 'TOTAL_DE_TRAMITES' },
    { pos: 17, key: 'CANCELADOS', label: 'CANCELADOS' },
    { pos: 18, key: 'TOTAL_DE_RECHAZOS', label: 'TOTAL_DE_RECHAZOS' },
    { pos: 19, key: 'CPV_DEVUELTA_ENTREGA', label: 'CPV_DEVUELTA_ENTREGA' },
    { pos: 20, key: 'DISPONIBLES_AL_DIA_ANTERIOR', label: 'DISPONIBLES_AL_DIA_ANTERIOR' },
    { pos: 21, key: 'RECIBIDAS', label: 'RECIBIDAS' },
    { pos: 22, key: 'RECIBIDAS_DE_OTROS_TIPOS', label: 'RECIBIDAS_DE_OTROS_TIPOS' },
    { pos: 23, key: 'ENTREGADAS', label: 'ENTREGADAS' },
    { pos: 24, key: 'RECIBO_Y_O_EXTRAVIO', label: 'RECIBO_Y_O_EXTRAVIO' },
    { pos: 25, key: 'ANEXAS_A_FUAR', label: 'ANEXAS_A_FUAR' },
    { pos: 26, key: 'DATOS_ERRONEOS', label: 'DATOS_ERRONEOS' },
    { pos: 27, key: 'FOTO_MAL_IMPRESA', label: 'FOTO_MAL_IMPRESA' },
    { pos: 28, key: 'REIMPRESION_2', label: 'REIMPRESION_2' },
    { pos: 29, key: 'RETIRADAS_AS_POR_CAUSA', label: 'RETIRADAS_POR_CAUSA' },
    { pos: 30, key: 'DISPONIBLES', label: 'DISPONIBLES' },
    { pos: 31, key: 'CREDENCIALES_X_CANJE', label: 'CREDENCIALES_X_CANJE' },
    { pos: 32, key: 'FICHAS_ENTREGADAS', label: 'FICHAS_ENTREGADAS' },
    { pos: 33, key: 'FICHAS_ATENDIDAS', label: 'FICHAS_ATENDIDAS' },
    { pos: 34, key: 'DIAS_TRABAJADOS', label: 'DIAS_TRABAJADOS' },
    { pos: 35, key: 'SOLICITUD_EXPEDICION_PATRIADOS', label: 'SOLICITUD_EXPEDICION_REPATRIADOS' },
    { pos: 36, key: 'SOLICITUD_EXPEDICION_ORDINARIA', label: 'SOLICITUD_EXPEDICION_ORDINARIA' },
    { pos: 37, key: 'SOLICITUD_DE_RECTIFICACION', label: 'SOLICITUD_RECTIFICACION' },
    { pos: 38, key: 'DEMANDA_DE_JUICIO', label: 'DEMANDA_DE_JUICIO' },
    { pos: 39, key: 'REMESA', label: 'REMESA' },
    { pos: 40, key: 'TOTAL_DE_MOVIMIENTOS', label: 'TOTAL_DE_MOVIMIENTOS' },
    { pos: 41, key: 'DEVUELTAS_POR_TERCEROS', label: 'DEVUELTAS_POR_TERCEROS' },
    { pos: 42, key: '34_IMAGEN_INCONSISTENTE', label: '34_IMAGEN_INCONSISTENTE' },
    { pos: 43, key: '35_MOVIMIENTO_POSTERIOR', label: '35_MOVIMIENTO_POSTERIOR' },
    { pos: 44, key: 'CONFIGURACION', label: 'CONFIGURACION' },
    { pos: 45, key: 'ENT', label: 'ENT' },
    { pos: 46, key: 'DTTO', label: 'DTTO' },
    { pos: 47, key: 'MODULO', label: 'MODULO' },
    { pos: 48, key: 'RESGUARDO', label: 'RESGUARDO' },
    { pos: 49, key: 'SOLICITU_DE_REIMPRESION', label: 'SOLICITUD_DE_REIMPRESION' },
    { pos: 50, key: 'CPV_DEVUELTA_ENTREGA_2', label: 'CPV_DEVUELTA_ENTREGA_2' },
    { pos: 51, key: 'SCRIPT_EJECUTADO', label: 'SCRIPT_EJECUTADO' },
    { pos: 52, key: 'FOLIO_NEC', label: 'FOLIO_NEC' },
    { pos: 53, key: 'CARTOGRAFIA', label: 'CARTOGRAFIA' },
    { pos: 54, key: 'LOTES_DE_CREDENCIALES', label: 'LOTES_CREDENCIALES' },
    { pos: 55, key: 'REGISTRADAS_POR_DIA', label: 'REGISTRADAS_POR_DIA' },
    { pos: 56, key: 'FALTANTES', label: 'FALTANTES' },
    { pos: 57, key: 'OBSERVACIONES', label: 'OBSERVACIONES' },
    { pos: 58, key: 'SIN_NOMBRE1', label: 'SIN_NOMBRE1' },
    { pos: 59, key: 'SIN_NOMBRE2', label: 'SIN_NOMBRE2' },
    { pos: 60, key: 'SIN_NOMBRE3', label: 'SIN_NOMBRE3' },
    { pos: 61, key: 'MAC_QUE_RECIBE', label: 'MAC_QUE_RECIBE' },
    { pos: 62, key: 'MAC_QUE_ENTREGA', label: 'MAC_QUE_ENTREGA' },
    { pos: 63, key: 'IMPORTADAS', label: 'IMPORTADAS' },
    { pos: 64, key: 'EXPORTADAS', label: 'EXPORTADAS' },
    { pos: 65, key: 'REPOSICION_REIMPRESION', label: 'REPOSICION_REIMPRESION' },
    { pos: 66, key: 'MAL_IMPRESA', label: 'MAL_IMPRESA' },
    { pos: 67, key: 'ERROR_EN_CARTOGRAFIA', label: 'ERROR_CARTOGRAFIA' },
    { pos: 68, key: 'DEFUNCION', label: 'DEFUNCION' },
    { pos: 69, key: 'SUSPENSION', label: 'SUSPENSION' },
    { pos: 70, key: 'DUPLICADO', label: 'DUPLICADO' },
    { pos: 71, key: 'ERROR_NUM_DE_EMISION', label: 'ERROR_NUM_EMISION' },
    { pos: 72, key: 'PERDIDA_DE_VIGENCIA', label: 'PERDIDA_VIGENCIA' },
    { pos: 73, key: 'MOV_POST', label: 'MOV_POST' },
    { pos: 74, key: 'ANEXAS_A_SOLICITUD', label: 'ANEXAS_A_SOLICITUD' },
    { pos: 75, key: 'OTRAS_BAJAS', label: 'OTRAS_BAJAS' },
    { pos: 76, key: 'CIF_05', label: 'CIF_05' },
    { pos: 77, key: 'SOLICITUD_EXPEDICION', label: 'SOLICITUD_EXPEDICION' },
    { pos: 78, key: 'INICIALES_A', label: 'INICIALES_A' },
    { pos: 79, key: 'INICIALES_S', label: 'INICIALES_S' },
    { pos: 80, key: 'INICIALES_C', label: 'INICIALES_C' },
    { pos: 81, key: 'ACTUALIZACION', label: 'ACTUALIZACION' },
    { pos: 82, key: 'SOBRANTES', label: 'SOBRANTES' },
    { pos: 83, key: 'DISPONIBLES_DE_SOL_DE_EXP', label: 'DISPONIBLES_DE_SOL_DE_EXP' },
    { pos: 84, key: 'REIMPRE_FUERA_DEL_SISTEMA', label: 'REIMPRE_FUERA_DEL_SISTEMA' },
    { pos: 2, key: 'FECHA', label: 'FECHA' },
    { pos: 3, key: 'HORAS_TRABAJADAS', label: 'HORAS_TRABAJADAS' },
    { pos: 4, key: 'SEDES', label: 'SEDES' }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'LINEA TOTALES'];

document.addEventListener('DOMContentLoaded', () => {
    dibujarEncabezadosYNumeros();
    cargarDatosInicialesFirebase();

    const areaPegado = document.getElementById('areaPegado');
    if (areaPegado) {
        areaPegado.addEventListener('paste', manejarPegadoClipboard);
    }
});

// CONTROL DE CAMBIO DE NAVEGACIÓN Y VISTAS
window.cambiarModulo = function(modulo) {
    moduloSeleccionado = modulo;
    
    document.querySelectorAll('#tabsModulos .nav-link').forEach(btn => btn.classList.remove('active'));
    const btnActivo = document.getElementById(`btn-tab-${modulo}`);
    if (btnActivo) btnActivo.classList.add('active');

    const panelTotales = document.getElementById('panelAccionesTotales');
    const areaPegado = document.getElementById('areaPegado');
    const btnGuardarMadre = document.getElementById('btnGuardarMadre');

    // DIBUJA DE NUEVO LOS ENCABEZADOS SEGÚN LA VISTA SELECCIONADA
    dibujarEncabezadosYNumeros();

    if (modulo === 'TOTALES') {
        if (panelTotales) panelTotales.classList.remove('d-none');
        if (panelTotales) panelTotales.classList.add('d-flex');
        if (areaPegado) areaPegado.classList.add('d-none');
        if (btnGuardarMadre) btnGuardarMadre.classList.add('d-none');
        
        document.getElementById('lblMensajeAyuda').innerHTML = '<b>Vista Totales Generales:</b> Consolidado de los 3 módulos listos para sincronizar.';
        renderizarVistaTotalesGenerales();
    } else {
        if (panelTotales) panelTotales.classList.remove('d-flex');
        if (panelTotales) panelTotales.classList.add('d-none');
        if (areaPegado) areaPegado.classList.remove('d-none');
        if (btnGuardarMadre) btnGuardarMadre.classList.remove('d-none');

        document.getElementById('lblModuloActivo').textContent = modulo;
        document.getElementById('lblModuloPegado').textContent = modulo;
        document.getElementById('lblMensajeAyuda').innerHTML = `Módulo <b>${modulo}</b>: Pega los datos con Ctrl+V. Haz doble clic en un encabezado para cambiar su nombre.`;
        
        renderizarFilasEnPantalla(datosMesaTrabajo[moduloSeleccionado] || []);
    }
};

// DIBUJA ENCABEZADOS Y CAMBIA DINÁMICAMENTE 'DIA' POR 'MODULO' EN LA VISTA TOTALES
function dibujarEncabezadosYNumeros() {
    const thead = document.getElementById('cabeceraVaciado');
    if (!thead) return;

    let htmlHead = '<tr>';
    ESTRUCTURA_COLUMNAS.forEach((col, idx) => {
        let textoMostrar = col.label;
        
        // Si estamos en la vista TOTALES y es la primera columna (pos: 1), cambia 'DIA' por 'MODULO'
        if (moduloSeleccionado === 'TOTALES' && idx === 0) {
            textoMostrar = 'MODULO';
        }

        htmlHead += `<th ondblclick="editarNombreEncabezado(${idx})" title="Doble clic para editar nombre de columna">${textoMostrar}</th>`;
    });
    htmlHead += '</tr>';

    htmlHead += '<tr class="num-row">';
    ESTRUCTURA_COLUMNAS.forEach(col => {
        htmlHead += `<th>${col.pos}</th>`;
    });
    htmlHead += '</tr>';

    thead.innerHTML = htmlHead;
}

window.editarNombreEncabezado = function(indexColumna) {
    let actual = ESTRUCTURA_COLUMNAS[indexColumna];
    let nuevoNombre = prompt(`Editar nombre de columna #${actual.pos}:`, actual.label);
    
    if (nuevoNombre && nuevoNombre.trim() !== '') {
        nuevoNombre = nuevoNombre.trim().toUpperCase().replace(/\s+/g, '_');
        ESTRUCTURA_COLUMNAS[indexColumna].label = nuevoNombre;
        ESTRUCTURA_COLUMNAS[indexColumna].key = nuevoNombre;
        dibujarEncabezadosYNumeros();
        
        if (moduloSeleccionado === 'TOTALES') {
            renderizarVistaTotalesGenerales();
        } else {
            renderizarFilasEnPantalla(datosMesaTrabajo[moduloSeleccionado] || []);
        }
    }
};

function renderizarFilasEnPantalla(filasDatos) {
    const tbody = document.getElementById('cuerpoVaciado');
    if (!tbody) return;

    tbody.innerHTML = '';

    DIAS_SEMANA.forEach((diaNombre, indexFila) => {
        let esTotales = indexFila === 7;
        let itemFila = filasDatos.find(f => String(f.DIA || '').toLowerCase() === diaNombre.toLowerCase()) || {};

        let tr = document.createElement('tr');
        if (esTotales) tr.className = 'fila-totales';

        let htmlRow = '';
        ESTRUCTURA_COLUMNAS.forEach((col, idxCol) => {
            if (idxCol === 0) {
                htmlRow += `<td class="col-dia">${diaNombre}</td>`;
            } else {
                let valor = itemFila[col.key] !== undefined && itemFila[col.key] !== null ? itemFila[col.key] : '';
                htmlRow += `<td>${valor}</td>`;
            }
        });

        tr.innerHTML = htmlRow;
        tbody.appendChild(tr);
    });
}

function renderizarVistaTotalesGenerales() {
    const tbody = document.getElementById('cuerpoVaciado');
    const lblRemesa = document.getElementById('lblRemesaNumero');
    if (!tbody) return;

    tbody.innerHTML = '';

    const modulosList = ['050351', '050353', '050354'];
    let remesaDetectada = '';

    modulosList.forEach(modKey => {
        let filas = datosMesaTrabajo[modKey] || [];
        let filaTotales = filas.find(f => String(f.DIA || '').toLowerCase() === 'linea totales') || {};

        if (!remesaDetectada && filaTotales['REMESA']) {
            remesaDetectada = filaTotales['REMESA'];
        }

        let tr = document.createElement('tr');
        tr.className = 'fila-totales';

        let htmlRow = '';
        ESTRUCTURA_COLUMNAS.forEach((col, idxCol) => {
            if (idxCol === 0) {
                htmlRow += `<td class="col-dia">${modKey}</td>`;
            } else {
                let valor = filaTotales[col.key] !== undefined && filaTotales[col.key] !== null ? filaTotales[col.key] : '';
                htmlRow += `<td>${valor}</td>`;
            }
        });

        tr.innerHTML = htmlRow;
        tbody.appendChild(tr);
    });

    if (lblRemesa) {
        lblRemesa.textContent = remesaDetectada || 'S/N';
    }
}

function manejarPegadoClipboard(e) {
    if (moduloSeleccionado === 'TOTALES') return;

    e.preventDefault();
    let textoPegado = (e.clipboardData || window.clipboardData).getData('text');
    if (!textoPegado || textoPegado.trim() === '') return;

    let lineas = textoPegado.trim().split(/\r?\n/);
    let nuevasFilas = [];

    lineas.forEach((linea, idxLinea) => {
        if (idxLinea >= 8) return;

        let valores = linea.split('\t');
        let objetoFila = {};

        ESTRUCTURA_COLUMNAS.forEach((colDef) => {
            let indexClipboard = colDef.pos - 1;
            let valorCelda = valores[indexClipboard] !== undefined ? valores[indexClipboard].trim() : '';

            if (colDef.pos === 1) {
                objetoFila[colDef.key] = DIAS_SEMANA[idxLinea] || valorCelda;
            } else {
                objetoFila[colDef.key] = valorCelda;
            }
        });

        objetoFila['MODULO'] = moduloSeleccionado;
        nuevasFilas.push(objetoFila);
    });

    datosMesaTrabajo[moduloSeleccionado] = nuevasFilas;
    renderizarFilasEnPantalla(nuevasFilas);
}

window.guardarEnBaseMadre = function() {
    const overlay = document.getElementById('loadingOverlay');
    const txtOverlay = document.getElementById('lblOverlayTexto');
    if (txtOverlay) txtOverlay.textContent = 'Guardando en Base Madre...';
    if (overlay) overlay.style.display = 'flex';

    let filasA_Guardar = [];

    Object.keys(datosMesaTrabajo).forEach(modKey => {
        let filasMod = datosMesaTrabajo[modKey];
        filasMod.forEach(fila => {
            let diaLwr = String(fila.DIA || '').toLowerCase();
            if (diaLwr !== 'linea totales' && diaLwr !== 'totales' && diaLwr !== '') {
                filasA_Guardar.push(fila);
            }
        });
    });

    if (filasA_Guardar.length === 0) {
        if (overlay) overlay.style.display = 'none';
        alert("No hay registros diarios para guardar en Base Madre.");
        return;
    }

    database.ref('bd_madre').once('value').then(snapshot => {
        let datosBase = snapshot.val();
        let arregloBase = datosBase ? (Array.isArray(datosBase) ? datosBase : Object.values(datosBase)) : [];

        let modulosActualizados = Object.keys(datosMesaTrabajo).filter(m => datosMesaTrabajo[m].length > 0);

        let arregloFiltrado = arregloBase.filter(item => {
            let modItem = String(item.MODULO || item.MÓDULO || item.Módulo || '');
            return !modulosActualizados.includes(modItem);
        });

        let arregloFinal = [...arregloFiltrado, ...filasA_Guardar];

        database.ref('bd_madre').set(arregloFinal).then(() => {
            if (overlay) overlay.style.display = 'none';
            alert("¡Registros diarios guardados con éxito en Base Madre!");
        }).catch(err => {
            if (overlay) overlay.style.display = 'none';
            alert("Error al guardar en Firebase: " + err.message);
        });
    });
};

window.guardarEnBaseTotales = function() {
    const overlay = document.getElementById('loadingOverlay');
    const txtOverlay = document.getElementById('lblOverlayTexto');
    if (txtOverlay) txtOverlay.textContent = 'Guardando en BD Totales...';
    if (overlay) overlay.style.display = 'flex';

    const modulosList = ['050351', '050353', '050354'];
    let filasTotalesA_Guardar = [];

    modulosList.forEach(modKey => {
        let filas = datosMesaTrabajo[modKey] || [];
        let filaTotales = filas.find(f => String(f.DIA || '').toLowerCase() === 'linea totales');

        if (filaTotales) {
            let copiaTotales = { ...filaTotales };
            const rem = copiaTotales['REMESA'] || '';
            copiaTotales['IDMAC'] = generarIdMac(rem, modKey);
            copiaTotales['MODULO'] = modKey;
            filasTotalesA_Guardar.push(copiaTotales);
        }
    });

    if (filasTotalesA_Guardar.length === 0) {
        if (overlay) overlay.style.display = 'none';
        alert("No se encontraron líneas de totales para guardar en BD Totales.");
        return;
    }

    database.ref('bdtotales').once('value').then(snapshot => {
        let datosBase = snapshot.val();
        let arregloBase = datosBase ? (Array.isArray(datosBase) ? datosBase : Object.values(datosBase)) : [];

        let mapaRegistros = new Map();

        arregloBase.forEach(item => {
            const r = item.REMESA || item.Remesa || '';
            const m = item.MODULO || item.Modulo || '';
            const id = item.IDMAC || generarIdMac(r, m);
            if (id && id !== '000000') mapaRegistros.set(id, item);
        });

        filasTotalesA_Guardar.forEach(itemNuevo => {
            mapaRegistros.set(itemNuevo.IDMAC, itemNuevo);
        });

        const arregloFinal = Array.from(mapaRegistros.values());

        database.ref('bdtotales').set(arregloFinal).then(() => {
            if (overlay) overlay.style.display = 'none';
            alert("¡Líneas de Totales registradas y guardadas correctamente en BD Totales!");
        }).catch(err => {
            if (overlay) overlay.style.display = 'none';
            alert("Error al guardar en BD Totales: " + err.message);
        });
    });
};

function cargarDatosInicialesFirebase() {
    database.ref('bd_madre').once('value').then(snapshot => {
        let datos = snapshot.val();
        let arregloGlobal = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];

        ['050351', '050353', '050354'].forEach(m => {
            datosMesaTrabajo[m] = arregloGlobal.filter(item => {
                let modItem = String(item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '');
                return modItem === m;
            });
        });

        renderizarFilasEnPantalla(datosMesaTrabajo[moduloSeleccionado] || []);
    });
}

window.vaciarMesaTrabajo = function() {
    if (confirm("¿Deseas limpiar la pantalla actual? (Los datos no guardados se perderán)")) {
        if (moduloSeleccionado === 'TOTALES') {
            datosMesaTrabajo = { '050351': [], '050353': [], '050354': [] };
            renderizarVistaTotalesGenerales();
        } else {
            datosMesaTrabajo[moduloSeleccionado] = [];
            renderizarFilasEnPantalla([]);
        }
    }
};
