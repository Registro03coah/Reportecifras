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

// ESTRUCTURA DE 84 COLUMNAS (KEYS EN MINÚSCULAS Y LABELS TIPO NOMBRE PROPIO)
let ESTRUCTURA_COLUMNAS = [
    { pos: 1, key: 'DIA', label: 'Día' },
    { pos: 2, key: 'FECHA', label: 'Fecha' },
    { pos: 3, key: 'HORAS_TRABAJADAS', label: 'Horas' },
    { pos: 4, key: 'SEDES', label: 'Sede' },
    { pos: 5, key: 'INICIAL', label: 'Inicial' },
    { pos: 6, key: 'FINAL', label: 'Final' },
    { pos: 7, key: 'TOTAL_DE_FOLIOS', label: 'Total' },
    { pos: 8, key: 'INSCRIPCIONES', label: 'Inscrip.' },
    { pos: 9, key: 'CORRECCION_DE_DATOS_PERSONALES', label: 'Corr._Datos' },
    { pos: 10, key: 'CAMBIO_DE_DOMICILIO', label: 'Cambio_Dom.' },
    { pos: 11, key: 'REPOSISION', label: 'Reposición' },
    { pos: 12, key: 'CORR__DE_DATOS_DIRECCION', label: 'Corr._De_Datos_Direccion' },
    { pos: 13, key: 'REINCORPORACION', label: 'Reincorp.' },
    { pos: 14, key: 'REEMPLAZO', label: 'Reemplazo' },
    { pos: 15, key: 'REIMPRESION', label: 'Reimpresion' },
    { pos: 16, key: 'TOTAL_DE_TRAMITES', label: 'Total_Tramites' },
    { pos: 17, key: 'CANCELADOS', label: 'Cancelados' },
    { pos: 18, key: 'TOTAL_DE_ANEXOS_POR_RECHAZO', label: 'Total_Anexo_Rechazo' },
    { pos: 19, key: 'CPV_DEVUELTA_ENTREGA', label: 'Cpv_Devuelta_Entrega' },
    { pos: 20, key: 'DISPONIBLES_AL_DIA_ANTERIOR', label: 'Disponibles_Al_Dia_Anterior_(Iniciales)' },
    { pos: 21, key: 'ACTUALIZACION', label: 'Recibidas_Actualizacion' },
    { pos: 22, key: 'RECIBIDAS_DE_OTROS_TIPOS', label: 'Recibidas_Otros_Tipos' },
    { pos: 23, key: 'ENTREGADAS', label: 'Entregadas' },
    { pos: 24, key: 'RECIBO_Y_O_EXTRAVIO', label: 'Recibo_Y/O_Extravio' },
    { pos: 25, key: 'ANEXAS_A_FUAR', label: 'Anexas_A_Fuar' },
    { pos: 26, key: 'DATOS_ERRONEOS', label: 'Datos_Erroneos' },
    { pos: 27, key: 'FOTO_MAL_IMPRESA', label: 'Foto_Mal_Impresa' },
    { pos: 28, key: 'SOLICITU_DE_REIMPRESION', label: 'Reimpresion' },
    { pos: 29, key: 'RETIRADAS_POR_OTRA_CAUSA', label: 'Retiradas_Por_Causa' },
    { pos: 30, key: 'DISPONIBLES', label: 'Disponibles' },
    { pos: 31, key: 'CREDENCIALES_X_CANJE', label: 'Credenciales_X_Canje' },
    { pos: 32, key: 'FICHAS_ENTREGADAS', label: 'Fichas_Entregadas' },
    { pos: 33, key: 'FICHAS_ATENDIDAS', label: 'Fichas_Atendidas' },
    { pos: 34, key: 'DIAS_TRABAJADOS', label: 'Dias_Trabajados' },
    { pos: 35, key: 'CIF_05', label: 'Solicitud_Expedición' },
    { pos: 36, key: 'SOLICITUD_EXPEDICION', label: 'Solicitud_Expedición_Ordinaria' },
    { pos: 37, key: 'SOLICITUD_RECTIFICACION', label: 'Solicitu_De_Rectificación' },
    { pos: 38, key: 'DEMANDA_DE_JUICIO', label: 'Demanda_De_Juicio' },
    { pos: 39, key: 'REMESA', label: 'Remesa' },
    { pos: 40, key: 'TOTAL_DE_MOVIMIENTOS', label: 'Total_De_Movimientos' },
    { pos: 41, key: 'CREDEN_DEVUELTAS_POR_TERCEROS', label: 'Devueltas_Por_Terceros' },
    { pos: 42, key: 'RECHAZOS_DE_MAC_34', label: '34_Imagen_Inconsistente' },
    { pos: 43, key: 'RECHAZOS_DE_MAC_35', label: '35_Movimiento_Posterior' },
    { pos: 44, key: 'CONFIGURACION', label: 'Configuracion' },
    { pos: 45, key: 'ENT', label: 'Ent' },
    { pos: 46, key: 'DTTO', label: 'Dtto' },
    { pos: 47, key: 'MODULO', label: 'Modulo' },
    { pos: 48, key: 'RESGUARDO', label: 'Resguardo' },
    { pos: 49, key: 'SOLICITUD_DE_REIMPRESION', label: 'Solicitud_De_Reimpresion' },
    { pos: 50, key: 'CPV_DEVUELTA_ENTREGA_2', label: 'Cpv_Devuelta_Entrega' },
    { pos: 51, key: 'SCRIPT_EJECUTADOS', label: 'Script_Ejecutados' },
    { pos: 52, key: 'FOLIO_NEC', label: 'Folio_Nec' },
    { pos: 53, key: 'NUMERO_DE_TRAMITES_APLICADOS', label: 'Número_De_Trámites_Aplicados' },
    { pos: 54, key: 'NUMERO_DE_FICHAS_REQUISITADAS', label: 'Número_De_Fichas_Requisitadas' },
    { pos: 55, key: 'NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS', label: 'Número_De_Archivos_De_Transacción_Aceptados' },
    { pos: 56, key: 'TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS', label: 'Total_De_Archivos_De_Transacción_Procesados' },
    { pos: 57, key: 'CREDENCIALES_RECIBIDAS', label: 'Credenciales_Recibidas' },
    { pos: 58, key: 'CREDENCIALES_INCONSISTENTES', label: 'Credenciales_Inconsistentes' },
    { pos: 59, key: 'CREDENCIALES_EN_RESGUARDO', label: 'Credenciales_En_Resguardo' },
    { pos: 60, key: 'CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA', label: 'Credenciales_Totales_En_Siirfe_Disponibles_Para_Entrega' },
    { pos: 61, key: 'TOTAL_DE_CREDENCIALES_ENTREGADAS', label: 'Total_De_Credenciales_Entregadas' },
    { pos: 62, key: 'TOTAL_DE_CREDENCIALES_SOLICITADAS', label: 'Total_De_Credenciales_Solicitadas' },
    { pos: 63, key: 'IMPORTADAS', label: 'Importadas' },
    { pos: 64, key: 'EXPORTADAS', label: 'Exportadas' },
    { pos: 65, key: 'REPOSICIONES_REIMPRESIONES', label: 'Reposiciones_+_Reimpresiones' },
    { pos: 66, key: 'MAL_IMPRESA', label: 'Mal_Impresa' },
    { pos: 67, key: 'ERROR_EN_CARTOGRAFIA', label: 'Error_En_Cartografia' },
    { pos: 68, key: 'DEFUNCION', label: 'Defuncion' },
    { pos: 69, key: 'SUSPENSION', label: 'Suspension' },
    { pos: 70, key: 'DUPLICADO', label: 'Duplicado' },
    { pos: 71, key: 'ERROR_EN_NUM_DE_EMISION', label: 'Error_En_Num._De_Emision' },
    { pos: 72, key: 'PERDIDA_DE_VIGENCIA', label: 'Perdida_De_Vigencia' },
    { pos: 73, key: 'MOV_POST', label: 'Mov.post.' },
    { pos: 74, key: 'ANEXAS_A_SOLICITUD', label: 'Anexas_A_Solicitud' },
    { pos: 75, key: 'OTRAS_BAJAS', label: 'Otras_Bajas' }
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
