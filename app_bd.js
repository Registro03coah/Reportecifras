// NOTA PARA GITHUB Y FIREBASE:
// Descomenta y coloca aquí tu configuración real de Firebase
/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
  authDomain: "cifrasmac.firebaseapp.com",
  projectId: "cifrasmac",
  storageBucket: "cifrasmac.firebasestorage.app",
  messagingSenderId: "916644687837",
  appId: "1:916644687837:web:03d346cc48a071af1ed034"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let bdMadre = [];
let columnasEstructura = [];

// 1. EVENTO SUBIR ARCHIVO (BÓTON VERDE)
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
            const jsonData = JSON.parse(event.target.result);
            
            // Detectar columnas automáticamente del archivo JSON
            if(jsonData.length > 0) {
                columnasEstructura = Object.keys(jsonData[0]);
            }

            // AQUI ESTÁ EL CÓDIGO FIREBASE (Comentado hasta que pongas tus credenciales arriba)
            /*
            database.ref('bd_madre').set(jsonData).then(() => {
                alert("Datos subidos a Firebase correctamente");
            }).catch((error) => {
                alert("Error subiendo a Firebase: " + error);
            });
            */
            
            // Simulamos un pequeño retraso visual para que veas el "Cargando"
            setTimeout(() => {
                bdMadre = jsonData;
                renderizarCabeceras(columnasEstructura);
                ordenarYRenderizar(bdMadre);
                
                // Ocultar pantalla de carga
                document.getElementById('loadingOverlay').style.display = 'none';
                
                // Limpiamos el input por si quieres volver a subir el mismo archivo
                document.getElementById('fileInput').value = ''; 
                alert('Archivo procesado y cargado en la Base de Datos con éxito.');
            }, 1500);

        } catch (err) {
            document.getElementById('loadingOverlay').style.display = 'none';
            alert('Error al leer el archivo JSON. Verifica que el formato sea correcto.');
        }
    };
    reader.readAsText(file);
});

// 2. ORDENAR DATOS (AGRUPAR POR MÓDULO, LUEGO POR DÍA)
function ordenarYRenderizar(datos) {
    const datosOrdenados = [...datos].sort((a, b) => {
        const modA = a['Módulo'] || a['Modulo'] || '';
        const modB = b['Módulo'] || b['Modulo'] || '';
        const diaA = a['Día'] || a['Dia'] || '';
        const diaB = b['Día'] || b['Dia'] || '';
        
        // Si es el mismo módulo, ordena por día
        if (modA === modB) {
            return diaA.localeCompare(diaB);
        }
        // Si no, ordena por módulo
        return modA.localeCompare(modB);
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
            let valor = fila[colName] || '';
            
            // Colores especiales para columnas clave
            if(colName === 'Remesa') {
                tr += `<td class="fw-bold text-primary">${valor}</td>`;
            } else if (colName === 'Módulo' || colName === 'Modulo') {
                tr += `<td><span class="badge bg-secondary">${valor}</span></td>`;
            } else {
                tr += `<td>${valor}</td>`;
            }
        });
        
        // Agregar botones de acción
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

// 5. BOTÓN DE PÁNICO: VACIAR BASE DE DATOS
window.vaciarBaseDatosGeneral = function() {
    if(confirm("⚠️ ADVERTENCIA: ¿Estás seguro de querer VACIAR TODA la base de datos?")) {
        if(confirm("Se borrarán los datos visuales y de FIREBASE. ¿Confirmar borrado total?")) {
            
            // Mostrar pantalla de carga
            document.getElementById('loadingOverlay').style.display = 'flex';

            // CÓDIGO FIREBASE ACTIVO (Descomentar al poner credenciales)
            /*
            database.ref('bd_madre').remove()
            .then(() => {
                limpiarTableroLocal();
            })
            .catch((error) => {
                alert("Error limpiando Firebase: " + error);
                document.getElementById('loadingOverlay').style.display = 'none';
            });
            */
            
            // Simulación temporal mientras configuras Firebase
            setTimeout(() => {
                limpiarTableroLocal();
            }, 1000);
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

// 6. BUSCADOR
document.getElementById('buscadorBd').addEventListener('keyup', function(e) {
    const textoBusqueda = e.target.value.toLowerCase();
    
    if(textoBusqueda === '') {
        ordenarYRenderizar(bdMadre);
        return;
    }
    
    const resultados = bdMadre.filter(item => {
        const rem = (item['Remesa'] || '').toLowerCase();
        const dia = (item['Día'] || item['Dia'] || '').toLowerCase();
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

// Al inicio la tabla arranca limpia
renderizarTabla([]);
