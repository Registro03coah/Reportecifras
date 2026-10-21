// =========================================================
// CONFIGURACIÓN FIREBASE
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

let datosGlobalesTotales = [];
let datosEnPantallaTotales = [];
let columnaOrdenActual = 'REMESA';
let ordenAscendente = false;

// =========================================================
// LECTURA EN TIEMPO REAL DESDE BDTOTALES
// =========================================================
database.ref('bdtotales').on('value', (snapshot) => {
    let datos = snapshot.val();
    datosGlobalesTotales = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    ejecutarOrdenamientoTotales(datosGlobalesTotales);
});

// ORDENAMIENTO MULTI-CRITERIO: REMESA -> MÓDULO
function ejecutarOrdenamientoTotales(arreglo) {
    if(!arreglo || arreglo.length === 0) {
        dibujarTablaTotales([]);
        return;
    }

    arreglo.sort((a, b) => {
        let remesaA = String(a['REMESA'] || '').trim();
        let remesaB = String(b['REMESA'] || '').trim();
        if (remesaA !== remesaB) {
            return remesaB.localeCompare(remesaA, undefined, { numeric: true });
        }

        let moduloA = String(a['MODULO'] || '').trim();
        let moduloB = String(b['MODULO'] || '').trim();
        if (moduloA !== moduloB) {
            return moduloA.localeCompare(moduloB, undefined, { numeric: true });
        }

        let valA = a[columnaOrdenActual] !== undefined && a[columnaOrdenActual] !== null ? String(a[columnaOrdenActual]).toUpperCase() : '';
        let valB = b[columnaOrdenActual] !== undefined && b[columnaOrdenActual] !== null ? String(b[columnaOrdenActual]).toUpperCase() : '';

        if (!isNaN(valA) && !isNaN(valB) && valA.trim() !== '' && valB.trim() !== '') {
            valA = Number(valA);
            valB = Number(valB);
        }

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    dibujarTablaTotales(arreglo);
}

window.cambiarOrdenTotales = function(columnaClick) {
    if (columnaOrdenActual === columnaClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = columnaClick;
        ordenAscendente = false;
    }
    ejecutarOrdenamientoTotales(datosEnPantallaTotales);
};

function dibujarTablaTotales(datosArreglo) {
    datosEnPantallaTotales = datosArreglo;
    const thead = document.getElementById('cabeceraBdTotales');
    const tbody = document.getElementById('cuerpoBdTotales');
    if(!thead || !tbody) return;
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en BD Totales. Sube un archivo JSON.</td></tr>';
        return;
    }

    let columnas = Object.keys(datosArreglo[0]);

    const ordenDeseado = [
        "IDMAC", "MODULO", "REMESA", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
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
        "registradas_por_dia", "faltantes", "observaciones", "no_utilizados",
        "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA", "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES",
        "MAL_IMPRESAS", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION",
        "PERDIDA_DE_VIGENCIA", "MOY_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS",
        // Campos restantes (con iniciales A, S, C juntas al inicio de estos rezagados)
        "INICIALES_A", "INICIALES_S", "INICIALES_C",
        "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CRED_PROD_CANJE_POR_NUEVA", "ACTUALIZACIÓN",
        "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "SIN_NOMBRE3", "SOBRANTES", "DUPLICADOS",
        "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS",
        "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CIF-05", "SOLICITUDE_RECTIFICACIÒN"
    ];

    columnas.sort((a, b) => {
        let indiceA = ordenDeseado.indexOf(a);
        let indiceB = ordenDeseado.indexOf(b);
        if (indiceA === -1) indiceA = 999;
        if (indiceB === -1) indiceB = 999;
        return indiceA - indiceB;
    });

    let trHead = '<tr>';
    trHead += `<th class="text-white text-center" style="color: white !important; min-width: 110px;">ACCIONES</th>`;

    columnas.forEach(col => {
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        
        let iconoFlechita = '<i class="bi bi-arrow-down-up ms-1" style="font-size: 0.8em; color: rgba(255,255,255,0.4);"></i>';
        if (columnaOrdenActual === col) {
            iconoFlechita = ordenAscendente ? '<i class="bi bi-caret-up-fill text-warning ms-1"></i>' : '<i class="bi bi-caret-down-fill text-warning ms-1"></i>';
        }

        trHead += `<th class="text-white" style="color: white !important; cursor: pointer; white-space: normal; min-width: 110px; resize: horizontal; overflow: hidden;" onclick="cambiarOrdenTotales('${col}')">
                        ${nombreVisual} ${iconoFlechita}
                   </th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    let htmlCuerpo = '';
    datosArreglo.forEach(fila => {
        const idMacVal = fila.IDMAC || '';
        htmlCuerpo += '<tr>';
        
        htmlCuerpo += `<td class="text-center align-middle" style="min-width: 110px;">
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalEdicionTotales('${idMacVal}')" title="Editar total">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="borrarRegistroTotales('${idMacVal}')" title="Eliminar total">
                                <i class="bi bi-trash"></i>
                            </button>
                       </td>`;

        columnas.forEach(col => {
            htmlCuerpo += `<td class="align-middle">${fila[col] !== undefined && fila[col] !== null ? fila[col] : ''}</td>`;
        });
        htmlCuerpo += '</tr>';
    });
    tbody.innerHTML = htmlCuerpo;
}

// BUSCADOR
const buscadorTotales = document.getElementById('buscadorBdTotales');
if (buscadorTotales) {
    buscadorTotales.addEventListener('input', function(e) {
        const termino = e.target.value.toLowerCase();
        if(termino.trim() === '') {
            ejecutarOrdenamientoTotales(datosGlobalesTotales);
            return;
        }
        const filtrados = datosGlobalesTotales.filter(item => {
            const idmac = String(item.IDMAC || '').toLowerCase();
            const remesa = String(item.REMESA || '').toLowerCase();
            const modulo = String(item.MODULO || '').toLowerCase();
            return idmac.includes(termino) || remesa.includes(termino) || modulo.includes(termino);
        });
        ejecutarOrdenamientoTotales(filtrados);
    });
}

// =========================================================
// SUBIR Y FUSIONAR ARCHIVO JSON EN BDTOTALES (RECALCULA IDMAC SIEMPRE)
// =========================================================
const btnSubirTotales = document.getElementById('btnSubirTotales');
const fileInputTotales = document.getElementById('fileInputTotales');

if (btnSubirTotales && fileInputTotales) {
    btnSubirTotales.addEventListener('click', () => {
        fileInputTotales.click();
    });

    fileInputTotales.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.style.display = 'flex';

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                let nuevosDatos = JSON.parse(event.target.result);
                if (!Array.isArray(nuevosDatos)) nuevosDatos = [nuevosDatos];

                database.ref('bdtotales').once('value').then((snapshot) => {
                    let datosActuales = snapshot.val();
                    datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                    let mapaTotales = new Map();

                    // Cargar los existentes
                    datosActuales.forEach(item => {
                        const idmac = String(item.IDMAC || '');
                        if (idmac) mapaTotales.set(idmac, item);
                    });

                    // Procesar los nuevos (Forzando la corrección del IDMAC)
                    nuevosDatos.forEach(itemNuevo => {
                        if (itemNuevo.MODULO && itemNuevo.REMESA) {
                            const m = String(itemNuevo.MODULO).trim().slice(-3);
                            let remStr = String(itemNuevo.REMESA).trim();
                            let r = remStr;
                            
                            if (/^\d{4}/.test(remStr)) {
                                r = remStr.substring(4); 
                            } else if (!remStr.includes('-')) {
                                r = remStr.slice(-2);
                            }
                            // Sobrescribimos el IDMAC con el valor correcto calculado
                            itemNuevo.IDMAC = `${m}${r}`;
                        }
                        
                        const idmacNuevo = String(itemNuevo.IDMAC || '');
                        if (idmacNuevo) {
                            mapaTotales.set(idmacNuevo, itemNuevo);
                        }
                    });

                    const datosFusionados = Array.from(mapaTotales.values());

                    database.ref('bdtotales').set(datosFusionados).then(() => {
                        if (loadingOverlay) loadingOverlay.style.display = 'none';
                        alert("¡BD Totales actualizada y los IDMAC fueron corregidos con éxito!");
                        fileInputTotales.value = '';
                    }).catch(() => {
                        if (loadingOverlay) loadingOverlay.style.display = 'none';
                        alert("Error al guardar los datos en Firebase.");
                    });

                }).catch(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Error al conectar con la base de datos.");
                });

            } catch (error) {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                alert("Error al leer y parsear el archivo JSON.");
            }
        };
        reader.readAsText(file);
    });
}

// =========================================================
// ACCIONES DE GESTIÓN (ELIMINAR Y EDITAR)
// =========================================================
window.vaciarBaseTotales = function() {
    if(confirm("🚨 ¿Seguro que deseas vaciar toda la BD Totales?")) {
        database.ref('bdtotales').remove().then(() => alert("BD Totales vaciada."));
    }
};

window.descargarRespaldoTotalesJSON = function() {
    if(datosGlobalesTotales.length === 0) { alert("No hay datos."); return; }
    const blob = new Blob([JSON.stringify(datosGlobalesTotales, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdtotales_respaldo_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.borrarRegistroTotales = function(idmac) {
    if(confirm(`¿Eliminar el registro con IDMAC ${idmac}?`)) {
        const resto = datosGlobalesTotales.filter(item => String(item.IDMAC) !== String(idmac));
        database.ref('bdtotales').set(resto);
    }
};

// =========================================================
// FUNCIONES DE EDICIÓN DINÁMICA (TODAS LAS COLUMNAS)
// =========================================================
window.abrirModalEdicionTotales = function(idmac) {
    const registro = datosGlobalesTotales.find(item => String(item.IDMAC) === String(idmac));
    if (!registro) return;

    const contenedor = document.getElementById('contenedorCamposDinamicos');
    contenedor.innerHTML = ''; 

    let columnas = Object.keys(registro);
    
    const principales = ["IDMAC", "REMESA", "MODULO"];
    columnas = columnas.sort((a, b) => {
        let ia = principales.indexOf(a) !== -1 ? principales.indexOf(a) : 999;
        let ib = principales.indexOf(b) !== -1 ? principales.indexOf(b) : 999;
        return ia - ib;
    });

    columnas.forEach(col => {
        const valorActual = registro[col] !== undefined && registro[col] !== null ? registro[col] : '';
        const esReadOnly = (col === 'IDMAC') ? 'readonly' : '';
        const claseFondo = (col === 'IDMAC') ? 'bg-light' : '';

        const divCol = document.createElement('div');
        divCol.className = 'col-md-4 mb-3';
        
        divCol.innerHTML = `
            <label class="form-label small fw-bold text-muted mb-1">${col}</label>
            <input type="text" class="form-control form-control-sm ${claseFondo}" data-columna="${col}" value="${valorActual}" ${esReadOnly}>
        `;
        contenedor.appendChild(divCol);
    });
    
    var myModal = new bootstrap.Modal(document.getElementById('modalEditarTotales'));
    myModal.show();
};

window.guardarEdicionTotales = function() {
    const idmacInput = document.querySelector('#contenedorCamposDinamicos input[data-columna="IDMAC"]');
    if(!idmacInput) return;
    const idmac = idmacInput.value;

    let indice = datosGlobalesTotales.findIndex(item => String(item.IDMAC) === String(idmac));
    
    if(indice !== -1) {
        const inputs = document.querySelectorAll('#contenedorCamposDinamicos input');
        
        inputs.forEach(input => {
            const col = input.getAttribute('data-columna');
            if(col !== 'IDMAC') {
                datosGlobalesTotales[indice][col] = input.value;
            }
        });

        const btnGuardar = document.querySelector('#modalEditarTotales .btn-primary');
        btnGuardar.innerHTML = "Guardando...";
        btnGuardar.disabled = true;

        database.ref('bdtotales').set(datosGlobalesTotales).then(() => {
            var myModalEl = document.getElementById('modalEditarTotales');
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();
            
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
            btnGuardar.disabled = false;
            
            alert("¡Todos los datos del registro se actualizaron correctamente!");
        }).catch(error => {
            console.error("Error al actualizar:", error);
            btnGuardar.innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
            btnGuardar.disabled = false;
            alert("Hubo un error al guardar.");
        });
    }
};
