import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_ACUMULADO_KEYS = ["ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", "CIF_05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", "INICIALES_A", "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"];

const MAPA_NUMEROS = { "DIA": 1, "FECHA": 2, "HORAS_TRABAJADAS": 3, "SEDES": 4, "INICIAL": 5, "FINAL": 6, "TOTAL_DE_FOLIOS": 7, "INSCRIPCIONES": 8, "CORRECCION_DE_DATOS_PERSONALES": 9, "CAMBIO_DE_DOMICILIO": 10, "REPOSISION": 11, "CORR__DE_DATOS_DIRECCION": 12, "REINCORPORACION": 13, "REEMPLAZO": 14, "REIMPRESION": 15, "TOTAL_DE_TRAMITES": 16, "CANCELADOS": 17, "TOTAL_DE_ANEXOS_POR_RECHAZO": 18, "CPV_DEVUELTA_ENTREGA": 19, "DISPONIBLES_AL_DIA_ANTERIOR": 20, "ACTUALIZACION": 21, "RECIBIDAS_DE_OTROS_TIPOS": 22, "ENTREGADAS": 23, "RECIBO_Y_O_EXTRAVIO": 24, "ANEXAS_A_FUAR": 25, "DATOS_ERRONEOS": 26, "FOTO_MAL_IMPRESA": 27, "SOLICITU_DE_REIMPRESION": 28, "RETIRADAS_POR_OTRA_CAUSA": 29, "DISPONIBLES": 30, "CREDENCIALES_X_CANJE": 31, "FICHAS_ENTREGADAS": 32, "FICHAS_ATENDIDAS": 33, "DIAS_TRABAJADOS": 34, "CIF_05": 35, "SOLICITUD_EXPEDICION": 36, "SOLICITUD_RECTIFICACION": 37, "DEMANDA_DE_JUICIO": 38, "REMESA": 39, "TOTAL_DE_MOVIMIENTOS": 40, "CREDEN_DEVUELTAS_POR_TERCEROS": 41, "RECHAZOS_DE_MAC_34": 42, "RECHAZOS_DE_MAC_35": 43, "CONFIGURACION": 44, "ENT": 45, "DTTO": 46, "MODULO": 47, "RESGUARDO": 48, "SOLICITUD_DE_REIMPRESION": 49, "CPV_DEVUELA_ENTREGA_2": 50, "SCRIPT_EJECUTADOS": 51, "FOLIO_NEC": 52, "NUMERO_DE_TRAMITES_APLICADOS": 53, "NUMERO_DE_FICHAS_REQUISITADAS": 54, "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS": 55, "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS": 56, "CREDENCIALES_RECIBIDAS": 57, "CREDENCIALES_INCONSISTENTES": 58, "CREDENCIALES_EN_RESGUARDO": 59, "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA": 60, "TOTAL_DE_CREDENCIALES_ENTREGADAS": 61, "TOTAL_DE_CREDENCIALES_SOLICITADAS": 62, "IMPORTADAS": 63, "EXPORTADAS": 64, "REPOSICIONES_REIMPRESIONES": 65, "MAL_IMPRESA": 66, "ERROR_EN_CARTOGRAFIA": 67, "DEFUNCION": 68, "SUSPENSION": 69, "DUPLICADO": 70, "ERROR_EN_NUM_DE_EMISION": 71, "PERDIDA_DE_VIGENCIA": 72, "MOV_POST": 73, "ANEXAS_A_SOLICITUD": 74, "OTRAS_BAJAS": 75, "INICIALES_C": 76, "INICIALES_A": 77, "INICIALES_S": 78, "IDMAC": 79 };

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

let dataGlobalAcumulado = [];

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

function renderTabla() {
    const tbody = document.querySelector('#tablaAcumulado tbody'); if(!tbody) return; tbody.innerHTML = "";
    
    let remesasDisponibles = [...new Set(dataGlobalAcumulado.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)))].filter(x => !isNaN(x)).sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) return;

    let rIniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
    let rFinVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let modulosObjetivo = ['050351', '050353', '050354'];

    // Filtrar estrictamente los registros que pertenecen al rango de remesas y a los módulos válidos
    let registros = dataGlobalAcumulado.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        let modVal = String(obtenerValorFlexible(f, 'MODULO') || '').trim();
        let esModuloValido = modulosObjetivo.some(m => modVal.includes(m));
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin && esModuloValido; 
    }).sort((a, b) => {
        let modA = String(obtenerValorFlexible(a, 'MODULO') || '');
        let modB = String(obtenerValorFlexible(b, 'MODULO') || '');
        if(modA !== modB) return modA.localeCompare(modB);
        return parseInt(obtenerValorFlexible(a, 'REMESA')) - parseInt(obtenerValorFlexible(b, 'REMESA'));
    });

    let acumuladorGranTotal = {};
    COLUMNAS_ACUMULADO_KEYS.forEach(col => { acumuladorGranTotal[col] = 0; });

    registros.forEach(rDetalle => {
        let trDetalle = document.createElement('tr');

        let rIniDet = parseFloat(obtenerValorFlexible(rDetalle, 'INICIAL')) || 0;
        let rFinDet = parseFloat(obtenerValorFlexible(rDetalle, 'FINAL')) || 0;
        let foliosDet = (rFinDet >= rIniDet && rIniDet > 0) ? (rFinDet - rIniDet + 1) : 0;

        acumuladorGranTotal['TOTAL_DE_FOLIOS'] += foliosDet;

        COLUMNAS_ACUMULADO_KEYS.forEach(col => {
            let tdDet = document.createElement('td');
            let valDet = "";

            if(col === 'ENT') {
                valDet = obtenerValorFlexible(rDetalle, 'ENT') || "05";
                tdDet.className = "text-danger fw-bold";
            } else if(col === 'DTTO') {
                valDet = obtenerValorFlexible(rDetalle, 'DTTO') || "03";
                tdDet.className = "text-danger fw-bold";
            } else if(col === 'MODULO') {
                valDet = obtenerValorFlexible(rDetalle, 'MODULO') || "";
                tdDet.className = "text-danger fw-bold";
            } else if(col === 'INICIAL') {
                valDet = obtenerValorFlexible(rDetalle, 'INICIAL') || "";
                tdDet.className = "text-danger fw-bold";
            } else if(col === 'FINAL') {
                valDet = obtenerValorFlexible(rDetalle, 'FINAL') || "";
                tdDet.className = "text-danger fw-bold";
            } else if(col === 'TOTAL_DE_FOLIOS') {
                valDet = foliosDet > 0 ? foliosDet : "";
                tdDet.className = "text-dark fw-bold";
            } else {
                let vNum = parseFloat(obtenerValorFlexible(rDetalle, col) || 0);
                if(!isNaN(vNum) && vNum !== 0) {
                    valDet = vNum;
                    acumuladorGranTotal[col] += vNum;
                } else {
                    valDet = "";
                }
            }
            tdDet.innerText = valDet;
            trDetalle.appendChild(tdDet);
        });
        tbody.appendChild(trDetalle);
    });
    
    // Fila de Gran Total Final al pie de la tabla
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        let td = document.createElement('td');
        if(col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if (['ENT', 'DTTO', 'INICIAL', 'FINAL', 'INICIALES_A', 'CONFIGURACION'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = acumuladorGranTotal[col] || 0; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

const dbRefConfigAcumulado = ref(db, 'configuracion/acumulado');
onValue(dbRefConfigAcumulado, (snapshot) => {
    if (snapshot.exists()) {
        const config = snapshot.val();
        if (config.inicio !== undefined && document.getElementById('inputAcumuladoInicio')) document.getElementById('inputAcumuladoInicio').value = config.inicio;
        if (config.fin !== undefined && document.getElementById('inputAcumuladoFin')) document.getElementById('inputAcumuladoFin').value = config.fin;
    }
    renderTabla();
});

const btnGuardarAcumulado = document.getElementById('btnGuardarAcumulado');
if(btnGuardarAcumulado) {
    btnGuardarAcumulado.addEventListener('click', () => {
        let iniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
        let finVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

        set(dbRefConfigAcumulado, {
            inicio: iniVal,
            fin: finVal
        }).then(() => {
            alert("¡Rango de acumulado guardado en la nube y sincronizado!");
            renderTabla();
        }).catch((error) => {
            console.error("Error al guardar configuración en Firebase:", error);
            alert("Hubo un error al guardar el rango en la nube.");
        });
    });
}

construirHeaderTabla();

Promise.all([get(ref(db, 'bd_madre')), get(ref(db, 'bdtotales'))]).then(([sM, sT]) => {
    let aM = sM.exists() ? (Array.isArray(sM.val())?sM.val():Object.values(sM.val())).map(normalizarObj) : [];
    let aT = sT.exists() ? (Array.isArray(sT.val())?sT.val():Object.values(sT.val())).map(normalizarObj) : [];
    dataGlobalAcumulado = [...aT, ...aM];

    let todasRemesas = [...new Set(dataGlobalAcumulado.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)))].filter(x => !isNaN(x)).sort((a, b) => a - b);
    
    if(todasRemesas.length > 0) {
        get(dbRefConfigAcumulado).then((snap) => {
            if (!snap.exists() || !snap.val().inicio) {
                set(dbRefConfigAcumulado, {
                    inicio: String(todasRemesas[0]),
                    fin: ""
                });
            }
        });
    }

    renderTabla();
});

function normalizarObj(i) { let l={}; for(let k in i) l[k.toUpperCase().trim()] = i[k]; return l; }
