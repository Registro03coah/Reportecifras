import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Función para copiar tablas directamente a Excel
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

// Función pura de replicación (sin operaciones, solo dibuja el HTML guardado)
function renderizarDesdeEspejo(selectorTabla, data) {
    const tabla = document.querySelector(selectorTabla);
    if (!tabla) return;
    let thead = tabla.querySelector('thead');
    let tbody = tabla.querySelector('tbody');

    if (data && data.htmlThead && data.htmlTbody) {
        if (thead) thead.innerHTML = data.htmlThead;
        if (tbody) tbody.innerHTML = data.htmlTbody;
    } else {
        if (tbody) tbody.innerHTML = `<tr><td colspan="50" class="text-center text-muted py-3">Sin datos registrados para replicar.</td></tr>`;
    }
}

// Escuchar los nodos directos en la base de datos de Firebase
onValue(ref(db, 'semanal'), (snap) => {
    renderizarDesdeEspejo('#tablaSemanalReporte', snap.val());
});

onValue(ref(db, 'campana'), (snap) => {
    renderizarDesdeEspejo('#tablaCampanaReporte', snap.val());
});

onValue(ref(db, 'acumulado'), (snap) => {
    renderizarDesdeEspejo('#tablaAcumuladoReporte', snap.val());
});
