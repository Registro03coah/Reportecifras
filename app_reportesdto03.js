import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Función universal para copiar tablas a Excel
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
        alert("¡Tabla copiada con éxito! Lista para pegar en Excel.");
    } catch (err) {
        alert("Error al intentar copiar.");
    }
    document.body.removeChild(div);
    selection.removeAllRanges();
};

// Semáforo de conexión en tiempo real
onValue(ref(db, ".info/connected"), (s) => { 
    let sem = document.getElementById("semaforoConexion"); 
    if(sem) {
        sem.className = s.val() ? "badge bg-success text-white ms-2" : "badge bg-danger text-white ms-2";
        sem.innerHTML = s.val() ? '<i class="bi bi-check-circle"></i> ONLINE' : '<i class="bi bi-x-circle"></i> OFFLINE';
    }
});

// Función de replicación visual exacta por medio de espejos
function replicarTablaEspejo(selectorTabla, snapshotVal) {
    const tabla = document.querySelector(selectorTabla);
    if (!tabla) return;
    
    let thead = tabla.querySelector('thead');
    let tbody = tabla.querySelector('tbody');

    if (snapshotVal) {
        if (snapshotVal.htmlThead && thead) thead.innerHTML = snapshotVal.htmlThead;
        if (snapshotVal.htmlTbody && tbody) tbody.innerHTML = snapshotVal.htmlTbody;
        
        if (typeof snapshotVal === 'string' && tbody) {
            tbody.innerHTML = snapshotVal;
        }
    } else {
        if (tbody) tbody.innerHTML = `<tr><td colspan="50" class="text-center text-muted py-3">Esperando datos sincronizados desde los reportes...</td></tr>`;
    }
}

// Consultar última remesa disponible en bd_madre
async function consultarUltimaRemesaBdMadre() {
    const badgeRemesa = document.getElementById("badgeUltimaRemesa");
    try {
        const snapMadre = await get(ref(db, 'bd_madre'));
        if (!snapMadre.exists()) {
            if (badgeRemesa) badgeRemesa.textContent = "Sin datos en BD Madre";
            return "";
        }
        const raw = snapMadre.val();
        const registros = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});

        const remesas = [...new Set(
            registros
                .map(r => String((r && (r.REMESA ?? r.remesa)) || "").trim())
                .filter(Boolean)
        )].sort((a, b) => Number(a) - Number(b));

        const ultima = remesas.length ? remesas[remesas.length - 1] : "";
        if (badgeRemesa) {
            badgeRemesa.innerHTML = ultima
                ? `<i class="bi bi-bookmark-check-fill"></i> Última remesa BD Madre: <strong>${ultima}</strong>`
                : "Sin remesa detectada";
        }
        return ultima;
    } catch (err) {
        console.error("Error consultando bd_madre:", err);
        if (badgeRemesa) badgeRemesa.textContent = "Error al leer BD Madre";
        return "";
    }
}

// Botón manual para refrescar espejos y consultar última remesa de bd_madre
window.actualizarReportesDto03 = async function() {
    const btn = document.getElementById("btnActualizarReportes");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Actualizando...';
    }

    try {
        const [snapSem, snapCamp, snapAcum, ultimaRemesa] = await Promise.all([
            get(ref(db, 'configuracion/reportes_dto03/semanal')),
            get(ref(db, 'configuracion/reportes_dto03/campana')),
            get(ref(db, 'configuracion/reportes_dto03/acumulado')),
            consultarUltimaRemesaBdMadre()
        ]);

        replicarTablaEspejo('#tablaSemanalReporte', snapSem.exists() ? snapSem.val() : null);
        replicarTablaEspejo('#tablaCampanaReporte', snapCamp.exists() ? snapCamp.val() : null);
        replicarTablaEspejo('#tablaAcumuladoReporte', snapAcum.exists() ? snapAcum.val() : null);

        alert(
            ultimaRemesa
                ? `Reportes actualizados. Última remesa en BD Madre: ${ultimaRemesa}`
                : "Reportes actualizados desde los nodos sincronizados."
        );
    } catch (err) {
        console.error("Error al actualizar reportes:", err);
        alert("Hubo un problema al actualizar los reportes.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Actualizar Remesas';
        }
    }
};

// 1. Escuchar el espejo de Semanal
onValue(ref(db, 'configuracion/reportes_dto03/semanal'), (snap) => {
    replicarTablaEspejo('#tablaSemanalReporte', snap.val());
});

// 2. Escuchar el espejo de Campaña (Sincronizado directamente con tu app_campana.js)
onValue(ref(db, 'configuracion/reportes_dto03/campana'), (snap) => {
    replicarTablaEspejo('#tablaCampanaReporte', snap.val());
});

// 3. Escuchar el espejo de Acumulado
onValue(ref(db, 'configuracion/reportes_dto03/acumulado'), (snap) => {
    replicarTablaEspejo('#tablaAcumuladoReporte', snap.val());
});

// Consultar última remesa al cargar
consultarUltimaRemesaBdMadre();
