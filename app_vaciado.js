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

// Lista exacta de las 75 columnas con IDMAC, REMESA y MODULO al inicio, y las terminadas en _2 al final
const NOMBRES_ESTANDAR_BD = [
    "DIA", "FECHA", "HORAS_TRABAJADAS", "SEDES", "INICIAL", "FINAL", "TOTAL_DE_FOLIOS",
    "INSCRIPCIONES", "CORRECCION_DE_DATOS_PERSONALES", "CAMBIO_DE_DOMICILIO", "REPOSICION", "CORR_DE_DATOS_DIRECCION", 
    "REINCORPORACION", "REEMPLAZO", "REIMPRESION", "TOTAL_DE_TRAMITES", "CANCELADOS", "TOTAL_DE_ANEXOS_POR_RECHAZO", "CRED_PROD_CANJE_POR_NUEVA", "DISPONIBLES_AL_DIA_ANTERIOR", "ACTUALIZACION",
    "RECIBIDAS_DE_OTROS_TIPOS", "ENTREGADAS", "ROBO_Y_O_EXTRAVIO", "ANEXAS_A_FUAR", "DATOS_ERRONEOS",
    "FOTO_MAL_IMPRESA", "RETIRADA_POR_REIMPRESION", "RETIRADAS_POR_CAUSA", "DISPONIBLES_TOTAL","CPV_DEVUELTA_ENTREGA",
    "FICHAS_ENTREGADAS", "FICHAS_ATENDIDAS", "DIAS_TRABAJADOS", "SOLICITUD_EXPEDICION_ORDINARIA",
    "SOLICITUD_EXPEDICION_REPATRIADOS", "SOLICITUD_DE_RECTIFICACION",
    "DEMANDA_DE_JUICIO", "REMESA", "TOTAL_DE_MOVIMIENTOS", "CREDEN_DEVUELTAS_POR_TERCEROS",
    "34_Imagen_Inconsistente", "35_Movimiento_Posterior", "CONFIGURACION", "ENT", "DTTO", "MODULO",
    "RESGUARDO", "SOLICITUD_DE_REIMPRESION","CREDENCIAL_POR_CANJE", "SCRIPT_EJECUTADO",
    "FOLIO_NEC", "NUMERO_DE_TRAMITES_APLICADOS", "NUMERO_DE_FICHAS_REQUISITADAS",
    "NUMERO_DE_ARCHIVOS_DE_TRANSACCION_ACEPTADOS", "TOTAL_DE_ARCHIVOS_DE_TRANSACCION_PROCESADOS",
    "RECIBIDAS", "CREDENCIALES_INCONSISTENTES",
    "CREDENCIALES_TOTALES_EN_SIIRFE_DISPONIBLES_PARA_ENTREGA", "TOTAL_DE_CREDENCIALES_ENTREGADAS",
    "TOTAL_DE_CREDENCIALES_SOLICITADAS", "IMPORTADAS", "EXPORTADAS", "REPOSISION_REIMPRESIONES",
    "MAL_IMPRESA", "ERROR_EN_CARTOGRAFIA", "DEFUNCION", "SUSPENSION", "DUPLICADO",
    "ERROR_EN_NUM_DE_EMISION", "PERDIDA_DE_VIGENCIA", "MOV_POST", "ANEXAS_A_SOLICITUD", "OTRAS_BAJAS",
];

const INDEX_COLUMNA_REMESA = 1; // Columna REMESA ahora es la segunda de datos (índice 1)
const INDEX_COLUMNA_FECHA = 4;  // Columna FECHA ahora es la quinta de datos (índice 4)

document.addEventListener("DOMContentLoaded", () => {
    inicializarEncabezadosYTablas();
    configurarTabs();
    configurarPegadoPortapapeles();
    cargarDatosDesdeFirebase();

    const btnGuardar = document.getElementById('btnGuardarBD');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarBasesEnFirebase);
    }

    const btnLimpiar = document.getElementById('btnBorrar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
});

function generarIdMacCustom(mod, remesa, fechaStr) {
    const mod2 = String(mod || "00").slice(-2);
    const rem4 = String(remesa || "0000").slice(-4).padStart(4, '0');
    
    let ddmm = "0000";
    if (fechaStr) {
        let limpia = String(fechaStr).trim();
        if (limpia.includes('/')) {
            let partes = limpia.split('/');
            if (partes.length >= 2) {
                let d = partes[0].padStart(2, '0');
                let m = partes[1].padStart(2, '0');
                ddmm = d + m;
            }
        } else if (limpia.includes('-')) {
            let partes = limpia.split('-');
            if (partes.length >= 3) {
                if (partes[0].length === 4) {
                    let m = partes[1].padStart(2, '0');
                    let d = partes[2].padStart(2, '0');
                    ddmm = d + m;
                } else {
                    let d = partes[0].padStart(2, '0');
                    let m = partes[1].padStart(2, '0');
                    ddmm = d + m;
                }
            }
        }
    }
    return `${mod2}${rem4}${ddmm}`;
}

function construirHeaderTabla(tableEl, isTotales = false) {
    if (!tableEl) return;
    let thead = tableEl.querySelector('thead');
    if (!thead) {
        thead = document.createElement('thead');
        tableEl.insertBefore(thead, tableEl.firstChild);
    }
    thead.innerHTML = "";

    let trT = document.createElement('tr');
    let trN = document.createElement('tr');
    trN.className = 'num-row';

    NOMBRES_ESTANDAR_BD.forEach((nombreCol, idx) => {
        let th = document.createElement('th');
        let tituloStr = isTotales && idx === 0 ? "MODULO" : nombreCol.replace(/_/g, ' ');
        th.innerText = tituloStr;
        th.style.minWidth = "90px";
        trT.appendChild(th);

        let thN = document.createElement('th');
        thN.innerText = idx === 0 ? (isTotales ? "MOD" : "DÍA") : idx;
        trN.appendChild(thN);
    });

    thead.appendChild(trT);
    thead.appendChild(trN);
}

function inicializarEncabezadosYTablas() {
    MODULOS.forEach(mod => {
        const tablaEl = document.querySelector(`#tablaCaptura_${mod}`);
        if (tablaEl) construirHeaderTabla(tablaEl, false);

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
                    td.className = "fw-bold bg-light text-center col-dia";
                } else {
                    let input = document.createElement('input');
                    input.type = "text";
                    input.className = "form-control form-control-sm text-center p-0 border-0 bg-transparent";
                    input.value = (i === INDEX_COLUMNA_REMESA ? "202643" : (i === INDEX_COLUMNA_MODULO ? mod : (i === INDEX_COLUMNA_FECHA ? "" : "0")));
                    td.appendChild(input);
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        });

        let trTot = document.createElement('tr');
        trTot.className = "fila-totales fw-bold";
        for (let i = 0; i < TOTAL_COLUMNAS; i++) {
            let td = document.createElement('td');
            if (i === 0) {
                td.innerText = "LÍNEA TOTALES";
                td.className = "text-center col-dia bg-success text-white";
            } else {
                let input = document.createElement('input');
                input.type = "text";
                input.className = "form-control form-control-sm text-center p-0 border-0 bg-transparent fw-bold";
                input.value = "0";
                td.appendChild(input);
            }
            trTot.appendChild(td);
        }
        tbody.appendChild(trTot);
    });

    const tablaTotalesEl = document.querySelector('#tablaCaptura_totales');
    if (tablaTotalesEl) construirHeaderTabla(tablaTotalesEl, true);

    const tbodyTotales = document.querySelector('#tablaCaptura_totales tbody');
    if (tbodyTotales) {
        tbodyTotales.innerHTML = "";
        MODULOS.forEach(mod => {
            let tr = document.createElement('tr');
            for (let i = 0; i < TOTAL_COLUMNAS; i++) {
                let td = document.createElement('td');
                if (i === 0) {
                    td.innerText = `Módulo ${mod}`;
                    td.className = "fw-bold bg-light text-center col-dia";
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

// Índice auxiliar para inicializar el módulo en su columna si corresponde
const INDEX_COLUMNA_MODULO = 2;

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

window.cambiarModulo = function(mod) {
    ["050351", "050353", "050354", "TOTALES"].forEach(m => {
        const btn = document.getElementById(`btn-tab-${m}`);
        const container = document.getElementById(`container_${m}`);
        const pasteZone = document.getElementById(`pasteZone_${m}`);
        
        if (btn) {
            if (m === mod) btn.classList.add('active');
            else btn.classList.remove('active');
        }
        if (container) {
            if (m === mod) container.classList.remove('d-none');
            else container.classList.add('d-none');
        }
        if (pasteZone) {
            if (m === mod && m !== 'TOTALES') pasteZone.classList.remove('d-none');
            else pasteZone.classList.add('d-none');
        }
    });

    const lblModuloActivo = document.getElementById('lblModuloActivo');
    const lblModuloPegado = document.getElementById('lblModuloPegado');
    const panelAccionesTotales = document.getElementById('panelAccionesTotales');
    
    if (lblModuloActivo) lblModuloActivo.innerText = mod;
    if (lblModuloPegado) lblModuloPegado.innerText = mod;
    
    if (panelAccionesTotales) {
        if (mod === 'TOTALES') {
            panelAccionesTotales.classList.remove('d-none');
            panelAccionesTotales.classList.add('d-flex');
            
            const remesaDetectada = obtenerRemesaDesdeTablas() || "S/N";
            const spanRemesa = document.getElementById('inputRemesa');
            if (spanRemesa) spanRemesa.innerText = remesaDetectada;

            calcularTotalesGenerales();
        } else {
            panelAccionesTotales.classList.add('d-none');
            panelAccionesTotales.classList.remove('d-flex');
        }
    }
};

function obtenerRemesaDesdeTablas() {
    for (let mod of MODULOS) {
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        if (!tbody) continue;
        const primerasFilas = tbody.querySelectorAll('tr');
        for (let r = 0; r < 7; r++) {
            if (!primerasFilas[r]) continue;
            const inputs = primerasFilas[r].querySelectorAll('input');
            const inputRemesa = inputs[INDEX_COLUMNA_REMESA - 1];
            if (inputRemesa && inputRemesa.value.trim() !== "" && inputRemesa.value.trim() !== "0") {
                return inputRemesa.value.trim();
            }
        }
    }
    return null;
}

function configurarPegadoPortapapeles() {
    MODULOS.forEach(mod => {
        const pasteZone = document.getElementById(`pasteZone_${mod}`);
        const container = document.getElementById(`container_${mod}`);
        const tbody = document.querySelector(`#tablaCaptura_${mod} tbody`);
        if (!tbody) return;

        const ejecutarPegado = (e) => {
            e.preventDefault();
            let clipboardData = e.clipboardData || window.clipboardData;
            let pastedData = clipboardData.getData('Text');
            if (!pastedData) return;

            let filasPegadas = pastedData.split('\n').filter(row => row.trim() !== '');
            let trs = tbody.querySelectorAll('tr');
            let rowOffset = 0;

            filasPegadas.forEach((rowStr, rIdx) => {
                if (rIdx + rowOffset >= 8) return;
                let targetRow = trs[rIdx + rowOffset];
                if (!targetRow) return;

                let celdasDatos = rowStr.split('\t');
                
                if (rIdx === 0 && (celdasDatos[0].toUpperCase().includes("DIA") || celdasDatos[0].toUpperCase().includes("DÍA"))) {
                    rowOffset++;
                    return;
                }

                let editableInputs = targetRow.querySelectorAll('input');
                let startIndex = (celdasDatos.length >= TOTAL_COLUMNAS || celdasDatos[0].toLowerCase().includes('lunes') || celdasDatos[0].toLowerCase().includes('martes') || celdasDatos[0].toLowerCase().includes('línea')) ? 1 : 0;

                editableInputs.forEach((input, cIdx) => {
                    let valorCelda = celdasDatos[cIdx + startIndex];
                    if (valorCelda !== undefined) {
                        input.value = valorCelda.trim();
                    }
                });
            });

            sincronizarTotales();
        };

        if (pasteZone) pasteZone.addEventListener('paste', ejecutarPegado);
        if (container) container.addEventListener('paste', ejecutarPegado);
        tbody.addEventListener('paste', ejecutarPegado);
    });
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

function sincronizarTotales() {
    const tablaTotalesEl = document.querySelector('#tablaCaptura_totales');
    if (tablaTotalesEl && !document.getElementById('container_TOTALES').classList.contains('d-none')) {
        calcularTotalesGenerales();
    }
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
                    }
                }
            });
        }
    });
}

function guardarBasesEnFirebase() {
    const remesaActual = obtenerRemesaDesdeTablas() || "S/N";
    
    if (remesaActual === "S/N") {
        alert("Aviso: No se detectó ningún número de remesa en la columna REMESA de las tablas. Asegúrate de incluirlo.");
    }
    
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

            let fechaCelda = "";
            const inputsFila = fila.querySelectorAll('input');
            if (!esFilaTotales && inputsFila[INDEX_COLUMNA_FECHA - 1]) {
                fechaCelda = inputsFila[INDEX_COLUMNA_FECHA - 1].value.trim();
            }

            const idMacGenerado = generarIdMacCustom(mod, remesaActual, fechaCelda);

            fila.querySelectorAll('td').forEach((td, colIdx) => {
                const input = td.querySelector('input');
                let valCelda = input ? input.value.trim() : "";
                if (valCelda === "") valCelda = "0";
                
                filaArray.push(valCelda);

                let nombreOriginal = NOMBRES_ESTANDAR_BD[colIdx];
                if (nombreOriginal === "IDMAC") {
                    objFilaDia["IDMAC"] = idMacGenerado;
                } else if (nombreOriginal === "REMESA") {
                    objFilaDia["REMESA"] = remesaActual;
                } else if (nombreOriginal === "MODULO") {
                    objFilaDia["MODULO"] = mod;
                } else {
                    let claveLimpia = String(nombreOriginal)
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[.#$ /\[\]]/g, "_")
                        .replace(/_+/g, "_")
                        .trim();
                    objFilaDia[claveLimpia] = valCelda;
                }
            });

            datosTabla.push(filaArray);

            if (!esFilaTotales) {
                objFilaDia["MODULO"] = mod;
                objFilaDia["REMESA"] = remesaActual;
                objFilaDia["IDMAC"] = idMacGenerado;
                objFilaDia["INICIALES_C"] = document.getElementById(`camp_${mod}`) ? document.getElementById(`camp_${mod}`).value : "";
                objFilaDia["INICIALES_A"] = document.getElementById(`acum_${mod}`) ? document.getElementById(`acum_${mod}`).value : "";

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
            let fechaFilaTotal = ""; 
            const inputsTotales = filaModulo.querySelectorAll('input');
            if (inputsTotales[INDEX_COLUMNA_FECHA - 1]) {
                fechaFilaTotal = inputsTotales[INDEX_COLUMNA_FECHA - 1].value.trim();
            }
            const idMacGeneradoTotales = generarIdMacCustom(mod, remesaActual, fechaFilaTotal);

            filaModulo.querySelectorAll('td').forEach((td, colIdx) => {
                const input = td.querySelector('input');
                let valorCelda = input ? input.value.trim() : "0";
                if (valorCelda === "") valorCelda = "0";

                let nombreOriginal = NOMBRES_ESTANDAR_BD[colIdx];
                if (nombreOriginal === "IDMAC") {
                    objFilaTotal["IDMAC"] = idMacGeneradoTotales;
                } else if (nombreOriginal === "REMESA") {
                    objFilaTotal["REMESA"] = remesaActual;
                } else if (nombreOriginal === "MODULO") {
                    objFilaTotal["MODULO"] = mod;
                } else {
                    let claveLimpia = String(nombreOriginal)
                        .toUpperCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[.#$ /\[\]]/g, "_")
                        .replace(/_+/g, "_")
                        .trim();
                    objFilaTotal[claveLimpia] = valorCelda;
                }
            });

            objFilaTotal["MODULO"] = mod;
            objFilaTotal["REMESA"] = remesaActual;
            objFilaTotal["IDMAC"] = idMacGeneradoTotales;
            objFilaTotal["INICIALES_C"] = document.getElementById(`camp_${mod}`) ? document.getElementById(`camp_${mod}`).value : "";
            objFilaTotal["INICIALES_A"] = document.getElementById(`acum_${mod}`) ? document.getElementById(`acum_${mod}`).value : "";

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
        alert(`¡Éxito! Todos los datos diarios se guardaron correctamente para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos en la nube.");
    });
}

function limpiarFormulario() {
    if (confirm("¿Deseas limpiar y depurar los datos de las tablas?")) {
        inicializarEncabezadosYTablas();
    }
}
