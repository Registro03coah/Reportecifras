const firebaseConfig = { 
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", 
    authDomain: "cifrasmac.firebaseapp.com", 
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", 
    projectId: "cifrasmac" 
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let datosGlobalesBd = []; 
let datosEnPantalla = []; 
let columnaOrdenActual = 'REMESA'; 
let ordenAscendente = false; 
let idmacEdicionActual = null;

function generarIdMac(remesa, modulo) {
    let modStr = String(modulo || '').replace(/\D/g, ''); 
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';
    let remStr = String(remesa || '').trim(); 
    let remMatch = remStr.match(/(\d+)\s*(-?\s*bis\d*)?/i);
    let numPart = '0000'; 
    let suffix = '';
    if (remMatch) { 
        numPart = remMatch[1].length >= 4 ? remMatch[1].slice(-4) : remMatch[1].padStart(4, '0'); 
        if (remMatch[2]) { 
            suffix = remMatch[2].replace(/\s+/g, ''); 
            if (!suffix.startsWith('-')) suffix = '-' + suffix; 
        } 
    }
    return `${modDigits}${numPart}${suffix}`;
}

// ORDEN EXACTO DE SEMANAL AL PRINCIPIO, Y LOS DEMÁS CAMPOS EXTRA DE FIREBASE AL FINAL
const ordenDeseado = [
    // --- Orden exacto del Reporte Semanal ---
    'ENT', 'DTTO', 'MODULO', 'INICIAL', 'FINAL', 'TOTAL_DE_FOLIOS', 'INSCRIPCIONES', 
    'CORRECCION_DE_DATOS_PERSONALES', 'CAMBIO_DE_DOMICILIO', 'REPOSISION', 'REIMPRESION', 
    'CORR__DE_DATOS_DIRECCION', 'REINCORPORACION', 'REEMPLAZO', 'TOTAL_DE_TRAMITES', 
    'RECHAZOS_DE_MAC_34', 'RECHAZOS_DE_MAC_35', 'CANCELADOS', 'TOTAL_DE_MOVIMIENTOS', 
    'CIF-05', 'CREDEN_DEVUELTAS_POR_TERCEROS', 'SOLICITUD_EXPEDICION', 'SOLICITUD_RECTIFICACION', 
    'DEMANDA_DE_JUICIO', 'INICIALES_C', 'INICIALES_A', 'INICIALES_S', 'ACTUALIZACIÓN', 
    'RECIBIDAS_DE_OTROS_TIPOS', 'IMPORTADAS', 'EXPORTADAS', 'ENTREGADAS', 'RECIBO_Y_O_EXTRAVIO', 
    'CPV_DEVUELTA_ENTREGA', 'RESGUARDO', 'SOLICITUD_DE_REIMPRESION', 'RETIRADAS_POR_OTRA_CAUSA', 
    'DISPONIBLES', 'DUPLICADO', 'DISPONIBLES_AL_DÍA_ANTERIOR', 'DIAS_TRABAJADOS', 'CONFIGURACION', 
    'SRIPT_EJECUTADO_VIGENCIA', 'REMESA', 'DIA', 'FECHA', 'IDMAC', 'SEDES',
    
    // --- Campos adicionales que Firebase contiene y se ubicarán al final ---
    '34_IMAGEN_INCONSISTENTE', '35_MOVIMIENTO_POSTERIOR', 'ANEXAS_A_FUAR', 'ANEXAS_A_SOLICITUD', 
    'CARTOGRAFIA_SOLICITUD', 'CRED_PROD_CANJE_POR_NUEVA', 'CRED_PRODUCTO_DE_REGISTRO_DUPLICADO', 
    'DATOS_ERRONEOS', 'DEFUNCION', 'DEVUELTAS_POR_TERCEROS', 'DISPONIBLES_DE_SOL_DE_EXP', 
    'DUPLICADOS', 'ERROR_EN_CARTOGRAFIA', 'ERROR_EN_NUM_DE_EMISION', 'FALTANTES', 'FICHAS_ATENDIDAS', 
    'FICHAS_ENTREGADAS', 'FOLIO_NEC_POST', 'FOTO_MAL_IMPRESA', 'LOTES_DE_CREDENCIALES', 
    'MAC_QUE_ENTREGA', 'MAC_QUE_RECIBE', 'MAL_IMPRESAS', 'MOV_POST', 'NO_UTILIZADOS', 
    'OBSERVACIONES', 'OTRAS_BAJAS', 'PERDIDA_DE_VIGENCIA', 'REGISTRADAS_POR_DIA', 
    'REIMPRE_FUERA_DEL_SISTEMA', 'REPOSISION_REIMPRESIONES', 'SIN_NOMBRE3', 'SOBRANTES', 
    'SOLICITUD_EXPEDICION_REPATRIADOS', 'SOLICITUDE_RECTIFICACIÒN', 'SUSPENSION', 'TOTAL_DE_ANEXO_DE_RECHAZO'
];

function obtenerIndiceOrden(k) { 
    let idx = ordenDeseado.indexOf(k.toUpperCase().trim()); 
    return idx !== -1 ? idx : 9999; 
}

database.ref('bdtotales').on('value', (snap) => {
    let datos = snap.val(); 
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    ejecutarOrdenamiento(datosGlobalesBd);
});

document.addEventListener('DOMContentLoaded', () => {
    const b = document.getElementById('buscadorBdTotales');
    if(b) b.addEventListener('input', e => {
        let t = e.target.value.toLowerCase().trim();
        if(t === '') { ejecutarOrdenamiento(datosGlobalesBd); return; }
        ejecutarOrdenamiento(datosGlobalesBd.filter(i => String(i.IDMAC || generarIdMac(i.REMESA, i.MODULO)).toLowerCase().includes(t) || String(i.REMESA).toLowerCase().includes(t)));
    });
});

function ejecutarOrdenamiento(arr) {
    if(!arr || arr.length === 0) { dibujarTabla([]); return; }
    let o = [...arr];
    o.sort((a, b) => {
        let rA = String(a.REMESA || '').trim(); 
        let rB = String(b.REMESA || '').trim();
        if(rA !== rB) return rB.localeCompare(rA, undefined, {numeric: true});
        let mA = String(a.MODULO || '').trim(); 
        let mB = String(b.MODULO || '').trim();
        return mA.localeCompare(mB, undefined, {numeric: true});
    });
    dibujarTabla(o);
}

window.cambiarOrden = function(col) { 
    if (columnaOrdenActual === col) ordenAscendente = !ordenAscendente; 
    else { columnaOrdenActual = col; ordenAscendente = false; } 
    ejecutarOrdenamiento(datosEnPantalla); 
};

function dibujarTabla(arr) {
    datosEnPantalla = arr;
    const thead = document.getElementById('cabeceraBdTotales'); 
    const tbody = document.getElementById('cuerpoBdTotales');
    if(!thead || !tbody) return; 
    thead.innerHTML = ''; 
    tbody.innerHTML = '';
    if(arr.length === 0) return;
    
    let datosNorm = arr.map(i => {
        let obj = {}; 
        for(let k in i) obj[k.toUpperCase().trim()] = i[k];
        obj['IDMAC'] = generarIdMac(obj['REMESA'], obj['MODULO']); 
        return obj;
    });

    let colSet = new Set(); 
    datosNorm.forEach(i => Object.keys(i).forEach(k => colSet.add(k)));
    
    // Ordenar columnas aplicando la jerarquía de ordenDeseado (lo de semanal primero, el resto al final)
    let columnas = Array.from(colSet).sort((a, b) => obtenerIndiceOrden(a) - obtenerIndiceOrden(b));
    
    let trH = '<tr><th class="text-white text-center">ACCIONES</th>';
    columnas.forEach(col => { 
        trH += `<th class="text-white" onclick="cambiarOrden('${col}')">${col.replace(/_/g, ' ')}</th>`; 
    });
    trH += '</tr>'; 
    thead.innerHTML = trH;
    
    let htmlB = '';
    datosNorm.forEach(fila => {
        htmlB += `<tr><td class="text-center align-middle" style="white-space:nowrap;"><button class="btn btn-sm btn-warning py-0 px-1 me-1" onclick="editarRegistro('${fila.IDMAC}')"><i class="bi bi-pencil-square"></i></button><button class="btn btn-sm btn-danger py-0 px-1" onclick="borrarRegistro('${fila.IDMAC}')"><i class="bi bi-trash"></i></button></td>`;
        columnas.forEach(col => {
            let val = fila[col] !== undefined ? fila[col] : '';
            if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
            htmlB += `<td>${val}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;
}

window.borrarRegistro = function(id) {
    if(confirm(`¿Eliminar registro ${id}?`)) {
        database.ref('bdtotales').set(datosGlobalesBd.filter(i => (i.IDMAC || generarIdMac(i.REMESA, i.MODULO)) !== id))
        .then(() => alert("Eliminado."))
        .catch(() => alert("Error al eliminar."));
    }
}

window.descargarRespaldoTotalesJSON = function() {
    const jsonString = JSON.stringify(datosGlobalesBd, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `bdtotales_respaldo.json`;
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url);
}
