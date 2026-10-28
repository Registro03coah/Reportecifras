import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac", storageBucket: "cifrasmac.firebasestorage.app", messagingSenderId: "916644687837", appId: "1:916644687837:web:03d346cc48a071af1ed034" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

const COLUMNAS_CAMPANA_KEYS = [
    'ENT',
    'DTTO',
    'MODULO',
    'INICIAL',
    'FINAL',
    'TOTAL_DE_FOLIOS',
    'NO_UTILIZADOS',
    'INSCRIPCIONES',
    'CORRECCION_DE_DATOS_PERSONALES',
    'CAMBIO_DE_DOMICILIO',
    'REPOSICION',
    'CORR_DE_DATOS_DIRECCION',
    'REINCORPORACION',
    'REEMPLAZO',
    'REIMPRESION',
    'TOTAL_DE_TRAMITES',
    'RECHAZOS_DE_MAC_34',
    'RECHAZOS_DE_MAC_35',
    'CANCELADOS',
    'TOTAL_DE_MOVIMIENTOS',
    'CIF_05',
    'SOLICITUD_EXPEDICION_ORDINARIA',
    'SOLICITUD_DE_RECTIFICACION',
    'DEMANDA_DE_JUICIO',
    'INICIALES_C',
    'ACTUALIZACION',
    'RECIBIDAS_DE_OTROS_TIPOS',
    'IMPORTADAS',
    'EXPORTADAS',
    'ENTREGADAS',
    'ANEXAS_A_FUAR',
    'RESGUARDO',
    'SOLICITUD_DE_REIMPRESION',
    'ROBO_Y_O_EXTRAVIO',
    'RETIRADAS_POR_CAUSA',
    'SOBRANTES',
    'DUPLICADOS',
    'DISPONIBLES_TOTAL',
    'DISPONIBLES_DE_SOL_DE_EXP',
    'REIMPRE_FUERA_DEL_SISTEMA',
    'CREDEN_DEVUELTAS_POR_TERCEROS',
    'CRED_PRODUCTO_DE_REGISTRO_DUPLICADO',
    'CRED_PROD_CANJE_POR_NUEVA',
    'DIAS_TRABAJADOS',
    'CONFIGURACION',
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
        alert("¡Tabla copiada al 100% con la fila de totales incluida! Lista para pegar en Excel.");
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
    const thead = document.querySelector('#tablaCampana thead'); 
    if(!thead) return;
    thead.innerHTML = ""; 
    let trT = document.createElement('tr'); 
    let trN = document.createElement('tr'); 
    trN.className = 'num-row';
    
    COLUMNAS_CAMPANA_KEYS.forEach(col => {
        let th = document.createElement('th'); 
        th.innerText = col.replace(/_/g, ' '); 
        
        if(['INICIAL', 'FINAL'].includes(col)) {
            th.style.minWidth = "170px";
        } else if(['MODULO','ENT','DTTO'].includes(col)) {
            th.style.minWidth = "70px";
        } else {
            th.style.minWidth = "95px";
        }

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
    const tbody = document.querySelector('#tablaCampana tbody'); 
    if(!tbody) return; 
    tbody.innerHTML = "";

    let dataF = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    if(dataF.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.colSpan = COLUMNAS_CAMPANA_KEYS.length;
        td.className = "text-center text-muted py-3 fw-bold";
        td.innerText = "⚠️ No hay datos disponibles en Firebase para mostrar en campaña.";
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    let rIniVal = document.getElementById('inputCampanaInicio').value.trim();
    let rFinVal = document.getElementById('inputCampanaFin').value.trim();

    let remesasDisponibles = [...new Set(dataF.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) return;

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let registros = dataF.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    });

    let modulosObjetivo = ['050351', '050353', '050354'];
    let acumuladorGranTotal = {};

    COLUMNAS_CAMPANA_KEYS.forEach(col => {
        acumuladorGranTotal[col] = 0;
    });

    modulosObjetivo.forEach(modTarget => {
        let modNumTarget = parseInt(modTarget, 10);
        
        let regs = registros.filter(r => {
            let rMod = parseInt(obtenerValorFlexible(r, 'MODULO'), 10);
            return !isNaN(rMod) && rMod === modNumTarget;
        }).sort((a, b) => parseInt(obtenerValorFlexible(a, 'REMESA'), 10) - parseInt(obtenerValorFlexible(b, 'REMESA'), 10));

        let tr = document.createElement('tr');
        let pR = regs.length > 0 ? regs[0] : null; 
        let uR = regs.length > 0 ? regs[regs.length - 1] : null;

        // Lista de columnas que componen los trámites operativos
        let camposTrámites = [
            'INSCRIPCIONES', 
            'CORRECCION_DE_DATOS_PERSONALES', 
            'CAMBIO_DE_DOMICILIO', 
            'REPOSICION', 
            'CORR_DE_DATOS_DIRECCION', 
            'REINCORPORACION', 
            'REEMPLAZO', 
            'REIMPRESION'
        ];

        // Calcular Total de Trámites para este módulo en el rango
        let sumaTramitesModulo = 0;
        regs.forEach(r => {
            camposTrámites.forEach(cKey => {
                let v = parseFloat(obtenerValorFlexible(r, cKey) || 0);
                if (!isNaN(v)) sumaTramitesModulo += v;
            });
        });

        // Calcular Cancelados totales del módulo en el rango
        let sumaCanceladosModulo = 0;
        regs.forEach(r => {
            let v = parseFloat(obtenerValorFlexible(r, 'CANCELADOS') || 0);
            if (!isNaN(v)) sumaCanceladosModulo += v;
        });

        COLUMNAS_CAMPANA_KEYS.forEach(col => {
            let td = document.createElement('td');
            let valorCelda = "";

            if(col === 'MODULO') {
                valorCelda = modTarget;
            } else if(col === 'INICIAL') {
                valorCelda = pR ? (obtenerValorFlexible(pR, 'INICIAL') || "0") : "0";
            } else if(col === 'FINAL') {
                valorCelda = uR ? (obtenerValorFlexible(uR, 'FINAL') || "0") : "0";
            } else if(col === 'TOTAL_DE_FOLIOS') {
                let valIni = pR ? parseFloat(obtenerValorFlexible(pR, 'INICIAL')) : NaN;
                let valFin = uR ? parseFloat(obtenerValorFlexible(uR, 'FINAL')) : NaN;
                if (!isNaN(valIni) && !isNaN(valFin) && valFin >= valIni) {
                    valorCelda = (valFin - valIni + 1);
                } else {
                    valorCelda = 0;
                }
                acumuladorGranTotal[col] += Number(valorCelda);
            } else if(col === 'TOTAL_DE_TRAMITES') {
                // Total de Trámites = Suma de las 8 columnas de trámites
                valorCelda = sumaTramitesModulo;
                acumuladorGranTotal[col] += Number(valorCelda);
            } else if(col === 'TOTAL_DE_MOVIMIENTOS') {
                // Total de Movimientos = Total de Trámites - Cancelados
                valorCelda = sumaTramitesModulo - sumaCanceladosModulo;
                acumuladorGranTotal[col] += Number(valorCelda);
            } else if(col === 'INICIALES_C') {
                valorCelda = pR ? (obtenerValorFlexible(pR, 'INICIALES_C') || "0") : "0";
            } else if(col === 'CONFIGURACION') {
                valorCelda = uR ? (obtenerValorFlexible(uR, 'CONFIGURACION') || "0") : "0";
            } else if(['ENT', 'DTTO'].includes(col)) {
                valorCelda = pR ? (obtenerValorFlexible(pR, col) || "") : "";
            } else { 
                let s = 0; 
                regs.forEach(r => {
                    let valRaw = obtenerValorFlexible(r, col);
                    let v = parseFloat(valRaw || 0); 
                    if(!isNaN(v)) s += v;
                }); 
                valorCelda = s;
                acumuladorGranTotal[col] += s;
            }

            td.innerText = valorCelda;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    
    COLUMNAS_CAMPANA_KEYS.forEach(col => {
        let td = document.createElement('td');
        td.style.fontWeight = 'bold';
        if(col === 'MODULO') {
            td.innerText = "GRAN TOTAL";
        } else if(['INICIAL', 'FINAL', 'INICIALES_C', 'CONFIGURACION', 'ENT', 'DTTO'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = acumuladorGranTotal[col];
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

function abrirVentanaAuditoria() {
    let dataF = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    let rIniVal = document.getElementById('inputCampanaInicio').value.trim();
    let rFinVal = document.getElementById('inputCampanaFin').value.trim();

    let remesasDisponibles = [...new Set(dataF.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) {
        alert("No hay remesas disponibles para auditar.");
        return;
    }

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let registros = dataF.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    }).sort((a, b) => parseInt(obtenerValorFlexible(a, 'REMESA'), 10) - parseInt(obtenerValorFlexible(b, 'REMESA'), 10));

    let modalId = "modalAuditoriaCampana";
    let modalEl = document.getElementById(modalId);
    if (!modalEl) {
        const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="bi bi-search"></i> Auditoría de Remesas en Rango (<span id="lblRangoAuditoria"></span>)</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body bg-light">
                <div class="mb-3 text-end">
                    <button class="btn btn-success btn-sm fw-bold" onclick="copiarTablaExcel('tablaAuditoriaDesglose')">
                        <i class="bi bi-table"></i> Copiar Desglose a Excel
                    </button>
                </div>
                <div class="table-responsive bg-white rounded shadow-sm p-2" style="max-height: 60vh;">
                    <table class="table table-bordered table-striped table-hover text-center align-middle" id="tablaAuditoriaDesglose" style="font-size: 11px;">
                        <thead class="table-dark sticky-top" id="cabeceraAuditoria"></thead>
                        <tbody id="cuerpoAuditoria"></tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById(modalId);
    }

    document.getElementById('lblRangoAuditoria').innerText = `${rIni} al ${rFin}`;

    let theadAud = document.getElementById('cabeceraAuditoria');
    let trTh = `<tr><th>REMESA</th><th>MÓDULO</th>`;
    COLUMNAS_CAMPANA_KEYS.forEach(col => {
        if(!['ENT', 'DTTO', 'MODULO'].includes(col)) {
            trTh += `<th>${col.replace(/_/g, ' ')}</th>`;
        }
    });
    trTh += `</tr>`;
    theadAud.innerHTML = trTh;

    let tbodyAud = document.getElementById('cuerpoAuditoria');
    tbodyAud.innerHTML = "";

    if (registros.length === 0) {
        tbodyAud.innerHTML = `<tr><td colspan="10" class="text-muted py-3">No se encontraron registros en el rango seleccionado.</td></tr>`;
    } else {
        registros.forEach(r => {
            let remVal = obtenerValorFlexible(r, 'REMESA');
            let modVal = obtenerValorFlexible(r, 'MODULO');
            let trRow = `<tr><td class="fw-bold bg-warning-subtle">${remVal}</td><td class="fw-bold">${modVal}</td>`;
            
            COLUMNAS_CAMPANA_KEYS.forEach(col => {
                if(!['ENT', 'DTTO', 'MODULO'].includes(col)) {
                    let valCol = obtenerValorFlexible(r, col) || "0";
                    trRow += `<td>${valCol}</td>`;
                }
            });
            trRow += `</tr>`;
            tbodyAud.innerHTML += trRow;
        });
    }

    let myModal = new bootstrap.Modal(modalEl);
    myModal.show();
}

document.addEventListener("DOMContentLoaded", () => {
    const btnGuardarCampana = document.getElementById('btnGuardarCampana');
    if (btnGuardarCampana && !document.getElementById('btnAuditarCampana')) {
        let btnAuditar = document.createElement('button');
        btnAuditar.id = 'btnAuditarCampana';
        btnAuditar.className = 'btn btn-warning btn-sm fw-bold ms-2';
        btnAuditar.innerHTML = '<i class="bi bi-search"></i> Ver Desglose';
        btnAuditar.addEventListener('click', abrirVentanaAuditoria);
        btnGuardarCampana.parentNode.insertBefore(btnAuditar, btnGuardarCampana.nextSibling);
    }
});

function normalizarObj(i) { 
    let l = {}; 
    for(let k in i) l[k.toUpperCase().trim()] = i[k]; 
    return l; 
}

construirHeaderTabla();

const dbRefConfigCampana = ref(db, 'configuracion/campana');
onValue(dbRefConfigCampana, (snapshot) => {
    if (snapshot.exists()) {
        const config = snapshot.val();
        if (config.inicio !== undefined) document.getElementById('inputCampanaInicio').value = config.inicio;
        if (config.fin !== undefined) document.getElementById('inputCampanaFin').value = config.fin;
    }
    renderTabla();
});

document.getElementById('btnGuardarCampana').addEventListener('click', () => {
    let iniVal = document.getElementById('inputCampanaInicio').value.trim();
    let finVal = document.getElementById('inputCampanaFin').value.trim();

    set(dbRefConfigCampana, {
        inicio: iniVal,
        fin: finVal
    }).then(() => {
        alert("¡Rango de campaña guardado en la nube y sincronizado para todos los equipos!");
        renderTabla();
    }).catch((error) => {
        console.error("Error al guardar configuración en Firebase:", error);
        alert("Hubo un error al guardar el rango en la nube.");
    });
});

Promise.all([get(ref(db, 'bd_madre')), get(ref(db, 'bdtotales'))]).then(([sM, sT]) => {
    if(sM.exists()) bdMadreGlobal = (Array.isArray(sM.val()) ? sM.val() : Object.values(sM.val())).map(normalizarObj);
    if(sT.exists()) bdtotalesGlobal = (Array.isArray(sT.val()) ? sT.val() : Object.values(sT.val())).map(normalizarObj);

    let todasRemesas = [...new Set([...bdtotalesGlobal, ...bdMadreGlobal].map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    
    if(todasRemesas.length > 0) {
        get(dbRefConfigCampana).then((snap) => {
            if (!snap.exists() || !snap.val().inicio) {
                set(dbRefConfigCampana, {
                    inicio: String(todasRemesas[0]),
                    fin: ""
                });
            }
        });
    }
    
    renderTabla();
}).catch((error) => {
    console.error("Error al cargar las bases de datos para campaña:", error);
    const tbody = document.querySelector('#tablaCampana tbody');
    if(tbody) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_CAMPANA_KEYS.length}" class="text-center text-danger fw-bold py-3">❌ Error al conectar con Firebase. Revisa tu consola (F12).</td></tr>`;
    }
});
