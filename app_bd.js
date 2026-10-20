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

// Si no hay ninguna app de Firebase iniciada, entonces inicialízala
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Si ya existe, simplemente úsala
}

const database = firebase.database();

// Variables globales para los datos, buscador y ordenamiento
let datosGlobalesBd = [];
let datosEnPantalla = [];
let columnaOrdenActual = 'REMESA';
let ordenAscendente = false; // Falso = de mayor a menor

// =========================================================
// 2. DESCARGAR Y DIBUJAR DATOS EN LA TABLA (TIEMPO REAL)
// =========================================================
database.ref('bd_madre').on('value', (snapshot) => {
    let datos = snapshot.val();
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    
    // Al descargar, ordenamos por REMESA (de más nueva a más vieja) por defecto
    columnaOrdenActual = 'REMESA';
    ordenAscendente = false;
    ejecutarOrdenamiento(datosGlobalesBd); 
});

// Función que ordena los datos
function ejecutarOrdenamiento(arregloA_Ordenar) {
    if(!arregloA_Ordenar || arregloA_Ordenar.length === 0) {
        dibujarTablaBd([]);
        return;
    }

    arregloA_Ordenar.sort((a, b) => {
        let valA = a[columnaOrdenActual] !== undefined && a[columnaOrdenActual] !== null ? String(a[columnaOrdenActual]).toUpperCase() : '';
        let valB = b[columnaOrdenActual] !== undefined && b[columnaOrdenActual] !== null ? String(b[columnaOrdenActual]).toUpperCase() : '';

        // Si son números, los ordenamos matemáticamente
        if (!isNaN(valA) && !isNaN(valB) && valA.trim() !== '' && valB.trim() !== '') {
            valA = Number(valA);
            valB = Number(valB);
        }

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    dibujarTablaBd(arregloA_Ordenar);
}

// Función activada por clic en cabecera
function cambiarOrden(columnaClick) {
    if (columnaOrdenActual === columnaClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = columnaClick;
        ordenAscendente = false;
    }
    ejecutarOrdenamiento(datosEnPantalla);
}

function dibujarTablaBd(datosArreglo) {
    datosEnPantalla = datosArreglo; 
    const thead = document.getElementById('cabeceraBdMadre');
    const tbody = document.getElementById('cuerpoBdMadre');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la Base Madre. Sube una nueva remesa.</td></tr>';
        return;
    }

    let columnas = Object.keys(datosArreglo[0]);

    // Orden estricto deseado
    const ordenDeseado = [
        "MODULO", "REMESA", "FECHA", "DIA", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
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
        "registradas_por_dia", "faltantes", "observaciones", "sin_nombre1", "sin_nombre2", "sin_nombre3",
        "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA", "IMPORTADAS", "EXPORTADAS", "REPOSISION_+_REIMPRESIONES",
        "MAL_IMPRESAS", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION",
        "PERDIDA_DE_VIGENCIA", "MOY_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
    ];

    columnas.sort((a, b) => {
        let indiceA = ordenDeseado.indexOf(a);
        let indiceB = ordenDeseado.indexOf(b);
        if (indiceA === -1) indiceA = 999;
        if (indiceB === -1) indiceB = 999;
        return indiceA - indiceB;
    });

    // --- DIBUJAMOS CABECERA ---
    let trHead = '<tr>';
    
    // Columna de acciones al principio o al final (la ponemos al inicio para acceso rápido)
    trHead += `<th class="text-white text-center" style="color: white !important; min-width: 80px; vertical-align: top;">ACCIONES</th>`;

    columnas.forEach(col => {
        let nombreColumnaVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                                     .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        
        let iconoFlechita = '<i class="bi bi-arrow-down-up ms-1" style="font-size: 0.8em; color: rgba(255,255,255,0.4);"></i>';
        if (columnaOrdenActual === col) {
            iconoFlechita = ordenAscendente 
                            ? '<i class="bi bi-caret-up-fill text-warning ms-1"></i>' 
                            : '<i class="bi bi-caret-down-fill text-warning ms-1"></i>';
        }

        // Estilos añadidos: white-space: normal (baja de línea), resize: horizontal (permite cambiar ancho manual)
        trHead += `<th class="text-white" style="color: white !important; cursor: pointer; user-select: none; white-space: normal; word-wrap: break-word; min-width: 120px; resize: horizontal; overflow: hidden; vertical-align: top;" onclick="cambiarOrden('${col}')" title="Clic para ordenar o arrastra el borde derecho para cambiar ancho">
                        ${nombreColumnaVisual} ${iconoFlechita}
                   </th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    // --- DIBUJAMOS CUERPO ---
    let htmlCuerpo = '';
    datosArreglo.forEach(fila => {
        // Variables clave para poder borrar esta fila
        const remFila = fila.REMESA || fila.Remesa || '';
        const modFila = fila.MODULO || fila.MÓDULO || fila.Módulo || '';
        const fechaFila = fila.FECHA || fila.Fecha || '';

        htmlCuerpo += '<tr>';
        
        // Botón de eliminar por línea
        htmlCuerpo += `<td class="text-center align-middle">
                            <button class="btn btn-sm btn-danger" onclick="borrarRegistroLinea('${remFila}', '${modFila}', '${fechaFila}')" title="Eliminar registro">
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

// =========================================================
// 3. BUSCADOR EN TIEMPO REAL
// =========================================================
document.getElementById('buscadorBd').addEventListener('input', function(e) {
    const termino = e.target.value.toLowerCase();
    if(termino.trim() === '') {
        ejecutarOrdenamiento(datosGlobalesBd);
        return;
    }

    const datosFiltrados = datosGlobalesBd.filter(item => {
        const remesa = String(item['REMESA'] || item['Remesa'] || '').toLowerCase();
        const fecha = String(item['FECHA'] || item['Fecha'] || '').toLowerCase();
        const modulo = String(item['MODULO'] || item['MÓDULO'] || item['Módulo'] || '').toLowerCase();
        return remesa.includes(termino) || fecha.includes(termino) || modulo.includes(termino);
    });

    ejecutarOrdenamiento(datosFiltrados);
});

// =========================================================
// 4. EVENTOS PARA SUBIR Y PROCESAR EL ARCHIVO JSON
// =========================================================
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            let nuevosDatos = JSON.parse(event.target.result);
            if (!Array.isArray(nuevosDatos)) nuevosDatos = [nuevosDatos];

            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                // Limpiador de símbolos prohibidos por Firebase (. # $ / [ ])
                function limpiarObjetoParaFirebase(obj) {
                    let nuevoObj = {};
                    for (let key in obj) {
                        let cleanKey = key.replace(/[.#$/\[\]]/g, '_');
                        nuevoObj[cleanKey] = obj[key];
                    }
                    return nuevoObj;
                }

                // Procesamos actuales
                datosActuales.forEach(item => {
                    const rem = String(item['REMESA'] || item['Remesa'] || '');
                    const mod = String(item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    if (mod && fecha) mapaRegistros.set(`${rem}_${mod}_${fecha}`, limpiarObjetoParaFirebase(item));
                });

                // Procesamos nuevos
                nuevosDatos.forEach(itemNuevo => {
                    const remNuevo = String(itemNuevo['REMESA'] || itemNuevo['Remesa'] || '');
                    const modNuevo = String(itemNuevo['MODULO'] || itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '');
                    const fechaNueva = String(itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '');
                    if (modNuevo && fechaNueva) mapaRegistros.set(`${remNuevo}_${modNuevo}_${fechaNueva}`, limpiarObjetoParaFirebase(itemNuevo));
                });

                const datosFusionados = Array.from(mapaRegistros.values());

                database.ref('bd_madre').set(datosFusionados).then(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Base de datos actualizada con éxito.");
                    document.getElementById('fileInput').value = ''; 
                }).catch((error) => {
                    console.error("Error al guardar: ", error);
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Error al guardar los datos en la nube.");
                });

            }).catch((error) => {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                alert("Error al conectar con la base de datos.");
            });

        } catch (error) {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            alert("Error al leer el archivo JSON.");
        }
    };
    reader.readAsText(file);
});

// =========================================================
// 5. FUNCIÓN PARA VACIAR LA BASE DE DATOS (BOTÓN ROJO)
// =========================================================
function vaciarBaseDatosGeneral() {
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de la Base Madre en la nube.")) {
        database.ref('bd_madre').remove()
            .then(() => alert("La base de datos ha sido vaciada."))
            .catch((error) => alert("Hubo un problema al vaciar."));
    }
}

// =========================================================
// 6. NUEVA FUNCIÓN: RESPALDAR DATOS A JSON
// =========================================================
function descargarRespaldoJSON() {
    if (datosGlobalesBd.length === 0) {
        alert("No hay datos en la base para respaldar.");
        return;
    }
    
    // Convertir a texto JSON formateado
    const jsonString = JSON.stringify(datosGlobalesBd, null, 2);
    
    // Crear el archivo virtual
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Crear enlace oculto y hacer clic automático
    const a = document.createElement('a');
    a.href = url;
    
    // Nombre del archivo con fecha
    let hoy = new Date();
    let fechaTxt = hoy.getFullYear() + "-" + (hoy.getMonth()+1).toString().padStart(2, '0') + "-" + hoy.getDate().toString().padStart(2, '0');
    a.download = `bd_madre_respaldo_${fechaTxt}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    // Limpieza
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// =========================================================
// 7. NUEVA FUNCIÓN: BORRAR REGISTRO POR LÍNEA
// =========================================================
function borrarRegistroLinea(remesa, modulo, fecha) {
    if(confirm(`¿Estás seguro de eliminar el registro del Módulo ${modulo}, Remesa ${remesa}, Fecha ${fecha}?`)) {
        
        // Filtramos para quedarnos con todos EXCEPTO el que coincida con estos 3 datos
        const datosRestantes = datosGlobalesBd.filter(item => {
            const r = String(item.REMESA || item.Remesa || '');
            const m = String(item.MODULO || item.MÓDULO || item.Módulo || '');
            const f = String(item.FECHA || item.Fecha || '');
            
            return !(r === String(remesa) && m === String(modulo) && f === String(fecha));
        });

        // Actualizamos Firebase con el arreglo sin ese registro
        database.ref('bd_madre').set(datosRestantes)
            .then(() => {
                // No necesitamos alert porque la tabla se recarga sola con .on('value')
                console.log("Registro eliminado correctamente.");
            })
            .catch((error) => {
                console.error("Error al eliminar registro:", error);
                alert("Hubo un error al intentar eliminar la fila.");
            });
    }
}
            });
    }
}
