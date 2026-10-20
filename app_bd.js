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

console.log("1. Parámetros de Firebase Config:", firebaseConfig);

// ERROR CORREGIDO: Inicializamos Firebase SOLO UNA VEZ
// Si no hay ninguna app de Firebase iniciada, entonces inicialízala
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Si ya existe, simplemente úsala
}

const database = firebase.database();

// Variable global para guardar los datos y que el buscador funcione rápido
let datosGlobalesBd = [];

// =========================================================
// 2. DESCARGAR Y DIBUJAR DATOS EN LA TABLA (TIEMPO REAL)
// =========================================================
database.ref('bd_madre').on('value', (snapshot) => {
    let datos = snapshot.val();
    
    // ESTO TE DIRÁ QUÉ ESTÁ LLEGANDO REALMENTE (Revisa F12)
    console.log("Datos recibidos de bd_madre:", datos); 
    
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    dibujarTablaBd(datosGlobalesBd);
});

function dibujarTablaBd(datosArreglo) {
    const thead = document.getElementById('cabeceraBdMadre');
    const tbody = document.getElementById('cuerpoBdMadre');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la Base Madre. Sube una nueva remesa.</td></tr>';
        return;
    }

    // 1. Extraemos las columnas que llegaron de Firebase
    let columnas = Object.keys(datosArreglo[0]);

    // 2. ESTE ES EL ORDEN ESTRICTO BASADO EN TU IMAGEN
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

    // 3. Forzamos a las columnas a formarse en el orden de la lista
    columnas.sort((a, b) => {
        let indiceA = ordenDeseado.indexOf(a);
        let indiceB = ordenDeseado.indexOf(b);
        
        // Si hay una columna nueva que no está en la lista, la manda hasta el final
        if (indiceA === -1) indiceA = 999;
        if (indiceB === -1) indiceB = 999;
        
        return indiceA - indiceB;
    });

    // 4. ORDENAMOS LAS FILAS: De la REMESA más nueva a la más vieja
    datosArreglo.sort((a, b) => {
        const remA = String(a.REMESA || a.Remesa || '').toUpperCase();
        const remB = String(b.REMESA || b.Remesa || '').toUpperCase();
        return remB.localeCompare(remA); // Orden descendente
    });

   // Dibujamos la cabecera (thead)
    let trHead = '<tr>';
    columnas.forEach(col => {
        // Devolvemos el punto (.) y la diagonal (/) solo de manera visual para la tabla
        let nombreColumnaVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                                     .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
                                     
        // AQUÍ AGREGAMOS EL COLOR BLANCO A LA LETRA
        trHead += `<th class="text-white" style="color: white !important;">${nombreColumnaVisual}</th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    // Dibujamos el cuerpo (tbody) con los datos
    let htmlCuerpo = '';
    datosArreglo.forEach(fila => {
        htmlCuerpo += '<tr>';
        columnas.forEach(col => {
            htmlCuerpo += `<td>${fila[col] !== undefined && fila[col] !== null ? fila[col] : ''}</td>`;
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
        dibujarTablaBd(datosGlobalesBd);
        return;
    }

    const datosFiltrados = datosGlobalesBd.filter(item => {
        const remesa = String(item['Remesa'] || item['REMESA'] || '').toLowerCase();
        const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '').toLowerCase();
        const modulo = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '').toLowerCase();
        
        return remesa.includes(termino) || fecha.includes(termino) || modulo.includes(termino);
    });

    dibujarTablaBd(datosFiltrados);
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
            if (!Array.isArray(nuevosDatos)) {
                nuevosDatos = [nuevosDatos];
            }
            
            // ¡ESTO ES LO NUEVO! Imprimimos el archivo JSON en consola
            console.log("2. Datos leídos del archivo JSON:", nuevosDatos);
            
            // Usamos once() solo para leer una vez al momento de fusionar
            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

// Procesamos los datos actuales
                datosActuales.forEach(item => {
                    const rem = String(item['REMESA'] || item['Remesa'] || '');
                    // ¡AQUÍ ESTÁ LA MAGIA! Agregamos 'MODULO' en mayúsculas
                    const mod = String(item['MODULO'] || item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    if (mod && fecha) mapaRegistros.set(`${rem}_${mod}_${fecha}`, item);
                });

                // Procesamos los nuevos datos
                nuevosDatos.forEach(itemNuevo => {
                    const remNuevo = String(itemNuevo['REMESA'] || itemNuevo['Remesa'] || '');
                    // Agregamos 'MODULO' también aquí
                    const modNuevo = String(itemNuevo['MODULO'] || itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '');
                    const fechaNueva = String(itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '');
                    if (modNuevo && fechaNueva) mapaRegistros.set(`${remNuevo}_${modNuevo}_${fechaNueva}`, itemNuevo);
                });

                const datosFusionados = Array.from(mapaRegistros.values());

                // Guardamos en Firebase (esto disparará el .on() de arriba automáticamente)
                database.ref('bd_madre').set(datosFusionados).then(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Base de datos actualizada y fusionada con éxito.");
                    document.getElementById('fileInput').value = ''; 
                }).catch((error) => {
                    console.error("Error al guardar: ", error);
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Hubo un error al intentar guardar los datos en la nube.");
                });

            }).catch((error) => {
                console.error("Error al consultar Firebase: ", error);
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                alert("Error al conectar con la base de datos.");
            });

        } catch (error) {
            console.error("Error al procesar JSON: ", error);
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            alert("Error al leer el archivo JSON. Verifica que su formato sea válido.");
        }
    };
    reader.readAsText(file);
});

// =========================================================
// 5. FUNCIÓN PARA VACIAR LA BASE DE DATOS (BOTÓN ROJO)
// =========================================================
function vaciarBaseDatosGeneral() {
    // Alerta de confirmación
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de la Base Madre en la nube de forma permanente.")) {
        database.ref('bd_madre').remove()
            .then(() => {
                alert("La base de datos ha sido vaciada.");
                // No necesitamos recargar porque la función .on('value') limpiará la tabla sola
            })
            .catch((error) => {
                console.error("Error al borrar los datos: ", error);
                alert("Hubo un problema al intentar vaciar la base de datos.");
            });
    }
}
