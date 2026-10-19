// 1. Simulamos tu Base de Datos Central (BD Madre)
// Más adelante, esto vendrá directamente de Firebase o tu base de datos real.
let bdMadre = [
    { id: 1, remesa: 'REM-45', dia: '16/10/2026', modulo: 'Módulo 1', tramites: 120, entregas: 85, otros: 10 },
    { id: 2, remesa: 'REM-45', dia: '16/10/2026', modulo: 'Módulo 2', tramites: 95, entregas: 60, otros: 5 },
    { id: 3, remesa: 'REM-45', dia: '16/10/2026', modulo: 'Módulo 3', tramites: 110, entregas: 70, otros: 8 },
    { id: 4, remesa: 'REM-46', dia: '17/10/2026', modulo: 'Módulo 1', tramites: 130, entregas: 90, otros: 12 },
    { id: 5, remesa: 'REM-46', dia: '17/10/2026', modulo: 'Módulo 2', tramites: 80, entregas: 55, otros: 4 },
    { id: 6, remesa: 'REM-46', dia: '17/10/2026', modulo: 'Módulo 3', tramites: 105, entregas: 65, otros: 7 },
];

// 2. Función para pintar la tabla
function renderizarTabla(datos) {
    const tbody = document.getElementById('cuerpoBdMadre');
    tbody.innerHTML = ''; // Limpiamos la tabla
    
    if(datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No se encontraron registros</td></tr>`;
        return;
    }

    datos.forEach(fila => {
        tbody.innerHTML += `
            <tr>
                <td class="fw-bold text-primary">${fila.remesa}</td>
                <td>${fila.dia}</td>
                <td><span class="badge bg-secondary">${fila.modulo}</span></td>
                <td>${fila.tramites}</td>
                <td>${fila.entregas}</td>
                <td>${fila.otros}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning text-dark me-1" onclick="editarRegistro(${fila.id})">
                        <i class="bi bi-pencil-square"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="borrarRegistro(${fila.id})">
                        <i class="bi bi-trash3-fill"></i> Borrar
                    </button>
                </td>
            </tr>
        `;
    });
}

// 3. Lógica del Buscador en tiempo real
document.getElementById('buscadorBd').addEventListener('keyup', function(e) {
    const textoBusqueda = e.target.value.toLowerCase();
    
    // Filtramos si el texto coincide con la remesa o con el día
    const resultados = bdMadre.filter(item => 
        item.remesa.toLowerCase().includes(textoBusqueda) || 
        item.dia.toLowerCase().includes(textoBusqueda)
    );
    
    // Volvemos a pintar la tabla solo con los resultados encontrados
    renderizarTabla(resultados);
});

// 4. Funciones de los botones de acción
function editarRegistro(id) {
    alert("Aquí abriremos la ventana para editar los datos del registro con ID: " + id);
    // Aquí pondremos la lógica para cargar los datos en un modal y actualizar
}

function borrarRegistro(id) {
    if(confirm("¿Estás seguro de borrar este registro de la BD Madre? Esto afectará los reportes.")) {
        // Filtramos para quitar el registro borrado
        bdMadre = bdMadre.filter(item => item.id !== id);
        // Volvemos a buscar/pintar para que desaparezca visualmente
        document.getElementById('buscadorBd').dispatchEvent(new Event('keyup'));
    }
}

// Inicializamos la tabla al cargar la página
renderizarTabla(bdMadre);
