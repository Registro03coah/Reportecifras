// AGREGA ESTA LÍNEA JUSTO AQUÍ, ANTES DE TUS EVENTOS:
const database = firebase.database();

// 1. EVENTO SUBIR ARCHIVO (BOTÓN VERDE) - FUSIÓN INTELIGENTE
document.getElementById('btnSubir').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// SOLO DEBE HABER UN EVENTO 'change' PARA fileInput
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
            
            // Aquí ya funciona la base de datos
            database.ref('bd_madre').once('value').then((snapshot) => {
                let datosActuales = snapshot.val();
                datosActuales = datosActuales ? (Array.isArray(datosActuales) ? datosActuales : Object.values(datosActuales)) : [];

                let mapaRegistros = new Map();

                // 1. Procesamos los datos que ya están en Firebase
                datosActuales.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    // Usamos la FECHA exacta como identificador en lugar del día
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    
                    if (mod && fecha) {
                        mapaRegistros.set(`${rem}_${mod}_${fecha}`, item);
                    }
                });

                // 2. Procesamos los datos nuevos del archivo JSON
                nuevosDatos.forEach(item => {
                    const rem = String(item['Remesa'] || item['REMESA'] || '');
                    const mod = String(item['MÓDULO'] || item['Módulo'] || item['Modulo'] || '');
                    const fecha = String(item['FECHA'] || item['Fecha'] || item['fecha'] || '');
                    
                    // FILTRO DE BASURA: Si la fila no tiene módulo o no tiene fecha, es una fila vacía o de totales. La ignoramos.
                    if (!mod || !fecha) {
                        return;
                    }

                    // Guardamos usando la llave única con FECHA para que no se empalmen los diferentes jueves
                    mapaRegistros.set(`${rem}_${mod}_${fecha}`, item);
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
