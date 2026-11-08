/**
 * Lógica para procesar los datos, agruparlos por módulo, 
 * calcular los totales semanales y guardarlos en el nodo "semanal" de Firebase.
 */

// Importar Firebase (asegúrate de que tu inicialización sea correcta)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Lista de llaves de columnas estándar para la tabla semanal
const COLUMNAS_KEYS = [
    "ENT", "DTTO", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", 
    "NO_UTILIZADOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", 
    "REPOSISION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", 
    "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CANCELADOS", "TOTAL_DE_MOVIMIENTOS", 
    "CIF-05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", 
    "INICIALES_S", "ACTUALIZACIÓN", "RECIBIDAS_DE_OTROS_TYPES", "IMPORTADAS", "EXPORTADAS", 
    "ENTREGADAS", "ANEXAS_A_FUAR", "RESGUARDO", "SOLICITU_DE_REIMPRESION", "RECIBO_Y_O_EXTRAVIO", 
    "RETIRADAS_POR_OTRA_CAUSA", "SOBRANTES", "DUPLICADO", "DISPONIBLES", "DISPONIBLES_DE_SOL_DE_EXP", 
    "REIMPRE_FUERA_DEL_SISTEMA", "CREDEN_DEVUELTAS_POR_TERCEROS", "CRED_PRODUCTO_DE_REGISTRO_DUPLICADO", 
    "CRED_PROD_CANJE_POR_NUEVA", "DIAS_TRABAJADOS", "CONFIGURACION"
];

function generarYGuardarReporteSemanal(datosSemana) {
    const modulosEnOrden = ["050351", "050353", "050354"];
    let modulosSemanalMap = {};

    // Agrupar los registros por módulo
    datosSemana.forEach(d => {
        let mod = String(d.modulo || '').trim();
        if (!modulosSemanalMap[mod]) modulosSemanalMap[mod] = [];
        modulosSemanalMap[mod].push(d);
    });

    let filasHtmlTbody = "";
    let granTotalCols = {};

    // Procesar cada módulo para dejar exactamente UNA sola línea de totales
    modulosEnOrden.forEach(modulo => {
        let registrosMod = modulosSemanalMap[modulo];
        if (!registrosMod || registrosMod.length === 0) return;

        let baseReg = registrosMod[registrosMod.length - 1];

        // Obtener el folio inicial menor y el folio final mayor
        let minIniciales = registrosMod.map(r => r.inicial || r.fi).filter(v => v);
        let maxFinales = registrosMod.map(r => r.final || r.ff).filter(v => v);
        
        let folioMin = minIniciales.length > 0 ? minIniciales[0] : (baseReg.inicial || "0");
        let folioMax = maxFinales.length > 0 ? maxFinales[maxFinales.length - 1] : (baseReg.final || "0");

        let filaConsolidadaCols = {};

        // Mapear y sumar columnas numéricas correspondientes
        COLUMNAS_KEYS.forEach(colKey => {
            if (colKey === "ENT") filaConsolidadaCols[colKey] = baseReg.ent || 5;
            else if (colKey === "DTTO") filaConsolidadaCols[colKey] = baseReg.dtto || 3;
            else if (colKey === "MODULO") filaConsolidadaCols[colKey] = modulo;
            else if (colKey === "INICIAL") filaConsolidadaCols[colKey] = folioMin;
            else if (colKey === "FINAL") filaConsolidadaCols[colKey] = folioMax;
            else {
                let sumaCol = 0;
                registrosMod.forEach(reg => {
                    // Buscar la propiedad equivalente en minúsculas/camelCase o sumar directamente
                    let valorReg = parseFloat(reg[colKey.toLowerCase()] || reg[colKey] || 0);
                    if (!isNaN(valorReg)) sumaCol += valorReg;
                });
                filaConsolidadaCols[colKey] = sumaCol;
                granTotalCols[colKey] = (granTotalCols[colKey] || 0) + sumaCol;
            }
        });

        // Generar la fila HTML para este módulo
        filasHtmlTbody += `<tr>`;
        COLUMNAS_KEYS.forEach(colKey => {
            let val = filaConsolidadaCols[colKey];
            let claseExtra = ['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey) ? ' class="col-orange"' : '';
            filasHtmlTbody += `<td${claseExtra}>${val !== undefined && val !== "" ? val : "0"}</td>`;
        });
        filasHtmlTbody += `</tr>`;
    });

    // Agregar la fila de GRAN TOTAL al final
    filasHtmlTbody += `<tr class="fila-totales">`;
    COLUMNAS_KEYS.forEach(colKey => {
        if (colKey === "MODULO") {
            filasHtmlTbody += `<td>GRAN TOTAL</td>`;
        } else if (["INICIAL", "FINAL", "INICIALES_S", "CONFIGURACION", "ENT", "DTTO"].includes(colKey)) {
            filasHtmlTbody += `<td></td>`;
        } else {
            filasHtmlTbody += `<td>${granTotalCols[colKey] || 0}</td>`;
        }
    });
    filasHtmlTbody += `</tr>`;

    // Construir el thead limpio
    let htmlThead = `<tr>`;
    COLUMNAS_KEYS.forEach(colKey => {
        let claseFolios = ['INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS'].includes(colKey) ? ' class="bg-folios"' : '';
        htmlThead += `<th${claseFolios}>${colKey.replace(/_/g, ' ')}</th>`;
    });
    htmlThead += `</tr>`;

    // Guardar directamente en la ruta "semanal" en Firebase para que Reportes Dtto 03 lo replique impecable
    set(ref(db, 'semanal'), {
        htmlThead: htmlThead,
        htmlTbody: filasHtmlTbody
    }).then(() => {
        console.log("¡Reporte semanal consolidado guardado con éxito en Firebase!");
    }).catch((err) => {
        console.error("Error al guardar en Firebase:", err);
    });
}
