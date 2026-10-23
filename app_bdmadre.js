const firebaseConfig = { apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", authDomain: "cifrasmac.firebaseapp.com", databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", projectId: "cifrasmac" };
firebase.initializeApp(firebaseConfig); const database = firebase.database();
const ordenColumnas = ["REMESA", "MODULO", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS", "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION", "REPOSICION", "CORR__DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CPV_DEVUELTA_ENTREGA", "DISPONIBLES_AL_DIA_ANTERIOR", "ACTUALIZACION", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR", "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "SOLICITU_DE_REIMPRESION", "RETIRADAS_POR_OTRA_CAUSA", "DISPONIBLES", "CREDENCIALES_X_CANJE", "FICHAS_ENTREGADAS", "FICHAS_ATENDIDAS", "DIAS_TRABAJADOS", "CIF_05", "SOLICITUD_EXPEDICION", "SOLICITUD_RECTIFICACION", "DEMANDA_DE_JUICIO", "TOTAL_DE_MOVIMIENTOS", "CREDEN_DEVUELTAS_POR_TERCEROS", "RECHAZOS_DE_MAC_34", "RECHAZOS_DE_MAC_35", "CONFIGURACION", "ENT", "DTTO", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "CPV_DEVUELTA_ENTREGA_2", "SCRIPT_EJECUTADOS", "FOLIO_NEC", "NUMERO_DE_TRAMITES_APLICADOS", "NUMERO_DE_FICHAS_REQUISITADAS", "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS", "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS", "CREDENCIALES_RECIBIDAS", "CREDENCIALES_INCONSISTENTES", "CREDENCIALES_EN_RESGUARDO", "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA", "TOTAL_DE_CREDENCIALES_ENTREGADAS", "TOTAL_DE_CREDENCIALES_SOLICITADAS", "IMPORTADAS", "EXPORTADAS", "REPOSICIONES_REIMPRESIONES", "MAL_IMPRESA", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA", "MOV_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS", "FECHA", "HORAS_TRABAJADAS", "SEDES", "DIA"];
database.ref('bd_madre').on('value', (snap) => {
    let data = snap.val(); let arr = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    const thead = document.getElementById('cabeceraBdMadre'); const tbody = document.getElementById('cuerpoBdMadre');
    if(!thead || !tbody) return; thead.innerHTML = ''; tbody.innerHTML = '';
    if (arr.length === 0) return;
    let trH = '<tr>'; ordenColumnas.forEach(k => trH += `<th>${k.replace(/_/g, ' ').toUpperCase()}</th>`); trH += '</tr>'; thead.innerHTML = trH;
    let htmlB = '';
    arr.forEach(item => {
        let limpio = {}; for (let k in item) limpio[k.toUpperCase().trim()] = item[k];
        htmlB += '<tr>';
        ordenColumnas.forEach(k => {
            let val = limpio[k] !== undefined ? limpio[k] : (limpio[k.toUpperCase()] !== undefined ? limpio[k.toUpperCase()] : '');
            if(typeof val === 'string' && val.includes('T00:00:00')) val = val.split('T')[0];
            htmlB += `<td>${val}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;
});