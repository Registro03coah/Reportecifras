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
            // Reemplaza . # $ / [ ] por guion bajo _
            let nuevaKey = key.replace(/[\.#\$\[\]\/]/g, '_');
            nuevoObj[nuevaKey] = limpiarLlavesParaFirebase(obj[key]);
        });
        return nuevoObj;
    }
    return obj;
}

// Al cargar la página, intentamos traer los datos que ya estén guardados en Firebase
window.addEventListener('DOMContentLoaded', () => {
    database.ref('bd_madre').once('value')
    .then((snapshot) => {
        const data = snapshot.val();
        if (data) {
            bdMadre = Array.isArray(data) ? data : Object.values(data);
            if(bdMadre.length > 0) {
                columnasEstructura = Object.keys(bdMadre[0]);
                renderizarCabeceras(columnasEstructura);
                ordenarYRenderizar(bdMadre);
            }
        }
    })
    .catch((error) => {
        console.error("Error al cargar datos de Firebase:", error);
    });
});

// 1. EVENTO SUBIR ARCHIVO (BOTÓN VERDE)
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Mostrar pantalla de carga
    document.getElementById('loadingOverlay').style.display = 'flex';

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            let jsonData = JSON.parse(event.target.result);
            
            // ASEGURAR QUE SEA UN ARREGLO
            if (!Array.isArray(jsonData)) {
                jsonData = [jsonData];
            }
            
            // LIMPIAR LLAVES PROHIBIDAS POR FIREBASE (/ . # $ [ ])
            const dataParaFirebase = limpiarLlavesParaFirebase(jsonData);

            if(jsonData.length > 0) {
                columnasEstructura = Object.keys(jsonData[0]);
            }

            // GUARDAR EN FIREBASE DE GOLPE
            database.ref('bd_madre').set(dataParaFirebase).then(() => {
                bdMadre = jsonData;
                renderizarCabeceras(columnasEstructura);
                ordenarYRenderizar(bdMadre);
                
                document.getElementById('loadingOverlay').style.display = 'none';
                document.getElementById('fileInput').value = ''; 
                alert('¡Archivo procesado y guardado en Firebase con éxito!');
            }).catch((error) => {
                document.getElementById('loadingOverlay').style.display = 'none';
                alert("Error al subir a Firebase: " + error);
            });

        } catch (err) {
            document.getElementById('loadingOverlay').style.display = 'none';
            alert('Error al leer el archivo JSON. Verifica que el formato sea correcto. Detalles: ' + err.message);
        }
    };
    reader.readAsText(file);
});

// 2. ORDENAR DATOS (AGRUPAR POR MÓDULO, LUEGO POR DÍA)
function ordenarYRenderizar(datos) {
    const datosOrdenados = [...datos].sort((a, b) => {
        const modA = a['MÓDULO'] || a['Módulo'] || a['Modulo'] || '';
        const modB = b['MÓDULO'] || b['Módulo'] || b['Modulo'] || '';
        const diaA = a['DÍA'] || a['Día'] || a['Dia'] || '';
        const diaB = a['DÍA'] || a['Día'] || a['Dia'] || '';
        
        if (modA === modB) {
            return String(diaA).localeCompare(String(diaB));
        }
        return String(modA).localeCompare(String(modB));
    });
    
    renderizarTabla(datosOrdenados);
}

// 3. RENDERIZAR CABECERAS DINÁMICAS
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

// 4. RENDERIZAR TABLA
function renderizarTabla(datos) {
    const tbody = document.getElementById('cuerpoBdMadre');
    tbody.innerHTML = ''; 
    
    if(datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="100" class="text-center text-muted py-4">No se encontraron registros. Sube una remesa para comenzar.</td></tr>`;
        return;
    }

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
        
        tbody.innerHTML += tr;
    });
}

// 5. BOTÓN DE PÁNICO: VACIAR BASE DE DATOS Y FIREBASE
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

function limpiarTableroLogal() {
    bdMadre = [];
    columnasEstructura = [];
    document.getElementById('cabeceraBdMadre').innerHTML = '';
    renderizarTabla(bdMadre);
    document.getElementById('buscadorBd').value = '';
    document.getElementById('loadingOverlay').style.display = 'none';
    alert("Base de datos y Firebase vaciados correctamente.");
}

// 6. BUSCADOR
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
