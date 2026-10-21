// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN FIREBASE (REPORTE CAMPAÑA)
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

// Mismo orden validado que en el Semanal
const COLUMNAS_CAMPANA_KEYS = [
    "ENT", "DTTO", "MODULO", "REMESA", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", 
    "RECIBO_Y_O_EXTRAVIO", "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", 
    "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA", 
    "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION", 
    "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", 
    "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", 
    "TOTAL_DE_TRAMITES", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", 
    "TOTAL_DE_MOVIMIENTOS", "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", 
    "DEMANDA_DE_JUICIO", "INICIALES_A", "INICIALES_S", "INICIALES_C", "ACTUALIZACIÓN", 
    "RECIBIDAS_DE_OTROS_TIPOS", "IMPORTADAS", "EXPORTADAS", "ENTREGADAS"
];

let bdtotalesGlobal = [];
let bdMadreGlobal = [];

// ==========================================
// 2. GESTIÓN DE RANGO DE CAMPAÑA (LOCALSTORAGE)
// ==========================================
function inicializarFiltrosCampana() {
    const inputInicio = document.getElementById('inputCampanaInicio');
    const inputFin = document.getElementById('inputCampanaFin');
    const btnGuardar = document.getElementById('btnGuardarCampana');

    if(inputInicio && inputFin) {
        inputInicio.value = localStorage.getItem('campanaRemesaInicio') || '';
        inputFin.value = localStorage.getItem('campanaRemesaFin') || '';

        if(btnGuardar) {
            btnGuardar.addEventListener('click', () => {
                localStorage.setItem('campanaRemesaInicio', inputInicio.value.trim());
                localStorage.setItem('campanaRemesaFin', inputFin.value.trim());
                alert("Rango de campaña guardado exitosamente.");
                renderTablaCampana();
            });
        }
    }
}

function construirHeaderTabla(selectorTabla) {
    const thead = document.querySelector(`${selectorTabla} thead`);
    if(!thead) return;
    thead.innerHTML = "";
    let trTitulos = document.createElement('tr');
    
    COLUMNAS_CAMPANA_KEYS.forEach((colKey) => {
        let thT = document.createElement('th');
        let nombreVisual = colKey.replace(/_/g, ' ')
                                  .replace('SOLICITU DE', 'SOLICITUD DE')
                                  .replace('DUPLICADO', 'DUPLICADOS')
                                  .replace('DISPONIBLES', 'DISPONIBLES TOTAL')
                                  .replace('CORR  DE', 'CORR DE');
        
        thT.innerText = nombreVisual;
        thT.style.height = "50px";
        thT.style.verticalAlignment = "middle";
        thT.style.fontSize = "11px";
        
        let anchoCelda = "90px"; 
        if(['MODULO', 'REMESA', 'ENT', 'DTTO'].includes(colKey)) anchoCelda = "70px"; 
        else if(['INICIAL', 'FINAL'].includes(colKey)) anchoCelda = "110px";
        
        thT.style.width = anchoCelda; thT.style.minWidth = anchoCelda;
        
        if(['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey)) {
            thT.classList.add('bg-folios');
        }
        trTitulos.appendChild(thT);
    });
    thead.appendChild(trTitulos);
}

// ==========================================
// 3. CARGA DE DATOS Y RENDERIZADO
// ==========================================
function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) limpio[key.toUpperCase().trim()] = item[key];
    return limpio;
}

function cargarDatosCampana() {
    construirHeaderTabla('#tablaCampana');
    inicializarFiltrosCampana();

    Promise.all([
        get(ref(db, 'bd_madre')),
        get(ref(db, 'bdtotales'))
    ]).then(([snapMadre, snapTotales]) => {
        if (snapMadre.exists()) bdMadreGlobal = (Array.isArray(snapMadre.val()) ? snapMadre.val() : Object.values(snapMadre.val())).map(normalizarObjeto);
        if (snapTotales.exists()) bdtotalesGlobal = (Array.isArray(snapTotales.val()) ? snapTotales.val() : Object.values(snapTotales.val())).map(normalizarObjeto);
        renderTablaCampana();
    });
}

function renderTablaCampana() {
    const tbody = document.querySelector('#tablaCampana tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    const rInicio = localStorage.getItem('campanaRemesaInicio');
    const rFin = localStorage.getItem('campanaRemesaFin');

    if (!rInicio || !rFin) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_CAMPANA_KEYS.length}" class="text-center py-4 text-muted">Por favor establece la remesa Inicial y Final de la Campaña.</td></tr>`;
        return;
    }

    // Filtrar registros que estén en el rango de remesas
    let dataFiltrada = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    let registrosRango = dataFiltrada.filter(item => {
        let r = String(item['REMESA'] || '').trim();
        return r >= rInicio && r <= rFin;
    });

    if (registrosRango.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${COLUMNAS_CAMPANA_KEYS.length}" class="text-center py-4 text-muted">No hay datos en el rango de remesas indicado (${rInicio} a ${rFin}).</td></tr>`;
        return;
    }

    // Agrupar por módulo
    let modulosMap = {};
    registrosRango.forEach(f => {
        let mod = String(f['MODULO'] || 'General').trim();
        if (!modulosMap[mod]) modulosMap[mod] = [];
        modulosMap[mod].push(f);
    });

    Object.keys(modulosMap).sort().forEach(modNombre => {
        let tr = document.createElement('tr');
        
        // Ordenar los registros del módulo por remesa para asegurar 1ero y último
        let registrosMod = modulosMap[modNombre].sort((a, b) => String(a['REMESA']).localeCompare(String(b['REMESA'])));
        
        let primerRegistro = registrosMod[0];
        let ultimoRegistro = registrosMod[registrosMod.length - 1];

        COLUMNAS_CAMPANA_KEYS.forEach(colKey => {
            let td = document.createElement('td');

            if (colKey === "MODULO") {
                td.innerText = modNombre;
            } else if (colKey === "REMESA") {
                td.innerText = `${rInicio} - ${rFin}`;
            } else if (colKey === "INICIAL") {
                td.innerText = primerRegistro["INICIAL"] || "0"; // Primer folio de la remesa inicial
            } else if (colKey === "FINAL") {
                td.innerText = ultimoRegistro["FINAL"] || "0"; // Último folio de la remesa final
            } else if (["INICIALES_A", "INICIALES_S", "INICIALES_C"].includes(colKey)) {
                td.innerText = primerRegistro[colKey] || "0"; // Iniciales de la remesa inicial
            } else if (colKey === "CONFIGURACION") {
                td.innerText = ultimoRegistro[colKey] || "0"; // Configuración de la última remesa (no se suma)
            } else if (["ENT", "DTTO"].includes(colKey)) {
                td.innerText = primerRegistro[colKey] || "";
            } else {
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

    renderGranTotalCampana(tbody, modulosMap, rInicio, rFin);
}

function renderGranTotalCampana(tbody, modulosMap, rInicio, rFin) {
    let trGranTotal = document.createElement('tr');
    trGranTotal.classList.add('fila-totales');
    
    // Obtenemos todos los registros de todos los módulos ya ordenados
    let todosLosRegistros = [];
    Object.values(modulosMap).forEach(arr => todosLosRegistros = todosLosRegistros.concat(arr));
    
    COLUMNAS_CAMPANA_KEYS.forEach(colKey => {
        let td = document.createElement('td');

        if (colKey === "MODULO") {
            td.innerText = "GRAN TOTAL";
        } else if (colKey === "REMESA") {
            td.innerText = `${rInicio} - ${rFin}`;
        } else if (["INICIAL", "FINAL", "INICIALES_A", "INICIALES_S", "INICIALES_C", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
            td.innerText = ""; // Se dejan vacíos en el gran total
        } else {
            let sumaTotal = 0;
            todosLosRegistros.forEach(reg => {
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
cargarDatosCampana();
