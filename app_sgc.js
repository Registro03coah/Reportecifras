// ==========================================
// LÓGICA PANEL SGC CONSOLIDADO (app_sgc.js)
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

let bdtotalesGlobal = [];
let sgcRemesasData = {}; 

// Configuración de filas usando estrictamente las llaves correctas de tu base de datos
const FILAS_SGC_CONFIG = [
    { bdKey: "TOTAL_DE_FOLIOS", nominativo: "Número de trámites aplicados", tipo: "calculo_10_folios" },
    { bdKey: "TOTAL_DE_TRAMITES", nominativo: "Número de fichas requisitadas", tipo: "calculo_10_tramites" },
    { bdKey: "EDITABLE_EXITOSOS", nominativo: "Número de trámites exitosos", tipo: "editable" },
    { bdKey: "TOTAL_DE_FOLIOS", nominativo: "Número de trámites aplicados", tipo: "directo_1" },
    { bdKey: "SCRIPT_EJECUTADO", nominativo: "Script solicitados", tipo: "directo_1" },
    { bdKey: "SCRIPT_EJECUTADO", nominativo: "Script ejecutados", tipo: "directo_2" },
    { bdKey: "ACTUALIZACION", nominativo: "Credenciales Recibidas", tipo: "directo_1" },
    { bdKey: "ACTUALIZACION", nominativo: "Credenciales recibidas", tipo: "directo_2" },
    { bdKey: "DISPONIBLES_TOTAL", nominativo: "Credenciales en resguardo", tipo: "directo_1" },
    { bdKey: "DISPONIBLES_TOTAL", nominativo: "Credenciales totales en", tipo: "directo_2" },
    { bdKey: "EXPORTADAS", nominativo: "Total de credenciales entregadas", tipo: "directo_1" },
    { bdKey: "EXPORTADAS", nominativo: "Total de credenciales solicitadas", tipo: "directo_2" }
];

onValue(ref(db, ".info/connected"), (s) => {
    let sem = document.getElementById("semaforoConexion");
    if (sem) {
        sem.className = s.val() ? "badge bg-success text-white px-2 py-1" : "badge bg-danger text-white px-2 py-1";
        sem.innerHTML = s.val() ? '<i class="bi bi-wifi"></i> ONLINE' : '<i class="bi bi-wifi-off"></i> OFFLINE';
    }
});

function normalizarObjeto(item) {
    let limpio = {};
    for (let key in item) {
        limpio[key.toUpperCase().trim()] = item[key];
    }
    return limpio;
}

function cargarDatosPanelSGC() {
    Promise.all([
        get(ref(db, 'bdtotales')),
        get(ref(db, 'bdSGC'))
    ]).then(([snapTotales, snapSGC]) => {
        if (snapTotales.exists()) {
            let dataRaw = snapTotales.val();
            let listaOriginal = Array.isArray(dataRaw) ? dataRaw : Object.values(dataRaw);
            bdtotalesGlobal = listaOriginal.map(normalizarObjeto);
        } else {
            bdtotalesGlobal = [];
        }

        if (snapSGC.exists()) {
            sgcRemesasData = snapSGC.val();
        } else {
            sgcRemesasData = {};
        }

        poblarSelectorRemesas();
        construirMatrizSGC();
    }).catch(err => console.error("Error al cargar datos para Panel SGC:", err));
}

function obtenerRemesasDisponibles() {
    let remesasSet = new Set();
    bdtotalesGlobal.forEach(r => {
        let rem = String(r['REMESA'] || '').trim();
        if (rem && parseInt(rem, 10) >= 202637) {
            remesasSet.add(rem);
        }
    });
    return Array.from(remesasSet).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

function poblarSelectorRemesas() {
    let listaRemesas = obtenerRemesasDisponibles();
    const select = document.getElementById('selectRemesaInicio');
    if (!select) return;

    select.innerHTML = "";
    let remesaGuardada = localStorage.getItem('sgc_remesa_inicial') || "202637";

    listaRemesas.forEach(rem => {
        let opt = document.createElement('option');
        opt.value = rem;
        opt.innerText = rem;
        if (rem === remesaGuardada) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

window.cambiarRemesaInicial = function(nuevaRemesa) {
    localStorage.setItem('sgc_remesa_inicial', nuevaRemesa);
    construirMatrizSGC();
};

function construirMatrizSGC() {
    let listaRemesas = obtenerRemesasDisponibles();
    if (listaRemesas.length === 0) {
        console.warn("No se encontraron remesas >= 202637 en bdtotales.");
        return;
    }

    let remesaInicialSeleccionada = localStorage.getItem('sgc_remesa_inicial') || "202637";
    let remesasFiltradas = listaRemesas.filter(rem => parseInt(rem, 10) >= parseInt(remesaInicialSeleccionada, 10));

    if (remesasFiltradas.length === 0) {
        remesasFiltradas = listaRemesas;
    }

    const trRemesasHeader = document.getElementById('trRemesasHeader');
    const trModulosHeader = document.getElementById('trModulosHeader');
    const tbody = document.getElementById('tbodyPanelSGC');

    trRemesasHeader.innerHTML = `<th class="col-nominativo" rowspan="2">Nominativo (Concepto SGC)</th>`;
    trModulosHeader.innerHTML = ``;
    tbody.innerHTML = ``;

    const modulosSub = ["50351", "50353", "50354"];

    remesasFiltradas.forEach(remesa => {
        let thRem = document.createElement('th');
        thRem.setAttribute('colspan', '3');
        thRem.innerText = remesa;
        trRemesasHeader.appendChild(thRem);

        modulosSub.forEach((mod, idx) => {
            let thMod = document.createElement('th');
            thMod.innerText = mod;
            if(idx === 0) thMod.style.backgroundColor = "#d6d8db";
            else if(idx === 1) thMod.style.backgroundColor = "#cce5ff";
            else thMod.style.backgroundColor = "#ffeeba";
            thMod.style.color = "#000";
            trModulosHeader.appendChild(thMod);
        });
    });

    FILAS_SGC_CONFIG.forEach((filaConfig) => {
        let tr = document.createElement('tr');
        
        if (filaConfig.tipo === 'editable') {
            tr.className = "fila-editable";
        } else if (filaConfig.tipo.includes('directo_2') || filaConfig.tipo.includes('calculo')) {
            tr.className = "bg-osCURO";
        }

        let tdNom = document.createElement('td');
        tdNom.className = "td-nominativo";
        tdNom.innerText = filaConfig.nominativo;
        if(filaConfig.tipo === 'editable') tdNom.style.backgroundColor = "#ffff00";
        tr.appendChild(tdNom);

        remesasFiltradas.forEach(remesa => {
            modulosSub.forEach(modId => {
                let td = document.createElement('td');
                
                let registroEncontrado = bdtotalesGlobal.find(r => 
                    String(r['REMESA'] || '').trim() === String(remesa) && 
                    String(r['MODULO'] || '').trim().includes(modId)
                );

                let valorBase = registroEncontrado ? (parseFloat(registroEncontrado[filaConfig.bdKey]) || 0) : 0;
                let valorFinal = 0;

                if (filaConfig.tipo === 'calculo_10_folios') {
                    valorFinal = Math.floor(valorBase * 0.10);
                    td.innerText = valorFinal;
                } 
                else if (filaConfig.tipo === 'calculo_10_tramites') {
                    let valTramites = registroEncontrado ? (parseFloat(registroEncontrado['TOTAL_DE_TRAMITES']) || 0) : 0;
                    valorFinal = Math.floor(valTramites * 0.10);
                    td.innerText = valorFinal;
                } 
                else if (filaConfig.tipo === 'editable') {
                    let valGuardado = "";
                    if (sgcRemesasData[remesa] && sgcRemesasData[remesa][modId] !== undefined) {
                        valGuardado = sgcRemesasData[remesa][modId];
                    }
                    
                    let input = document.createElement('input');
                    input.type = "number";
                    input.className = "input-editable";
                    input.value = valGuardado;
                    input.setAttribute('data-remesa', remesa);
                    input.setAttribute('data-modulo', modId);
                    td.appendChild(input);
                } 
                else {
                    valorFinal = valorBase;
                    td.innerText = valorFinal;
                }

                tr.appendChild(td);
            });
        });

        tbody.appendChild(tr);
    });
}

window.guardarTodoSGC = function() {
    let inputs = document.querySelectorAll('.input-editable');
    let dataParaGuardar = {};

    inputs.forEach(input => {
        let rem = input.getAttribute('data-remesa');
        let mod = input.getAttribute('data-modulo');
        let val = input.value;

        if (!dataParaGuardar[rem]) dataParaGuardar[rem] = {};
        dataParaGuardar[rem][mod] = val;
    });

    set(ref(db, 'bdSGC'), dataParaGuardar).then(() => {
        alert("¡Valores del Panel SGC guardados con éxito en la base de datos 'bdSGC'!");
    }).catch(error => {
        console.error("Error al guardar bdSGC:", error);
        alert("Hubo un error al guardar los cambios en la nube.");
    });
};

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
};

cargarDatosPanelSGC();
