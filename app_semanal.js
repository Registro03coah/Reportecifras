// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (BD MADRE Y BD TOTALES)
// ==========================================
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

// Tus nuevos 70 encabezados oficiales estandarizados (Índice 0 a 69)
const ENCABEZADOS_OFICIALES = [
    "IDMAC", "MODULO", "REMESA", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
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

// Columnas que deseas mostrar en el reporte semanal (basadas en los índices o puedes agregar/quitar)
let COLUMNAS_SEMANAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];

let bdMadreGlobal = [];
let bdtotalesGlobal = [];

// ==========================================
// 2. SEMÁFORO DE CONEXIÓN FIREBASE
// ==========================================
const connectedRef = ref(db, ".info/connected");
onValue(connectedRef, (snap) => {
    const semaforo = document.getElementById("semaforoConexion");
    if(!semaforo) return;
    if (snap.val() === true) {
        semaforo.className = "badge bg-success text-white fs-6 px-3 py-2 rounded-pill online-glow";
        semaforo.innerHTML = '<i class="bi bi-wifi"></i> ONLINE';
    } else {
        semaforo.className = "badge bg-danger text-white fs-6 px-3 py-2 rounded-pill offline-glow";
        semaforo.innerHTML = '<i class="bi bi-wifi-off"></i> OFFLINE';
    }
});

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    
    COLUMNAS_SEMANAL.forEach((colIdx) => {
        let thT = document.createElement('th');
        let nombreCol = ENCABEZADOS_OFICIALES[colIdx] || `Col_${colIdx}`;
        
        let nombreVisual = nombreCol.replace(/_/g, ' ');
        thT.innerText = nombreVisual;
        thT.style.height = "50px";
        thT.style.verticalAlignment = "middle";
        thT.style.fontSize = "11px";
        
        let anchoCelda = "90px"; 
        if(colIdx === 1 || colIdx === 2 || colIdx === 3) anchoCelda = "85px"; 
        else if(colIdx === 4) anchoCelda = "130px"; // SEDES
        else if(colIdx === 5 || colIdx === 6) anchoCelda = "110px"; // INICIAL / FINAL
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda;
        
        if(colIdx >= 5 && colIdx <= 7) thT.classList.add('bg-folios');
        
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

construirHeaderTabla('#tablaSemanal');

// ==========================================
// 3. CARGA DE DATOS Y GESTIÓN DE REMESA
// ==========================================
function cargarDatosSemanal() {
    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        if (snapMadre.exists()) {
            const dataRaw = snapMadre.val();
            bdMadreGlobal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
        } else {
            bdMadreGlobal = [];
        }

        if (snapTotales.exists()) {
            const dataTotalesRaw = snapTotales.val();
            bdtotalesGlobal = Array.isArray(dataTotalesRaw) ? dataTotalesRaw : Object.values(dataTotalesRaw);
        } else {
            bdtotalesGlobal = [];
        }

        inicializarFiltroRemesa();
        renderTablaSemanal();
    }).catch(err => console.error("Error al leer la base de datos:", err));
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

    if (remesaEscrita !== "") {
        return remesaEscrita;
    }

    let remesasDisponibles = new Set();
    bdMadreGlobal.forEach(f => {
        let r = String(f['REMESA'] || f['Remesa'] || f['remesa'] || '').trim();
        if(r) remesasDisponibles.add(r);
    });
    bdtotalesGlobal.forEach(f => {
        let r = String(f['REMESA'] || f['Remesa'] || f['remesa'] || '').trim();
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
    if(lblRemesaActual) {
        lblRemesaActual.innerText = remesaActiva ? `Remesa en vista: ${remesaActiva}` : "Sin remesa detectada";
    }

    if (!remesaActiva) {
        tbody.innerHTML = '<tr><td colspan="30" class="text-center py-4 text-muted">No se encontró ninguna remesa registrada o escrita.</td></tr>';
        return;
    }

    let registrosTotalesRemesa = bdtotalesGlobal.filter(item => String(item.REMESA || item.Remesa || '').trim() === String(remesaActiva));

    if (registrosTotalesRemesa.length > 0) {
        registrosTotalesRemesa.forEach(reg => {
            let tr = document.createElement('tr');

            COLUMNAS_SEMANAL.forEach(colIdx => {
                let td = document.createElement('td');
                let nombreColKey = ENCABEZADOS_OFICIALES[colIdx];

                td.innerText = reg[nombreColKey] || reg[`Columna ${colIdx + 1}`] || "0";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        renderGranTotalDesdeRegistros(tbody, registrosTotalesRemesa, remesaActiva);

    } else {
        let filasRemesa = bdMadreGlobal.filter(item => String(item.REMESA || item.Remesa || '').trim() === String(remesaActiva));

        if (filasRemesa.length === 0) {
            tbody.innerHTML = `<tr><td colspan="30" class="text-center py-4 text-muted">No hay registros para la remesa: ${remesaActiva}</td></tr>`;
            return;
        }

        let modulosMap = {};
        filasRemesa.forEach(f => {
            let mod = String(f['MODULO'] || f['MÓDULO'] || f['Módulo'] || f['Modulo'] || 'General').trim();
            if (!modulosMap[mod]) modulosMap[mod] = [];
            modulosMap[mod].push(f);
        });

        Object.keys(modulosMap).sort().forEach(modNombre => {
            let tr = document.createElement('tr');
            let registrosMod = modulosMap[modNombre];

            COLUMNAS_SEMANAL.forEach(colIdx => {
                let td = document.createElement('td');
                let nombreColKey = ENCABEZADOS_OFICIALES[colIdx];

                if (nombreColKey === "MODULO") {
                    td.innerText = modNombre;
                } else if (nombreColKey === "REMESA") {
                    td.innerText = remesaActiva;
                } else {
                    let sumaCol = 0;
                    registrosMod.forEach(reg => {
                        let val = parseFloat(reg[nombreColKey] || 0);
                        if (!isNaN(val)) sumaCol += val;
                    });
                    td.innerText = sumaCol;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        renderGranTotalDesdeRegistros(tbody, filasRemesa, remesaActiva);
    }
}

function renderGranTotalDesdeRegistros(tbody, listaRegistros, remesaId) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    COLUMNAS_SEMANAL.forEach(colIdx => {
        let td = document.createElement('td');
        let nombreColKey = ENCABEZADOS_OFICIALES[colIdx];

        if (nombreColKey === "MODULO") {
            td.innerText = "GRAN TOTAL";
        } else if (nombreColKey === "REMESA") {
            td.innerText = remesaId;
        } else {
            let sumaTotalRemesa = 0;
            listaRegistros.forEach(reg => {
                let val = parseFloat(reg[nombreColKey] || 0);
                if (!isNaN(val)) sumaTotalRemesa += val;
            });
            td.innerText = sumaTotalRemesa;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

// Iniciar carga
cargarDatosSemanal();
