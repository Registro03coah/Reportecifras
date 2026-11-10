// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (REPORTE SEMANAL)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
window.db = db;

const COLUMNAS_SEMANAL_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSICION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", 
    "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", 
    "INICIALES_S", "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", 
    "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES_TOTALES", "DISPONIBLES_DE_SOL_DE_EXP", 
    "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"
];

let bdMadreGlobal = [];
let bdtotalesGlobal = [];

const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    const semaforo = document.getElementById("semaforoConexion");
    if(!semaforo) return;
    if (snap.val() === true) {
        semaforo.className = "badge bg-success text-white fs-6 px-2 py-1 rounded-pill";
        semaforo.innerHTML = '<i class="bi bi-wifi"></i> ONLINE';
    } else {
        semaforo.className = "badge bg-danger text-white fs-6 px-2 py-1 rounded-pill";
        semaforo.innerHTML = '<i class="bi bi-wifi-off"></i> OFFLINE';
    }
});

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    
    let trTitulos = document.createElement('tr');
    
    COLUMNAS_SEMANAL_KEYS.forEach((colKey) => {
        let thT = document.createElement('th');
        let nombreVisual = colKey.replace(/_/g, ' ')
                                    .replace('SOLICITU DE', 'SOLICITUD DE')
                                    .replace('DUPLICADO', 'DUPLICADOS')
                                    .replace('CORR__', 'CORR ')
                                    .replace('CREDEN DEVUELTAS POR TERCEROS', 'DEVUELTAS POR TERCEROS');
        
        thT.innerText = nombreVisual;
        
        let anchoCelda = "85px"; 
        if(['MODULO', 'ENT', 'DTTO'].includes(colKey)) anchoCelda = "65px"; 
        else if(['INICIAL', 'FINAL'].includes(colKey)) anchoCelda = "100px";
        
        thT.style.width = anchoCelda; 
        thT.style.minWidth = anchoCelda;
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) thT.classList.add('bg-folios');
        
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
    return limpio;
}

function cargarDatosSemanal() {
    construirHeaderTabla('#tablaSemanal');
    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        if (snapMadre.exists()) {
            let dataRaw = snapMadre.val();
            bdMadreGlobal = (Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw)).map(normalizarObjeto);
        } else { bdMadreGlobal = []; }

        if (snapTotales.exists()) {
            let dataTotalesRaw = snapTotales.val();
            bdtotalesGlobal = (Array.isArray(dataTotalesRaw) ? dataTotalesRaw : Object.values(dataTotalesRaw)).map(normalizarObjeto);
        } else { bdtotalesGlobal = []; }

        inicializarFiltroRemesa();
        renderTablaSemanal();
        renderListaRemesasAdmin();
    }).catch(err => console.error("Error al cargar datos semanales:", err));
}

function inicializarFiltroRemesa() {
    const inputRemesa = document.getElementById('inputRemesaFiltro');
    if (inputRemesa) {
        inputRemesa.removeEventListener('input', renderTablaSemanal);
        inputRemesa.addEventListener('input', renderTablaSemanal);
    }
}

function obtenerRemesaSeleccionada() {
    const inputRemesa = document.getElementById('inputRemesaFiltro');
    let remesaEscrita = inputRemesa ? inputRemesa.value.trim() : "";

    if (remesaEscrita !== "") return remesaEscrita;

    let remesasDisponibles = new Set();
    [...bdMadreGlobal, ...bdtotalesGlobal].forEach(f => {
        let r = String(f['REMESA'] || '').trim();
        if(r) remesasDisponibles.add(r);
    });

    if (remesasDisponibles.size > 0) {
        let listaRemesas = Array.from(remesasDisponibles).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        return listaRemesas[0]; 
    }
    return "";
}

function renderTablaSemanal() {
    const tbody = document.querySelector('#tablaSemanal tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    let remesaActiva = obtenerRemesaSeleccionada();
    const lblRemesaActual = document.getElementById('lblRemesaActiva');
    if(lblRemesaActual) lblRemesaActual.innerText = remesaActiva ? `Remesa en vista: ${remesaActiva}` : "Sin remesa detectada";

    if (!remesaActiva) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_SEMANAL_KEYS.length}" class="text-center py-4 text-muted">No se encontró ninguna remesa.</td></tr>`;
        return;
    }

    let registrosTotalesRemesa = bdtotalesGlobal.filter(item => String(item['REMESA'] || '').trim() === String(remesaActiva));

    if (registrosTotalesRemesa.length > 0) {
        registrosTotalesRemesa.forEach(reg => {
            let tr = document.createElement('tr');
            COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
                let td = document.createElement('td');
                td.innerText = reg[colKey] !== undefined && reg[colKey] !== null ? reg[colKey] : "0";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        renderGranTotalDesdeRegistros(tbody, registrosTotalesRemesa);
    } else {
        let filasRemesa = bdMadreGlobal.filter(item => String(item['REMESA'] || '').trim() === String(remesaActiva));
        if (filasRemesa.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${COLUMNAS_SEMANAL_KEYS.length}" class="text-center py-4 text-muted">No hay registros para la remesa: ${remesaActiva}</td></tr>`;
            return;
        }

        let modulosMap = {};
        filasRemesa.forEach(f => {
            let mod = String(f['MODULO'] || 'General').trim();
            if (!modulosMap[mod]) modulosMap[mod] = [];
            modulosMap[mod].push(f);
        });

        Object.keys(modulosMap).sort().forEach(modNombre => {
            let tr = document.createElement('tr');
            let registrosMod = modulosMap[modNombre];

            COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
                let td = document.createElement('td');
                if (colKey === "MODULO") td.innerText = modNombre;
                else if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
                    td.innerText = registrosMod[0][colKey] || (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION"].includes(colKey) ? "0" : "");
                }
                else {
                    let sumaCol = 0;
                    registrosMod.forEach(reg => {
                        let val = parseFloat(reg[colKey] || 0);
                        if (!isNaN(val)) sumaCol += val;
                    });
                    td.innerText = sumaCol;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        renderGranTotalDesdeRegistros(tbody, filasRemesa);
    }

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
}

function renderGranTotalDesdeRegistros(tbody, listaRegistros) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    COLUMNAS_SEMANAL_KEYS.forEach(colKey => {
        let td = document.createElement('td');
        if (colKey === "MODULO") td.innerText = "GRAN TOTAL";
        else if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
            td.innerText = ""; 
        }
        else {
            let sumaTotalRemesa = 0;
            listaRegistros.forEach(reg => {
                let val = parseFloat(reg[colKey] || 0);
                if (!isNaN(val)) sumaTotalRemesa += val;
            });
            td.innerText = sumaTotalRemesa;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

function renderListaRemesasAdmin() {
    const tbodyRemesas = document.querySelector('#tablaListaRemesas tbody');
    if(!tbodyRemesas) return;
    tbodyRemesas.innerHTML = "";

    let remesasSet = new Set();
    [...bdMadreGlobal, ...bdtotalesGlobal].forEach(f => {
        let r = String(f['REMESA'] || '').trim();
        if(r) remesasSet.add(r);
    });

    let lista = Array.from(remesasSet).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    if(lista.length === 0) {
        tbodyRemesas.innerHTML = `<tr><td colspan="2" class="text-muted">No hay remesas registradas.</td></tr>`;
        return;
    }

    lista.forEach(rem => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${rem}</td>
            <td>
                <button class="btn btn-sm btn-primary fw-bold px-2 py-0" style="font-size:10px;" onclick="seleccionarRemesaAdmin('${rem}')">
                    <i class="bi bi-eye-fill"></i> Ver en Tabla
                </button>
            </td>
        `;
        tbodyRemesas.appendChild(tr);
    });
}

window.seleccionarRemesaAdmin = function(remesa) {
    const inputRemesa = document.getElementById('inputRemesaFiltro');
    if(inputRemesa) {
        inputRemesa.value = remesa;
        renderTablaSemanal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.copiarTablaExcel = function(idTabla) {
    let tabla = document.getElementById(idTabla);
    if (!tabla) return;
    let rango = document.createRange();
    rango.selectNode(tabla);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(rango);
    try {
        document.execCommand('copy');
        alert("¡Tabla copiada al portapapeles! Ya puedes pegarla en Excel.");
    } catch (err) {
        alert("Error al copiar la tabla.");
    }
    window.getSelection().removeAllRanges();
}

// ==========================================
// 2. LÓGICA DEL MÓDULO SGC (ACTUALIZADA PARA BD TOTALES)
// ==========================================
window.abrirModalSGC = function() {
    const modal = document.getElementById('modalSGC');
    if(modal) {
        modal.style.display = 'flex';
        cargarYCalcularSGC();
    }
}

window.cerrarModalSGC = function() {
    const modal = document.getElementById('modalSGC');
    if(modal) modal.style.display = 'none';
}

function cargarYCalcularSGC() {
    let remesaActual = obtenerRemesaSeleccionada();
    const thRemesa = document.getElementById('thRemesaSGC');
    if(thRemesa) thRemesa.innerText = "Remesa: " + remesaActual;

    // Función auxiliar que busca primero en bdtotalesGlobal, y si no encuentra, hace respaldo en bdMadreGlobal
    function obtenerValorModulo(moduloId, columnaKey) {
        // Buscar en bdtotales por remesa y módulo exacto (ej. 50351, 50353, 50354)
        let regMod = bdtotalesGlobal.find(r => 
            String(r['REMESA'] || '').trim() === String(remesaActual) && 
            String(r['MODULO'] || '').trim() === String(moduloId)
        );

        if (!regMod) {
            // Respaldar buscando en bdMadreGlobal si no estuviera consolidado en bdtotales
            let regs = bdMadreGlobal.filter(r => 
                String(r['REMESA'] || '').trim() === String(remesaActual) && 
                String(r['MODULO'] || '').trim() === String(moduloId)
            );
            if (regs.length > 0) {
                let sumaCol = 0;
                regs.forEach(reg => {
                    let val = parseFloat(reg[columnaKey] || 0);
                    if (!isNaN(val)) sumaCol += val;
                });
                return sumaCol;
            }
            return 0;
        }
        return parseFloat(regMod[columnaKey]) || 0;
    }

    // Obtener Total de Trámites por módulo desde bdtotales
    let t51 = obtenerValorModulo('50351', 'TOTAL_DE_TRAMITES');
    let t53 = obtenerValorModulo('50353', 'TOTAL_DE_TRAMITES');
    let t54 = obtenerValorModulo('50354', 'TOTAL_DE_TRAMITES');

    // Rellenar campos de Trámites Aplicados, Total Trámites y Fichas Requisitadas
    let el1 = document.querySelector('[data-key="tramites_aplicados_1"]');
    let el2 = document.querySelector('[data-key="tramites_aplicados_2"]');
    let el3 = document.querySelector('[data-key="tramites_aplicados_3"]');
    if(el1) el1.value = t51;
    if(el2) el2.value = t53;
    if(el3) el3.value = t54;

    let tt1 = document.querySelector('[data-key="total_tramites_1"]');
    let tt2 = document.querySelector('[data-key="total_tramites_2"]');
    let tt3 = document.querySelector('[data-key="total_tramites_3"]');
    if(tt1) tt1.value = t51;
    if(tt2) tt2.value = t53;
    if(tt3) tt3.value = t54;

    let fr1 = document.querySelector('[data-key="fichas_req_1"]');
    let fr2 = document.querySelector('[data-key="fichas_req_2"]');
    let fr3 = document.querySelector('[data-key="fichas_req_3"]');
    if(fr1) fr1.value = t51;
    if(fr2) fr2.value = t53;
    if(fr3) fr3.value = t54;

    // Cálculo exacto del 10% del total de trámites de cada módulo individual para Trámites Exitosos
    let te1 = document.querySelector('[data-key="tramites_exitosos_1"]');
    let te2 = document.querySelector('[data-key="tramites_exitosos_2"]');
    let te3 = document.querySelector('[data-key="tramites_exitosos_3"]');
    if(te1) te1.value = Math.round(t51 * 0.10 * 100) / 100;
    if(te2) te2.value = Math.round(t53 * 0.10 * 100) / 100;
    if(te3) te3.value = Math.round(t54 * 0.10 * 100) / 100;

    // Transacciones aceptadas y procesadas
    let ta51 = obtenerValorModulo('50351', 'TOTAL_DE_MOVIMIENTOS');
    let ta53 = obtenerValorModulo('50353', 'TOTAL_DE_MOVIMIENTOS');
    let ta54 = obtenerValorModulo('50354', 'TOTAL_DE_MOVIMIENTOS');

    let ta_ac1 = document.querySelector('[data-key="transac_aceptados_1"]');
    let ta_ac2 = document.querySelector('[data-key="transac_aceptados_2"]');
    let ta_ac3 = document.querySelector('[data-key="transac_aceptados_3"]');
    if(ta_ac1) ta_ac1.value = ta51;
    if(ta_ac2) ta_ac2.value = ta53;
    if(ta_ac3) ta_ac3.value = ta54;

    let ta_pr1 = document.querySelector('[data-key="transac_procesados_1"]');
    let ta_pr2 = document.querySelector('[data-key="transac_procesados_2"]');
    let ta_pr3 = document.querySelector('[data-key="transac_procesados_3"]');
    if(ta_pr1) ta_pr1.value = ta51;
    if(ta_pr2) ta_pr2.value = ta53;
    if(ta_pr3) ta_pr3.value = ta54;

    // Credenciales entregadas / recibidas / inconsistentes
    let cr51 = obtenerValorModulo('50351', 'ENTREGADAS');
    let cr53 = obtenerValorModulo('50353', 'ENTREGADAS');
    let cr54 = obtenerValorModulo('50354', 'ENTREGADAS');

    let ci1 = document.querySelector('[data-key="cred_inconsistentes_1"]');
    let ci2 = document.querySelector('[data-key="cred_inconsistentes_2"]');
    let ci3 = document.querySelector('[data-key="cred_inconsistentes_3"]');
    if(ci1) ci1.value = cr51;
    if(ci2) ci2.value = cr53;
    if(ci3) ci3.value = cr54;

    let cr_rec1 = document.querySelector('[data-key="cred_recibidas_1"]');
    let cr_rec2 = document.querySelector('[data-key="cred_recibidas_2"]');
    let cr_rec3 = document.querySelector('[data-key="cred_recibidas_3"]');
    if(cr_rec1) cr_rec1.value = cr51;
    if(cr_rec2) cr_rec2.value = cr53;
    if(cr_rec3) cr_rec3.value = cr54;

    // Resguardo
    let res51 = obtenerValorModulo('50351', 'RESGUARDO');
    let res53 = obtenerValorModulo('50353', 'RESGUARDO');
    let res54 = obtenerValorModulo('50354', 'RESGUARDO');

    let cr_res1 = document.querySelector('[data-key="cred_resguardo_1"]');
    let cr_res2 = document.querySelector('[data-key="cred_resguardo_2"]');
    let cr_res3 = document.querySelector('[data-key="cred_resguardo_3"]');
    if(cr_res1) cr_res1.value = res51;
    if(cr_res2) cr_res2.value = res53;
    if(cr_res3) cr_res3.value = res54;

    // Disponibles SIIRFE
    let disp51 = obtenerValorModulo('50351', 'DISPONIBLES_TOTALES');
    let disp53 = obtenerValorModulo('50353', 'DISPONIBLES_TOTALES');
    let disp54 = obtenerValorModulo('50354', 'DISPONIBLES_TOTALES');

    let si1 = document.querySelector('[data-key="siirfe_1"]');
    let si2 = document.querySelector('[data-key="siirfe_2"]');
    let si3 = document.querySelector('[data-key="siirfe_3"]');
    if(si1) si1.value = disp51;
    if(si2) si2.value = disp53;
    if(si3) si3.value = disp54;

    // Entregadas / Solicitadas
    let ent51 = obtenerValorModulo('50351', 'ENTREGADAS');
    let ent53 = obtenerValorModulo('50353', 'ENTREGADAS');
    let ent54 = obtenerValorModulo('50354', 'ENTREGADAS');

    let ce1 = document.querySelector('[data-key="cred_entregadas_1"]');
    let ce2 = document.querySelector('[data-key="cred_entregadas_2"]');
    let ce3 = document.querySelector('[data-key="cred_entregadas_3"]');
    if(ce1) ce1.value = ent51;
    if(ce2) ce2.value = ent53;
    if(ce3) ce3.value = ent54;

    let cs1 = document.querySelector('[data-key="cred_solicitadas_1"]');
    let cs2 = document.querySelector('[data-key="cred_solicitadas_2"]');
    let cs3 = document.querySelector('[data-key="cred_solicitadas_3"]');
    if(cs1) cs1.value = ent51;
    if(cs2) cs2.value = ent53;
    if(cs3) cs3.value = ent54;

    // Cargar si existen valores previos guardados independientemente en Firebase para esta remesa SGC
    if (window.db) {
        const dbRef = ref(window.db, `sgc_remesas/${remesaActual}`);
        get(dbRef).then((snapshot) => {
            if (snapshot.exists()) {
                const datosGuardados = snapshot.val();
                document.querySelectorAll('.val-sgc').forEach(input => {
                    let key = input.getAttribute('data-key');
                    if (datosGuardados[key] !== undefined) {
                        input.value = datosGuardados[key];
                    }
                });
            }
        }).catch(error => {
            console.error("Error al leer SGC:", error);
        });
    }
}

window.guardarDatosSGC = function() {
    let remesaActual = obtenerRemesaSeleccionada();
    let datosASubir = {};
    document.querySelectorAll('.val-sgc').forEach(input => {
        let key = input.getAttribute('data-key');
        datosASubir[key] = input.value;
    });

    if (window.db) {
        const dbRef = ref(window.db, `sgc_remesas/${remesaActual}`);
        set(dbRef, datosASubir).then(() => {
            alert("¡Formato SGC guardado con éxito de forma independiente en Firebase!");
            cerrarModalSGC();
        }).catch(error => {
            console.error("Error al guardar SGC:", error);
            alert("Hubo un error al guardar los datos en la nube.");
        });
    } else {
        alert("La conexión con Firebase no está disponible en este momento.");
    }
}

cargarDatosSemanal();
