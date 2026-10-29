// Configuración de Firebase
const firebaseConfig = {  
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",  
    authDomain: "cifrasmac.firebaseapp.com",  
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",  
    projectId: "cifrasmac"  
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let datosTemporalesCarga = [];

// Lista oficial y estandarizada de columnas para BD Totales y Gráficas
const COLUMNAS_ESTANDAR_TOTALES = [
    "IDMAC", "DIA", "FECHA", "HORAS_TRABAJADAS", "SEDES", "INICIAL", "FINAL",
    "TOTAL_DE_FOLIOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES",
    "CAMBIO_DE_DOMICILIO", "REPOSICION", "CORR_DE_DATOS_DIRECCION",
    "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CRED_PROD_CANJE_POR_NUEVA",  
    "DISPONIBLES_AL_DIA_ANTERIOR", "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS",
    "ENTREGADAS", "ROBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR", "DATOS_ERRONEOS",
    "FOTO_MAL_IMPRESA", "RETIRADA_POR_REIMPRESION", "RETIRADAS_POR_CAUSA",
    "DISPONIBLES_TOTAL", "FICHAS_ENTREGADAS", "FICHAS_ATENDIDAS", "DIAS_TRABAJADOS",
    "SOLICITUD_EXPEDICION_ORDINARIA", "SOLICITUD_EXPEDICION_REPATRIADOS",  
    "SOLICITUD_DE_RECTIFICACION", "DEMANDA_DE_JUICIO", "REMESA",
    "TOTAL_DE_MOVIMIENTOS", "CREDEN_DEVUELTAS_POR_TERCEROS", "RECHAZOS_DE_MAC_34",
    "RECHAZOS_DE_MAC_35", "CONFIGURACION", "ENT", "DTTO", "MODULO", "RESGUARDO",
    "SOLICITUD_DE_REIMPRESION", "SCRIPT_EJECUTADO", "FOLIO_NEC",
    "NUMERO_DE_TRAMITES_APLICADOS", "NUMERO_DE_FICHAS_REQUISITADAS",
    "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS",
    "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS", "RECIBIDAS",
    "CREDENCIALES_INCONSISTENTES",
    "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA",
    "TOTAL_DE_CREDENCIALES_ENTREGADAS", "TOTAL_DE_CREDENCIALES_SOLICITADAS",
    "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES", "MAL_IMPRESA",
    "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO",
    "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA", "MOV_POST",
    "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

function getClaveLimpia(nombreOriginal) {
    return String(nombreOriginal || "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.#$ /\[\]]/g, "_")
        .replace(/_+/g, "_")
        .trim();
}

function generarIdMac(remesa, modulo) {
    let modStr = String(modulo || '').replace(/\D/g, ''); 
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';
    let remStr = String(remesa || '').trim(); 
    let remMatch = remStr.match(/(\d+)\s*(-?\s*bis\d*)?/i);
    let numPart = '0000'; 
    let suffix = '';
    if (remMatch) { 
        numPart = remMatch[1].length >= 4 ? remMatch[1].slice(-4) : remMatch[1].padStart(4, '0'); 
        if (remMatch[2]) { 
            suffix = remMatch[2].replace(/\s+/g, ''); 
            if (!suffix.startsWith('-')) suffix = '-' + suffix; 
        } 
    }
    return `${modDigits}${numPart}${suffix}`;
}

// 1. Procesar archivo Excel (.xlsx/.xls) o JSON con estandarización de columnas
function procesarArchivoExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    if (file.name.endsWith('.json')) {
        reader.onload = function(evt) {
            try {
                let json = JSON.parse(evt.target.result);
                let rawArr = Array.isArray(json) ? json : Object.values(json);
                normalizarYMostrarPreview(rawArr);
            } catch(err) {
                alert("El archivo JSON no es válido.");
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = function(e) {
            try {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let firstSheet = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[firstSheet];
                let jsonRows = XLSX.utils.sheet_to_json(worksheet, {defval: ""});
                
                normalizarYMostrarPreview(jsonRows);
            } catch(err) {
                console.error(err);
                alert("Error al leer el archivo Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

// 2. Procesar pegado directo desde el portapapeles
function procesarPegadoPortapapeles(e) {
    setTimeout(() => {
        let texto = document.getElementById('textoPegadoExcel').value;
        if (!texto.trim()) return;

        let lineas = texto.split('\n').filter(l => l.trim() !== '');
        if (lineas.length < 2) {
            alert("El texto pegado debe incluir la fila de encabezados y al menos un registro.");
            return;
        }

        let delimitador = lineas[0].includes('\t') ? '\t' : ',';
        let headers = lineas[0].split(delimitador).map(h => h.trim());

        let filasObjetos = [];
        for (let i = 1; i < lineas.length; i++) {
            let valores = lineas[i].split(delimitador);
            let obj = {};
            headers.forEach((cabecera, idx) => {
                obj[cabecera] = valores[idx] !== undefined ? valores[idx].trim() : "";
            });
            filasObjetos.push(obj);
        }

        normalizarYMostrarPreview(filasObjetos);
        document.getElementById('textoPegadoExcel').value = ''; 
    }, 100);
}

// 3. Normalizar registros aplicando el estándar de columnas exactas para Firebase y Gráficas
function normalizarYMostrarPreview(arrRegistros) {
    const thead = document.getElementById('headPreview');
    const tbody = document.getElementById('bodyPreview');
    const contador = document.getElementById('contadorRegistrosPreview');
    const btnGuardar = document.getElementById('btnGuardarFirebase');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!arrRegistros || arrRegistros.length === 0) {
        contador.innerText = "0";
        btnGuardar.disabled = true;
        return;
    }

    datosTemporalesCarga = arrRegistros.map(item => {
        let itemNormalizado = {};
        let modVal = "";
        let remVal = "";

        Object.keys(item).forEach(k => {
            let kClean = getClaveLimpia(k);
            if (kClean === "MODULO") modVal = item[k];
            if (kClean === "REMESA") remVal = item[k];
        });

        // IDMAC unificado
        itemNormalizado["IDMAC"] = generarIdMac(remVal, modVal);

        // Mapear cada columna estándar buscando coincidencias limpias con el Excel
        COLUMNAS_ESTANDAR_TOTALES.forEach(col => {
            if (col === "IDMAC") return;
            let encontradaClave = Object.keys(item).find(k => getClaveLimpia(k) === getClaveLimpia(col));
            itemNormalizado[col] = encontradaClave !== undefined && item[encontradaClave] !== null ? String(item[encontradaClave]) : "0";
        });

        return itemNormalizado;
    });

    // Renderizar cabecera de vista previa
    let trH = '<tr><th>#</th>';
    COLUMNAS_ESTANDAR_TOTALES.forEach(col => {
        trH += `<th>${col.replace(/_/g, ' ')}</th>`;
    });
    trH += '</tr>';
    thead.innerHTML = trH;

    // Renderizar primeros 50 registros en pantalla
    let htmlB = '';
    datosTemporalesCarga.slice(0, 50).forEach((fila, idx) => {
        htmlB += `<tr><td class="fw-bold text-center">${idx + 1}</td>`;
        COLUMNAS_ESTANDAR_TOTALES.forEach(col => {
            htmlB += `<td>${fila[col] !== undefined ? fila[col] : ''}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;

    if (datosTemporalesCarga.length > 50) {
        tbody.innerHTML += `<tr><td colspan="${COLUMNAS_ESTANDAR_TOTALES.length + 1}" class="text-center text-muted fw-bold bg-light">... y ${datosTemporalesCarga.length - 50} registros más listos para guardarse en la nube.</td></tr>`;
    }

    contador.innerText = datosTemporalesCarga.length;
    btnGuardar.disabled = false;
}

// 4. Subir todos los datos estandarizados a Firebase
function subirDatosAFirebase() {
    if (datosTemporalesCarga.length === 0) return;

    if (confirm(`¿Estás seguro de subir ${datosTemporalesCarga.length} registros estandarizados a la Base de Datos Totales en Firebase?`)) {
        database.ref('bdtotales').set(datosTemporalesCarga)
        .then(() => {
            alert("¡Éxito! Todos los registros se han guardado correctamente en Firebase.");
            window.location.href = "bdtotales.html"; 
        })
        .catch(err => {
            console.error(err);
            alert("Hubo un error al guardar en Firebase: " + err.message);
        });
    }
}

// 5. Vaciar por completo Firebase en la ruta bdtotales
function vaciarFirebaseCompleto() {
    if (confirm("⚠️ ADVERTENCIA EXTREMA: ¿Estás completamente seguro de BORRAR TODO en la ruta 'bdtotales' de Firebase?")) {
        database.ref('bdtotales').remove()
        .then(() => {
            alert("Se ha vaciado por completo la base de datos en Firebase.");
            datosTemporalesCarga = [];
            normalizarYMostrarPreview([]);
        })
        .catch(err => {
            console.error(err);
            alert("Error al intentar vaciar la base de datos.");
        });
    }
}
