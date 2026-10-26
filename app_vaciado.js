import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const MODULOS = ["050351", "050353", "050354"];
const TOTAL_COLUMNAS = 75;

const NOMBRES_ESTANDAR_BD = [
    "DIA", "FECHA", "Horas_trabajadas", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSISION",
    "CORR_DE_DATOS_DIRECCION", "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES",
    "CANCELADOS", "TOTAL_DE_ANEXO_DE_RECHAZO", "CPV_devuelta_entrega", "DISPONIBLES_AL_DIA_ANTERIOR",
    "RECIBIDAS", "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "RECIBO_YO_EXTRAVIO", "ANEXAS_A_FUAR",
    "DATOS_ERRONEOS", "FOTO_MAL_IMPRESA", "REIMPRESION_2", "RETIRADAS_POR_CAUSA", "DISPONIBLES",
    "credenciales_x_canje", "fichas_Entregadas", "fichas_atendidas", "Dias_trabajados",
    "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITUD_EXPEDICION_ORDINARIA", "SOLICITU_DE_RECTIFICACION",
    "DEMANDA_DE_JUICIO", "REMESA", "Total_de_movimientos", "DEVUELTAS_POR_TERCEROS",
    "34_Imagen_inconsistente", "35_Movimiento_posterior", "CONFIGURACION", "ENT", "DTTO",
    "MODULO", "RESGUARDO", "SOLICITUD_DE_REIMPRESION", "CPV_devuelta_entrega_2", "script_ejecutado",
    "FOLIO_NEC", "cartografia", "lotes_de_credenciales", "registradas_por_dia", "faltantes", "observaciones",
    "sin_nombre1", "sin_nombre2", "sin_nombre3", "MAC_QUE_RECIBE", "MAC_QUE_ENTREGA",
    "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES", "MAL_IMPRESA", "ERROR_EN_CARTOGRAFIA",
    "DEFUNCION", "SUSPENSION", "DUPLICADO", "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA",
    "MOV_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS"
];

document.addEventListener("DOMContentLoaded", () => {
    inicializarTablas();
    configurarTabs();
    configurarPegadoPortapapeles();
    cargarDatosDesdeFirebase();

    const btnGuardar = document.getElementById('btnGuardarBD');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarBasesEnFirebase);
    }

    const btnLimpiar = document.getElementById('btnLimpiarBD');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
});

function inicializarTablas() {
    MODULOS.forEach(mod => {
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        if (!tbody) return;
        tbody.innerHTML = "";
        
        const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        dias.forEach(dia => {
            let tr = document.createElement('tr');
            for (let i = 0; i < TOTAL_COLUMNAS; i++) {
                let td = document.createElement('td');
                if (i === 0) {
                    td.innerText = dia;
                    td.className = "fw-bold bg-light text-center";
                } else {
                    let input = document.createElement('input');
                    input.type = "text";
                    input.className = "form-control form-control-sm text-center p-0 border-0 bg-transparent";
                    input.value = "0";
                    td.appendChild(input);
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });

        let trTot = document.createElement('tr');
        trTot.className = "fila-totales fw-bold bg-secondary text-white";
        for (let i = 0; i < TOTAL_COLUMNAS; i++) {
            let td = document.createElement('td');
            if (i === 0) {
                td.innerText = "LÍNEA TOTALI";
                td.className = "text-center";
            } else {
                let input = document.createElement('input');
                input.type = "text";
                input.className = "form-control form-control-sm text-center p-0 border-0 bg-transparent text-white fw-bold";
                input.value = "0";
                input.readOnly = true;
                td.appendChild(input);
            }
            trTot.appendChild(td);
        }
        tbody.appendChild(trTot);
    });

    const tbodyTotales = document.querySelector('#tablaCaptura_totales tbody');
    if (tbodyTotales) {
        tbodyTotales.innerHTML = "";
        MODULOS.forEach(mod => {
            let tr = document.createElement('tr');
            for (let i = 0; i < TOTAL_COLUMNAS; i++) {
                let td = document.createElement('td');
                if (i === 0) {
                    td.innerText = `Módulo ${mod}`;
                    td.className = "fw-bold bg-light text-center";
                } else {
                    let input = document.createElement('input');
                    input.type = "text";
                    input.className = "form-control form-control-sm text-center p-0 border-0 bg-transparent";
                    input.value = "0";
                    input.readOnly = true;
                    td.appendChild(input);
                }
                tr.appendChild(td);
            }
            tbodyTotales.appendChild(tr);
        });
    }
}

function configurarTabs() {
    const tabs = document.querySelectorAll('.nav-link, [data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target') || e.target.getAttribute('href');
            if (targetId && targetId.includes('totales')) {
                calcularTotalesGenerales();
            }
        });
    });
}

function configurarPegadoPortapapeles() {
    MODULOS.forEach(mod => {
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        if (!tbody) return;

        tbody.addEventListener('paste', (e) => {
            e.preventDefault();
            let clipboardData = e.clipboardData || window.clipboardData;
            let pastedData = clipboardData.getData('Text');
            if (!pastedData) return;

            let filasPegadas = pastedData.split('\n').filter(row => row.trim() !== '');
            let trs = tbody.querySelectorAll('tr');
            
            filasPegadas.forEach((rowStr, rIdx) => {
                if (rIdx >= 7) return;
                let targetRow = trs[rIdx];
                if (!targetRow) return;

                let celdasDatos = rowStr.split('\t');
                let inputs = targetRow.querySelectorAll('input');

                inputs.forEach((input, cIdx) => {
                    let val = celdasDatos[cIdx] !== undefined ? celdasDatos[cIdx].trim() : "";
                    if (val !== "") {
                        input.value = val;
                    }
                });
            });

            recalcularTotalesModulo(mod);
        });
    });
}

function recalcularTotalesModulo(mod) {
    const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
    if (!tbody) return;
    const filas = tbody.querySelectorAll('tr');
    
    for (let c = 1; c < TOTAL_COLUMNAS; c++) {
        let suma = 0;
        for (let r = 0; r < 7; r++) {
            let input = filas[r].querySelectorAll('td')[c].querySelector('input');
            let val = parseFloat(input ? input.value : 0) || 0;
            suma += val;
        }
        let inputTotal = filas[7].querySelectorAll('td')[c].querySelector('input');
        if (inputTotal) inputTotal.value = suma;
    }
}

function calcularTotalesGenerales() {
    MODULOS.forEach((mod, modIdx) => {
        const tbodyMod = document.querySelector(`#tablaCaptura_${mod} tbody`);
        const tbodyTot = document.querySelector('#tablaCaptura_totales tbody');
        if (!tbodyMod || !tbodyTot) return;

        let filaTotalesModulo = tbodyMod.querySelectorAll('tr')[7];
        let filaDestinoTotales = tbodyTot.querySelectorAll('tr')[modIdx];

        if (!filaTotalesModulo || !filaDestinoTotales) return;

        for (let c = 1; c < TOTAL_COLUMNAS; c++) {
            let valOrigen = filaTotalesModulo.querySelectorAll('td')[c].querySelector('input').value;
            let inputDestino = filaDestinoTotales.querySelectorAll('td')[c].querySelector('input');
            if (inputDestino) inputDestino.value = valOrigen;
        }
    });
}

function cargarDatosDesdeFirebase() {
    const dbRef = ref(db, 'vaciado_actual');
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            MODULOS.forEach(mod => {
                if (data[mod]) {
                    if (document.getElementById(`camp_${mod}`)) document.getElementById(`camp_${mod}`).value = data[mod].iniciales_C || '';
                    if (document.getElementById(`acum_${mod}`)) document.getElementById(`acum_${mod}`).value = data[mod].iniciales_A || '';

                    if (data[mod].tabla) {
                        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
                        if (!tbody) return;
                        const filas = tbody.querySelectorAll('tr');
                        
                        data[mod].tabla.forEach((filaArr, rIdx) => {
                            if (filas[rIdx]) {
                                let inputs = filas[rIdx].querySelectorAll('input');
                                filaArr.forEach((val, cIdx) => {
                                    if (inputs[cIdx - 1]) inputs[cIdx - 1].value = val;
                                });
                            }
                        });
                        recalcularTotalesModulo(mod);
                    }
                }
            });
        }
    });
}

function guardarBasesEnFirebase() {
    const remesaActual = document.getElementById('hiddenRemesaVal')?.value.trim() || document.getElementById('inputRemesa')?.innerText.trim() || "39";
    const anioActual = new Date().getFullYear().toString().slice(-2); // Ej: "26"
    
    let datosAGuardar = {};
    let registrosDiariosParaBdMadre = []; 
    
    MODULOS.forEach(mod => {
        const tablaEl = document.querySelector(`#tablaCaptura_${mod}`);
        if (!tablaEl) return;
        const filas = tablaEl.querySelectorAll('tbody tr');
        let datosTabla = [];
        
        filas.forEach((fila, rowIndex) => {
            let filaArray = [];
            let objFilaDia = {};
            let esFilaTotales = rowIndex === 7;

            fila.querySelectorAll('td').forEach((td, colIdx) => {
                const input = td.querySelector('input');
                let valCelda = input ? input.value.trim() : "";
                if (valCelda === "") valCelda = "0";
                
                filaArray.push(valCelda);

                let nombreOriginal = NOMBRES_ESTANDAR_BD[colIdx] || `Col_${colIdx + 1}`;
                let claveLimpia = String(nombreOriginal)
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[.#$ /\[\]]/g, "_")
                    .replace(/_+/g, "_")
                    .trim();

                objFilaDia[claveLimpia] = valCelda;
            });

            datosTabla.push(filaArray);

            if (!esFilaTotales) {
                objFilaDia["MODULO"] = mod;
                objFilaDia["REMESA"] = remesaActual;
                
                objFilaDia["INICIALES_C"] = document.getElementById(`camp_${mod}`) ? document.getElementById(`camp_${mod}`).value : "";
                objFilaDia["INICIALES_A"] = document.getElementById(`acum_${mod}`) ? document.getElementById(`acum_${mod}`).value : "";

                // IDMAC Único con Año, Módulo, Remesa y Fecha (Ej: 3512639-1012)
                const ultimos3Mod = String(mod).slice(-3);
                let numRem = remesaActual.match(/\d+/) ? remesaActual.match(/\d+/)[0].padStart(2, '0') : '39';
                let fechaVal = objFilaDia["FECHA"] || '00000000';
                let fechaLimpia = String(fechaVal).replace(/[^0-9]/g, '');
                let sufijoFecha = fechaLimpia.length >= 8 ? fechaLimpia.slice(-4) : (fechaLimpia || '0000');

                objFilaDia["IDMAC"] = `${ultimos3Mod}${anioActual}${numRem}-${sufijoFecha}`;

                registrosDiariosParaBdMadre.push(objFilaDia);
            }
        });

        const inicialC = document.getElementById(`camp_${mod}`) ? document.getElementById(`camp_${mod}`).value : "";
        const inicialA = document.getElementById(`acum_${mod}`) ? document.getElementById(`acum_${mod}`).value : "";

        datosAGuardar[mod] = {
            tabla: datosTabla,
            iniciales_C: inicialC,
            iniciales_A: inicialA
        };
    });

    let registrosTotalesParaBD = [];
    const tbodyTotales = document.querySelector('#tablaCaptura_totales tbody');
    
    if (tbodyTotales) {
        const filasTotales = tbodyTotales.querySelectorAll('tr');
        MODULOS.forEach((mod, i) => {
            const filaModulo = filasTotales[i];
            if (!filaModulo) return;

            let objFilaTotal = {};
            filaModulo.querySelectorAll('td').forEach((td, colIdx) => {
                const input = td.querySelector('input');
                let valorCelda = input ? input.value.trim() : "0";
                if (valorCelda === "") valorCelda = "0";

                let nombreOriginal = NOMBRES_ESTANDAR_BD[colIdx] || `Col_${colIdx + 1}`;
                let claveLimpia = String(nombreOriginal)
                    .toUpperCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[.#$ /\[\]]/g, "_")
                    .replace(/_+/g, "_")
                    .trim();

                objFilaTotal[claveLimpia] = valorCelda;
            });

            objFilaTotal["MODULO"] = mod;
            objFilaTotal["REMESA"] = remesaActual;
            objFilaTotal["INICIALES_C"] = document.getElementById(`camp_${mod}`) ? document.getElementById(`camp_${mod}`).value : "";
            objFilaTotal["INICIALES_A"] = document.getElementById(`acum_${mod}`) ? document.getElementById(`acum_${mod}`).value : "";

            const ultimos3Mod = String(mod).slice(-3);
            let numRem = remesaActual.match(/\d+/) ? remesaActual.match(/\d+/)[0].padStart(2, '0') : '39';
            objFilaTotal["IDMAC"] = `${ultimos3Mod}${anioActual}${numRem}`;

            registrosTotalesParaBD.push(objFilaTotal);
        });
    }

    const dbRefActual = ref(db, 'vaciado_actual');
    const dbRefHistorial = ref(db, `historial_campanas/${remesaActual}`);
    const dbRefTotales = ref(db, 'bdtotales');
    const dbRefBdMadre = ref(db, 'bd_madre'); 

    get(dbRefBdMadre).then((snapshotSnap) => {
        let actualBdMadre = snapshotSnap.val() || [];
        actualBdMadre = Array.isArray(actualBdMadre) ? actualBdMadre : Object.values(actualBdMadre);

        let bdMadreFiltrada = actualBdMadre.filter(item => String(item.REMESA) !== String(remesaActual));
        const fusionFinalBdMadre = [...bdMadreFiltrada, ...registrosDiariosParaBdMadre];

        return Promise.all([
            set(dbRefActual, datosAGuardar),
            set(dbRefHistorial, datosAGuardar),
            set(dbRefBdMadre, fusionFinalBdMadre), 
            get(dbRefTotales).then((snapshot) => {
                let actualTotales = snapshot.val() || [];
                actualTotales = Array.isArray(actualTotales) ? actualTotales : Object.values(actualTotales);

                let totalesFiltrados = actualTotales.filter(item => String(item.REMESA) !== String(remesaActual));
                const fusionFinalTotales = [...totalesFiltrados, ...registrosTotalesParaBD];
                return set(dbRefTotales, fusionFinalTotales);
            })
        ]);
    }).then(() => {
        alert(`¡Éxito! Todos los datos diarios, iniciales y totales se guardaron correctamente en la BD Principal (bd_madre) para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos en la nube.");
    });
}

function limpiarFormulario() {
    if (confirm("¿Deseas limpiar todos los campos del formulario actual?")) {
        inicializarTablas();
        MODULOS.forEach(mod => {
            if (document.getElementById(`camp_${mod}`)) document.getElementById(`camp_${mod}`).value = "";
            if (document.getElementById(`acum_${mod}`)) document.getElementById(`acum_${mod}`).value = "";
        });
    }
}
