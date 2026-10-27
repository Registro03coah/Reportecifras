// Configuración de Firebase
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
}
const database = firebase.database();

// Lista oficial de las 73 columnas estándar (con IDMAC al inicio)
const NOMBRES_ESTANDAR_BD = [
"IDMAC", 
"DIA",
"FECHA",
"HORAS_TRABAJADAS",
"SEDES",
"INICIAL",
"FINAL",
"TOTAL_DE_FOLIOS",
"INSCRIPCIONES",
"CORRECCION_DE_DATOS_PERSONALES",
"CAMBIO_DE_DOMICILIO",
"REPOSICION",
"CORR_DE_DATOS_DIRECCION",
"REINCORPORACION",
"REEMPLAZO",
"REIMPRESION",
"TOTAL_DE_TRAMITES",
"CANCELADOS",
"TOTAL_DE_ANEXOS_POR_RECHAZO",
"CRED_PROD_CANJE_POR_NUEVA",  
"DISPONIBLES_AL_DIA_ANTERIOR",
"ACTUALIZACION",
"RECIBIDAS_DE_OTROS_TIPOS",
"ENTREGADAS",
"ROBO_Y_O_EXTRAVIO",
"ANEXAS_A_FUAR",
"DATOS_ERRONEOS",
"FOTO_MAL_IMPRESA",
"RETIRADA_POR_REIMPRESION",
"RETIRADAS_POR_CAUSA",
"DISPONIBLES_TOTAL",
"FICHAS_ENTREGADAS",
"FICHAS_ATENDIDAS",
"DIAS_TRABAJADOS",
"SOLICITUD_EXPEDICION_ORDINARIA",
"SOLICITUD_EXPEDICION_REPATRIADOS",  
"SOLICITUD_DE_RECTIFICACION",
"DEMANDA_DE_JUICIO",
    "REMESA",
"TOTAL_DE_MOVIMIENTOS",
"CREDEN_DEVUELTAS_POR_TERCEROS",
"RECHAZOS_DE_MAC_34",
"RECHAZOS_DE_MAC_35",
"CONFIGURACION",
"ENT",
"DTTO",
    "MODULO",
"RESGUARDO",
"SOLICITUD_DE_REIMPRESION",
"SCRIPT_EJECUTADO",
"FOLIO_NEC",
"NUMERO_DE_TRAMITES_APLICADOS",
"NUMERO_DE_FICHAS_REQUISITADAS",
"NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS",
"TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS",
"RECIBIDAS",
"CREDENCIALES_INCONSISTENTES",
"CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA",
"TOTAL_DE_CREDENCIALES_ENTREGADAS",
"TOTAL_DE_CREDENCIALES_SOLICITADAS",
"IMPORTADAS",
"EXPORTADAS",
"REPOSISION_REIMPRESIONES",
"MAL_IMPRESA",
"ERROR_EN_CARTOGRAFIA",
"DEFUNCION",
"SUSPENSION",
"DUPLICADO",
"ERROR_EN_NUM_DE_EMISION",
"PERDIDA_DE_VIGENCIA",
"MOV_POST",
"ANEXAS_A_SOLICITUD",
"OTRAS_BAJAS"
];

let datosProcesadosGlobal = [];

function getClaveLimpia(nombreOriginal) {
    return String(nombreOriginal)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.#$ /\[\]]/g, "_")
        .replace(/_+/g, "_")
        .trim();
}

// Función para generar el IDMAC con el formato solicitado: [últimos 2 del módulo] + [últimos 4 de la remesa] + [ddmm de la fecha]
function generarIdMacCustom(mod, remesa, fechaStr) {
    const mod2 = String(mod || "00").slice(-2);
    const rem4 = String(remesa || "0000").slice(-4).padStart(4, '0');
    
    let ddmm = "0000";
    if (fechaStr) {
        let limpia = String(fechaStr).trim();
        if (limpia.includes('/')) {
            let partes = limpia.split('/');
            if (partes.length >= 2) {
                let d = partes[0].padStart(2, '0');
                let m = partes[1].padStart(2, '0');
                ddmm = d + m;
            }
        } else if (limpia.includes('-')) {
            let partes = limpia.split('-');
            if (partes.length >= 3) {
                if (partes[0].length === 4) { // Formato YYYY-MM-DD
                    let m = partes[1].padStart(2, '0');
                    let d = partes[2].padStart(2, '0');
                    ddmm = d + m;
                } else { // Formato DD-MM-YYYY
                    let d = partes[0].padStart(2, '0');
                    let m = partes[1].padStart(2, '0');
                    ddmm = d + m;
                }
            }
        }
    }
    return `${mod2}${rem4}${ddmm}`;
}

// Procesar archivo Excel (.xlsx / .xls) o JSON
window.procesarArchivoExcel = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.name.endsWith('.json')) {
        reader.onload = function(e) {
            try {
                const jsonContent = JSON.parse(e.target.result);
                datosProcesadosGlobal = Array.isArray(jsonContent) ? jsonContent : Object.values(jsonContent);
                normalizarYMostrarPreview(datosProcesadosGlobal);
            } catch (err) {
                alert("El archivo JSON no es válido.");
            }
        };
        reader.readAsText(file);
    } else {
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const jsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                datosProcesadosGlobal = jsonRows;
                normalizarYMostrarPreview(datosProcesadosGlobal);
            } catch (err) {
                alert("Error al leer el archivo Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
};

// Procesar pegado directo desde el portapapeles (Ctrl+V en el Textarea)
window.procesarPegadoPortapapeles = function(event) {
    setTimeout(() => {
        const texto = document.getElementById('textoPegadoExcel').value;
        if (!texto.trim()) return;

        const lineas = texto.split('\n').filter(l => l.trim() !== '');
        if (lineas.length < 2) {
            alert("El texto pegado debe incluir al menos la fila de encabezados y una fila de datos.");
            return;
        }

        const encabezados = lineas[0].split('\t').map(h => h.trim());
        let filasObjetos = [];

        for (let i = 1; i < lineas.length; i++) {
            const celdas = lineas[i].split('\t');
            let obj = {};
            encabezados.forEach((cabecera, idx) => {
                obj[cabecera] = celdas[idx] !== undefined ? celdas[idx].trim() : "";
            });
            filasObjetos.push(obj);
        }

        datosProcesadosGlobal = filasObjetos;
        normalizarYMostrarPreview(datosProcesadosGlobal);
    }, 100);
};

// Normalizar registros, calcular IDMAC personalizado y poblar la vista previa
function normalizarYMostrarPreview(arrRegistros) {
    const headPreview = document.getElementById('headPreview');
    const bodyPreview = document.getElementById('bodyPreview');
    const contador = document.getElementById('contadorRegistrosPreview');
    const btnGuardar = document.getElementById('btnGuardarFirebase');

    headPreview.innerHTML = '';
    bodyPreview.innerHTML = '';

    if (!arrRegistros || arrRegistros.length === 0) {
        contador.innerText = "0";
        btnGuardar.disabled = true;
        return;
    }

    datosProcesadosGlobal = arrRegistros.map(item => {
        let itemNormalizado = {};
        
        let modVal = "";
        let remVal = "";
        let fecVal = "";

        Object.keys(item).forEach(k => {
            let kClean = getClaveLimpia(k);
            if (kClean === "MODULO") modVal = item[k];
            if (kClean === "REMESA") remVal = item[k];
            if (kClean === "FECHA") fecVal = item[k];
        });

        // Generar IDMAC con la estructura solicitada
        itemNormalizado["IDMAC"] = generarIdMacCustom(modVal, remVal, fecVal);

        NOMBRES_ESTANDAR_BD.forEach(col => {
            if (col === "IDMAC") return; 
            let encontradaClave = Object.keys(item).find(k => getClaveLimpia(k) === getClaveLimpia(col));
            itemNormalizado[col] = encontradaClave !== undefined && item[encontradaClave] !== null ? String(item[encontradaClave]) : "0";
        });

        return itemNormalizado;
    });

    let trH = '<tr>';
    NOMBRES_ESTANDAR_BD.forEach(col => {
        trH += `<th>${col.replace(/_/g, ' ')}</th>`;
    });
    trH += '</tr>';
    headPreview.innerHTML = trH;

    let htmlB = '';
    datosProcesadosGlobal.forEach(item => {
        htmlB += '<tr>';
        NOMBRES_ESTANDAR_BD.forEach(col => {
            htmlB += `<td>${item[col] !== undefined ? item[col] : ''}</td>`;
        });
        htmlB += '</tr>';
    });
    bodyPreview.innerHTML = htmlB;

    contador.innerText = datosProcesadosGlobal.length;
    btnGuardar.disabled = false;
}

// Subir datos validados a Firebase (BD Principal / bd_madre)
window.subirDatosABdMadre = function() {
    if (!datosProcesadosGlobal || datosProcesadosGlobal.length === 0) {
        alert("No hay datos para guardar.");
        return;
    }

    if (confirm(`¿Estás seguro de subir y fusionar ${datosProcesadosGlobal.length} registros en la Base de Datos Principal (BD Madre)?`)) {
        const dbRef = database.ref('bd_madre');

        dbRef.once('value').then((snapshot) => {
            let existente = snapshot.val() || [];
            existente = Array.isArray(existente) ? existente : Object.values(existente);

            const fusionFinal = [...existente, ...datosProcesadosGlobal];

            dbRef.set(fusionFinal)
                .then(() => {
                    alert("¡Carga masiva completada con éxito en la BD Principal!");
                    window.location.href = "bd_madre.html";
                })
                .catch(err => {
                    alert("Error al guardar en Firebase: " + err.message);
                });
        });
    }
};

// Vaciar por completo la BD Principal en Firebase
window.vaciarBdMadreFirebase = function() {
    if (confirm("¡ADVERTENCIA EXTREMA! Vas a borrar TODOS los registros existentes en la BD Principal de Firebase. ¿Deseas continuar?")) {
        if (confirm("Confirma nuevamente: Se eliminará toda la información de la BD Madre.")) {
            database.ref('bd_madre').set(null)
                .then(() => {
                    alert("Se ha vaciado toda la BD Principal correctamente.");
                    location.reload();
                })
                .catch(err => alert("Error al vaciar: " + err.message));
        }
    }
};
