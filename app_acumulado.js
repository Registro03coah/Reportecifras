import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_ACUMULADO_KEYS = ["ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", "CIF_05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", "INICIALES_A", "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"];

const MAPA_NUMEROS = { "DIA": 1, "FECHA": 2, "HORAS_TRABAJADAS": 3, "SEDES": 4, "INICIAL": 5, "FINAL": 6, "TOTAL_DE_FOLIOS": 7, "INSCRIPCIONES": 8, "CORRECCION_DE_DATOS_PERSONALES": 9, "CAMBIO_DE_DOMICILIO": 10, "REPOSISION": 11, "CORR__DE_DATOS_DIRECCION": 12, "REINCORPORACION": 13, "REEMPLAZO": 14, "REIMPRESION": 15, "TOTAL_DE_TRAMITES": 16, "CANCELADOS": 17, "TOTAL_DE_ANEXOS_POR_RECHAZO": 18, "CPV_DEVUELA_ENTREGA": 19, "DISPONIBLES_AL_DIA_ANTERIOR": 20, "ACTUALIZACION": 21, "RECIBIDAS_DE_OTROS_TIPOS": 22, "ENTREGADAS": 23, "RECIBO_Y_O_EXTRAVIO": 24, "ANEXAS_A_FUAR": 25, "DATOS_ERRONEOS": 26, "FOTO_MAL_IMPRESA": 27, "SOLICITU_DE_REIMPRESION": 28, "RETIRADAS_POR_OTRA_CAUSA": 29, "DISPONIBLES": 30, "CREDENCIALES_X_CANJE": 31, "FICHAS_ENTREGADAS": 32, "FICHAS_ATENDIDAS": 33, "DIAS_TRABAJADOS": 34, "CIF_05": 35, "SOLICITUD_EXPEDICION": 36, "SOLICITUD_RECTIFICACION": 37, "DEMANDA_DE_JUICIO": 38, "REMESA": 39, "TOTAL_DE_MOVIMIENTOS": 40, "CREDEN_DEVUELTAS_POR_TERCEROS": 41, "RECHAZOS_DE_MAC_34": 42, "RECHAZOS_DE_MAC_35": 43, "CONFIGURACION": 44, "ENT": 45, "DTTO": 46, "MODULO": 47, "RESGUARDO": 48, "SOLICITUD_DE_REIMPRESION": 49, "CPV_DEVUELA_ENTREGA_2": 50, "SCRIPT_EJECUTADOS": 51, "FOLIO_NEC": 52, "NUMERO_DE_TRAMITES_APLICADOS": 53, "NUMERO_DE_FICHAS_REQUISITADAS": 54, "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS": 55, "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS": 56, "CREDENCIALES_RECIBIDAS": 57, "CREDENCIALES_INCONSISTENTES": 58, "CREDENCIALES_EN_RESGUARDO": 59, "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA": 60, "TOTAL_DE_CREDENCIALES_ENTREGADAS": 61, "TOTAL_DE_CREDENCIALES_SOLICITADAS": 62, "IMPORTADAS": 63, "EXPORTADAS": 64, "REPOSICIONES_REIMPRESIONES": 65, "MAL_IMPRESA": 66, "ERROR_EN_CARTOGRAFIA": 67, "DEFUNCION": 68, "SUSPENSION": 69, "DUPLICADO": 70, "ERROR_EN_NUM_DE_EMISION": 71, "PERDIDA_DE_VIGENCIA": 72, "MOV_POST": 73, "ANEXAS_A_SOLICITUD": 74, "OTRAS_BAJAS": 75, "INICIALES_C": 76, "INICIALES_A": 77, "INICIALES_S": 78, "IDMAC": 79 };

function obtenerNumeroColumna(key) { return MAPA_NUMEROS[key] || '-'; }

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

onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(sem) {
        sem.className = s.val() ? "badge bg-success text-white ms-2" : "badge bg-danger text-white ms-2";
        sem.innerHTML = s.val() ? '<i class="bi bi-check-circle"></i> ONLINE' : '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaAcumulado thead'); if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
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

// Estructura exacta de los 21 renglones (7 por módulo: 1 negro + 6 rojos)
const ESTRUCTURA_21_RENGLONES = [
    // --- MÓDULO 50351 (7 renglones: 1 principal negro + 6 desgloses rojos) ---
    { tipo: "NEGRO", ent: "05", dtto: "03", modulo: "50351", inicial: "2605035108669", final: "2605035130714" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "2605035100001", final: "2605035108668" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "2505035125557", final: "2505035139930" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "2505035109053", final: "2505035125556" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "2505035100001", final: "2505035109052" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "24050351119618", final: "2405035132139" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50351", inicial: "24050351109082", final: "24050351119617" },

    // --- MÓDULO 50353 (7 renglones: 1 principal negro + 6 desgloses rojos) ---
    { tipo: "NEGRO", ent: "05", dtto: "03", modulo: "50353", inicial: "2605035303086", final: "2605035312364" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2605035300001", final: "2605035303085" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2505035309689", final: "2505035316305" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2505035303324", final: "2505035309688" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2505035300001", final: "2505035303323" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2405035307991", final: "2405035313485" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50353", inicial: "2405035303096", final: "2405035307990" },

    // --- MÓDULO 50354 (7 renglones: 1 principal negro + 6 desgloses rojos) ---
    { tipo: "NEGRO", ent: "05", dtto: "03", modulo: "50354", inicial: "2605035401973", final: "2605035406077" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2605035400001", final: "2605035401972" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2505035404268", final: "2505035408381" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2505035401417", final: "2505035404267" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2505035400001", final: "2505035401416" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2405035402884", final: "2405035405329" },
    { tipo: "ROJO",  ent: "05", dtto: "03", modulo: "50354", inicial: "2405035400971", final: "2405035402883" }
];

function renderTabla() {
    const tbody = document.querySelector('#tablaAcumulado tbody'); if(!tbody) return; tbody.innerHTML = "";
    
    let sumaTotalFolios = 0;

    ESTRUCTURA_21_RENGLONES.forEach(item => {
        let trDetalle = document.createElement('tr');

        let rIniNum = parseFloat(item.inicial) || 0;
        let rFinNum = parseFloat(item.final) || 0;
        let foliosDet = (rFinNum >= rIniNum && rIniNum > 0) ? (rFinNum - rIniNum + 1) : 0;
        
        if(foliosDet > 0) sumaTotalFolios += foliosDet;

        COLUMNAS_ACUMULADO_KEYS.forEach(col => {
            let tdDet = document.createElement('td');
            let valDet = "";

            if (item.tipo === "ROJO") {
                // Renglones rojos: solo muestran ENT, DTTO, MODULO, INICIAL, FINAL en rojo; TOTAL_DE_FOLIOS en negro; lo demás vacío
                if(col === 'ENT') {
                    valDet = item.ent; tdDet.className = "text-danger fw-bold";
                } else if(col === 'DTTO') {
                    valDet = item.dtto; tdDet.className = "text-danger fw-bold";
                } else if(col === 'MODULO') {
                    valDet = item.modulo; tdDet.className = "text-danger fw-bold";
                } else if(col === 'INICIAL') {
                    valDet = item.inicial; tdDet.className = "text-danger fw-bold";
                } else if(col === 'FINAL') {
                    valDet = item.final; tdDet.className = "text-danger fw-bold";
                } else if(col === 'TOTAL_DE_FOLIOS') {
                    valDet = foliosDet > 0 ? foliosDet : ""; tdDet.className = "text-dark fw-bold";
                } else {
                    valDet = ""; // Vacío en los renglones rojos tal como solicitaste
                }
            } else {
                // Renglones negros (principales): listos para las fórmulas y sumatorias
                if(col === 'ENT') {
                    valDet = item.ent;
                } else if(col === 'DTTO') {
                    valDet = item.dtto;
                } else if(col === 'MODULO') {
                    valDet = item.modulo;
                } else if(col === 'INICIAL') {
                    valDet = item.inicial;
                } else if(col === 'FINAL') {
                    valDet = item.final;
                } else if(col === 'TOTAL_DE_FOLIOS') {
                    valDet = foliosDet > 0 ? foliosDet : "";
                } else {
                    valDet = ""; // Aquí irán las fórmulas posteriormente
                }
            }
            tdDet.innerText = valDet;
            trDetalle.appendChild(tdDet);
        });
        tbody.appendChild(trDetalle);
    });
    
    // Fila de Gran Total Final al pie de los 21 renglones
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        let td = document.createElement('td');
        if(col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if(col === 'TOTAL_DE_FOLIOS') {
            td.innerText = sumaTotalFolios;
        } else if (['ENT', 'DTTO', 'INICIAL', 'FINAL', 'INICIALES_A', 'CONFIGURACION'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = ""; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

construirHeaderTabla();
renderTabla();
