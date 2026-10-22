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

// =========================================================
// HELPER: GENERACIÓN Y NORMALIZACIÓN DE IDMAC (INCLUYE -bis)
// =========================================================
function generarIdMac(remesa, modulo, fecha) {
    let remClean = String(remesa || '').trim().toLowerCase();
    let modClean = String(modulo || '').trim();
    let fecClean = String(fecha || '').trim().split('T')[0];
    return `${remClean}_${modClean}_${fecClean}`;
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
// 3. FUNCIONES GLOBALES PARA SUBIR ARCHIVO JSON
// =========================================================
window.abrirSelectorArchivo = function() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
    } else {
        alert("No se encontró el elemento <input id='fileInput'> en el HTML.");
    }
};

window.procesarArchivoJson = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            let jsonData = JSON.parse(event.target.result);
            if (!Array.isArray(jsonData)) {
                jsonData = [jsonData];
            }

            // Fusión inteligente en BDTO TALES usando IDMAC
            database.ref('bdtotales').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                // Cargar existentes
                datosActuales.forEach(item => {
                    const rem = item['REMESA'] || item['Remesa'] || item['remesa'] || '';
                    const mod = item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '';
                    const fec = item['FECHA'] || item['Fecha'] || item['fecha'] || '';
                    const id = item['IDMAC'] || item['idmac'] || generarIdMac(rem, mod, fec);
                    if (id && id !== '__') mapaRegistros.set(id, item);
                });

                // Insertar o actualizar con los datos del JSON nuevo
                jsonData.forEach(itemNuevo => {
                    const rem = itemNuevo['REMESA'] || itemNuevo['Remesa'] || itemNuevo['remesa'] || '';
                    const mod = itemNuevo['MODULO'] || itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '';
                    const fec = itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '';
                    const id = itemNuevo['IDMAC'] || itemNuevo['idmac'] || generarIdMac(rem, mod, fec);
                    if (!itemNuevo['IDMAC']) itemNuevo['IDMAC'] = id;
                    if (id && id !== '__') mapaRegistros.set(id, itemNuevo);
                });

                const datosFusionados = Array.from(mapaRegistros.values());

                database.ref('bdtotales').set(datosFusionados).then(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    const fileInput = document.getElementById('fileInput');
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
};

// =========================================================
// 4. BUSCADOR EN TIEMPO REAL
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const buscadorInput = document.getElementById('buscadorBd');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase().trim();
            if(termino === '') {
                ejecutarOrdenamiento(datosGlobalesBd);
                return;
            }

            const datosFiltrados = datosGlobalesBd.filter(item => {
                const idmac = String(item['IDMAC'] || item['idmac'] || '').toLowerCase();
                const remesa = String(item['REMESA'] || item['Remesa'] || item['remesa'] || '').toLowerCase();
                const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '').toLowerCase();
                const modulo = String(item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '').toLowerCase();
                return idmac.includes(termino) || remesa.includes(termino) || fecha.includes(termino) || modulo.includes(termino);
            });

            ejecutarOrdenamiento(datosFiltrados);
        });
    }
});

// =========================================================
// 5. ORDENAMIENTO DE FILAS: REMESA -> MÓDULO -> DÍA
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
// 6. NORMALIZACIÓN Y ORDENAMIENTO DE COLUMNAS SOLICITADO
// =========================================================
function normalizarNombreColumna(str) {
    return String(str || '')
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/g, "_");
}

// NUEVO ORDEN SOLICITADO COMENZANDO POR IDMAC
const ordenDeseadoPatron = [
    "IDMAC",
    "REMESA", "REMESA", "REMESA",
    "MODULO", "MODULO",
    "FECHA", "DIA", // Por si existen en el JSON original
    "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS",
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

function obtenerIndiceOrdenColumna(columnaOriginal) {
    const colNorm = normalizarNombreColumna(columnaOriginal);
    const idx = ordenDeseadoPatron.indexOf(colNorm);
    return idx !== -1 ? idx : 9999;
}

// =========================================================
// 7. CONSTRUCCIÓN DE LA TABLA EN PANTALLA
// =========================================================
function dibujarTablaBd(datosArreglo) {
    datosEnPantalla = datosArreglo; 
    const thead = document.getElementById('cabeceraBdTotales') || document.getElementById('cabeceraBdMadre');
    const tbody = document.getElementById('cuerpoBdTotales') || document.getElementById('cuerpoBdMadre');
    if(!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos registrados en BDTO TALES.</td></tr>';
        return;
    }

    // Garantizar que la propiedad IDMAC existe en cada fila
    datosArreglo.forEach(fila => {
        const r = fila.REMESA || fila.Remesa || fila.remesa || '';
        const m = fila.MODULO || fila.MÓDULO || fila.Módulo || fila.Modulo || '';
        const f = fila.FECHA || fila.Fecha || fila.fecha || '';
        if (!fila['IDMAC'] && !fila['idmac']) {
            fila['IDMAC'] = generarIdMac(r, m, f);
        }
    });

    let columnasSet = new Set();
    datosArreglo.forEach(item => {
        Object.keys(item).forEach(k => columnasSet.add(k));
    });
    let columnas = Array.from(columnasSet);

    columnas.sort((a, b) => {
        let idxA = obtenerIndiceOrdenColumna(a);
        let idxB = obtenerIndiceOrdenColumna(b);
        if (idxA === idxB) {
            return a.localeCompare(b);
        }
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
    datosArreglo.forEach((fila) => {
        const remFila = fila.REMESA || fila.Remesa || fila.remesa || '';
        const modFila = fila.MODULO || fila.MÓDULO || fila.Módulo || fila.Modulo || '';
        const fechaFila = fila.FECHA || fila.Fecha || fila.fecha || '';

        htmlCuerpo += '<tr>';
        htmlCuerpo += `<td class="text-center align-middle" style="white-space: nowrap;">
                            <button class="btn btn-sm btn-warning text-dark py-0 px-1 me-1" onclick="editarRegistroLinea('${remFila}', '${modFila}', '${fechaFila}')" title="Editar registro">
                                <i class="bi bi-pencil-square" style="font-size: 0.85rem;"></i>
                            </button>
                            <button class="btn btn-sm btn-danger py-0 px-1" onclick="borrarRegistroLinea('${remFila}', '${modFila}', '${fechaFila}')" title="Eliminar registro">
                                <i class="bi bi-trash" style="font-size: 0.85rem;"></i>
                            </button>
                       </td>`;

        columnas.forEach(col => {
            let valorCelda = fila[col] !== undefined && fila[col] !== null ? fila[col] : '';

            // Limpieza del formato ISO a YYYY-MM-DD
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
// 8. MANTENIMIENTO Y FUNCIONES GLOBALES
// =========================================================
window.vaciarBaseDatosGeneral = function() {
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de BDTO TALES en la nube.")) {
        database.ref('bdtotales').remove()
            .then(() => alert("BDTO TALES ha sido vaciada."))
            .catch(() => alert("Hubo un problema al vaciar los datos."));
    }
};

window.descargarRespaldoJSON = function() {
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

window.borrarRegistroLinea = function(remesa, modulo, fecha) {
    if(confirm(`¿Estás seguro de eliminar el registro del Módulo ${modulo}, Remesa ${remesa}, Fecha ${fecha}?`)) {
        const targetId = generarIdMac(remesa, modulo, fecha);
        const datosRestantes = datosGlobalesBd.filter(item => {
            const r = item.REMESA || item.Remesa || item.remesa || '';
            const m = item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '';
            const f = item.FECHA || item.Fecha || item.fecha || '';
            const id = item.IDMAC || item.idmac || generarIdMac(r, m, f);
            return id !== targetId;
        });

        database.ref('bdtotales').set(datosRestantes)
            .then(() => console.log("Registro eliminado correctamente de BDTO TALES."))
            .catch(() => alert("Hubo un error al intentar eliminar la fila."));
    }
};

window.editarRegistroLinea = function(remesa, modulo, fecha) {
    const targetId = generarIdMac(remesa, modulo, fecha);
    const registroIndex = datosGlobalesBd.findIndex(item => {
        const r = item.REMESA || item.Remesa || item.remesa || '';
        const m = item.MODULO || item.MÓDULO || item.Módulo || item.Modulo || '';
        const f = item.FECHA || item.Fecha || item.fecha || '';
        const id = item.IDMAC || item.idmac || generarIdMac(r, m, f);
        return id === targetId;
    });

    if (registroIndex === -1) {
        alert("No se encontró el registro para editar.");
        return;
    }

    let registro = datosGlobalesBd[registroIndex];
    let campoEditar = prompt("Escribe el nombre de la columna que deseas modificar (ej. TOTAL_DE_FOLIOS, INSCRIPCIONES, TOTAL_DE_TRAMITES):");
    if (!campoEditar) return;
    
    campoEditar = campoEditar.trim();
    if (registro[campoEditar] === undefined) {
        alert(`El campo "${campoEditar}" no existe en este registro.`);
        return;
    }

    let valorActual = registro[campoEditar];
    let nuevoValor = prompt(`Modificando "${campoEditar}"\nValor actual: ${valorActual}\nEscribe el nuevo valor:`, valorActual);
    
    if (nuevoValor === null) return;

    registro[campoEditar] = nuevoValor;
    datosGlobalesBd[registroIndex] = registro;

    database.ref('bdtotales').set(datosGlobalesBd)
        .then(() => alert("¡Registro actualizado con éxito en BDTO TALES!"))
        .catch(() => alert("Error al guardar la modificación en la nube."));
};
