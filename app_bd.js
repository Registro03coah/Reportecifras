// =========================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// =========================================================

// Reemplaza esto con los datos reales de tu proyecto MACs APP
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// IMPORTANTE: El orden de estas dos líneas no debe cambiar
firebase.initializeApp(firebaseConfig);
const database = firebase.database(); // Inicializamos database DESPUÉS de config


// =========================================================
// 2. EVENTOS PARA SUBIR Y PROCESAR EL ARCHIVO JSON
// =========================================================

// Evento del botón verde para disparar la ventana de archivos
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// Evento cuando se selecciona el archivo
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Mostramos la pantalla de carga
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            // 1. Convertimos el archivo JSON a objeto JavaScript
            let nuevosDatos = JSON.parse(event.target.result);
            if (!Array.isArray(nuevosDatos)) {
                nuevosDatos = [nuevosDatos];
            }
            
            // 2. Conectamos con Firebase para traer los datos actuales
            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                // 3. Procesamos los datos que YA ESTÁN en Firebase
                datosActuales.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    
                    if (mod && fecha) {
                        mapaRegistros.set(`${rem}_${mod}_${fecha}`, item);
                    }
                });

                // 4. Procesamos y fusionamos los datos NUEVOS del JSON
                nuevosDatos.forEach(itemNuevo => {
                    const remNuevo = String(itemNuevo['Remesa'] || itemNuevo['REMESA'] || '');
                    const modNuevo = String(itemNuevo['MÓDULO'] || itemNuevo['Módulo'] || itemNuevo['Modulo'] || '');
                    const fechaNueva = String(itemNuevo['FECHA'] || itemNuevo['Fecha'] || itemNuevo['fecha'] || '');
                    
                    if (modNuevo && fechaNueva) {
                        // Si ya existe la combinación Remesa_Módulo_Fecha, se actualiza; si no, se agrega.
                        mapaRegistros.set(`${remNuevo}_${modNuevo}_${fechaNueva}`, itemNuevo);
                    }
                });

                // 5. Convertimos el mapa fusionado de vuelta a un arreglo normal
                const datosFusionados = Array.from(mapaRegistros.values());

                // 6. Subimos los datos finales actualizados a Firebase
                database.ref('bd_madre').set(datosFusionados).then(() => {
                    console.log("¡Datos subidos y fusionados correctamente!");
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    alert("Base de datos actualizada con éxito.");
                    
                    // Limpiamos el input para permitir subir el mismo archivo otra vez si se requiere
                    document.getElementById('fileInput').value = ''; 
                    
                }).catch((error) => {
                    console.error("Error al guardar en Firebase: ", error);
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
    
    // Leemos el contenido del archivo como texto
    reader.readAsText(file);
});
