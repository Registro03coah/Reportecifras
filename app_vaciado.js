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
let datosModuloActual = [];

// =========================================================
// MAPA EXACTO DE LAS 75 COLUMNAS COINCIDENTES CON BD MADRE
// =========================================================
const ESTRUCTURA_COLUMNAS = [
    { pos: 1, key: 'DIA', label: 'DIA', color: 'th-gris' },
    { pos: 2, key: 'FECHA', label: 'FECHA', color: 'th-gris' },
    { pos: 3, key: 'HORAS_TRABAJADAS', label: 'HORAS_TRABAJADAS', color: 'th-gris' },
    { pos: 4, key: 'SEDES', label: 'SEDES', color: 'th-gris' },
    { pos: 5, key: 'INICIAL', label: 'INICIAL', color: 'th-naranja' },
    { pos: 6, key: 'FINAL', label: 'FINAL', color: 'th-naranja' },
    { pos: 7, key: 'TOTAL_DE_FOLIOS', label: 'TOTAL_DE_FOLIOS', color: 'th-naranja' },
    { pos: 8, key: 'INSCRIPCIONES', label: 'INSCRIPCIONES', color: 'th-gris' },
    { pos: 9, key: 'CORRECCION_DE_DATOS_PERSONALES', label: 'CORRECCION_DE_DATOS_PERSONALES', color: 'th-gris' },
    { pos: 10, key: 'CAMBIO_DE_DOMICILIO', label: 'CAMBIO_DE_DOMICILIO', color: 'th-gris' },
    { pos: 11, key: 'REPOSISION', label: 'REPOSICION', color: 'th-gris' },
    { pos: 12, key: 'CORR__DE_DATOS_DIRECCION', label: 'CORR_DE_DATOS_DIRECCION', color: 'th-gris' },
    { pos: 13, key: 'REINCORPORACION', label: 'REINCORPORACION', color: 'th-gris' },
    { pos: 14, key: 'REEMPLAZO', label: 'REEMPLAZO', color: 'th-gris' },
    { pos: 15, key: 'REIMPRESION', label: 'REIMPRESION', color: 'th-gris' },
    { pos: 16, key: 'TOTAL_DE_TRAMITES', label: 'TOTAL_DE_TRAMITES', color: 'th-verde-tramites' },
    { pos: 17, key: 'CANCELADOS', label: 'CANCELADOS', color: 'th-rojo-cancelados' },
    { pos: 18, key: 'TOTAL_DE_RECHAZOS', label: 'TOTAL_DE_RECHAZOS', color: 'th-amarillo-rechazos' },
    { pos: 19, key: 'CPV_DEVUELTA_ENTREGA', label: 'CPV_DEVUELTA_ENTREGA', color: 'th-morado-resguardo' },
    { pos: 20, key: 'DISPONIBLES_AL_DIA_ANTERIOR', label: 'DISPONIBLES_AL_DIA_ANTERIOR', color: 'th-morado-resguardo' },
    { pos: 21, key: 'RECIBIDAS', label: 'RECIBIDAS', color: 'th-morado-resguardo' },
    { pos: 22, key: 'RECIBIDAS_DE_OTROS_TIPOS', label: 'RECIBIDAS_DE_OTROS_TIPOS', color: 'th-morado-resguardo' },
    { pos: 23, key: 'ENTREGADAS', label: 'ENTREGADAS', color: 'th-morado-resguardo' },
    { pos: 24, key: 'RECIBO_Y_O_EXTRAVIO', label: 'RECIBO_Y_O_EXTRAVIO', color: 'th-morado-resguardo' },
    { pos: 25, key: 'ANEXAS_A_FUAR', label: 'ANEXAS_A_FUAR', color: 'th-morado-resguardo' },
    { pos: 26, key: 'DATOS_ERRONEOS', label: 'DATOS_ERRONEOS', color: 'th-morado-resguardo' },
    { pos: 27, key: 'FOTO_MAL_IMPRESA', label: 'FOTO_MAL_IMPRESA', color: 'th-morado-resguardo' },
    { pos: 28, key: 'REIMPRESION_2', label: 'REIMPRESION_2', color: 'th-morado-resguardo' },
    { pos: 29, key: 'RETIRADAS_AS_POR_CAUSA', label: 'RETIRADAS_POR_CAUSA', color: 'th-morado-resguardo' },
    { pos: 30, key: 'DISPONIBLES', label: 'DISPONIBLES', color: 'th-morado-resguardo' },
    { pos: 31, key: 'CREDENCIALES_X_CANJE', label: 'CREDENCIALES_X_CANJE', color: 'th-morado-resguardo' },
    { pos: 32, key: 'FICHAS_ENTREGADAS', label: 'FICHAS_ENTREGADAS', color: 'th-gris' },
    { pos: 33, key: 'FICHAS_ATENDIDAS', label: 'FICHAS_ATENDIDAS', color: 'th-gris' },
    { pos: 34, key: 'DIAS_TRABAJADOS', label: 'DIAS_TRABAJADOS', color: 'th-gris' },
    { pos: 35, key: 'SOLICITUD_EXPEDICION_PATRIADOS', label: 'SOLICITUD_EXPEDICION_REPATRIADOS', color: 'th-gris' },
    { pos: 36, key: 'SOLICITUD_EXPEDICION_ORDINARIA', label: 'SOLICITUD_EXPEDICION_ORDINARIA', color: 'th-gris' },
    { pos: 37, key: 'SOLICITUD_DE_RECTIFICACION', label: 'SOLICITUD_RECTIFICACION', color: 'th-gris' },
    { pos: 38, key: 'DEMANDA_DE_JUICIO', label: 'DEMANDA_DE_JUICIO', color: 'th-gris' },
    { pos: 39, key: 'REMESA', label: 'REMESA', color: 'th-gris' },
    { pos: 40, key: 'TOTAL_DE_MOVIMIENTOS', label: 'TOTAL_DE_MOVIMIENTOS', color: 'th-gris' },
    { pos: 41, key: 'DEVUELTAS_POR_TERCEROS', label: 'DEVUELTAS_POR_TERCEROS', color: 'th-gris' },
    { pos: 42, key: '34_IMAGEN_INCONSISTENTE', label: '34_IMAGEN_INCONSISTENTE', color: 'th-gris' },
    { pos: 43, key: '35_MOVIMIENTO_POSTERIOR', label: '35_MOVIMIENTO_POSTERIOR', color: 'th-gris' },
    { pos: 44, key: 'CONFIGURACION', label: 'CONFIGURACION', color: 'th-gris' },
    { pos: 45, key: 'ENT', label: 'ENT', color: 'th-gris' },
    { pos: 46, key: 'DTTO', label: 'DTTO', color: 'th-gris' },
    { pos: 47, key: 'MODULO', label: 'MODULO', color: 'th-gris' },
    { pos: 48, key: 'RESGUARDO', label: 'RESGUARDO', color: 'th-gris' },
    { pos: 49, key: 'SOLICITU_DE_REIMPRESION', label: 'SOLICITUD_DE_REIMPRESION', color: 'th-gris' },
    { pos: 50, key: 'CPV_DEVUELTA_ENTREGA_2', label: 'CPV_DEVUELTA_ENTREGA_2', color: 'th-gris' },
    { pos: 51, key: 'SCRIPT_EJECUTADO', label: 'SCRIPT_EJECUTADO', color: 'th-gris' },
    { pos: 52, key: 'FOLIO_NEC', label: 'FOLIO_NEC', color: 'th-gris' },
    { pos: 53, key: 'CARTOGRAFIA', label: 'CARTOGRAFIA', color: 'th-gris' },
    { pos: 54, key: 'LOTES_DE_CREDENCIALES', label: 'LOTES_CREDENCIALES', color: 'th-gris' },
    { pos: 55, key: 'REGISTRADAS_POR_DIA', label: 'REGISTRADAS_POR_DIA', color: 'th-gris' },
    { pos: 56, key: 'FALTANTES', label: 'FALTANTES', color: 'th-gris' },
    { pos: 57, key: 'OBSERVACIONES', label: 'OBSERVACIONES', color: 'th-gris' },
    { pos: 58, key: 'SIN_NOMBRE1', label: 'SIN_NOMBRE1', color: 'th-gris' },
    { pos: 59, key: 'SIN_NOMBRE2', label: 'SIN_NOMBRE2', color: 'th-gris' },
    { pos: 60, key: 'SIN_NOMBRE3', label: 'SIN_NOMBRE3', color: 'th-gris' },
    { pos: 61, key: 'MAC_QUE_RECIBE', label: 'MAC_QUE_RECIBE', color: 'th-oliva' },
    { pos: 62, key: 'MAC_QUE_ENTREGA', label: 'MAC_QUE_ENTREGA', color: 'th-oliva' },
    { pos: 63, key: 'IMPORTADAS', label: 'IMPORTADAS', color: 'th-amarillo-fuerte' },
    { pos: 64, key: 'EXPORTADAS', label: 'EXPORTADAS', color: 'th-amarillo-fuerte' },
    { pos: 65, key: 'REPOSICION_REIMPRESION', label: 'REPOSICION_REIMPRESION', color: 'th-gris' },
    { pos: 66, key: 'MAL_IMPRESA', label: 'MAL_IMPRESA', color: 'th-gris' },
    { pos: 67, key: 'ERROR_EN_CARTOGRAFIA', label: 'ERROR_CARTOGRAFIA', color: 'th-gris' },
    { pos: 68, key: 'DEFUNCION', label: 'DEFUNCION', color: 'th-gris' },
    { pos: 69, key: 'SUSPENSION', label: 'SUSPENSION', color: 'th-gris' },
    { pos: 70, key: 'DUPLICADO', label: 'DUPLICADO', color: 'th-gris' },
    { pos: 71, key: 'ERROR_NUM_DE_EMISION', label: 'ERROR_NUM_EMISION', color: 'th-gris' },
    { pos: 72, key: 'PERDIDA_DE_VIGENCIA', label: 'PERDIDA_VIGENCIA', color: 'th-gris' },
    { pos: 73, key: 'MOV_POST', label: 'MOV_POST', color: 'th-gris' },
    { pos: 74, key: 'ANEXAS_A_SOLICITUD', label: 'ANEXAS_A_SOLICITUD', color: 'th-gris' },
    { pos: 75, key: 'OTRAS_BAJAS', label: 'OTRAS_BAJAS', color: 'th-gris' }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'LINEA TOTALES'];

// =========================================================
// INICIALIZACIÓN PANTALLA
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    dibujarEncabezadosYNumeros();
    cargarDatosModuloDesdeFirebase(moduloSeleccionado);

    const areaPegado = document.getElementById('areaPegado');
    if (areaPegado) {
        areaPegado.addEventListener('paste', manejarPegadoClipboard);
    }
});

window.cambiarModulo = function(modulo) {
    moduloSeleccionado = modulo;
    
    document.querySelectorAll('#tabsModulos .nav-link').forEach(btn => btn.classList.remove('active'));
    const btnActivo = document.getElementById(`btn-tab-${modulo}`);
    if (btnActivo) btnActivo.classList.add('active');

    document.getElementById('lblModuloActivo').textContent = modulo;
    document.getElementById('lblModuloPegado').textContent = modulo;

    cargarDatosModuloDesdeFirebase(moduloSeleccionado);
};

function dibujarEncabezadosYNumeros() {
    const thead = document.getElementById('cabeceraVaciado');
    if (!thead) return;

    let htmlHead = '<tr>';
    ESTRUCTURA_COLUMNAS.forEach(col => {
        htmlHead += `<th class="${col.color}">${col.label}</th>`;
    });
    htmlHead += '</tr>';

    htmlHead += '<tr class="num-row">';
    ESTRUCTURA_COLUMNAS.forEach(col => {
        htmlHead += `<th>${col.pos}</th>`;
    });
    htmlHead += '</tr>';

    thead.innerHTML = htmlHead;
}

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
                
                if (typeof valor === 'string' && valor.includes('T00:00:00')) {
                    valor = valor.split('T')[0];
                }

                htmlRow += `<td>${valor}</td>`;
            }
        });

        tr.innerHTML = htmlRow;
        tbody.appendChild(tr);
    });
}

// =========================================================
// PEGAR DESDE EL PORTAPAPELES (MAPEO POSICIONAL 1 A 75)
// =========================================================
function manejarPegadoClipboard(e) {
    e.preventDefault();
    let textoPegado = (e.clipboardData || window.clipboardData).getData('text');
    if (!textoPegado || textoPegado.trim() === '') return;

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';

    setTimeout(() => {
        let lineas = textoPegado.trim().split(/\r?\n/);
        let nuevasFilas = [];

        lineas.forEach((linea, idxLinea) => {
            if (idxLinea >= 8) return;

            let valores = linea.split('\t');
            let objetoFila = {};

            ESTRUCTURA_COLUMNAS.forEach((colDef, idxCol) => {
                let valorCelda = valores[idxCol] !== undefined ? valores[idxCol].trim() : '';

                if (idxCol === 0) {
                    objetoFila[colDef.key] = DIAS_SEMANA[idxLinea] || valorCelda;
                } else {
                    objetoFila[colDef.key] = valorCelda;
                }
            });

            objetoFila['MODULO'] = moduloSeleccionado;
            nuevasFilas.push(objetoFila);
        });

        // Guardar en bd_madre
        database.ref('bd_madre').once('value').then(snapshot => {
            let datosBase = snapshot.val();
            let arregloBase = datosBase ? (Array.isArray(datosBase) ? datosBase : Object.values(datosBase)) : [];

            let arregloFiltrado = arregloBase.filter(item => {
                let modItem = String(item.MODULO || item.MÓDULO || item.Módulo || '');
                return modItem !== String(moduloSeleccionado);
            });

            let arregloActualizado = [...arregloFiltrado, ...nuevasFilas];

            database.ref('bd_madre').set(arregloActualizado).then(() => {
                if (overlay) overlay.style.display = 'none';
                alert(`¡Se pegaron y guardaron los datos del Módulo ${moduloSeleccionado} en Base Madre con éxito!`);
            }).catch(err => {
                if (overlay) overlay.style.display = 'none';
                alert("Error al guardar en Firebase: " + err.message);
            });
        });

    }, 100);
}

// =========================================================
// LECTURA EN TIEMPO REAL DE BD MADRE
// =========================================================
function cargarDatosModuloDesdeFirebase(modulo) {
    database.ref('bd_madre').on('value', snapshot => {
        let datos = snapshot.val();
        let arregloGlobal = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];

        datosModuloActual = arregloGlobal.filter(item => {
            let modItem = String(item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '');
            return modItem === String(modulo);
        });

        renderizarFilasEnPantalla(datosModuloActual);
    });
}
