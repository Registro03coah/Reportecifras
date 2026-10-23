import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { 
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", 
    authDomain: "cifrasmac.firebaseapp.com", 
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", 
    projectId: "cifrasmac", 
    storageBucket: "cifrasmac.firebasestorage.app", 
    messagingSenderId: "916644687837", 
    appId: "1:916644687837:web:03d346cc48a071af1ed034" 
};

const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_SEMANAL_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS", 
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", 
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", "CIF_05", 
    "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", "INICIALES_S", 
    "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", 
    "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", 
    "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"
];

const MAPA_NUMEROS = { 
    "DIA": 1, "FECHA": 2, "HORAS_TRABAJADAS": 3, "SEDES": 4, "INICIAL": 5, "FINAL": 6, 
    "TOTAL_DE_FOLIOS": 7, "INSCRIPCIONES": 8, "CORRECCION_DE_DATOS_PERSONALES": 9, 
    "CAMBIO_DE_DOMICILIO": 10, "REPOSISION": 11, "CORR__DE_DATOS_DIRECCION": 12, 
    "REINCORPORACION": 13, "REEMPLAZO": 14, "REIMPRESION": 15, "TOTAL_DE_TRAMITES": 16, 
    "CANCELADOS": 17, "TOTAL_DE_ANEXOS_POR_RECHAZO": 18, "CPV_DEVUELTA_ENTREGA": 19, 
    "DISPONIBLES_AL_DIA_ANTERIOR": 20, "ACTUALIZACION": 21, "RECIBIDAS_DE_OTROS_TIPOS": 22, 
    "ENTREGADAS": 23, "RECIBO_Y_O_EXTRAVIO": 24, "ANEXAS_A_FUAR": 25, "DATOS_ERRONEOS": 26, 
    "FOTO_MAL_IMPRESA": 27, "SOLICITU_DE_REIMPRESION": 28, "RETIRADAS_POR_OTRA_CAUSA": 29, 
    "DISPONIBLES": 30, "CREDENCIALES_X_CANJE": 31, "FICHAS_ENTREGADAS": 32, "FICHAS_ATENDIDAS": 33, 
    "DIAS_TRABAJADOS": 34, "CIF_05": 35, "SOLICITUD_EXPEDICION": 36, "SOLICITUD_RECTIFICACION": 37, 
    "DEMANDA_DE_JUICIO": 38, "REMESA": 39, "TOTAL_DE_MOVIMIENTOS": 40, "CREDEN_DEVUELTAS_POR_TERCEROS": 41, 
    "RECHAZOS_DE_MAC_34": 42, "RECHAZOS_DE_MAC_35": 43, "CONFIGURACION": 44, "ENT": 45, "DTTO": 46, 
    "MODULO": 47, "RESGUARDO": 48, "SOLICITUD_DE_REIMPRESION": 49, "CPV_DEVUELTA_ENTREGA_2": 50, 
    "SCRIPT_EJECUTADOS": 51, "FOLIO_NEC": 52, "NUMERO_DE_TRAMITES_APLICADOS": 53, 
    "NUMERO_DE_FICHAS_REQUISITADAS": 54, "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS": 55, 
    "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS": 56, "CREDENCIALES_RECIBIDAS": 57, 
    "CREDENCIALES_INCONSISTENTES": 58, "CREDENCIALES_EN_RESGUARDO": 59, 
    "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA": 60, "TOTAL_DE_CREDENCIALES_ENTREGADAS": 61, 
    "TOTAL_DE_CREDENCIALES_SOLICITADAS": 62, "IMPORTADAS": 63, "EXPORTADAS": 64, "REPOSICIONES_REIMPRESIONES": 65, 
    "MAL_IMPRESA": 66, "ERROR_EN_CARTOGRAFIA": 67, "DEFUNCION": 68, "SUSPENSION": 69, "DUPLICADO": 70, 
    "ERROR_EN_NUM_DE_EMISION": 71, "PERDIDA_DE_VIGENCIA": 72, "MOV_POST": 73, "ANEXAS_A_SOLICITUD": 74, 
    "OTRAS_BAJAS": 75, "INICIALES_C": 76, "INICIALES_A": 77, "INICIALES_S": 78, "IDMAC": 79 
};

function obtenerNumeroColumna(key) { 
    return MAPA_NUMEROS[key] || '-'; 
}

window.copiarTablaExcel = function(tablaId) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;
    const clone = tabla.cloneNode(true);
    const totales = clone.querySelectorAll('.fila-totales');
    totales.forEach(t => t.remove()); 
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
        alert("¡Tabla copiada sin la fila de totales! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

let bdtotalesGlobal = []; 
let bdMadreGlobal = [];

onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(sem) sem.innerText = s.val() ? "ONLINE" : "OFFLINE"; 
});

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaSemanal thead'); 
    if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    COLUMNAS_SEMANAL_KEYS.forEach(col => {
        let th = document.createElement('th'); 
        th.innerText = col.replace(/_/g, ' '); 
        th.style.minWidth = ['MODULO','ENT','DTTO'].includes(col) ? "70px" : "90px";
        if(['INICIAL','FINAL','TOTAL_DE_FOLIOS'].includes(col)) th.classList.add('bg-folios');
        trT.appendChild(th);
        
        let thN = document.createElement('th'); 
        thN.innerText = obtenerNumeroColumna(col); 
        trN.appendChild(thN);
    });
    thead.appendChild(trT); 
    thead.appendChild(trN);
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody'); 
    if(!tbody) return; 
    tbody.innerHTML = "";
    
    let inputRem = document.getElementById('inputRemesaFiltro').value.trim();
    if (!inputRem) {
        let remesas = new Set();
        [...bdMadreGlobal, ...bdtotalesGlobal].forEach(f => { if(f.REMESA) remesas.add(String(f.REMESA).trim()); });
        inputRem = Array.from(remesas).sort((a,b)=>b.localeCompare(a, undefined, {numeric:true}))[0] || "";
    }
    document.getElementById('lblRemesaActiva').innerText = `Remesa: ${inputRem}`;
    
    let regTot = bdtotalesGlobal.filter(f => String(f.REMESA).trim() === inputRem);
    if(regTot.length > 0) {
        regTot.forEach(reg => {
            let tr = document.createElement('tr');
            COLUMNAS_SEMANAL_KEYS.forEach(col => {
                let td = document.createElement('td'); 
                let val = reg[col] !== undefined ? reg[col] : "0";
                if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
                td.innerText = val; 
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        renderTotal(tbody, regTot);
    } else {
        let filasM = bdMadreGlobal.filter(f => String(f.REMESA).trim() === inputRem);
        if(filasM.length === 0) return;
        
        // Iterar estrictamente en el orden de los módulos solicitados
        ['050351', '050353', '050354'].forEach(mod => {
            let regs = filasM.filter(f => String(f.MODULO).trim() === mod);
            if(regs.length === 0) return;
            
            // Renderizar cada registro diario individualmente para evitar que se empalmen o se reduzcan a uno solo
            regs.forEach(reg => {
                let tr = document.createElement('tr');
                COLUMNAS_SEMANAL_KEYS.forEach(col => {
                    let td = document.createElement('td');
                    let val = reg[col] !== undefined ? reg[col] : "0";
                    if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
                    if(col === 'MODULO') td.innerText = mod;
                    else td.innerText = val;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        });
        
        renderTotal(tbody, filasM);
    }
}

function renderTotal(tbody, lista) {
    let tr = document.createElement('tr'); 
    tr.className = 'fila-totales';
    COLUMNAS_SEMANAL_KEYS.forEach(col => {
        let td = document.createElement('td');
        if(col === 'MODULO') td.innerText = "GRAN TOTAL";
        else if (['INICIAL', 'FINAL', 'INICIALES_S', 'CONFIGURACION', 'ENT', 'DTTO'].includes(col)) td.innerText = "";
        else { 
            let s = 0; 
            lista.forEach(r => {
                let v = parseFloat(r[col] || 0); 
                if(!isNaN(v)) s += v;
            }); 
            td.innerText = s; 
        }
        tr.appendChild(td);
    });
    tbody.appendChild(tr);
}

function normalizarObj(i) { 
    let l = {}; 
    for(let k in i) l[k.toUpperCase().trim()] = i[k]; 
    return l; 
}

construirHeaderTabla();

Promise.all([get(ref(db, 'bd_madre')), get(ref(db, 'bdtotales'))]).then(([sM, sT]) => {
    if(sM.exists()) bdMadreGlobal = (Array.isArray(sM.val()) ? sM.val() : Object.values(sM.val())).map(normalizarObj);
    if(sT.exists()) bdtotalesGlobal = (Array.isArray(sT.val()) ? sT.val() : Object.values(sT.val())).map(normalizarObj);
    document.getElementById('inputRemesaFiltro').addEventListener('input', renderTablaSemanal);
    renderTablaSemanal();
});
