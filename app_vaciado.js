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

// ESTRUCTURA DE 84 COLUMNAS
let ESTRUCTURA_COLUMNAS = [
    { pos: 1, key: 'dia', label: 'Día' },
    { pos: 5, key: 'inicial', label: 'Inicial' },
    { pos: 6, key: 'final', label: 'Final' },
    { pos: 7, key: 'total_de_folios', label: 'Total de folios' },
    { pos: 8, key: 'inscripciones', label: 'Inscripciones' },
    { pos: 9, key: 'correccion_de_datos_personales', label: 'Corrección de datos personales' },
    { pos: 10, key: 'cambio_de_domicilio', label: 'Cambio de domicilio' },
    { pos: 11, key: 'reposision', label: 'Reposición' },
    { pos: 12, key: 'corr__de_datos_direccion', label: 'Corr. de datos dirección' },
    { pos: 13, key: 'reincorporacion', label: 'Reincorporación' },
    { pos: 14, key: 'reemplazo', label: 'Reemplazo' },
    { pos: 15, key: 'reimpresion', label: 'Reimpresión' },
    { pos: 16, key: 'total_de_tramites', label: 'Total de trámites' },
    { pos: 17, key: 'cancelados', label: 'Cancelados' },
    { pos: 18, key: 'total_de_rechazos', label: 'Total de rechazos' },
    { pos: 19, key: 'cpv_devuelta_entrega', label: 'Cpv devuelta entrega' },
    { pos: 20, key: 'disponibles_al_dia_anterior', label: 'Disponibles al día anterior' },
    { pos: 21, key: 'recibidas', label: 'Recibidas' },
    { pos: 22, key: 'recibidas_de_otros_tipos', label: 'Recibidas de otros tipos' },
    { pos: 23, key: 'entregadas', label: 'Entregadas' },
    { pos: 24, key: 'recibo_y_o_extravio', label: 'Recibo y/o extravío' },
    { pos: 25, key: 'anexas_a_fuar', label: 'Anexas a fuar' },
    { pos: 26, key: 'datos_erroneos', label: 'Datos erróneos' },
    { pos: 27, key: 'foto_mal_impresa', label: 'Foto mal impresa' },
    { pos: 28, key: 'reimpresion_2', label: 'Reimpresión 2' },
    { pos: 29, key: 'retiradas_as_por_causa', label: 'Retiradas por causa' },
    { pos: 30, key: 'disponibles', label: 'Disponibles' },
    { pos: 31, key: 'credenciales_x_canje', label: 'Credenciales x canje' },
    { pos: 32, key: 'fichas_entregadas', label: 'Fichas entregadas' },
    { pos: 33, key: 'fichas_atendidas', label: 'Fichas atendidas' },
    { pos: 34, key: 'dias_trabajados', label: 'Días trabajados' },
    { pos: 35, key: 'solicitud_expedicion_patriados', label: 'Solicitud expedición repatriados' },
    { pos: 36, key: 'solicitud_expedicion_ordinaria', label: 'Solicitud expedición ordinaria' },
    { pos: 37, key: 'solicitud_de_rectificacion', label: 'Solicitud de rectificación' },
    { pos: 38, key: 'demanda_de_juicio', label: 'Demanda de juicio' },
    { pos: 39, key: 'remesa', label: 'Remesa' },
    { pos: 40, key: 'total_de_movimientos', label: 'Total de movimientos' },
    { pos: 41, key: 'devueltas_por_terceros', label: 'Devueltas por terceros' },
    { pos: 42, key: '34_imagen_inconsistente', label: '34 Imagen inconsistente' },
    { pos: 43, key: '35_movimiento_posterior', label: '35 Movimiento posterior' },
    { pos: 44, key: 'configuracion', label: 'Configuración' },
    { pos: 45, key: 'ent', label: 'Ent' },
    { pos: 46, key: 'dtto', label: 'Dtto' },
    { pos: 47, key: 'modulo', label: 'Módulo' },
    { pos: 48, key: 'resguardo', label: 'Resguardo' },
    { pos: 49, key: 'solicitu_de_reimpresion', label: 'Solicitud de reimpresión' },
    { pos: 50, key: 'cpv_devuelta_entrega_2', label: 'Cpv devuelta entrega 2' },
    { pos: 51, key: 'script_ejecutado', label: 'Script ejecutado' },
    { pos: 52, key: 'folio_nec', label: 'Folio nec' },
    { pos: 53, key: 'cartografia', label: 'Cartografía' },
    { pos: 54, key: 'lotes_de_credenciales', label: 'Lotes de credenciales' },
    { pos: 55, key: 'registradas_por_dia', label: 'Registradas por día' },
    { pos: 56, key: 'faltantes', label: 'Faltantes' },
    { pos: 57, key: 'observaciones', label: 'Observaciones' },
    { pos: 58, key: 'sin_nombre1', label: 'Sin nombre 1' },
    { pos: 59, key: 'sin_nombre2', label: 'Sin nombre 2' },
    { pos: 60, key: 'sin_nombre3', label: 'Sin nombre 3' },
    { pos: 61, key: 'mac_que_recibe', label: 'Mac que recibe' },
    { pos: 62, key: 'mac_que_entrega', label: 'Mac que entrega' },
    { pos: 63, key: 'importadas', label: 'Importadas' },
    { pos: 64, key: 'exportadas', label: 'Exportadas' },
    { pos: 65, key: 'reposicion_reimpresion', label: 'Reposición reimpresión' },
    { pos: 66, key: 'mal_impresa', label: 'Mal impresa' },
    { pos: 67, key: 'error_en_cartografia', label: 'Error en cartografía' },
    { pos: 68, key: 'defuncion', label: 'Defunción' },
    { pos: 69, key: 'suspension', label: 'Suspensión' },
    { pos: 70, key: 'duplicado', label: 'Duplicado' },
    { pos: 71, key: 'error_num_de_emision', label: 'Error num de emisión' },
    { pos: 72, key: 'perdida_de_vigencia', label: 'Pérdida de vigencia' },
    { pos: 73, key: 'mov_post', label: 'Mov post' },
    { pos: 74, key: 'anexas_a_solicitud', label: 'Anexas a solicitud' },
    { pos: 75, key: 'otras_bajas', label: 'Otras bajas' },
    { pos: 76, key: 'cif_05', label: 'Cif 05' },
    { pos: 77, key: 'solicitud_expedicion', label: 'Solicitud expedición' },
    { pos: 78, key: 'iniciales_a', label: 'Iniciales A' },
    { pos: 79, key: 'iniciales_s', label: 'Iniciales S' },
    { pos: 80, key: 'iniciales_c', label: 'Iniciales C' },
    { pos: 81, key: 'actualizacion', label: 'Actualización' },
    { pos: 82, key: 'sobrantes', label: 'Sobrantes' },
    { pos: 83, key: 'disponibles_de_sol_de_exp', label: 'Disponibles de sol de exp' },
    { pos: 84, key: 'reimpre_fuera_del_sistema', label: 'Reimpre fuera del sistema' },
    { pos: 2, key: 'fecha', label: 'Fecha' },
    { pos: 3, key: 'horas_trabajadas', label: 'Horas trabajadas' },
    { pos: 4, key: 'sedes', label: 'Sedes' }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'LINEA TOTALES'];

document.addEventListener('DOMContentLoaded', () => {
    dibujarEncabezadosYNumeros();
    cargarDatosInicialesFirebase();
    inicializarPersistenciaIniciales(); // <-- CARGA Y GUARDA AUTOMÁTICAMENTE LAS INICIALES

    const areaPegado = document.getElementById('areaPegado');
    if (areaPegado) {
        areaPegado.addEventListener('paste', manejarPegadoClipboard);
    }
});

// FUNCIÓN PARA QUE LAS INICIALES NUNCA SE BORREN AL REINICIAR LA PÁGINA
function inicializarPersistenciaIniciales() {
    const idsInputs = ['camp_50351', 'camp_50353', 'camp_50354', 'acum_50351', 'acum_50353', 'acum_50354'];

    idsInputs.forEach(id => {
        const inputElement = document.getElementById(id);
        if (!inputElement) return;

        // Recuperar valor guardado previamente al abrir la página
        const valorGuardado = localStorage.getItem('mac_init_' + id);
        if (valorGuardado !== null) {
            inputElement.value = valorGuardado;
        }

        // Guardar automáticamente cada vez que el usuario escriba o modifique algo
        inputElement.addEventListener('input', () => {
            localStorage.setItem('mac_init_' + id, inputElement.value);
        });
    });
}

// NAVEGACIÓN Y CAMBIO DE PESTAÑAS
window.cambiarModulo = function(modulo) {
    moduloSeleccionado = modulo;
    
    document.querySelectorAll('#tabsModulos .nav-link').forEach(btn => btn.classList.remove('active'));
    const btnActivo = document.getElementById(`btn-tab-${modulo}`);
    if (btnActivo) btnActivo.classList.add('active');

    const panelTotales = document.getElementById('panelAccionesTotales');
    const areaPegado = document.getElementById('areaPegado');
    const btnGuardarMadre = document.getElementById('btnGuardarMadre');
    const lblAyuda = document.getElementById('lblMensajeAyuda');
    const lblPegado = document.getElementById('lblModuloPegado');

    dibujarEncabezadosYNumeros();

    if (modulo === 'TOTALES') {
        if (panelTotales) { panelTotales.classList.remove('d-none'); panelTotales.classList.add('d-flex'); }
        if (areaPegado) areaPegado.classList.add('d-none');
        if (btnGuardarMadre) btnGuardarMadre.classList.add('d-none');
        
        if (lblAyuda) {
            lblAyuda.innerHTML = '<b>Vista Totales Generales:</b> Consolidado de los 3 módulos listos para sincronizar.';
        }
        
        renderizarVistaTotalesGenerales();
    } else {
        if (panelTotales) { panelTotales.classList.remove('d-flex'); panelTotales.classList.add('d-none'); }
        if (areaPegado) areaPegado.classList.remove('d-none');
        if (btnGuardarMadre) btnGuardarMadre.classList.remove('d-none');

        if (lblPegado) lblPegado.textContent = modulo;
        if (lblAyuda) {
            lblAyuda.innerHTML = `Módulo <b>${modulo}</b>: Pega los datos con Ctrl+V. Haz doble clic en un encabezado para cambiar su nombre.`;
        }
        
        renderizarFilasEnPantalla(datosMesaTrabajo[moduloSeleccionado] || []);
    }
};

function dibujarEncabezadosYNumeros() {
    const thead = document.getElementById('cabeceraVaciado');
    if (!thead) return;

    let htmlHead = '<tr>';
    ESTRUCTURA_COLUMNAS.forEach((col, idx) => {
        let textoMostrar = col.label;
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
        ESTRUCTURA_COLUMNAS[indexColumna].key = nuevoNombre.toLowerCase();
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
        let itemFila = filasDatos.find(f => String(f.dia || f.DIA || '').toLowerCase() === diaNombre.toLowerCase()) || {};

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
        let filaTotales = filas.find(f => String(f.dia || f.DIA || '').toLowerCase() === 'linea totales') || {};

        if (!remesaDetectada && (filaTotales['remesa'] || filaTotales['REMESA'])) {
            remesaDetectada = filaTotales['remesa'] || filaTotales['REMESA'];
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

        objetoFila['modulo'] = moduloSeleccionado;
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
            let diaLwr = String(fila.dia || fila.DIA || '').toLowerCase();
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
            let modItem = String(item.modulo || item.MODULO || item.MÓDULO || item.Módulo || '');
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
        let filaTotales = filas.find(f => String(f.dia || f.DIA || '').toLowerCase() === 'linea totales');

        if (filaTotales) {
            let copiaTotales = { ...filaTotales };
            const rem = copiaTotales['remesa'] || copiaTotales['REMESA'] || '';
            copiaTotales['IDMAC'] = generarIdMac(rem, modKey);
            copiaTotales['modulo'] = modKey;
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
            const r = item.remesa || item.REMESA || item.Remesa || '';
            const m = item.modulo || item.MODULO || item.Modulo || '';
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
                let modItem = String(item.modulo || item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '');
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
