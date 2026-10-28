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
    if(sem) sem.innerText = s.val() ? "ONLINE" : "OFFLINE"; 
});

function construirHeaderTabla() {
    const thead = document.querySelector('#tablaAcumulado thead'); if(!thead) return;
    thead.innerHTML = ""; let trT = document.createElement('tr'); let trN = document.createElement('tr'); trN.className = 'num-row';
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        let th = document.createElement('th'); th.innerText = col.replace(/_/g, ' '); 
        th.style.minWidth = ['MODULO','ENT','DTTO'].includes(col) ? "70px" : "90px";
        if(['INICIAL','FINAL','TOTAL_DE_FOLIOS'].includes(col)) th.classList.add('bg-folios');
        trT.appendChild(th);
        let thN = document.createElement('th'); thN.innerText = obtenerNumeroColumna(col); trN.appendChild(thN);
    });
    thead.appendChild(trT); thead.appendChild(trN);
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
    
    let remesasDisponibles = [...new Set(dataGlobalAcumulado.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) return;

    let rIniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
    let rFinVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let lbl = document.getElementById('lblRangoRemesas');
    if(lbl) lbl.innerText = `Desde ${rIni} hasta ${rFin}`;

    let registros = dataGlobalAcumulado.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    });

    let modulosList = ['050351', '050353', '050354'];
    let acumuladorGranTotal = {};
    COLUMNAS_ACUMULADO_KEYS.forEach(col => { acumuladorGranTotal[col] = 0; });

    let camposTrámites = [
        'INSCRIPCIONES', 
        'CORRECCION_DE_DATOS_PERSONALES', 
        'CAMBIO_DE_DOMICILIO', 
        'REPOSISION', 
        'CORR__DE_DATOS_DIRECCION', 
        'REINCORPORACION', 
        'REEMPLAZO', 
        'REIMPRESION'
    ];

    modulosList.forEach(mod => {
        let regsMod = registros.filter(r => String(obtenerValorFlexible(r, 'MODULO') || '').trim().includes(mod)).sort((a,b)=>parseInt(obtenerValorFlexible(a, 'REMESA')) - parseInt(obtenerValorFlexible(b, 'REMESA')));
        if(regsMod.length === 0) return;

        let pReg = regsMod[0]; 
        let uReg = regsMod[regsMod.length-1];

        // 1. FILA PRINCIPAL RESUMEN DEL MÓDULO (Primera fila en rojo con totales acumulados)
        let trPrincipal = document.createElement('tr');
        trPrincipal.className = "fw-bold text-danger bg-light";

        let sumaTramitesModulo = 0;
        regsMod.forEach(r => {
            camposTrámites.forEach(cKey => {
                let v = parseFloat(obtenerValorFlexible(r, cKey) || 0);
                if (!isNaN(v)) sumaTramitesModulo += v;
            });
        });

        let sumaCanceladosModulo = 0;
        regsMod.forEach(r => {
            let v = parseFloat(obtenerValorFlexible(r, 'CANCELADOS') || 0);
            if (!isNaN(v)) sumaCanceladosModulo += v;
        });

        let valIniFolio = pReg ? parseFloat(obtenerValorFlexible(pReg, 'INICIAL')) : NaN;
        let valFinFolio = uReg ? parseFloat(obtenerValorFlexible(uReg, 'FINAL')) : NaN;
        let foliosNegra = (!isNaN(valIniFolio) && !isNaN(valFinFolio) && valFinFolio >= valIniFolio) ? (valFinFolio - valIniFolio + 1) : 0;

        COLUMNAS_ACUMULADO_KEYS.forEach(col => {
            let td = document.createElement('td');
            let valorCelda = "";

            if(col === 'MODULO') {
                valorCelda = mod;
            } else if(col === 'INICIAL') {
                valorCelda = obtenerValorFlexible(pReg, 'INICIAL') || "0";
            } else if(col === 'FINAL') {
                valorCelda = obtenerValorFlexible(uReg, 'FINAL') || "0";
            } else if(col === 'INICIALES_A') {
                valorCelda = obtenerValorFlexible(pReg, 'INICIALES_A') || "0";
            } else if(col === 'CONFIGURACION') {
                valorCelda = obtenerValorFlexible(uReg, 'CONFIGURACION') || "0";
            } else if(['ENT','DTTO'].includes(col)) {
                valorCelda = obtenerValorFlexible(pReg, col) || "";
            } else if(col === 'TOTAL_DE_FOLIOS') {
                valorCelda = foliosNegra;
                acumuladorGranTotal[col] += Number(valorCelda);
            } else if(col === 'TOTAL_DE_TRAMITES') {
                valorCelda = sumaTramitesModulo;
                acumuladorGranTotal[col] += Number(valorCelda);
            } else if(col === 'TOTAL_DE_MOVIMIENTOS') {
                valorCelda = sumaTramitesModulo - sumaCanceladosModulo;
                acumuladorGranTotal[col] += Number(valorCelda);
            } else { 
                let sum = 0; 
                regsMod.forEach(r => { 
                    let val = parseFloat(obtenerValorFlexible(r, col) || 0); 
                    if(!isNaN(val)) sum += val; 
                }); 
                valorCelda = sum;
                acumuladorGranTotal[col] += sum;
            }
            td.innerText = valorCelda;
            trPrincipal.appendChild(td);
        });
        tbody.appendChild(trPrincipal);

        // 2. FILAS SECUNDARIAS DE DESGLOSE (Remesa por remesa tal como en la imagen)
        regsMod.forEach(rDetalle => {
            let trDetalle = document.createElement('tr');
            trDetalle.className = "text-danger"; // Estilo rojo como en el formato

            let rIniDet = parseFloat(obtenerValorFlexible(rDetalle, 'INICIAL')) || 0;
            let rFinDet = parseFloat(obtenerValorFlexible(rDetalle, 'FINAL')) || 0;
            let foliosDet = (rFinDet >= rIniDet && rIniDet > 0) ? (rFinDet - rIniDet + 1) : 0;

            COLUMNAS_ACUMULADO_KEYS.forEach(col => {
                let tdDet = document.createElement('td');
                let valDet = "";

                if(col === 'MODULO') {
                    valDet = mod;
                } else if(col === 'INICIAL') {
                    valDet = obtenerValorFlexible(rDetalle, 'INICIAL') || "";
                } else if(col === 'FINAL') {
                    valDet = obtenerValorFlexible(rDetalle, 'FINAL') || "";
                } else if(col === 'TOTAL_DE_FOLIOS') {
                    valDet = foliosDet > 0 ? foliosDet : "";
                } else if(['ENT','DTTO'].includes(col)) {
                    valDet = obtenerValorFlexible(rDetalle, col) || "";
                } else {
                    // Las filas secundarias muestran celdas vacías en los rubros operativos tal como en tu formato de Excel
                    valDet = "";
                }
                tdDet.innerText = valDet;
                trDetalle.appendChild(tdDet);
            });
            tbody.appendChild(trDetalle);
        });
    });
    
    // 3. FILA DE GRAN TOTAL FINAL
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold bg-dark text-white';
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        let td = document.createElement('td');
        td.style.fontWeight = 'bold';
        if(col === 'MODULO') {
            td.innerText = "TOTAL";
        } else if (['INICIAL','FINAL','INICIALES_A','CONFIGURACION','ENT','DTTO'].includes(col)) {
            td.innerText = "";
        } else { 
            td.innerText = acumuladorGranTotal[col]; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}

function abrirVentanaAuditoriaAcumulado() {
    let rIniVal = document.getElementById('inputAcumuladoInicio')?.value.trim() || '';
    let rFinVal = document.getElementById('inputAcumuladoFin')?.value.trim() || '';

    let remesasDisponibles = [...new Set(dataGlobalAcumulado.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) {
        alert("No hay remesas disponibles para auditar.");
        return;
    }

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let registros = dataGlobalAcumulado.filter(f => { 
        let rNum = parseInt(obtenerValorFlexible(f, 'REMESA'), 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    }).sort((a, b) => parseInt(obtenerValorFlexible(a, 'REMESA'), 10) - parseInt(obtenerValorFlexible(b, 'REMESA'), 10));

    let modalId = "modalAuditoriaAcumulado";
    let modalEl = document.getElementById(modalId);
    if (!modalEl) {
        const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold"><i class="bi bi-search"></i> Auditoría de Acumulado en Rango (<span id="lblRangoAuditoriaAcum"></span>)</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body bg-light">
                <div class="mb-3 text-end">
                    <button class="btn btn-success btn-sm fw-bold" onclick="copiarTablaExcel('tablaAuditoriaDesgloseAcum')">
                        <i class="bi bi-table"></i> Copiar Desglose a Excel
                    </button>
                </div>
                <div class="table-responsive bg-white rounded shadow-sm p-2" style="max-height: 60vh;">
                    <table class="table table-bordered table-striped table-hover text-center align-middle" id="tablaAuditoriaDesgloseAcum" style="font-size: 11px;">
                        <thead class="table-dark sticky-top" id="cabeceraAuditoriaAcum"></thead>
                        <tbody id="cuerpoAuditoriaAcum"></tbody>
                    </table>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modalEl = document.getElementById(modalId);
    }

    document.getElementById('lblRangoAuditoriaAcum').innerText = `${rIni} al ${rFin}`;

    let theadAud = document.getElementById('cabeceraAuditoriaAcum');
    let trTh = `<tr><th>REMESA</th><th>MÓDULO</th>`;
    COLUMNAS_ACUMULADO_KEYS.forEach(col => {
        if(!['ENT', 'DTTO', 'MODULO'].includes(col)) {
            trTh += `<th>${col.replace(/_/g, ' ')}</th>`;
        }
    });
    trTh += `</tr>`;
    theadAud.innerHTML = trTh;

    let tbodyAud = document.getElementById('cuerpoAuditoriaAcum');
    tbodyAud.innerHTML = "";

    if (registros.length === 0) {
        tbodyAud.innerHTML = `<tr><td colspan="10" class="text-muted py-3">No se encontraron registros en el rango seleccionado.</td></tr>`;
    } else {
        registros.forEach(r => {
            let remVal = obtenerValorFlexible(r, 'REMESA');
            let modVal = obtenerValorFlexible(r, 'MODULO');
            let trRow = `<tr><td class="fw-bold bg-warning-subtle">${remVal}</td><td class="fw-bold">${modVal}</td>`;
            
            COLUMNAS_ACUMULADO_KEYS.forEach(col => {
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
    const btnGuardarAcumulado = document.getElementById('btnGuardarAcumulado');
    if (btnGuardarAcumulado && !document.getElementById('btnAuditarAcumulado')) {
        let btnAuditar = document.createElement('button');
        btnAuditar.id = 'btnAuditarAcumulado';
        btnAuditar.className = 'btn btn-warning btn-sm fw-bold ms-2';
        btnAuditar.innerHTML = '<i class="bi bi-search"></i> Ver Desglose';
        btnAuditar.addEventListener('click', abrirVentanaAuditoriaAcumulado);
        btnGuardarAcumulado.parentNode.insertBefore(btnAuditar, btnGuardarAcumulado.nextSibling);
    }
});

function normalizarObj(i) { let l={}; for(let k in i) l[k.toUpperCase().trim()] = i[k]; return l; }

construirHeaderTabla();

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
            alert("¡Rango de acumulado guardado en la nube y sincronizado para todos los equipos!");
            renderTabla();
        }).catch((error) => {
            console.error("Error al guardar configuración en Firebase:", error);
            alert("Hubo un error al guardar el rango en la nube.");
        });
    });
}

Promise.all([get(ref(db, 'bd_madre')), get(ref(db, 'bdtotales'))]).then(([sM, sT]) => {
    let aM = sM.exists() ? (Array.isArray(sM.val())?sM.val():Object.values(sM.val())).map(normalizarObj) : [];
    let aT = sT.exists() ? (Array.isArray(sT.val())?sT.val():Object.values(sT.val())).map(normalizarObj) : [];
    dataGlobalAcumulado = [...aT, ...aM];

    let todasRemesas = [...new Set(dataGlobalAcumulado.map(x => parseInt(obtenerValorFlexible(x, 'REMESA'), 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    
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
