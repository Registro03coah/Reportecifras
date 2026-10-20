// BOTÓN GUARDAR LIMPIO (Sin afectar bd_madre)
document.getElementById('btnGuardarBD').addEventListener('click', () => {
    const remesaActual = document.getElementById('inputRemesa').value.trim();
    
    if(!remesaActual) {
        alert("Atención: No se ha detectado el número de Remesa en la columna 39.");
        return;
    }

    const tablasNombres = [...MODULOS, "totales"];
    let datosAGuardar = {};
    
    tablasNombres.forEach(mod => {
        const filas = document.querySelector(`#tablaCaptura_${mod} tbody`).querySelectorAll('tr');
        let datosTabla = [];
        filas.forEach(fila => {
            let filaArray = [];
            fila.querySelectorAll('td').forEach(td => {
                const input = td.querySelector('input');
                filaArray.push(input ? input.value : "");
            });
            datosTabla.push(filaArray);
        });
        datosAGuardar[mod] = datosTabla;
    });

    const dbRefActual = ref(db, 'vaciado_actual');
    const dbRefHistorial = ref(db, `historial_campanas/${remesaActual}`);
    
    Promise.all([
        set(dbRefActual, datosAGuardar),
        set(dbRefHistorial, datosAGuardar)
    ]).then(() => {
        alert(`¡Éxito! Información guardada para la Remesa: ${remesaActual}.`);
    }).catch((error) => {
        console.error("Error al guardar en Firebase:", error);
        alert("Hubo un error al guardar los datos.");
    });
});
