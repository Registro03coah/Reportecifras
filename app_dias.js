function obtenerValorFila(fila, col) {
    if (!fila) return '';
    
    // Normalizar la clave para evitar problemas con acentos y mayúsculas/minúsculas
    const colClean = col.trim();
    const colUpper = colClean.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (colUpper === "MODULO") return fila["MODULO"] || fila["Módulo"] || fila["Modulo"] || fila["módulo"] || '';
    if (colUpper === "DIA") return fila["DIA"] || fila["Día"] || fila["Dia"] || fila["día"] || '';
    if (colUpper === "FECHA") return fila["FECHA"] || fila["Fecha"] || fila["fecha"] || '';
    if (colUpper === "REMESA") return fila["REMESA"] || fila["Remesa"] || fila["remesa"] || '';
    if (colUpper === "SEDES") return fila["SEDE_DE_OPERACIÓN_DE_MÓDULO"] || fila["SEDES"] || fila["Sedes"] || fila["sedes"] || '';
    
    // Búsqueda directa o flexible en el objeto de la fila
    if (fila[colClean] !== undefined && fila[colClean] !== null) return fila[colClean];
    
    // Intentar buscar ignorando mayúsculas/minúsculas en las llaves del objeto
    const foundKey = Object.keys(fila).find(k => k.toLowerCase() === colClean.toLowerCase());
    return foundKey ? fila[foundKey] : '';
}

// Escuchador de Firebase seguro con depuración
construirHeaderTabla();
onValue(ref(db, 'bd_madre'), (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        bdMadreGlobal = Array.isArray(data) ? data : Object.values(data);
        console.log("✅ Datos cargados correctamente de Firebase:", bdMadreGlobal.length, "registros.");
        procesarYMostrarDatos(); 
    } else {
        console.warn("⚠️ La ruta 'bd_madre' en Firebase no contiene datos o no existe.");
        bdMadreGlobal = [];
        procesarYMostrarDatos();
    }
}, (error) => {
    console.error("❌ Error al leer Firebase:", error);
});
