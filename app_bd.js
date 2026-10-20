// =========================================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (cifrasmac)
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
// LECTURA EN TIEMPO REAL DESDE BD_MADRE
// =========================================================
database.ref('bd_madre').on('value', (snapshot) => {
    let datos = snapshot.val();
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    ejecutarOrdenamiento(datosGlobalesBd);
});

function ejecutarOrdenamiento(arregloA_Ordenar) {
    if(!arregloA_Ordenar || arregloA_Ordenar.length === 0) {
        dibujarTablaBd([]);
        return;
    }

    let arregloOrdenado = [...arregloA_Ordenar];

    arregloOrdenado.sort((a, b) => {
        let valA = a[columnaOrdenActual] !== undefined && a[columnaOrdenActual] !== null ? String(a[columnaOrdenActual]).trim() : '';
        let valB = b[columnaOrdenActual] !== undefined && b[columnaOrdenActual] !== null ? String(b[columnaOrdenActual]).trim() : '';

        let numA = parseFloat(valA);
        let numB = parseFloat(valB);
        let esNumA = !isNaN(numA) && valA !== '';
        let esNumB = !isNaN(numB) && valB !== '';

        if (esNumA && esNumB) {
            if (numA < numB) return ordenAscendente ? -1 : 1;
            if (numA > numB) return ordenAscendente ? 1 : -1;
            return 0;
        } else {
            valA = valA.toUpperCase();
            valB = valB.toUpperCase();
            if (valA < valB) return ordenAscendente ? -1 : 1;
            if (valA > valB) return ordenAscendente ? 1 : -1;
            return 0;
        }
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

function dibujarTablaBd(datosArreglo) {
    datosEnPantalla = datosArreglo; 
    const thead = document.getElementById('cabeceraBdMadre');
    const tbody = document.getElementById('cuerpoBdMadre');
    if(!thead || !tbody) return;

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos registrados en BD Madre.</td></tr>';
        return;
    }

    let columnas = Object.keys(datosArreglo[0]);

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

    let trHead = '<tr>';
    trHead += `<th class="text-white text-center" style="color: white !important; min-width: 80px; vertical-align: top;">ACCIONES</th>`;

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
    datosArreglo.forEach(fila => {
        const remFila = fila.REMESA || fila.Remesa || '';
        const modFila = fila.MODULO || fila.MÓDULO || fila.Módulo || '';
        const fechaFila = fila.FECHA || fila.Fecha || '';

        htmlCuerpo += '<tr>';
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
const buscadorInput = document.getElementById('buscadorBd');
if (buscadorInput) {
    buscadorInput.addEventListener('input', function(e) {
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
}

// =========================================================
// 4. FUNCIONES GLOBALES (Vaciar, Respaldar, Borrar Fila)
// =========================================================
window.vaciarBaseDatosGeneral = function() {
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de BD Madre en la nube.")) {
        database.ref('bd_madre').remove()
            .then(() => alert("La Base Madre ha sido vaciada."))
            .catch(() => alert("Hubo un problema al vaciar."));
    }
};

window.descargarRespaldoJSON = function() {
    if (datosGlobalesBd.length === 0) {
        alert("No hay datos en la base para respaldar.");
        return;
    }
    
    const jsonString = JSON.stringify(datosGlobalesBd, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let hoy = new Date();
    let fechaTxt = hoy.getFullYear() + "-" + (hoy.getMonth()+1).toString().padStart(2, '0') + "-" + hoy.getDate().toString().padStart(2, '0');
    a.download = `bd_madre_respaldo_${fechaTxt}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.borrarRegistroLinea = function(remesa, modulo, fecha) {
    if(confirm(`¿Estás seguro de eliminar el registro del Módulo ${modulo}, Remesa ${remesa}, Fecha ${fecha}?`)) {
        const datosRestantes = datosGlobalesBd.filter(item => {
            const r = String(item.REMESA || item.Remesa || '');
            const m = String(item.MODULO || item.MÓDULO || item.Módulo || '');
            const f = String(item.FECHA || item.Fecha || '');
            
            return !(r === String(remesa) && m === String(modulo) && f === String(fecha));
        });

        database.ref('bd_madre').set(datosRestantes)
            .then(() => console.log("Registro eliminado correctamente de BD Madre."))
            .catch(() => alert("Hubo un error al intentar eliminar la fila."));
    }
};
