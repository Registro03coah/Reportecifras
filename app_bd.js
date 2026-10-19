// ==========================================
// CONFIGURACIÓN REAL DE FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac",
    storageBucket: "cifrasmac.firebasestorage.app",
    messagingSenderId: "916644687837",
    appId: "1:916644687837:web:03d346cc48a071af1ed034"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let bdMadre = [];
let columnasEstructura = [];

// Función para limpiar caracteres prohibidos por Firebase en las llaves (ej: /, ., #, $, [, ])
function limpiarLlavesParaFirebase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => limpiarLlavesParaFirebase(item));
    } else if (obj !== null && typeof obj === 'object') {
        let nuevoObj = {};
        Object.keys(obj).forEach(key => {
            let nuevaKey = key.replace(/[\.#\$\[\]\/]/g, '_');
            nuevoObj[nuevaKey] = limpiarLlavesParaFirebase(obj[key]);
        });
        return nuevoObj;
    }
    return obj;
}

// Extraer TODAS las llaves únicas de todos los registros (para asegurar las 75 columnas)
function extraerTodasLasColumnas(datos) {
    const setColumnas = new Set();
    datos.forEach(fila => {
        Object.keys(fila).forEach(col => setColumnas.add(col));
    });
    return Array.from(setColumnas);
}

// Al cargar la página, traemos los datos de Firebase
window.addEventListener('DOMContentLoaded', () => {
    cargarDatosFirebase();
});

function cargarDatosFirebase() {
    database.ref('bd_madre').once('value')
    .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            bdMadre = Array.isArray(data) ? data : Object.values(data);
            if(bdMadre.length > 0) {
                columnasEstructura = extraerTodasLasColumnas(bdMadre);
                renderizarCabeceras(columnasEstructura);
                ordenarYRenderizar(bdMadre);
            }
        }
    })
    .catch((error) => {
        console.error("Error al cargar datos de Firebase:", error);
    });
}

// 1. EVENTO SUBIR ARCHIVO (BOTÓN VERDE) - FUSIÓN INTELIGENTE
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById('loadingOverlay').style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            let nuevosDatos = JSON.parse(event.target.result);
            if (!Array.isArray(nuevosDatos)) {
                nuevosDatos = [nuevosDatos];
            }
            
            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                datosActuales.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const dia = String(item['DÍA'] || item['Día'] || item['Dia'] || '');
                    mapaRegistros.set(`${rem}_${mod}_${dia}`, item);
                });

                nuevosDatos.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const dia = String(item['DÍA'] || item['Día'] || item['Dia'] || '');
                    mapaRegistros.set(`${rem}_${mod}_${dia}`, item);
                });

                const bdFusionada = Array.from(mapaRegistros.values());
                const dataParaFirebase = limpiarLlavesParaFirebase(bdFusionada);

                if(bdFusionada.length > 0) {
                    columnasEstructura = extraerTodasLasColumnas(bdFusionada);
                }

                database.ref('bd_madre').set(dataParaFirebase).then(() => {
                    bdMadre = bdFusionada;
                    renderizarCabeceras(columnasEstructura);
                    ordenarYRenderizar(bdMadre);
                    
                    document.getElementById('loadingOverlay').style.display = 'none';
                    document.getElementById('fileInput').value = ''; 
                    alert('¡Remesa procesada, fusionada y guardada en Firebase con éxito!');
                }).catch((error) => {
                    document.getElementById('loadingOverlay').style.display = 'none';
                    alert("Error al subir a Firebase: " + error);
                });

            });

        } catch (err) {
            document.getElementById('loadingOverlay').style.display = 'none';
            alert('Error al leer el archivo JSON. Verifica que el formato sea correcto. Detalles: ' + err.message);
        }
    };
    reader.readAsText(file);
});

// 2. DESCARGAR RESPALDO JSON
window.descargarRespaldoJSON = function() {
    if (bdMadre.length === 0) {
        alert("No hay datos en la base de datos para respaldar.");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bdMadre, null, 2));
    const downloadAnchor = document.createElement('a');
    const fechaHoy = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Respaldo_BD_Madre_${fechaHoy}.json`);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// 3. ORDENAR DATOS (AGRUPAR POR MÓDULO, LUEGO POR DÍA)
function ordenarYRenderizar(datos) {
    const datosOrdenados = [...datos].sort((a, b) => {
        const modA = a['MÓDULO'] || a['Módulo'] || a['Modulo'] || '';
        const modB = b['MÓDULO'] || b['Módulo'] || b['Modulo'] || '';
        const diaA = a['DÍA'] || a['Día'] || a['Dia'] || '';
        const diaB = b['DÍA'] || b['Día'] || b['Dia'] || '';
        
        if (modA === modB) {
            return String(diaA).localeCompare(String(diaB));
        }
        return String(modA).localeCompare(String(modB));
    });
    
    renderizarTabla(datosOrdenados);
}

// 4. RENDERIZAR CABECERAS DINÁMICAS
function renderizarCabeceras(columnas) {
    const thead = document.getElementById('cabeceraBdMadre');
    let tr = '<tr>';
    
    if(columnas.length === 0) {
        thead.innerHTML = '<tr><th>No hay datos</th></tr>';
        return;
    }

    columnas.forEach(colName => {
        tr += `<th>${colName}</th>`;
    });
    
    tr += '<th class="text-center col-acciones">Acciones</th></tr>';
    thead.innerHTML = tr;
}

// 5. RENDERIZAR TABLA (Optimizado para gran cantidad de columnas y filas)
function renderizarTabla(datos) {
    const tbody = document.getElementById('cuerpoBdMadre');
    
    if(datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="100" class="text-center text-muted py-4">No se encontraron registros. Sube una remesa para comenzar.</td></tr>`;
        return;
    }

    let htmlFilas = '';

    datos.forEach((fila, index) => {
        let tr = '<tr>';
        
        columnasEstructura.forEach(colName => {
            let valor = fila[colName] !== undefined ? fila[colName] : '';
            
            if(colName === 'Remesa' || colName === 'REMESA') {
                tr += `<td class="fw-bold text-primary">${valor}</td>`;
            } else if (colName === 'MÓDULO' || colName === 'Módulo' || colName === 'Modulo') {
                tr += `<td><span class="badge bg-secondary">${valor}</span></td>`;
            } else {
                tr += `<td>${valor}</td>`;
            }
        });
        
        tr += `
            <td class="text-center col-acciones">
                <button class="btn btn-sm btn-warning text-dark me-1" onclick="editarRegistro(${index})">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="borrarRegistro(${index})">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </td>
        </tr>`;
        
        htmlFilas += tr;
    });

    tbody.innerHTML = htmlFilas;
}

// 6. BOTÓN DE PÁNICO: VACIAR BASE DE DATOS Y FIREBASE
window.vaciarBaseDatosGeneral = function() {
    if(confirm("⚠️ ADVERTENCIA: ¿Estás seguro de querer VACIAR TODA la base de datos?")) {
        if(confirm("Se borrarán los datos visuales y de FIREBASE permanentemente. ¿Confirmar borrado total?")) {
            
            document.getElementById('loadingOverlay').style.display = 'flex';

            database.ref('bd_madre').remove()
            .then(() => {
                limpiarTableroLocal();
            })
            .catch((error) => {
                alert("Error limpiando Firebase: " + error);
                document.getElementById('loadingOverlay').style.display = 'none';
            });
        }
    }
}

function limpiarTableroLocal() {
    bdMadre = [];
    columnasEstructura = [];
    document.getElementById('cabeceraBdMadre').innerHTML = '';
    renderizarTabla(bdMadre);
    document.getElementById('buscadorBd').value = '';
    document.getElementById('loadingOverlay').style.display = 'none';
    alert("Base de datos y Firebase vaciados correctamente.");
}

// 7. BUSCADOR
document.getElementById('buscadorBd').addEventListener('keyup', function(e) {
    const textoBusqueda = e.target.value.toLowerCase();
    
    if(textoBusqueda === '') {
        ordenarYRenderizar(bdMadre);
        return;
    }
    
    const resultados = bdMadre.filter(item => {
        const rem = String(item['Remesa'] || item['REMESA'] || '').toLowerCase();
        const dia = String(item['DÍA'] || item['Día'] || item['Dia'] || '').toLowerCase();
        return rem.includes(textoBusqueda) || dia.includes(textoBusqueda);
    });
    
    ordenarYRenderizar(resultados);
});

window.editarRegistro = function(index) {
    alert("Ventana para editar. Fila lógica índice: " + index);
}

window.borrarRegistro = function(index) {
    alert("Borrado individual en construcción. Índice: " + index);
}
