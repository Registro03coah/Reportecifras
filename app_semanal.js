import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_SEMANAL_KEYS = [
    'ENT', 'DTTO', 'MODULO', 'REMESA', 'INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS', 'NO_UTILIZADOS', 
    'INSCRIPCIONES', 'CORRECCION_DE_DATOS_PERSONALES', 'CAMBIO_DE_DOMICILIO', 
    'REPOSICION', 'CORR_DE_DATOS_DIRECCION', 'REINCORPORACION', 'REEMPLAZO', 
    'REIMPRESION', 'TOTAL_DE_TRAMITES', 'RECHAZOS_DE_MAC_34', 'RECHAZOS_DE_MAC_35', 
    'CANCELADOS', 'TOTAL_DE_MOVIMIENTOS', 'CIF_05', 'SOLICITUD_EXPEDICION_ORDINARIA', 
    'SOLICITUD_DE_RECTIFICACION', 'DEMANDA_DE_JUICIO', 'INICIALES_A', 'ACTUALIZACION', 
    'RECIBIDAS_DE_OTROS_TIPOS', 'IMPORTADAS', 'EXPORTADAS', 'ENTREGADAS', 
    'ANEXAS_A_FUAR', 'RESGUARDO', 'SOLICITUD_DE_REIMPRESION', 'ROBO_Y_O_EXTRAVIO', 
    'RETIRADAS_POR_CAUSA', 'SOBRANTES', 'DUPLICADOS', 'DISPONIBLES_TOTAL', 
    'DISPONIBLES_DE_SOL_DE_EXP', 'REIMPRE_FUERA_DEL_SISTEMA', 'CREDEN_DEVUELTAS_POR_TERCEROS', 
    'CRED_PRODUCTO_DE_REGISTRO_DUPLICADO', 'CRED_PROD_CANJE_POR_NUEVA', 
    'DIAS_TRABAJADOS', 'CONFIGURACION'
];

const MAPA_NUMEROS = { "DIA": 1, "FECHA": 2, "HORAS_TRABAJADAS": 3, "SEDES": 4, "INICIAL": 5, "FINAL": 6, "TOTAL_DE_FOLIOS": 7, "INSCRIPCIONES": 8, "CORRECCION_DE_DATOS_PERSONALES": 9, "CAMBIO_DE_DOMICILIO": 10, "REPOSISION": 11, "CORR__DE_DATOS_DIRECCION": 12, "REINCORPORACION": 13, "REEMPLAZO": 14, "REIMPRESION": 15, "TOTAL_DE_TRAMITES": 16, "CANCELADOS": 17, "TOTAL_DE_ANEXOS_POR_RECHAZO": 18, "CPV_DEVUELA_ENTREGA": 19, "DISPONIBLES_AL_DIA_ANTERIOR": 20, "ACTUALIZACION": 21, "RECIBIDAS_DE_OTROS_TIPOS": 22, "ENTREGADAS": 23, "RECIBO_Y_O_EXTRAVIO": 24, "ANEXAS_A_FUAR": 25, "DATOS_ERRONEOS": 26, "FOTO_MAL_IMPRESA": 27, "SOLICITU_DE_REIMPRESION": 28, "RETIRADAS_POR_OTRA_CAUSA": 29, "DISPONIBLES": 30, "CREDENCIALES_X_CANJE": 31, "FICHAS_ENTREGADAS": 32, "FICHAS_ATENDIDAS": 33, "DIAS_TRABAJADOS": 34, "CIF_05": 35, "SOLICITUD_EXPEDICION": 36, "SOLICITUD_RECTIFICACION": 37, "DEMANDA_DE_JUICIO": 38, "REMESA": 39, "TOTAL_DE_MOVIMIENTOS": 40, "CREDEN_DEVUELTAS_POR_TERCEROS": 41, "RECHAZOS_DE_MAC_34": 42, "RECHAZOS_DE_MAC_35": 43, "CONFIGURACION": 44, "ENT": 45, "DTTO": 46, "MODULO": 47, "RESGUARDO": 48, "SOLICITUD_DE_REIMPRESION": 49, "CPV_DEVUELA_ENTREGA_2": 50, "SCRIPT_EJECUTADOS": 51, "FOLIO_NEC": 52, "NUMERO_DE_TRAMITES_APLICADOS": 53, "NUMERO_DE_FICHAS_REQUISITADAS": 54, "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS": 55, "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS": 56, "CREDENCIALES_RECIBIDAS": 57, "CREDENCIALES_INCONSISTENTES": 58, "CREDENCIALES_EN_RESGUARDO": 59, "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA": 60, "TOTAL_DE_CREDENCIALES_ENTREGADAS": 61, "TOTAL_DE_CREDENCIALES_SOLICITADAS": 62, "IMPORTADAS": 63, "EXPORTADAS": 64, "REPOSICIONES_REIMPRESIONES": 65, "MAL_IMPRESA": 66, "ERROR_EN_CARTOGRAFIA": 67, "DEFUNCION": 68, "SUSPENSION": 69, "DUPLICADO": 70, "ERROR_EN_NUM_DE_EMISION": 71, "PERDIDA_DE_VIGENCIA": 72, "MOV_POST": 73, "ANEXAS_A_SOLICITUD": 74, "OTRAS_BAJAS": 75, "INICIAL_C": 76, "INICIAL_A": 77, "INICIAL_S": 78, "IDMAC": 79 };

function obtenerNumeroColumna(key) { return MAPA_NUMEROS[key] || '-'; }

window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;
    const clone = tabla.cloneNode(true);
    const div = document.createElement('div');
    div.appendChild(clone);
    document.body.appendChild(div);
    const range = document.createRange();
    range.selectNode(clone);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    try {
        document.execCommand('copy');
        alert("¡Tabla copiada con éxito! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(!sem) return;
    if (s.val() === true) {
        sem.className = "badge bg-success text-white ms-2";
        sem.innerHTML = '<i class="bi bi-check-circle"></i> ONLINE';
    } else {
        sem.className = "badge bg-danger text-white ms-2";
        sem.innerHTML = '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaSemanal thead'); 
    if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Semanal MAC</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        body { background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .header-banner { background: linear-gradient(135deg, #ff9800, #ff5722); color: white; border-bottom: 4px solid #1b396b; }
        .excel-container { width: 100%; max-height: 65vh; overflow: auto; border: 1px solid #ddd; background: white; margin-bottom: 15px; }
        .excel-table { margin-bottom: 0; table-layout: fixed; }
        .excel-table thead tr:first-child th { position: sticky; top: 0; z-index: 3; font-size: 9px; text-transform: uppercase; background-color: #e9ecef; height: 50px; text-align: center; vertical-align: middle; }
        .excel-table thead tr.num-row th { position: sticky; top: 50px; z-index: 2; background-color: #d6d8db !important; color: #212529 !important; font-size: 10px; text-align: center; padding: 2px; border-bottom: 2px solid #2d3436; }
        .excel-table td { padding: 4px; border: 1px solid #ccc; text-align: center; vertical-align: middle; font-size: 11px;}
        .bg-folios { background-color: #f4b084 !important; }
        .fila-totales td { background-color: #d1e7dd !important; font-weight: bold; }
    </style>
</head>
<body class="d-flex flex-column min-vh-100">
    <style>
    .navbar-nav .nav-link { font-size: 11px !important; }
    .navbar-brand { font-size: 14px !important; }
    nav.navbar, .fixed-top-nav .navbar { padding: 2px 15px !important; }
    .header-banner { padding: 10px 0 !important; margin-bottom: 15px !important; }
    .header-banner h1 { font-size: 1.4rem !important; }
    .header-banner p { font-size: 0.85rem !important; }
</style>
<nav class="navbar navbar-expand-lg navbar-dark shadow-sm" style="background-color: #1b396b; width: 100%;">
  <div class="container-fluid px-3">
    <a class="navbar-brand fw-bold" href="https://registro03coah.github.io/mimenu/"><i class="bi bi-hdd-network"></i> SISTEMA MAC</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto gap-2">
        <li class="nav-item"><a class="nav-link text-light px-2" href="index.html"><i class="bi bi-pencil-square"></i> Vaciado de Datos</a></li>
        <li class="nav-item"><a class="nav-link text-light px-2" href="reporte_dias.html"><i class="bi bi-calendar3"></i> Reporte Días</a></li>
        <li class="nav-item"><a class="nav-link active bg-primary rounded px-2 text-white fw-bold" href="reporte_semanal.html"><i class="bi bi-calendar-week"></i> Reporte Semanal</a></li>
        <li class="nav-item"><a class="nav-link text-light px-2" href="reporte_campana.html"><i class="bi bi-bar-chart-fill"></i> Reporte Campaña</a></li>
        <li class="nav-item"><a class="nav-link text-light px-2" href="reporte_acumulado.html"><i class="bi bi-archive-fill"></i> Reporte Acumulado</a></li>
        <li class="nav-item"><a class="nav-link px-2" href="graficos.html" style="color: #ff66b2 !important; font-weight: bold;"><i class="bi bi-pie-chart-fill"></i> Gráficos</a></li>
        <li class="nav-item"><a class="nav-link text-light px-2" href="bd_madre.html"><i class="bi bi-database-fill"></i> BD Principal</a></li>
        <li class="nav-item"><a class="nav-link text-light px-2" href="bdtotales.html"><i class="bi bi-database-fill-gear"></i> BD Totales</a></li>
      </ul>
    </div>
  </div>
</nav>
    <div class="header-banner text-center d-flex justify-content-center align-items-center">
        <div><h1 class="fw-bold mb-0"><i class="bi bi-calendar-week"></i> Reporte Semanal</h1><p class="lead mb-0">Totales Generales Remesa a Remesa</p></div>
    </div>
    <div class="container-fluid px-4 flex-grow-1">
        <div class="row align-items-center mb-3 p-2 bg-white shadow-sm rounded">
            <div class="col-md-4">
                <label for="inputRemesaFiltro" class="form-label fw-bold mb-1" style="font-size:12px;">Buscar Remesa:</label>
                <input type="text" id="inputRemesaFiltro" class="form-control form-control-sm" placeholder="Ej. 202643">
            </div>
            <div class="col-md-3 text-center">
                <span id="lblRemesaActiva" class="badge bg-secondary fs-6 px-3 py-2">Cargando...</span>
            </div>
            <div class="col-md-5 text-end">
                <button class="btn btn-sm btn-info fw-bold me-2" onclick="copiarTablaExcel('tablaSemanal')"><i class="bi bi-file-excel"></i> Copiar a Excel</button>
                <div id="semaforoConexion" class="badge bg-secondary">Conectando...</div>
            </div>
        </div>
        <div class="excel-container shadow-sm rounded border-warning">
            <table class="excel-table table table-hover" id="tablaSemanal">
                <thead></thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    COLUMNAS_SEMANAL_KEYS.forEach(col => {
        let th = document.createElement('th'); 
        th.innerText = col.replace(/_/g, ' '); 
        if(['INICIAL', 'FINAL'].includes(col)) th.style.minWidth = "170px";
        else if(['MODULO','ENT','DTTO','REMESA'].includes(col)) th.style.minWidth = "70px";
        else th.style.minWidth = "95px";

        if(['INICIAL','FINAL','TOTAL_DE_FOLIOS'].includes(col)) th.classList.add('bg-folios');
        trT.appendChild(th);
        
        let thN = document.createElement('th'); 
        thN.innerText = obtenerNumeroColumna(col); 
        trN.appendChild(thN);
    });
    thead.appendChild(trT); 
    thead.appendChild(trN);
}

function limpiarStr(str) {
    return String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function obtenerValorFlexible(objetoRegistro, claveBuscada) {
    if (!objetoRegistro) return "";
    if (objetoRegistro[claveBuscada] !== undefined) return objetoRegistro[claveBuscada];
    let claveLimpiada = limpiarStr(claveBuscada);
    let llaveEncontrada = Object.keys(objetoRegistro).find(k => limpiarStr(k) === claveLimpiada);
    if (llaveEncontrada !== undefined) return objetoRegistro[llaveEncontrada];
    return "";
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody'); 
    if(!tbody) return; 
    tbody.innerHTML = "";

    get(ref(db, 'bdtotales')).then((snapshot) => {
        if (!snapshot.exists()) {
            tbody.innerHTML = `<tr><td colspan="${COLUMNAS_SEMANAL_KEYS.length}" class="text-center text-muted py-3">No hay datos en bdtotales.</td></tr>`;
            return;
        }

        let rawData = snapshot.val();
        let dataT = (Array.isArray(rawData) ? rawData : Object.values(rawData)).map(i => {
            let l = {};
            for(let k in i) l[k.toUpperCase().trim()] = i[k];
            return l;
        });

        // 1. Obtener estrictamente solo los registros de la última remesa
        let remesas = [...new Set(dataT.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)))].filter(x => !isNaN(x)).sort((a, b) => a - b);
        let ultimaRemesa = remesas.length > 0 ? remesas[remesas.length - 1] : 0;
        let registrosUltimaRemesa = dataT.filter(r => parseInt(obtenerValorFlexible(r, 'REMESA'), 10) === ultimaRemesa);

        let acumuladorTotales = {};
        COLUMNAS_SEMANAL_KEYS.forEach(col => { acumuladorTotales[col] = 0; });
        let hayValidos = false;

        // 2. Pintar únicamente las filas de los módulos encontrados en esa última remesa (sin estructura de 21 renglones)
        registrosUltimaRemesa.forEach(reg => {
            let tr = document.createElement('tr');
            COLUMNAS_SEMANAL_KEYS.forEach(col => {
                let td = document.createElement('td');
                let val = obtenerValorFlexible(reg, col);

                if (!['ENT', 'DTTO', 'MODULO', 'REMESA', 'INICIAL', 'FINAL', 'CONFIGURACION', 'INICIALES_A'].includes(col)) {
                    let numVal = parseFloat(val) || 0;
                    if (!isNaN(numVal) && val !== "") {
                        acumuladorTotales[col] += numVal;
                        hayValidos = true;
                    }
                }
                td.innerText = (val !== undefined && val !== "" && val !== 0) ? val : "";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // 3. Fila de Totales final
        let trT = document.createElement('tr');
        trT.className = 'fila-totales fw-bold';
        COLUMNAS_SEMANAL_KEYS.forEach(col => {
            let td = document.createElement('td');
            if (col === 'MODULO') {
                td.innerText = "TOTAL";
            } else if (['ENT', 'DTTO', 'REMESA', 'INICIAL', 'FINAL', 'INICIALES_A', 'CONFIGURACION'].includes(col)) {
                td.innerText = "";
            } else {
                td.innerText = hayValidos ? (acumuladorTotales[col] || 0) : "";
            }
            trT.appendChild(td);
        });
        tbody.appendChild(trT);

        // Sincronizar espejo en Firebase para Reportesdto03
        let tablaEl = document.getElementById('tablaSemanal');
        if (tablaEl) {
            let theadEl = tablaEl.querySelector('thead');
            let tbodyEl = tablaEl.querySelector('tbody');
            if (theadEl && tbodyEl) {
                set(ref(db, 'configuracion/reportes_dto03/semanal'), {
                    htmlThead: theadEl.innerHTML,
                    htmlTbody: tbodyEl.innerHTML
                });
            }
        }
    });
}

construirHeaderTabla();
renderTablaSemanal();
