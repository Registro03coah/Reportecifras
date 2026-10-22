// =========================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (cifrasmac)
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

let datosGlobalesBd = [];
let datosEnPantalla = [];
let columnaOrdenActual = 'REMESA';
let ordenAscendente = false; 
let idmacEdicionActual = null;

// =========================================================
// HELPERS DE FORMACIÓN DE IDMAC Y NORMALIZACIÓN DE COLUMNAS
// =========================================================

// Estructura IDMAC: [2 dígitos Módulo][2 dígitos Año][2 dígitos Remesa][Sufijo -bis]
function generarIdMac(remesa, modulo, fecha) {
    // 1. Módulo: últimos 2 dígitos (ej. "0301" -> "01", "050351" -> "51")
    let modStr = String(modulo || '').replace(/\D/g, '');
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';

    // 2. Año: últimos 2 dígitos del año de la fecha (ej. "2026" -> "26")
    let fecStr = String(fecha || '').trim();
    let yearMatch = fecStr.match(/(20\d{2}|\d{4}|\d{2})/);
    let yrDigits = '00';
    if (yearMatch) {
        let yr = yearMatch[1];
        yrDigits = yr.slice(-2);
    }

    // 3. Remesa: últimos 2 dígitos + sufijo (-bis, -bis2, -Bis, -Bis2, etc.)
    let remStr = String(remesa || '').trim();
    let remMatch = remStr.match(/(\d+)\s*(-?\s*bis\d*)?/i);
    let numPart = '00';
    let suffix = '';

    if (remMatch) {
        let n = remMatch[1];
        numPart = n.length >= 2 ? n.slice(-2) : n.padStart(2, '0');
        if (remMatch[2]) {
            suffix = remMatch[2].replace(/\s+/g, '');
            if (!suffix.startsWith('-')) {
                suffix = '-' + suffix;
            }
        }
    }

    return `${modDigits}${yrDigits}${numPart}${suffix}`;
}

function normalizarNombreColumna(str) {
    return String(str || '')
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "_");
}

function obtenerClaveCanonica(key) {
    const norm = normalizarNombreColumna(key);
    if (norm === 'REMESA') return 'REMESA';
    if (norm === 'MODULO' || norm === 'MODULOS') return 'MODULO';
    if (norm === 'FECHA') return 'FECHA';
    if (norm === 'DIA' || norm === 'DIA_') return 'DIA';
    if (norm === 'IDMAC') return 'IDMAC';
    return key;
}

// =========================================================
// 2. LECTURA EN TIEMPO REAL DESDE BDTO TALES
// =========================================================
database.ref('bdtotales').on('value', (snapshot) => {
    let datos = snapshot.val();
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    ejecutarOrdenamiento(datosGlobalesBd);
});

// =========================================================
// 3. EVENTOS LISTENERS (SUBIR JSON Y BUSCADOR)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnSubir = document.getElementById('btnSubirTotales');
    const fileInput = document.getElementById('fileInputTotales');

    if (btnSubir && fileInput) {
        btnSubir.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', procesarArchivoJson);
    }

    const buscadorInput = document.getElementById('buscadorBdTotales');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase().trim();
            if(termino === '') {
                ejecutarOrdenamiento(datosGlobalesBd);
                return;
            }

            const datosFiltrados = datosGlobalesBd.filter(item => {
                const rem = item['REMESA'] || item['Remesa'] || item['remesa'] || '';
                const mod = item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '';
                const fec = item['FECHA'] || item['Fecha'] || item['fecha'] || '';
                const idmacCalculado = generarIdMac(rem, mod, fec).toLowerCase();

                const idmac = String(item['IDMAC'] || idmacCalculado).toLowerCase();
                const remesa = String(rem).toLowerCase();
                const fecha = String(fec).toLowerCase();
                const modulo = String(mod).toLowerCase();
                return idmac.includes(termino) || remesa.includes(termino) || fecha.includes(termino) || modulo.includes(termino);
            });

            ejecutarOrdenamiento(datosFiltrados);
        });
    }
});

function procesarArchivoJson(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            let jsonData = JSON.parse(event.target.result);
            if (!Array.isArray(jsonData)) jsonData = [jsonData];

            database.ref('bdtotales').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                datosActuales.forEach(item => {
                    const rem = item['REMESA'] || item['Remesa'] || item['remesa'] || '';
                    const mod = item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '';
                    const fec = item['FECHA'] || item['Fecha'] || item['fecha'] || '';
                    const id = generarIdMac(rem, mod, fec);
                    item['IDMAC'] = id;
                    if (id && id !== '000000') mapaRegistros.set(id, item);
                });

                jsonData.forEach(itemNuevo => {
                    const rem = itemNuevo['REMESA'] || itemNuevo['Remesa'] || itemNuevo['remesa'] || '';
                    const mod = itemNuevo['MODULO'] || itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '';
                    const fec = itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '';
                    const id = generarIdMac(rem, mod, fec);
                    itemNuevo['IDMAC'] = id;
                    if (id && id !== '000000') mapaRegistros.set(id, itemNuevo);
                });

                const datosFusionados = Array.from(mapaRegistros.values());

                database.ref('bdtotales').set(datosFusionados).then(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    const fileInput = document.getElementById('fileInputTotales');
                    if (fileInput) fileInput.value = ''; 
                    alert("¡Datos subidos e integrados correctamente en BDTO TALES!");
                }).catch((error) => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Error subiendo a Firebase: " + error.message);
                });

            }).catch((error) => {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                alert("Error al consultar Firebase: " + error.message);
            });

        } catch (err) {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            alert('Error al leer el archivo JSON. Verifica que la estructura sea válida.');
        }
    };
    reader.readAsText(file);
}

// =========================================================
// 4. ORDENAMIENTO DE FILAS: REMESA -> MÓDULO -> DÍA
// =========================================================
function ejecutarOrdenamiento(arregloA_Ordenar) {
    if(!arregloA_Ordenar || arregloA_Ordenar.length === 0) {
        dibujarTablaBd([]);
        return;
    }

    let arregloOrdenado = [...arregloA_Ordenar];

    const ordenDias = {
        "lunes": 1, "martes": 2, "miércoles": 3, "miercoles": 3, 
        "jueves": 4, "viernes": 5, "sábado": 6, "sabado": 6,    
        "domingo": 7, "linea totales": 8, "totales": 8
    };

    arregloOrdenado.sort((a, b) => {
        let remesaA = String(a['REMESA'] || a['Remesa'] || a['remesa'] || '').trim();
        let remesaB = String(b['REMESA'] || b['Remesa'] || b['remesa'] || '').trim();
        if (remesaA !== remesaB) {
            return remesaB.localeCompare(remesaA, undefined, { numeric: true });
        }

        let moduloA = String(a['MODULO'] || a['MÓDULO'] || a['Módulo'] || a['Modulo'] || a['modulo'] || '').trim();
        let moduloB = String(b['MODULO'] || b['MÓDULO'] || b['Módulo'] || b['Modulo'] || b['modulo'] || '').trim();
        if (moduloA !== moduloB) {
            return moduloA.localeCompare(moduloB, undefined, { numeric: true });
        }

        let diaA = String(a['DIA'] || a['DÍA'] || a['Dia'] || a['dia'] || '').trim().toLowerCase();
        let diaB = String(b['DIA'] || b['DÍA'] || b['Dia'] || b['dia'] || '').trim().toLowerCase();
        
        let valorDiaA = ordenDias[diaA] !== undefined ? ordenDias[diaA] : 99; 
        let valorDiaB = ordenDias[diaB] !== undefined ? ordenDias[diaB] : 99;

        if (valorDiaA !== valorDiaB) {
            return valorDiaA - valorDiaB; 
        }

        return 0;
    });

    dibujarTablaBd(arregloOrdenado);
}

window.cambiarOrden = function(columnaClick) {
    if (columnaOrdenActual === columnaClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = columnaClick;
        ordenAscendente = false;
    }
    ejecutarOrdenamiento(datosEnPantalla);
};

// =========================================================
// 5. PATRÓN DE COLUMNAS BD TOTALES
// =========================================================
const ordenDeseadoPatronBdTotales = [
    "IDMAC", "REMESA", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO",
    "REPOSISION", "REPOSICION", "CORR__DE_DATOS_DIRECCION", "CORR_DE_DATOS_DIRECCION",
    "REINCORPORACION", "REEMPLAZO", "TOTAL_DE_TRAMITES",
    "RECHAZOS_DE_MAC_34", "34_IMAGEN_INCONSISTENTE", "RECHAZOS_DE_MAC_35", "35_MOVIMIENTO_POSTERIOR",
    "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", "CIF_05", "CIF-05", "SOLICITUD_EXPEDICION",
    "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO",
    "INICIALES_A", "INICIALES_S", "INICIALES_C", "ACTUALIZACION", "ACTUALIZACIÓN", "RECIBIDAS_DE_OTROS_TIPOS",
    "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO",
    "SOLICITU_DE_REIMPRESION", "SOLICITUD_DE_REIMPRESION", "REIMPRESION", "RECIBO_Y_O_EXTRAVIO",
    "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES",
    "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS",
    "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA",
    "DIAS_TRABAJADOS", "CONFIGURACION"
].map(normalizarNombreColumna);

function obtenerIndiceOrdenBdTotales(columnaOriginal) {
    const colNorm = normalizarNombreColumna(columnaOriginal);
    const idx = ordenDeseadoPatronBdTotales.indexOf(colNorm);
    return idx !== -1 ? idx : 9999;
}

// =========================================================
// 6. CONSTRUCCIÓN DE LA TABLA EN PANTALLA
// =========================================================
function dibujarTablaBd(datosArreglo) {
    datosEnPantalla = datosArreglo; 
    const thead = document.getElementById('cabeceraBdTotales');
    const tbody = document.getElementById('cuerpoBdTotales');
    if(!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos registrados en BDTO TALES.</td></tr>';
        return;
    }

    const datosNormalizados = datosArreglo.map(item => {
        let obj = {};
        Object.keys(item).forEach(k => {
            let cleanKey = obtenerClaveCanonica(k);
            if (obj[cleanKey] === undefined || obj[cleanKey] === '' || obj[cleanKey] === null) {
                obj[cleanKey] = item[k];
            }
        });
        
        // Recalcular siempre IDMAC con la fórmula especificada
        obj['IDMAC'] = generarIdMac(obj['REMESA'], obj['MODULO'], obj['FECHA']);
        return obj;
    });

    let columnasSet = new Set();
    datosNormalizados.forEach(item => {
        Object.keys(item).forEach(k => columnasSet.add(k));
    });
    let columnas = Array.from(columnasSet);

    columnas.sort((a, b) => {
        let idxA = obtenerIndiceOrdenBdTotales(a);
        let idxB = obtenerIndiceOrdenBdTotales(b);
        if (idxA === idxB) return a.localeCompare(b);
        return idxA - idxB;
    });

    let trHead = '<tr>';
    trHead += `<th class="text-white text-center" style="color: white !important; min-width: 100px; vertical-align: top;">ACCIONES</th>`;

    columnas.forEach(col => {
        let nombreColumnaVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                                     .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        
        let iconoFlechita = '<i class="bi bi-arrow-down-up ms-1" style="font-size: 0.8em; color: rgba(255,255,255,0.4);"></i>';
        if (columnaOrdenActual === col) {
            iconoFlechita = ordenAscendente ? '<i class="bi bi-caret-up-fill text-warning ms-1"></i>' : '<i class="bi bi-caret-down-fill text-warning ms-1"></i>';
        }

        trHead += `<th class="text-white" style="color: white !important; cursor: pointer; user-select: none; white-space: normal; word-wrap: break-word; min-width: 120px; resize: horizontal; overflow: hidden; vertical-align: top;" onclick="cambiarOrden('${col}')" title="Clic para ordenar">
                        ${nombreColumnaVisual} ${iconoFlechita}
                   </th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    let htmlCuerpo = '';
    datosNormalizados.forEach((fila) => {
        const idmacFila = fila.IDMAC || generarIdMac(fila.REMESA, fila.MODULO, fila.FECHA);

        htmlCuerpo += '<tr>';
        htmlCuerpo += `<td class="text-center align-middle" style="white-space: nowrap;">
                            <button class="btn btn-sm btn-warning text-dark py-0 px-1 me-1" onclick="editarRegistroLinea('${idmacFila}')" title="Editar registro completo">
                                <i class="bi bi-pencil-square" style="font-size: 0.85rem;"></i>
                            </button>
                            <button class="btn btn-sm btn-danger py-0 px-1" onclick="borrarRegistroLinea('${idmacFila}')" title="Eliminar registro">
                                <i class="bi bi-trash" style="font-size: 0.85rem;"></i>
                            </button>
                       </td>`;

        columnas.forEach(col => {
            let valorCelda = fila[col] !== undefined && fila[col] !== null ? fila[col] : '';

            if (typeof valorCelda === 'string' && valorCelda.includes('T00:00:00')) {
                valorCelda = valorCelda.split('T')[0];
            }

            htmlCuerpo += `<td class="align-middle">${valorCelda}</td>`;
        });
        htmlCuerpo += '</tr>';
    });
    tbody.innerHTML = htmlCuerpo;
}

// =========================================================
// 7. EDICIÓN EN VENTANA FLOTANTE (MODAL COMPLETO)
// =========================================================
window.editarRegistroLinea = function(idmac) {
    idmacEdicionActual = idmac;
    const registro = datosGlobalesBd.find(item => {
        const r = item.REMESA || item.Remesa || item.remesa || '';
        const m = item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '';
        const f = item.FECHA || item.Fecha || item.fecha || '';
        const id = item.IDMAC || item.idmac || generarIdMac(r, m, f);
        return id === idmac;
    });

    if (!registro) {
        alert("No se encontró el registro para editar.");
        return;
    }

    const contenedor = document.getElementById('contenedorCamposDinamicos');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    let llaves = Object.keys(registro);

    llaves.forEach(clave => {
        let valor = registro[clave] !== undefined && registro[clave] !== null ? registro[clave] : '';
        if (typeof valor === 'string' && valor.includes('T00:00:00')) {
            valor = valor.split('T')[0];
        }

        let nombreVisual = clave.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                                .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');

        const colDiv = document.createElement('div');
        colDiv.className = 'col-md-6 mb-3';
        colDiv.innerHTML = `
            <label class="form-label fw-bold text-secondary" style="font-size: 0.85rem;">
                ${nombreVisual} <small class="text-muted">(${clave})</small>
            </label>
            <div class="input-group">
                <input type="text" class="form-control campo-dinamico-totales" data-clave="${clave}" value="${valor}">
                <button class="btn btn-outline-danger" type="button" onclick="eliminarCampoFormulario(this)" title="Eliminar este campo de este registro">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        contenedor.appendChild(colDiv);
    });

    const modalElement = document.getElementById('modalEditarTotales');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

window.eliminarCampoFormulario = function(btn) {
    if (confirm("¿Deseas eliminar este campo de este registro?")) {
        const colDiv = btn.closest('.col-md-6');
        if (colDiv) colDiv.remove();
    }
};

window.guardarEdicionTotales = function() {
    if (!idmacEdicionActual) return;

    const registroIndex = datosGlobalesBd.findIndex(item => {
        const r = item.REMESA || item.Remesa || item.remesa || '';
        const m = item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '';
        const f = item.FECHA || item.Fecha || item.fecha || '';
        const id = item.IDMAC || item.idmac || generarIdMac(r, m, f);
        return id === idmacEdicionActual;
    });

    if (registroIndex === -1) {
        alert("Error: no se encontró el registro para actualizar.");
        return;
    }

    const inputs = document.querySelectorAll('.campo-dinamico-totales');
    let nuevoRegistro = {};

    inputs.forEach(input => {
        const clave = input.getAttribute('data-clave');
        const valor = input.value.trim();
        nuevoRegistro[clave] = valor;
    });

    // Recalcular IDMAC por si se modificó Módulo, Fecha o Remesa
    const rem = nuevoRegistro['REMESA'] || nuevoRegistro['Remesa'] || '';
    const mod = nuevoRegistro['MODULO'] || nuevoRegistro['Modulo'] || '';
    const fec = nuevoRegistro['FECHA'] || nuevoRegistro['Fecha'] || '';
    nuevoRegistro['IDMAC'] = generarIdMac(rem, mod, fec);

    datosGlobalesBd[registroIndex] = nuevoRegistro;

    database.ref('bdtotales').set(datosGlobalesBd)
        .then(() => {
            const modalElement = document.getElementById('modalEditarTotales');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            alert("¡Registro actualizado con éxito en la nube!");
        })
        .catch((error) => {
            alert("Error al guardar la modificación: " + error.message);
        });
};

// =========================================================
// 8. FUNCIONES GLOBALES DE ADMINISTRACIÓN
// =========================================================
window.vaciarBaseTotales = function() {
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de BDTO TALES en la nube.")) {
        database.ref('bdtotales').remove()
            .then(() => alert("BDTO TALES ha sido vaciada."))
            .catch(() => alert("Hubo un problema al vaciar los datos."));
    }
};

window.descargarRespaldoTotalesJSON = function() {
    if (datosGlobalesBd.length === 0) {
        alert("No hay datos en BDTO TALES para respaldar.");
        return;
    }
    
    const jsonString = JSON.stringify(datosGlobalesBd, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let hoy = new Date();
    let fechaTxt = hoy.getFullYear() + "-" + (hoy.getMonth()+1).toString().padStart(2, '0') + "-" + hoy.getDate().toString().padStart(2, '0');
    a.download = `bdtotales_respaldo_${fechaTxt}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.borrarRegistroLinea = function(idmac) {
    if(confirm(`¿Estás seguro de eliminar el registro ${idmac}?`)) {
        const datosRestantes = datosGlobalesBd.filter(item => {
            const r = item.REMESA || item.Remesa || item.remesa || '';
            const m = item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '';
            const f = item.FECHA || item.Fecha || item.fecha || '';
            const id = item.IDMAC || item.idmac || generarIdMac(r, m, f);
            return id !== idmac;
        });

        database.ref('bdtotales').set(datosRestantes)
            .then(() => alert("Registro eliminado correctamente de BDTO TALES."))
            .catch(() => alert("Hubo un error al intentar eliminar la fila."));
    }
};
