const firebaseConfig = { 
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", 
    authDomain: "cifrasmac.firebaseapp.com", 
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", 
    projectId: "cifrasmac" 
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let datosTemporalesCarga = [];

// Generador de IDMAC Único con Año, Módulo, Remesa y Fecha (Ej: 3512639-1012)
function generarIdMacBdMadre(remesa, modulo, fecha) {
    let modStr = String(modulo || '').replace(/\D/g, ''); 
    let modDigits = modStr.length >= 2 ? modStr.slice(-2) : modStr.padStart(2, '0');
    if (!modDigits) modDigits = '00';
    const ultimos3Mod = String(modDigits).slice(-3);

    let anioActual = new Date().getFullYear().toString().slice(-2); // Ej: "26"
    
    let remStr = String(remesa || '').trim(); 
    let remMatch = remStr.match(/(\d+)/);
    let numRem = remMatch ? remMatch[1].padStart(2, '0') : '39';

    let fechaLimpia = String(fecha || '').replace(/[^0-9]/g, '');
    let sufijoFecha = fechaLimpia.length >= 8 ? fechaLimpia.slice(-4) : (fechaLimpia || '0000');

    return `${ultimos3Mod}${anioActual}${numRem}-${sufijoFecha}`;
}

function limpiarNombreClave(key) {
    if (!key) return "COLUMNA";
    return String(key)
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.#$ /\[\]]/g, "_")
        .replace(/_+/g, "_")
        .trim();
}

function limpiarValorCelda(val) {
    if (val === null || val === undefined || String(val).trim() === "") {
        return "0";
    }
    return String(val).trim();
}

function procesarArchivoExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
        let reader = new FileReader();
        reader.onload = function(evt) {
            try {
                let json = JSON.parse(evt.target.result);
                let rawArr = Array.isArray(json) ? json : Object.values(json);
                
                datosTemporalesCarga = rawArr.map(row => {
                    let objNorm = {};
                    for(let k in row) {
                        let limpiaKey = limpiarNombreClave(k);
                        objNorm[limpiaKey] = limpiarValorCelda(row[k]);
                    }
                    objNorm['IDMAC'] = generarIdMacBdMadre(objNorm['REMESA'], objNorm['MODULO'], objNorm['FECHA']);
                    return objNorm;
                });

                mostrarVistaPrevia(datosTemporalesCarga);
            } catch(err) {
                alert("El archivo JSON no es válido.");
            }
        };
        reader.readAsText(file);
    } else {
        let reader = new FileReader();
        reader.onload = function(e) {
            try {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, {type: 'array'});
                let firstSheet = workbook.SheetNames[0];
                let worksheet = workbook.Sheets[firstSheet];
                let jsonRows = XLSX.utils.sheet_to_json(worksheet, {raw: false});
                
                datosTemporalesCarga = jsonRows.map(row => {
                    let objNorm = {};
                    for(let k in row) {
                        let limpiaKey = limpiarNombreClave(k);
                        objNorm[limpiaKey] = limpiarValorCelda(row[k]);
                    }
                    objNorm['IDMAC'] = generarIdMacBdMadre(objNorm['REMESA'], objNorm['MODULO'], objNorm['FECHA']);
                    return objNorm;
                });

                mostrarVistaPrevia(datosTemporalesCarga);
            } catch(err) {
                console.error(err);
                alert("Error al leer el archivo Excel.");
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function procesarPegadoPortapapeles(e) {
    setTimeout(() => {
        let texto = document.getElementById('textoPegadoExcel').value;
        if (!texto) return;

        let lineas = texto.split('\n').filter(l => l.trim() !== '');
        if (lineas.length < 2) {
            alert("El texto pegado debe incluir la fila de encabezados y al menos un registro.");
            return;
        }

        let delimitador = lineas[0].includes('\t') ? '\t' : ',';
        let headers = lineas[0].split(delimitador).map(h => limpiarNombreClave(h));

        let registros = [];
        for (let i = 1; i < lineas.length; i++) {
            let valores = lineas[i].split(delimitador);
            let obj = {};
            headers.forEach((h, idx) => {
                let valCrudo = valores[idx] !== undefined ? valores[idx] : "";
                obj[h] = limpiarValorCelda(valCrudo);
            });
            obj['IDMAC'] = generarIdMacBdMadre(obj['REMESA'], obj['MODULO'], obj['FECHA']);
            registros.push(obj);
        }

        datosTemporalesCarga = registros;
        mostrarVistaPrevia(datosTemporalesCarga);
        document.getElementById('textoPegadoExcel').value = '';
    }, 100);
}

function mostrarVistaPrevia(arr) {
    const thead = document.getElementById('headPreview');
    const tbody = document.getElementById('bodyPreview');
    const contador = document.getElementById('contadorRegistrosPreview');
    const btnGuardar = document.getElementById('btnGuardarFirebase');

    thead.innerHTML = '';
    tbody.innerHTML = '';
    contador.textContent = arr.length;

    if (arr.length === 0) {
        btnGuardar.disabled = true;
        return;
    }

    let colSet = new Set(['IDMAC']);
    arr.forEach(i => Object.keys(i).forEach(k => colSet.add(limpiarNombreClave(k))));
    let columnas = Array.from(colSet);

    let trH = '<tr><th>#</th>';
    columnas.forEach(c => trH += `<th>${c}</th>`);
    trH += '</tr>';
    thead.innerHTML = trH;

    let htmlB = '';
    arr.slice(0, 50).forEach((fila, idx) => {
        htmlB += `<tr><td class="fw-bold text-center">${idx + 1}</td>`;
        columnas.forEach(col => {
            let val = fila[col] !== undefined ? fila[col] : (col === 'IDMAC' ? generarIdMacBdMadre(fila['REMESA'], fila['MODULO'], fila['FECHA']) : '0');
            htmlB += `<td>${val}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;

    if (arr.length > 50) {
        tbody.innerHTML += `<tr><td colspan="${columnas.length + 1}" class="text-center text-muted fw-bold bg-light">... y ${arr.length - 50} registros más listos para guardarse en la BD Principal.</td></tr>`;
    }

    btnGuardar.disabled = false;
}

function subirDatosABdMadre() {
    if (datosTemporalesCarga.length === 0) {
        alert("No hay datos cargados para guardar.");
        return;
    }

    if (confirm(`¿Estás seguro de subir ${datosTemporalesCarga.length} registros a la BD Principal (bd_madre) en Firebase?`)) {
        database.ref('bd_madre').set(datosTemporalesCarga)
        .then(() => {
            alert("¡Éxito! Todos los registros se han guardado correctamente en la BD Principal de Firebase.");
            window.location.href = "bd_madre.html"; 
        })
        .catch(err => {
            console.error("Error detallado de Firebase:", err);
            alert("Hubo un error al guardar en Firebase. Revisa la consola (F12).");
        });
    }
}

function vaciarBdMadreFirebase() {
    if (confirm("⚠️ ADVERTENCIA EXTREMA: ¿Estás completamente seguro de BORRAR TODO en la ruta 'bd_madre' de Firebase?")) {
        database.ref('bd_madre').remove()
        .then(() => {
            alert("Se ha vaciado por completo la BD Principal en Firebase.");
            datosTemporalesCarga = [];
            mostrarVistaPrevia([]);
        })
        .catch(err => {
            console.error(err);
            alert("Error al intentar vaciar la base de datos.");
        });
    }
}
