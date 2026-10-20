// =========================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE (cifrasmac)
// =========================================================
  const firebaseConfig = {
    apiKey: "AIzaSyAE81KpvWVRKAc3l1mop6EEgCCeExq5wlo",
    authDomain: "cifrasmac.firebaseapp.com",
    databaseURL: "https://cifrasmac-default-rtdb.firebaseio.com",
    projectId: "cifrasmac",
    storageBucket: "cifrasmac.firebasestorage.app",
    messagingSenderId: "916644687837",
    appId: "1:916644687837:web:03d346cc48a071af1ed034"
  };

// Imprimir la configuración para asegurar que no hay valores 'undefined'
console.log("1. Parámetros de Firebase Config:", firebaseConfig);

firebase.initializeApp(firebaseConfig);
// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); 

// Variable global para guardar los datos y que el buscador funcione rápido
let datosGlobalesBd = [];

// =========================================================
// 2. DESCARGAR Y DIBUJAR DATOS EN LA TABLA (TIEMPO REAL)
// =========================================================
database.ref('bd_madre').on('value', (snapshot) => {
    let datos = snapshot.val();
    datosGlobalesBd = datos ? (Array.isArray(datos) ? datos : Object.values(datos)) : [];
    dibujarTablaBd(datosGlobalesBd);
});

function dibujarTablaBd(datosArreglo) {
    const thead = document.getElementById('cabeceraBdMadre');
    const tbody = document.getElementById('cuerpoBdMadre');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!datosArreglo || datosArreglo.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4 text-muted"><i class="bi bi-info-circle"></i> No hay datos en la Base Madre. Sube una nueva remesa.</td></tr>';
        return;
    }

    // Extraer las columnas dinámicamente del primer registro
    let columnas = Object.keys(datosArreglo[0]);
    
    // Dibujar la cabecera (thead)
    let trHead = '<tr>';
    columnas.forEach(col => {
        trHead += `<th>${col}</th>`;
    });
    trHead += '</tr>';
    thead.innerHTML = trHead;

    // Dibujar el cuerpo (tbody)
    let htmlCuerpo = '';
    datosArreglo.forEach(fila => {
        htmlCuerpo += '<tr>';
        columnas.forEach(col => {
            htmlCuerpo += `<td>${fila[col] !== undefined ? fila[col] : ''}</td>`;
        });
        htmlCuerpo += '</tr>';
    });
    tbody.innerHTML = htmlCuerpo;
}

// =========================================================
// 3. BUSCADOR EN TIEMPO REAL
// =========================================================
document.getElementById('buscadorBd').addEventListener('input', function(e) {
    const termino = e.target.value.toLowerCase();
    
    if(termino.trim() === '') {
        dibujarTablaBd(datosGlobalesBd);
        return;
    }

    const datosFiltrados = datosGlobalesBd.filter(item => {
        const remesa = String(item['Remesa'] || item['REMESA'] || '').toLowerCase();
        const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '').toLowerCase();
        const modulo = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '').toLowerCase();
        
        return remesa.includes(termino) || fecha.includes(termino) || modulo.includes(termino);
    });

    dibujarTablaBd(datosFiltrados);
});

// =========================================================
// 4. EVENTOS PARA SUBIR Y PROCESAR EL ARCHIVO JSON
// =========================================================
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            let nuevosDatos = JSON.parse(event.target.result);
            if (!Array.isArray(nuevosDatos)) {
                nuevosDatos = [nuevosDatos];
            }
            
            // Usamos once() solo para leer una vez al momento de fusionar
            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                // Procesamos los datos actuales
                datosActuales.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    if (mod && fecha) mapaRegistros.set(`${rem}_${mod}_${fecha}`, item);
                });

                // Procesamos los nuevos datos
                nuevosDatos.forEach(itemNuevo => {
                    const remNuevo = String(itemNuevo['Remesa'] || itemNuevo['REMESA'] || '');
                    const modNuevo = String(itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '');
                    const fechaNueva = String(itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '');
                    if (modNuevo && fechaNueva) mapaRegistros.set(`${remNuevo}_${modNuevo}_${fechaNueva}`, itemNuevo);
                });

                const datosFusionados = Array.from(mapaRegistros.values());

                // Guardamos en Firebase (esto disparará el .on() de arriba automáticamente)
                database.ref('bd_madre').set(datosFusionados).then(() => {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Base de datos actualizada y fusionada con éxito.");
                    document.getElementById('fileInput').value = ''; 
                }).catch((error) => {
                    console.error("Error al guardar: ", error);
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Hubo un error al intentar guardar los datos en la nube.");
                });

            }).catch((error) => {
                console.error("Error al consultar Firebase: ", error);
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                alert("Error al conectar con la base de datos.");
            });

        } catch (error) {
            console.error("Error al procesar JSON: ", error);
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            alert("Error al leer el archivo JSON. Verifica que su formato sea válido.");
        }
    };
    reader.readAsText(file);
});

// =========================================================
// 5. FUNCIÓN PARA VACIAR LA BASE DE DATOS (BOTÓN ROJO)
// =========================================================
function vaciarBaseDatosGeneral() {
    // Alerta de confirmación
    if (confirm("🚨 ¿ESTÁS COMPLETAMENTE SEGURO?\n\nEsto borrará TODOS los registros de la Base Madre en la nube de forma permanente.")) {
        database.ref('bd_madre').remove()
            .then(() => {
                alert("La base de datos ha sido vaciada.");
                // No necesitamos recargar porque la función .on('value') limpiará la tabla sola
            })
            .catch((error) => {
                console.error("Error al borrar los datos: ", error);
                alert("Hubo un problema al intentar vaciar la base de datos.");
            });
    }
}
