const firebaseConfig = { 
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo", 
    authDomain: "cifrasmac.firebaseapp.com", 
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com", 
    projectId: "cifrasmac" 
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let datosTemporalesCarga = [];

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

// 1. Procesar si el usuario sube un archivo Excel (.xlsx) o JSON
function procesarArchivoExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
        let reader = new FileReader();
        reader.onload = function(evt) {
            try {
                let json = JSON.parse(evt.target.result);
                datosTemporalesCarga = Array.isArray(json) ? json : Object.values(json);
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
                // Convertir la hoja de Excel a un arreglo de objetos JSON limpiando nombres de columnas
                let jsonRows = XLSX.utils.sheet_to_json(worksheet, {raw: false});
                
                datosTemporalesCarga = jsonRows.map(row => {
                    let objNorm = {};
                    for(let k in row) {
                        let limpiaKey = k.toUpperCase().trim().replace(/\s+/g, '_');
                        objNorm[limpiaKey] = row[k];
                    }
                    objNorm['IDMAC'] = generarIdMac(objNorm['REMESA'], objNorm['MODULO']);
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

// 2. Procesar si el usuario copia de Excel y pega directamente en el cuadro de texto
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
        let headers = lineas[0].split(delimitador).map(h => h.toUpperCase().trim().replace(/\s+/g, '_'));

        let registros = [];
        for (let i = 1; i < lineas.length; i++) {
            let valores = lineas[i].split(delimitador);
            let obj = {};
            headers.forEach((h, idx) => {
                obj[h] = valores[idx] !== undefined ? valores[idx].trim() : '';
            });
            obj['IDMAC'] = generarIdMac(obj['REMESA'], obj['MODULO']);
            registros.push(obj);
        }

        datosTemporalesCarga = registros;
        mostrarVistaPrevia(datosTemporalesCarga);
        document.getElementById('textoPegadoExcel').value = ''; // limpiar textarea
    }, 100);
}

// 3. Mostrar la tabla de vista previa
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
    arr.forEach(i => Object.keys(i).forEach(k => colSet.add(k.toUpperCase().trim())));
    let columnas = Array.from(colSet);

    // Cabecera HTML
    let trH = '<tr><th>#</th>';
    columnas.forEach(c => trH += `<th>${c}</th>`);
    trH += '</tr>';
    thead.innerHTML = trH;

    // Primeros 50 registros de vista previa para no saturar el navegador
    let htmlB = '';
    arr.slice(0, 50).forEach((fila, idx) => {
        htmlB += `<tr><td class="fw-bold text-center">${idx + 1}</td>`;
        columnas.forEach(col => {
            let val = fila[col] !== undefined ? fila[col] : (col === 'IDMAC' ? generarIdMac(fila['REMESA'], fila['MODULO']) : '');
            htmlB += `<td>${val}</td>`;
        });
        htmlB += '</tr>';
    });
    tbody.innerHTML = htmlB;

    if (arr.length > 50) {
        tbody.innerHTML += `<tr><td colspan="${columnas.length + 1}" class="text-center text-muted fw-bold bg-light">... y ${arr.length - 50} registros más listos para guardarse en la nube.</td></tr>`;
    }

    btnGuardar.disabled = false;
}

// 4. Subir todos los datos procesados a Firebase de un solo golpe
function subirDatosAFirebase() {
    if (datosTemporalesCarga.length === 0) return;

    if (confirm(`¿Estás seguro de subir ${datosTemporalesCarga.length} registros con todas sus columnas a la Base de Datos Totales en Firebase?`)) {
        database.ref('bdtotales').set(datosTemporalesCarga)
        .then(() => {
            alert("¡Éxito! Todos los registros y columnas se han guardado correctamente en Firebase.");
            window.location.href = "bdtotales.html"; // Regresar a la BD Totales
        })
        .catch(err => {
            console.error(err);
            alert("Hubo un error al guardar en Firebase.");
        });
    }
}

// 5. Vaciar por completo Firebase en la ruta bdtotales
function vaciarFirebaseCompleto() {
    if (confirm("⚠️ ADVERTENCIA EXTREMA: ¿Estás completamente seguro de BORRAR TODO en la ruta 'bdtotales' de Firebase? Esta acción no se puede deshacer y dejará la base de datos totalmente en ceros.")) {
        database.ref('bdtotales').remove()
        .then(() => {
            alert("Se ha vaciado por completo la base de datos en Firebase.");
            datosTemporalesCarga = [];
            mostrarVistaPrevia([]);
        })
        .catch(err => {
            console.error(err);
            alert("Error al intentar vaciar la base de datos.");
        });
    }
}
