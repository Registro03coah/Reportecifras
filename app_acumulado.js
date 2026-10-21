// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (REPORTE ACUMULADO)
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

// Todas las columnas oficiales (se podará a 30 después)
const COLUMNAS_ACUMULADO_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSISION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", 
    "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", 
    "INICIALES_A", "INICIALES_S", "INICIALES_C", "ACTUALIZACIÓN", "RECIBIDAS_DE_OTROS_TIPOS", 
    "IMPORTADAS", "EXPORTADAS", "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION",
    "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", 
    "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", 
    "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CRED_PROD_CANJE_POR_NUEVA", 
    "DIAS_TRABAJADOS", "CONFIGURACION"
];

let dataGlobalAcumulado = [];

// ==========================================
// 2. SEMÁFORO Y CONSTRUCCIÓN DE CABECERA
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
    
    COLUMNAS_ACUMULADO_KEYS.forEach((colKey) => {
        let thT = document.createElement('th');
        let nombreVisual = colKey.replace(/_/g, ' ')
                                  .replace('SOLICITU DE', 'SOLICITUD DE')
                                  .replace('DUPLICADO', 'DUPLICADOS')
                                  .replace('DISPONIBLES', 'DISPONIBLES TOTAL')
                                  .replace('CORR  DE', 'CORR DE');
        
        thT.innerText = nombreVisual;
        
        let anchoCelda = "90px"; 
        if(['MODULO', 'ENT', 'DTTO'].includes(colKey)) anchoCelda = "70px"; 
        else if(['INICIAL', 'FINAL'].includes(colKey)) anchoCelda = "130px";
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda;
        
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) {
            thT.classList.add('bg-folios');
        }
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

// ==========================================
// 3. CARGA DE DATOS Y RENDERIZADO ACUMULADO
// ==========================================
function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
    return limpio;
}

function cargarDatosAcumulado() {
    construirHeaderTabla('#tablaAcumulado');

    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        let arrMadre = snapMadre.exists() ? (Array.isArray(snapMadre.val()) ? snapMadre.val() : Object.values(snapMadre.val())).map(normalizarObjeto) : [];
        let arrTotales = snapTotales.exists() ? (Array.isArray(snapTotales.val()) ? snapTotales.val() : Object.values(snapTotales.val())).map(normalizarObjeto) : [];
        
        // El acumulado considera toda la base de datos combinada
        dataGlobalAcumulado = [...arrTotales, ...arrMadre];
        renderTablaAcumulado();
    }).catch(err => console.error("Error al leer datos:", err));
}

function renderTablaAcumulado() {
    const tbody = document.querySelector('#tablaAcumulado tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    if (dataGlobalAcumulado.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_ACUMULADO_KEYS.length}" class="text-center py-4 text-muted">No hay datos registrados en el sistema.</td></tr>`;
        return;
    }

    // Agrupar por módulo y extraer rangos únicos de folios
    let modulosMap = {};
    dataGlobalAcumulado.forEach(f => {
        let mod = String(f['MODULO'] || 'General').trim();
        if (!modulosMap[mod]) {
            modulosMap[mod] = { registros: [], foliosUnicos: new Set() };
        }
        modulosMap[mod].registros.push(f);

        let ini = String(f['INICIAL'] || '').trim();
        let fin = String(f['FINAL'] || '').trim();
        if (ini !== '' && fin !== '' && ini !== '0' && fin !== '0') {
            modulosMap[mod].foliosUnicos.add(JSON.stringify({ i: ini, f: fin }));
        }
    });

    let sumaGranTotalFolios = 0;

    Object.keys(modulosMap).sort().forEach(modNombre => {
        let dataMod = modulosMap[modNombre];
        
        // Convertir el Set a Array y ordenar de mayor a menor (folio FINAL descendente)
        let rangosFolios = Array.from(dataMod.foliosUnicos).map(str => JSON.parse(str));
        rangosFolios.sort((a, b) => Number(b.f) - Number(a.f));

        // Si no hay folios registrados para este módulo, creamos uno vacío por defecto para mostrar las métricas
        if (rangosFolios.length === 0) {
            rangosFolios.push({ i: "", f: "" });
        }

        // Renderizar una fila por cada rango de folio
        rangosFolios.forEach((rango, index) => {
            let tr = document.createElement('tr');
            
            // La fila 0 es la principal (negra). > 0 son históricas (rojas).
            let esFilaPrincipal = (index === 0);
            if (!esFilaPrincipal) {
                tr.classList.add('fila-historica');
            }

            COLUMNAS_ACUMULADO_KEYS.forEach(colKey => {
                let td = document.createElement('td');

                if (colKey === "ENT") {
                    td.innerText = dataMod.registros[0]['ENT'] || "";
                } else if (colKey === "DTTO") {
                    td.innerText = dataMod.registros[0]['DTTO'] || "";
                } else if (colKey === "MODULO") {
                    td.innerText = modNombre;
                } else if (colKey === "INICIAL") {
                    td.innerText = rango.i;
                } else if (colKey === "FINAL") {
                    td.innerText = rango.f;
                } else if (colKey === "TOTAL_DE_FOLIOS") {
                    // CÁLCULO ESTRICTO: FINAL - INICIAL + 1
                    let cIni = Number(rango.i);
                    let cFin = Number(rango.f);
                    if (rango.i !== "" && rango.f !== "" && !isNaN(cIni) && !isNaN(cFin)) {
                        let totalCalculado = cFin - cIni + 1;
                        td.innerText = totalCalculado;
                        sumaGranTotalFolios += totalCalculado; // Sumar al gran total global
                    } else {
                        td.innerText = "";
                    }
                } else if (["INICIALES_A", "INICIALES_S", "INICIALES_C", "CONFIGURACION"].includes(colKey)) {
                    // Se muestran en la principal sacados del registro más reciente
                    if (esFilaPrincipal) {
                        td.innerText = dataMod.registros[0][colKey] || "0";
                    } else {
                        td.innerText = "";
                    }
                } else {
                    // COLUMNAS DE TRÁMITES: Solo se suman y muestran en la fila negra (principal)
                    if (esFilaPrincipal) {
                        let sumaCol = 0;
                        dataMod.registros.forEach(reg => {
                            let val = parseFloat(reg[colKey] || 0);
                            if (!isNaN(val)) sumaCol += val;
                        });
                        td.innerText = sumaCol;
                    } else {
                        td.innerText = ""; // Filas rojas van vacías
                    }
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    });

    renderGranTotalAcumulado(tbody, sumaGranTotalFolios);
}

function renderGranTotalAcumulado(tbody, sumaGlobalFolios) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    COLUMNAS_ACUMULADO_KEYS.forEach(colKey => {
        let td = document.createElement('td');

        if (colKey === "MODULO") {
            td.innerText = "TOTAL";
        } else if (["ENT", "DTTO", "INICIAL", "FINAL", "INICIALES_A", "INICIALES_S", "INICIALES_C", "CONFIGURACION"].includes(colKey)) {
            td.innerText = ""; // Vacíos
        } else if (colKey === "TOTAL_DE_FOLIOS") {
            td.innerText = sumaGlobalFolios; // Suma de todos los bloques calculados (negros y rojos)
        } else {
            let sumaTotal = 0;
            dataGlobalAcumulado.forEach(reg => {
                let val = parseFloat(reg[colKey] || 0);
                if (!isNaN(val)) sumaTotal += val;
            });
            td.innerText = sumaTotal;
        }
        trGranTotal.appendChild(td);
    });
    tbody.appendChild(trGranTotal);
}

// Iniciar carga
cargarDatosAcumulado();