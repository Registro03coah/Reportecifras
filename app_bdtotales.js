// =========================================================
// CONFIGURACIÓN FIREBASE
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const database = getDatabase(app);

let datosGlobalesTotales = [];
let datosEnPantallaTotales = [];
let columnaOrdenActual = 'REMESA';
let ordenAscendente = false;

// =========================================================
// SEMÁFORO DE CONEXIÓN
// =========================================================
const connectedRef = ref(database, ".info/connected");
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

// =========================================================
// RECUPERAR INICIALES FIJAS AL CARGAR LA PÁGINA
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    ['camp_50351', 'camp_50353', 'camp_50354', 'acum_50351', 'acum_50353', 'acum_50354'].forEach(id => {
        let input = document.getElementById(id);
        if (input) input.value = localStorage.getItem(id) || "";
    });
});

// =========================================================
// LECTURA EN TIEMPO REAL DESDE BDTOTALES
// =========================================================
onValue(ref(database, 'bdtotales'), (snapshot) => {
    let datos = snapshot.val();
    let crudos = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    
    // Normalizar llaves para evitar duplicados en memoria
    datosGlobalesTotales = crudos.map(item => {
        let limpio = {};
        for (let key in item) {
            limpio[key.toUpperCase().trim()] = item[key];
        }
        return limpio;
    });

    ejecutarOrdenamientoTotales(datosGlobalesTotales);
});

// ORDENAMIENTO MULTI-CRITERIO: REMESA -> MÓDULO
function ejecutarOrdenamientoTotales(arreglo) {
    if(!arreglo || arreglo.length === 0) {
        dibujarTablaTotales([]);
        return;
    }

    arreglo.sort((a, b) => {
        let remesaA = String(a['REMESA'] || '').trim();
        let remesaB = String(b['REMESA'] || '').trim();
        if (remesaA !== remesaB) return remesaB.localeCompare(remesaA, undefined, { numeric: true });

        let moduloA = String(a['MODULO'] || '').trim();
        let moduloB = String(b['MODULO'] || '').trim();
        if (moduloA !== moduloB) return moduloA.localeCompare(moduloB, undefined, { numeric: true });

        let valA = a[columnaOrdenActual] !== undefined && a[columnaOrdenActual] !== null ? String(a[columnaOrdenActual]).toUpperCase() : '';
        let valB = b[columnaOrdenActual] !== undefined && b[columnaOrdenActual] !== null ? String(b[columnaOrdenActual]).toUpperCase() : '';

        if (!isNaN(valA) && !isNaN(valB) && valA.trim() !== '' && valB.trim() !== '') {
            valA = Number(valA);
            valB = Number(valB);
        }

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    dibujarTablaTotales(arreglo);
}

window.cambiarOrdenTotales = function(columnaClick) {
    if (columnaOrdenActual === columnaClick) {
        ordenAscendente = !ordenAscendente;
    } else {
        columnaOrdenActual = columnaClick;
        ordenAscendente = false;
    }
    ejecutarOrdenamientoTotales(datosEnPantallaTotales);
};

function dibujarTablaTotales(datosArreglo) {
    datosEnPantallaTotales = datosArreglo;
    const thead = document.getElementById('cabeceraBdTotales');
    const tbody = document.getElementById('cuerpoBdTotales');
    if(!thead || !tbody) return;
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en BD Totales. Sube un archivo JSON.</td></tr>';
        return;
    }

    const ordenDeseado = [
        "IDMAC", "MODULO", "REMESA", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
        "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
        "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
        "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
        "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR",
        "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "LIBRE2", "RETIRADAS_POR_OTRA_CAUSA", "DISPONIBLES",
        "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CRED_PROD_CANJE_POR_NUEVA", "INICIALES_A", "INICIALES_S", "INICIALES_C",
        "ACTUALIZACIÓN", "FICHAS_ENTREGADAS", "FICHAS_ATENDIDAS", "DIAS_TRABAJADOS", "SOLICITUD_EXPEDICION_REPATRIADOS",
        "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", "TOTAL_DE_MOVIMIENTOS",
        "DEVUELTAS_POR_TERCEROS", "34_IMAGEN_INCONSISTENTE", "35_MOVIMIENTO_POSTERIOR", "CONFIGURACION",
        "ENT", "DTTO", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "SRIPT_EJECUTADO_VIGENCIA", "FOLIO_NEC_POST",
        "CARTOGRAFIA_SOLICITUD", "LOTES_DE_CREDENCIALES", "REGISTRADAS_POR_DIA", "FALTANTES", "OBSERVACIONES",
        "NO_UTILIZADOS", "SIN_NOMBRE3", "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA", "IMPORTADAS", "EXPORTADAS",
        "REPOSISION_REIMPRESIONES", "MAL_IMPRESAS", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION",
        "DUPLICADO", "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA", "MOY_POST", "ANEXAS_A_SOLICITUD",
        "OTRAS_BAJAS", "SOBRANTES", "DUPLICADOS", "DISPONIBLES_DE_SOL_DE_EXP", "REIMPRE_FUERA_DEL_SISTEMA",
        "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", "CIF-05", "SOLICITUDE_RECTIFICACIÒN"
    ];

    let columnasDisponibles = Object.keys(datosArreglo[0]);
    let columnas = ordenDeseado.filter(col => columnasDisponibles.includes(col));
    columnasDisponibles.forEach(c => { if (!columnas.includes(c)) columnas.push(c); });

    let trHead = '<tr><th style="min-width: 90px; background-color: #1b396b; z-index: 5;">ACCIONES</th>';
    columnas.forEach(col => {
        let nombreVisual = col.replace('CORR__DE_DATOS_DIRECCION', 'CORR._DE_DATOS_DIRECCION')
                              .replace('RECIBO_Y_O_EXTRAVIO', 'RECIBO_Y/O_EXTRAVIO');
        let iconoFlechita = '<i class="bi bi-arrow-down-up ms-1" style="font-size: 0.8em; color: rgba(255,255,2