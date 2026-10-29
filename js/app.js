const diasNombresCortos = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
let moduloActual = null;
let totalDiasTrabajados = 0;
let sumaCol16Total = 0;
let primerDispEncontrado = false;
let primerDispVal = 0;
let sumas = {};
let esAdminMode = false;
let passwordEsperadaGlobal = '';
let modalCambiarPwdInstance = null;
let modalRemesasInstance = null;
let temporizadorInactividad = null;
let datosCargadosNube = {};
let remesaSeleccionadaParaCopiar = null;
const TIEMPO_INACTIVIDAD = 5 * 60 * 1000;

const configModulos = {
    '50351': { responsable: 'Pedro Cecilio Ornelas Iñiguez', conf: 'B+5' },
    '50353': { responsable: 'Arnoldo Montenegro Garza', conf: 'B+3' },
    '50354': { responsable: 'Ricardo Solar Salas', conf: 'B+2' }
};

const sedesPorModulo = {
    '50351': ['', 'MVA 050351'],
    '50353': ['', 'AGUJITA', 'ALLENDE', 'CLOETE', 'GUERRERO', 'HIDALGO', 'NUEVA ROSITA', 'SABINAS', 'VILLA UNION'],
    '50354': ['', 'ABASOLO', 'CANDELA', 'CASTAÑOS', 'EL HUIZACHAL', 'JUAREZ', 'MONCLOVA', 'OBAYOS', 'PRIMERO DE MAYO', 'PROGRESO', 'SAN ALBERTO', 'SAN JOSE DE AURA']
};

const datosBaseDefault = [
    {dia: 'Lunes', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Martes', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Miércoles', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Jueves', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Viernes', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Sábado', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640},
    {dia: 'Domingo', fecha: '', horas: '', sede: '', fi: '', ff: '', ins: 0, corr: 0, cam: 0, rep: 0, cdir: 0, reinc: 0, reempl: 0, reimp: 0, cpvDev: 0, dispAnt: 0, rec: 0, recOtr: 0, ent: 0, canje: 0, fichEnt: 0, fichAtend: 0, exp: 0, ord: 0, rect: 0, juicio: 0, remesa: 202640}
];

const lotesDataDefault = [
    { lote: '', cant: '' }, { lote: '', cant: '' }, { lote: '', cant: '' }, { lote: '', cant: '' }, { lote: '', cant: '' }, { lote: '', cant: '' }, { lote: '', cant: '' }
];

const columnasSinSuma = [1, 2, 3, 4, 5, 6, 16, 17, 18, 20, 22, 29, 30, 31, 39, 44, 45, 46, 47, 48, 51, 52];

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btnVolver').addEventListener('click', volverAlMenu);
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesionManual);
    document.getElementById('btnGuardar').addEventListener('click', guardarDatosManual);
    document.getElementById('btnCopiar').addEventListener('click', copiarTablaAlPortapapeles);
    document.getElementById('btnBorrar').addEventListener('click', confirmarBorrado);

    modalCambiarPwdInstance = new bootstrap.Modal(document.getElementById('modalCambiarPassword'));
    modalRemesasInstance = new bootstrap.Modal(document.getElementById('modalRemesasAdmin'));

    let moduloGuardado = localStorage.getItem('sesion_modulo_activo');
    let adminGuardado = localStorage.getItem('sesion_admin_mode') === 'true';

    if (moduloGuardado) {
        if (adminGuardado) {
            cargarModuloAdminDirecto(moduloGuardado);
        } else {
            cargarModuloDirecto(moduloGuardado);
        }
    } else {
        window.location.href = 'index.html';
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evento => {
        window.addEventListener(evento, reiniciarTemporizadorInactividad);
    });
});

function abrirModalCambiarPassword() {
    document.getElementById('txtPwdActual').value = '';
    document.getElementById('txtPwdNueva').value = '';
    document.getElementById('txtPwdConfirmar').value = '';
    modalCambiarPwdInstance.show();
}

function guardarNuevaPasswordFirebase() {
    let actualInput = document.getElementById('txtPwdActual').value;
    let nuevaInput = document.getElementById('txtPwdNueva').value;
    let confirmarInput = document.getElementById('txtPwdConfirmar').value;
    let defaults = { '50351': '351', '50353': '353', '50354': '354' };

    db.ref('passwords/' + moduloActual).once('value').then(snapshot => {
        let pwdReal = snapshot.val() || defaults[moduloActual];

        if (actualInput !== pwdReal && actualInput !== 'charro' && actualInput !== 'admin') {
            alert("❌ La contraseña actual es incorrecta.");
            return;
        }
        if (!nuevaInput || nuevaInput.trim() === "") {
            alert("❌ La nueva contraseña no puede estar vacía.");
            return;
        }
        if (nuevaInput !== confirmarInput) {
            alert("❌ Las nuevas contraseñas no coinciden.");
            return;
        }

        db.ref('passwords/' + moduloActual).set(nuevaInput).then(() => {
            alert("¡Contraseña actualizada con éxito en la nube! Por seguridad, se cerrará la sesión para volver a ingresar con tu nueva clave.");
            modalCambiarPwdInstance.hide();
            volverAlMenu();
        }).catch(err => {
            alert("Error al guardar la contraseña en Firebase.");
        });
    });
}

function abrirModalRemesasArchivadas() {
    volverListaRemesas();
    modalRemesasInstance.show();
    let tbody = document.getElementById('cuerpoTablaRemesasArchivadas');
    tbody.innerHTML = `<tr><td colspan="4" class="text-muted">Cargando registros...</td></tr>`;

    db.ref('remesas_completas').once('value').then(snapshot => {
        let data = snapshot.val();
        tbody.innerHTML = '';
        if (!data) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-danger">No hay remesas archivadas registradas.</td></tr>`;
            return;
        }

        let registros = [];
        Object.keys(data).forEach(macKey => {
            let remesasMac = data[macKey];
            Object.keys(remesasMac).forEach(timestampKey => {
                let reg = remesasMac[timestampKey];
                registros.push({ mac: macKey, timestampKey: timestampKey, remesa: reg.remesa, fechaHora: reg.fechaHora, filas1a75: reg.filas1a75 });
            });
        });

        if (registros.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-danger">No hay remesas archivadas registradas.</td></tr>`;
            return;
        }

        registros.forEach((r) => {
            let fechaFmt = new Date(r.fechaHora).toLocaleString();
            let regJson = encodeURIComponent(JSON.stringify(r));
            tbody.innerHTML += `
                <tr>
                    <td class="fw-bold">Módulo ${r.mac}</td>
                    <td>${r.remesa}</td>
                    <td>${fechaFmt}</td>
                    <td>
                        <button class="btn btn-sm btn-primary py-0 me-1" onclick='verDetalleRemesaArchivada(decodeURIComponent("${regJson}"))'>🔍 Ver</button>
                        <button class="btn btn-sm btn-danger py-0" onclick="borrarRemesaArchivada('${r.mac}', '${r.timestampKey}')">🗑️ Borrar</button>
                    </td>
                </tr>`;
        });
    }).catch(err => {
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Error al cargar el historial.</td></tr>`;
    });
}

function borrarRemesaArchivada(mac, timestampKey) {
    let pwd = prompt("🔐 Ingrese la contraseña de Administrador para borrar este registro:");
    if (pwd === "admin" || pwd === "charro") {
        db.ref(`remesas_completas/${mac}/${timestampKey}`).remove().then(() => {
            alert("🗑️ Remesa archivada eliminada correctamente.");
            abrirModalRemesasArchivadas();
        }).catch(err => {
            alert("Error al eliminar el registro.");
        });
    } else if (pwd !== null) {
        alert("❌ Contraseña incorrecta. No se eliminó el registro.");
    }
}

function verDetalleRemesaArchivada(regStr) {
    let reg = JSON.parse(regStr);
    remesaSeleccionadaParaCopiar = reg;
    document.getElementById('contenedorListaRemesas').style.display = 'none';
    document.getElementById('detalleRemesaContainer').style.display = 'block';
    document.getElementById('lblDetalleRemesaTitulo').innerText = `Remesa ${reg.remesa} - Módulo ${reg.mac} (${new Date(reg.fechaHora).toLocaleString()})`;

    let thead = document.querySelector('#tablaDetalleArchivada thead');
    let tbody = document.querySelector('#tablaDetalleArchivada tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    let trHead = document.createElement('tr');
    for(let i=1; i<=75; i++) {
        trHead.innerHTML += `<th>Col ${i}</th>`;
    }
    thead.appendChild(trHead);

    reg.filas1a75.forEach(filaVals => {
        let tr = document.createElement('tr');
        filaVals.forEach(val => {
            tr.innerHTML += `<td>${val}</td>`;
        });
        tbody.appendChild(tr);
    });
}

function volverListaRemesas() {
    document.getElementById('contenedorListaRemesas').style.display = 'block';
    document.getElementById('detalleRemesaContainer').style.display = 'none';
    remesaSeleccionadaParaCopiar = null;
}

function copiarRemesaSeleccionadaAlPortapapeles() {
    if(!remesaSeleccionadaParaCopiar || !remesaSeleccionadaParaCopiar.filas1a75) return;
    let lineas = [];
    remesaSeleccionadaParaCopiar.filas1a75.forEach(filaVals => {
        lineas.push(filaVals.join('\t'));
    });
    let textoFinal = lineas.join('\n');
    navigator.clipboard.writeText(textoFinal).then(() => {
        alert("¡Remesa (1-75 columnas con ceros) copiada con éxito para Excel!");
    }).catch(err => {
        alert("Error al copiar al portapapeles.");
    });
}

function reiniciarTemporizadorInactividad() {
    if(!moduloActual) return;
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(() => {
        alert("⏳ Sesión cerrada por 5 minutos de inactividad. Datos guardados en la nube.");
        volverAlMenu();
    }, TIEMPO_INACTIVIDAD);
}

function cargarModuloDirecto(idModulo) {
    esAdminMode = false;
    moduloActual = idModulo;
    localStorage.setItem('sesion_modulo_activo', idModulo);
    localStorage.setItem('sesion_admin_mode', 'false');
    
    document.getElementById('panelSelectorAdmin').style.display = 'none';
    document.getElementById('vistaReporte').classList.add('modulo-normal');
    document.getElementById('lblEncabezadoReporte').innerText = `REPORTE DIARIO DE SOLICITUDES Y OPERACIÓN - MÓDULO ${idModulo}`;
    document.getElementById('txtModulo').value = idModulo;
    
    db.ref('modulos/' + idModulo).once('value').then((snapshot) => {
        datosCargadosNube = snapshot.val() || JSON.parse(localStorage.getItem('mac_datos_' + idModulo) || '{}');
        construirTabla();
        cargarDatosLocalesUI();
        
        if(!snapshot.exists() && !localStorage.getItem('mac_datos_' + idModulo) && configModulos[idModulo]) {
            document.getElementById('txtResponsable').value = configModulos[idModulo].responsable;
            document.getElementById('txtConfGlobal').value = configModulos[idModulo].conf;
        }
    }).catch((err) => {
        console.error("Error al conectar con la nube:", err);
        datosCargadosNube = JSON.parse(localStorage.getItem('mac_datos_' + idModulo) || '{}');
        construirTabla();
        cargarDatosLocalesUI();
    });

    reiniciarTemporizadorInactividad();
}

function cargarModuloAdminDirecto(idModulo) {
    esAdminMode = true;
    moduloActual = idModulo;
    localStorage.setItem('sesion_modulo_activo', idModulo);
    localStorage.setItem('sesion_admin_mode', 'true');
    
    document.getElementById('panelSelectorAdmin').style.display = 'block';
    document.getElementById('vistaReporte').classList.remove('modulo-normal');
    document.getElementById('lblEncabezadoReporte').innerText = `PANEL ADMINISTRADOR - GESTIÓN MÓDULO ${idModulo}`;
    document.getElementById('txtModulo').value = idModulo;
    let combo = document.getElementById('comboAdminModulo');
    if(combo) combo.value = idModulo;
    
    db.ref('modulos/' + idModulo).once('value').then((snapshot) => {
        datosCargadosNube = snapshot.val() || JSON.parse(localStorage.getItem('mac_datos_' + idModulo) || '{}');
        construirTabla();
        cargarDatosLocalesUI();
        
        if(!snapshot.exists() && !localStorage.getItem('mac_datos_' + idModulo) && configModulos[idModulo]) {
            document.getElementById('txtResponsable').value = configModulos[idModulo].responsable;
            document.getElementById('txtConfGlobal').value = configModulos[idModulo].conf;
        }
    }).catch((err) => {
        console.error("Error al conectar con la nube:", err);
        datosCargadosNube = JSON.parse(localStorage.getItem('mac_datos_' + idModulo) || '{}');
        construirTabla();
        cargarDatosLocalesUI();
    });

    reiniciarTemporizadorInactividad();
}

function cambiarModuloAdmin(nuevoModulo) {
    guardarDatosLocales();
    cargarModuloAdminDirecto(nuevoModulo);
}

function volverAlMenu() {
    clearTimeout(temporizadorInactividad);
    guardarDatosLocales(); 
    localStorage.removeItem('sesion_modulo_activo'); 
    localStorage.removeItem('sesion_admin_mode');
    window.location.href = 'index.html';
}

function cerrarSesionManual() {
    if(confirm("¿Desea cerrar sesión y volver al menú principal?")) {
        volverAlMenu();
    }
}

function construirTabla() {
    let filaConsecutivos = document.getElementById('filaConsecutivos');
    filaConsecutivos.innerHTML = '';
    for(let i=1; i<=75; i++) {
        let claseOculta = (i > 30) ? 'col-oculta-modulo' : '';
        filaConsecutivos.innerHTML += `<th class="${claseOculta}">${i}</th>`;
    }

    let tbody = document.getElementById('cuerpoTablaCompleta');
    tbody.innerHTML = '';

    let savedData = datosCargadosNube;
    let datosDiarios = savedData.datosDiarios || datosBaseDefault;
    let sedesDisponibles = sedesPorModulo[moduloActual] || [''];

    datosDiarios.forEach((d, idx) => {
        let tr = document.createElement('tr');
        let esLunes = (idx === 0);
        
        let htmlSedes = '';
        sedesDisponibles.forEach(s => {
            let sel = (d.sede === s) ? 'selected' : '';
            htmlSedes += `<option value="${s}" ${sel}>${s}</option>`;
        });
        
        let htmlAdicionales = '';
        for(let aIdx=0; aIdx<35; aIdx++) {
            let colActual = 41 + aIdx;
            let valCol = (d.adic && d.adic[aIdx] !== undefined) ? d.adic[aIdx] : "";
            if ([44, 45, 46, 47].includes(colActual)) {
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input" value="" readonly style="background-color: #f1f5f9;"></td>`;
            } else if (colActual === 48) {
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-resguardo-link" value="" readonly></td>`;
            } else if (colActual === 51 || colActual === 52) {
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula ${colActual === 51 ? 'col-script-link' : 'col-folionec-link'}" value="" readonly></td>`;
            } else if (colActual === 63 || colActual === 64) {
                let impExpSubIdx = colActual - 63;
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-impexp-link-${impExpSubIdx}" value="" readonly></td>`;
            } else if (colActual === 53 || colActual === 54 || colActual === 65) {
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-adic-${colActual}" value="" readonly></td>`;
            } else if (colActual >= 66 && colActual <= 75) {
                let retSubIdx = colActual - 66;
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-ret-link-${retSubIdx}" value="" readonly></td>`;
            } else {
                htmlAdicionales += `<td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-adic-val" data-adic-idx="${aIdx}" value="${valCol}" oninput="recalcularTodo(); guardarDatosLocales();"></td>`;
            }
        }

        tr.innerHTML = `
            <td class="fw-bold col-dia">${d.dia}</td>
            <td><input type="date" class="date-input col-editable col-fecha" value="${d.fecha || ''}" ${esLunes ? 'onchange="actualizarFechasConsecutivas(this); guardarDatosLocales();"' : 'readonly style="background-color: #e9ecef;"'}></td>
            <td><input type="text" class="cell-input col-editable col-horas" value="${d.horas !== undefined ? d.horas : ''}" oninput="validarHoras(this); guardarDatosLocales();"></td>
            <td>
                <select class="cell-input col-editable col-sede" onchange="recalcularTodo(); guardarDatosLocales();">
                    ${htmlSedes}
                </select>
            </td>
            <td><input type="text" class="cell-input col-editable col-fi" maxlength="13" value="${d.fi || ''}" oninput="validarFolioNumerico(this); recalcularFila(this);"></td>
            <td><input type="text" class="cell-input col-editable col-ff" maxlength="13" value="${d.ff || ''}" oninput="validarFolioNumerico(this); recalcularFila(this);"></td>
            <td><input type="text" class="cell-input cell-formula col-tot-folios" value="" readonly></td>
            <td><input type="text" class="cell-input col-editable col-ins" value="${d.ins !== undefined ? d.ins : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-corr" value="${d.corr !== undefined ? d.corr : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-cam" value="${d.cam !== undefined ? d.cam : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-rep" value="${d.rep !== undefined ? d.rep : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-cdir" value="${d.cdir !== undefined ? d.cdir : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-reinc" value="${d.reinc !== undefined ? d.reinc : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-reempl" value="${d.reempl !== undefined ? d.reempl : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-reimp" value="${d.reimp !== undefined ? d.reimp : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input cell-formula col-tot-tram" value="" readonly></td>
            <td><input type="text" class="cell-input cell-formula col-canc-link" value="" readonly></td>
            <td><input type="text" class="cell-input cell-formula col-rech-link" value="" readonly></td>
            <td><input type="text" class="cell-input col-editable col-cpvdev" value="${d.cpvDev !== undefined ? d.cpvDev : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-disp-ant" value="${d.dispAnt !== undefined ? d.dispAnt : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-rec" value="${d.rec !== undefined ? d.rec : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input cell-formula col-recotr-link" value="" readonly></td>
            <td><input type="text" class="cell-input col-editable col-ent" value="${d.ent !== undefined ? d.ent : ''}" oninput="recalcularFila(this); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-num col-v24" value="${d.v24 || ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-num col-v25" value="${d.v25 || ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-num col-v26" value="${d.v26 || ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-num col-v27" value="${d.v27 || ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input col-editable col-num col-v28" value="${d.v28 || ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td><input type="text" class="cell-input cell-formula col-retiradas-causa-link" value="" readonly></td>
            <td><input type="text" class="cell-input cell-formula col-disp" value="" readonly></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-canje" value="${d.canje !== undefined ? d.canje : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-fichent" value="${d.fichEnt !== undefined ? d.fichEnt : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-fichatend" value="${d.fichAtend !== undefined ? d.fichAtend : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-dias-trab" value="" readonly></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-exp" value="${d.exp !== undefined ? d.exp : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-ord" value="${d.ord !== undefined ? d.ord : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-rect" value="${d.rect !== undefined ? d.rect : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-num col-juicio" value="${d.juicio !== undefined ? d.juicio : ''}" oninput="recalcularTodo(); guardarDatosLocales();"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-remesa" value="${d.remesa || 202640}"></td>
            <td class="col-oculta-modulo"><input type="text" class="cell-input cell-formula col-tot-mov" value="" readonly></td>
            ${htmlAdicionales}
        `;
        tbody.appendChild(tr);
    });
    
    let filaTotales = document.getElementById('filaTotales');
    filaTotales.innerHTML = `<td colspan="4" class="text-end">LÍNEA TOTALES:</td>`;
    for(let c=5; c<=75; c++) {
        let claseOculta = (c > 30) ? 'col-oculta-modulo' : '';
        if (c === 5) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_min_5" class="fw-bold"></span></td>`;
        } else if (c === 6) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_max_6" class="fw-bold"></span></td>`;
        } else if (c === 16) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_16" class="fw-bold" style="background-color: #22c55e; color: white; padding: 2px 4px; display: inline-block; width: 100%;"></span></td>`;
        } else if (c === 17) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_canc_17" class="fw-bold text-danger"></span></td>`;
        } else if (c === 18) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_rech_18" class="fw-bold text-danger"></span></td>`;
        } else if (c === 20) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_primer_disp_20" class="fw-bold text-danger"></span></td>`;
        } else if (c === 22) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_recotr_22" class="fw-bold text-danger"></span></td>`;
        } else if (c === 29) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_ret_29" class="fw-bold text-danger"></span></td>`;
        } else if (c === 30) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_disp_fin_30" class="fw-bold text-danger"></span></td>`;
        } else if (c === 31) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_canje_31" class="fw-bold text-danger"></span></td>`;
        } else if (c === 34) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_dias_trab_34" class="fw-bold"></span></td>`;
        } else if (c === 39) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_remesa_39" class="fw-bold text-primary"></span></td>`;
        } else if (c === 44) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_conf_44" class="fw-bold text-primary"></span></td>`;
        } else if (c === 45) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_ent_45" class="fw-bold text-primary">COAHUILA 05</span></td>`;
        } else if (c === 46) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_dtto_46" class="fw-bold text-primary">03</span></td>`;
        } else if (c === 47) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_modulo_47" class="fw-bold text-primary">${moduloActual}</span></td>`;
        } else if (c === 48) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_resguardo_48" class="fw-bold text-danger"></span></td>`;
        } else if (c === 51) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_script_51" class="fw-bold text-danger"></span></td>`;
        } else if (c === 52) {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_folionec_52" class="fw-bold text-danger"></span></td>`;
        } else if (c === 63 || c === 64) {
            let subIdx = c - 63;
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_impexp_${subIdx}" class="fw-bold text-danger"></span></td>`;
        } else if (c >= 66 && c <= 75) {
            let subIdx = c - 66;
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_ret_${subIdx}" class="fw-bold text-danger"></span></td>`;
        } else if (columnasSinSuma.includes(c)) {
            filaTotales.innerHTML += `<td class="${claseOculta}"></td>`;
        } else {
            filaTotales.innerHTML += `<td class="${claseOculta}"><span id="tot_col_${c}" class="fw-bold"></span></td>`;
        }
    }

    construirTablasInferiores();
    cargarValoresSubTablas(savedData);
    document.querySelectorAll('.col-horas').forEach(inp => validarHoras(inp));
    inicializarNavegacionIndependientePorTablas();
    recalcularTodo();
}

function construirTablasInferiores() {
    let tbodyRech = document.querySelector('#tablaRechazos tbody');
    tbodyRech.innerHTML = '';
    diasNombresCortos.forEach((corto) => {
        let htmlCols = '';
        for(let rIdx=0; rIdx<10; rIdx++) {
            htmlCols += `<td><input type="text" class="cell-input col-rech-val" data-col="${rIdx}" value="" oninput="actualizarDatosGlobales()"></td>`;
        }
        tbodyRech.innerHTML += `
            <tr>
                <td class="fw-bold">${corto}</td>
                ${htmlCols}
                <td><input type="text" class="cell-input cell-formula row-tot-rech" value="" readonly></td>
            </tr>`;
    });
    tbodyRech.innerHTML += `<tr class="row-total"><td class="text-end">TOTAL:</td><td colspan="10"></td><td><span id="totRechGeneral"></span></td></tr>`;

    let tbodyCred = document.querySelector('#tablaCredRecibidas tbody');
    let tbodyCanc = document.querySelector('#tablaCancelados tbody');
    let tbodyInst = document.querySelector('#tablaInstancias tbody');
    let tbodyImpExp = document.querySelector('#tablaImpExp tbody');
    let tbodyLotes = document.querySelector('#tablaLotes tbody');

    tbodyCred.innerHTML = ''; tbodyCanc.innerHTML = ''; tbodyInst.innerHTML = ''; tbodyImpExp.innerHTML = ''; tbodyLotes.innerHTML = '';

    diasNombresCortos.forEach((corto) => {
        tbodyCred.innerHTML += `
            <tr>
                <td class="fw-bold">${corto}</td>
                <td><input type="text" class="cell-input col-cred-1" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-cred-2" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-cred-3" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-cred-resguardo" value="" oninput="actualizarDatosGlobales()"></td>
            </tr>`;

        tbodyCanc.innerHTML += `
            <tr>
                <td><input type="text" class="cell-input col-canc-val" data-col="0" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-canc-val" data-col="1" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-canc-val" data-col="2" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-canc-val" data-col="3" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-canc-val" data-col="4" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input cell-formula row-tot-canc" value="" readonly></td>
            </tr>`;

        tbodyInst.innerHTML += `
            <tr>
                <td><input type="text" class="cell-input col-inst-val" data-col="0" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-inst-val" data-col="1" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-inst-val" data-col="2" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-inst-val" data-col="3" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input cell-formula row-tot-inst" value="" readonly></td>
            </tr>`;

        tbodyImpExp.innerHTML += `
            <tr>
                <td><input type="text" class="cell-input col-imp" value="" oninput="actualizarDatosGlobales()"></td>
                <td><input type="text" class="cell-input col-exp" value="" oninput="actualizarDatosGlobales()"></td>
            </tr>`;
    });

    tbodyCred.innerHTML += `<tr class="row-total"><td class="text-end">TOT:</td><td><span id="totCred1"></span></td><td><span id="totCred2"></span></td><td><span id="totCred3"></span></td><td><span id="totCredRes"></span></td></tr>`;

    let tbodyRet = document.querySelector('#tablaRetiradasCausa tbody');
    tbodyRet.innerHTML = '';
    diasNombresCortos.forEach((corto) => {
        let htmlRet = '';
        for(let cIdx=0; cIdx<10; cIdx++) {
            htmlRet += `<td><input type="text" class="cell-input col-ret-val" data-col="${cIdx}" value="" oninput="actualizarDatosGlobales()"></td>`;
        }
        tbodyRet.innerHTML += `
            <tr>
                <td class="fw-bold">${corto}</td>
                ${htmlRet}
                <td><input type="text" class="cell-input cell-formula row-tot-ret" value="" readonly></td>
            </tr>`;
    });
    tbodyRet.innerHTML += `<tr class="row-total"><td class="text-end">TOTAL:</td><td colspan="10"></td><td><span id="totRetGeneral"></span></td></tr>`;

    tbodyCanc.innerHTML += `<tr class="row-total"><td colspan="5" class="text-end">TOT:</td><td><span id="totCancGeneral"></span></td></tr>`;
    tbodyInst.innerHTML += `<tr class="row-total"><td colspan="4" class="text-end">TOT:</td><td><span id="totInstGeneral"></span></td></tr>`;
    tbodyImpExp.innerHTML += `<tr class="row-total"><td><span id="totImpGeneral"></span></td><td><span id="totExpGeneral"></span></td></tr>`;

    lotesDataDefault.forEach(l => {
        tbodyLotes.innerHTML += `
            <tr>
                <td><input type="text" class="cell-input col-lote-val" value="${l.lote}" oninput="guardarDatosLocales()"></td>
                <td><input type="text" class="cell-input col-lote-cant" value="${l.cant}" oninput="recalcularLotes(); guardarDatosLocales();"></td>
            </tr>`;
    });
    tbodyLotes.innerHTML += `<tr class="row-total"><td class="text-end">TOT</td><td><span id="totLotesGeneral"></span></td></tr>`;
    
    inicializarNavegacionIndependientePorTablas();
}

function configurarNavegacionTablaPorColumna(tableEl) {
    if (!tableEl) return;
    const rows = Array.from(tableEl.querySelectorAll('tbody tr'));
    if (rows.length === 0) return;

    rows.forEach((row, rIdx) => {
        const tds = Array.from(row.querySelectorAll('td'));
        
        tds.forEach((td, cIdx) => {
            const input = td.querySelector('input.cell-input, input.date-input, select.cell-input');
            if (!input) return;

            input.addEventListener('focus', function() {
                setTimeout(() => { if(this.select) this.select(); }, 50);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    let targetInput = null;

                    let nextR = rIdx + 1;
                    while (nextR < rows.length) {
                        let nextTd = rows[nextR].querySelectorAll('td')[cIdx];
                        if (nextTd) {
                            let candidate = nextTd.querySelector('input.cell-input:not([readonly]), input.date-input:not([readonly]), select.cell-input');
                            if (candidate && !candidate.disabled && candidate.offsetParent !== null && !candidate.readOnly) {
                                targetInput = candidate;
                                break;
                            }
                        }
                        nextR++;
                    }

                    if (!targetInput) {
                        let maxCols = Math.max(...rows.map(r => r.querySelectorAll('td').length));
                        let nextC = cIdx + 1;
                        while (nextC < maxCols) {
                            for (let r = 0; r < rows.length; r++) {
                                let candidateTd = rows[r].querySelectorAll('td')[nextC];
                                if (candidateTd) {
                                    let candidate = candidateTd.querySelector('input.cell-input:not([readonly]), input.date-input:not([readonly]), select.cell-input');
                                    if (candidate && !candidate.disabled && candidate.offsetParent !== null && !candidate.readOnly) {
                                        targetInput = candidate;
                                        break;
                                    }
                                }
                            }
                            if (targetInput) break;
                            nextC++;
                        }
                    }

                    if (!targetInput) {
                        for (let r = 0; r < rows.length; r++) {
                            let rowTds = rows[r].querySelectorAll('td');
                            for (let c = 0; c < rowTds.length; c++) {
                                let candidate = rowTds[c].querySelector('input.cell-input:not([readonly]), input.date-input:not([readonly]), select.cell-input');
                                if (candidate && !candidate.disabled && candidate.offsetParent !== null && !candidate.readOnly) {
                                    targetInput = candidate;
                                    break;
                                }
                            }
                            if (targetInput) break;
                        }
                    }

                    if (targetInput) {
                        targetInput.focus();
                        if (targetInput.select) targetInput.select();
                    }
                }
            });
        });
    });
}

function inicializarNavegacionIndependientePorTablas() {
    configurarNavegacionTablaPorColumna(document.getElementById('tablaCompleta'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaRechazos'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaRetiradasCausa'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaCredRecibidas'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaCancelados'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaInstancias'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaImpExp'));
    configurarNavegacionTablaPorColumna(document.getElementById('tablaLotes'));
}

function actualizarDatosGlobales() {
    recalcularTablasInferioresSinCiclo();
    recalcularTodo();
    guardarDatosLocales();
}

function validarFolioNumerico(input) {
    input.value = input.value.replace(/\D/g, '').slice(0, 13);
    let row = input.closest('tr');
    let fiInp = row.querySelector('.col-fi');
    let ffInp = row.querySelector('.col-ff');
    if (fiInp && ffInp && fiInp.value && ffInp.value) {
        let fiVal = BigInt(fiInp.value);
        let ffVal = BigInt(ffInp.value);
        if (ffVal < fiVal) {
            ffInp.style.color = 'red';
        } else {
            ffInp.style.color = 'black';
        }
    }
}

function recalcularTablasInferioresSinCiclo() {
    let rowsMain = document.querySelectorAll('#cuerpoTablaCompleta tr');

    let rowsRech = document.querySelectorAll('#tablaRechazos tbody tr');
    let sumRechTotal = 0;
    rowsRech.forEach((r, idx) => {
        if(idx < rowsRech.length - 1) {
            let inputs = r.querySelectorAll('.col-rech-val');
            let sum = 0;
            inputs.forEach(i => sum += parseFloat(i.value) || 0);
            let rowTot = r.querySelector('.row-tot-rech');
            if(rowTot) rowTot.value = sum > 0 ? sum : "";
            sumRechTotal += sum;

            let mainRow = rowsMain[idx];
            if(mainRow) {
                let linkInput = mainRow.querySelector('.col-rech-link');
                if(linkInput) linkInput.value = sum > 0 ? sum : "";
            }
        }
    });
    let totRechGen = document.getElementById('totRechGeneral');
    if(totRechGen) totRechGen.innerText = sumRechTotal > 0 ? sumRechTotal : "";
    let spanTotRechCol18 = document.getElementById('tot_col_rech_18');
    if(spanTotRechCol18) spanTotRechCol18.innerText = sumRechTotal > 0 ? sumRechTotal : "";

    let rowsCred = document.querySelectorAll('#tablaCredRecibidas tbody tr');
    let sumCredTotal = 0, sumResguardoTotal = 0, sumC1 = 0, sumC2 = 0, sumC3 = 0, sumCRes = 0;

    rowsCred.forEach((r, idx) => {
        if(idx < rowsCred.length - 1) {
            let i1 = r.querySelector('.col-cred-1');
            let i2 = r.querySelector('.col-cred-2');
            let i3 = r.querySelector('.col-cred-3');
            let iRes = r.querySelector('.col-cred-resguardo');

            let v1 = i1 ? (parseFloat(i1.value) || 0) : 0;
            let v2 = i2 ? (parseFloat(i2.value) || 0) : 0;
            let v3 = i3 ? (parseFloat(i3.value) || 0) : 0;
            let resguardoVal = iRes ? (parseFloat(iRes.value) || 0) : 0;
            
            sumC1 += v1; sumC2 += v2; sumC3 += v3; sumCRes += resguardoVal;

            let totalLinea = v1 + v2 + v3;
            sumCredTotal += totalLinea;
            sumResguardoTotal += resguardoVal;

            let mainRow = rowsMain[idx];
            if(mainRow) {
                let linkInput = mainRow.querySelector('.col-recotr-link');
                if(linkInput) linkInput.value = totalLinea > 0 ? totalLinea : "";
                let resguardoInput = mainRow.querySelector('.col-resguardo-link');
                if(resguardoInput) resguardoInput.value = resguardoVal > 0 ? resguardoVal : "";
            }
        }
    });

    document.getElementById('totCred1').innerText = sumC1 > 0 ? sumC1 : "";
    document.getElementById('totCred2').innerText = sumC2 > 0 ? sumC2 : "";
    document.getElementById('totCred3').innerText = sumC3 > 0 ? sumC3 : "";
    document.getElementById('totCredRes').innerText = sumCRes > 0 ? sumCRes : "";

    let spanTotRecOtr22 = document.getElementById('tot_col_recotr_22');
    if(spanTotRecOtr22) spanTotRecOtr22.innerText = sumCredTotal > 0 ? sumCredTotal : "";
    let spanTotResguardo48 = document.getElementById('tot_col_resguardo_48');
    if(spanTotResguardo48) spanTotResguardo48.innerText = sumResguardoTotal > 0 ? sumResguardoTotal : "";

    let rowsCanc = document.querySelectorAll('#tablaCancelados tbody tr');
    let sumCancTotal = 0;
    rowsCanc.forEach((r, idx) => {
        if(idx < rowsCanc.length - 1) {
            let inputs = r.querySelectorAll('.col-canc-val');
            let sum = 0;
            inputs.forEach(i => sum += parseFloat(i.value) || 0);
            let rowTot = r.querySelector('.row-tot-canc');
            if(rowTot) rowTot.value = sum > 0 ? sum : "";
            sumCancTotal += sum;

            let mainRow = rowsMain[idx];
            if(mainRow) {
                let linkInput = mainRow.querySelector('.col-canc-link');
                if(linkInput) linkInput.value = sum > 0 ? sum : "";
            }
        }
    });
    let totCancGen = document.getElementById('totCancGeneral');
    if(totCancGen) totCancGen.innerText = sumCancTotal > 0 ? sumCancTotal : "";
    let spanTotCancCol17 = document.getElementById('tot_col_canc_17');
    if(spanTotCancCol17) spanTotCancCol17.innerText = sumCancTotal > 0 ? sumCancTotal : "";

    let rowsInst = document.querySelectorAll('#tablaInstancias tbody tr');
    let sumInstTotal = 0;
    rowsInst.forEach((r, idx) => {
        if(idx < rowsInst.length - 1) {
            let inputs = r.querySelectorAll('.col-inst-val');
            let sum = 0;
            inputs.forEach(i => sum += parseFloat(i.value) || 0);
            let rowTot = r.querySelector('.row-tot-inst');
            if(rowTot) rowTot.value = sum > 0 ? sum : "";
            sumInstTotal += sum;
        }
    });
    let totInstGen = document.getElementById('totInstGeneral');
    if(totInstGen) totInstGen.innerText = sumInstTotal > 0 ? sumInstTotal : "";

    let rowsRet = document.querySelectorAll('#tablaRetiradasCausa tbody tr');
    let sumRetTotal = 0;
    let sumRetCols = Array(10).fill(0);

    rowsRet.forEach((r, rIdx) => {
        if(rIdx < rowsRet.length - 1) {
            let inputsRet = r.querySelectorAll('.col-ret-val');
            let sumRow = 0;
            
            inputsRet.forEach((inpRet) => {
                let subIdx = parseInt(inpRet.getAttribute('data-col'));
                let val = parseFloat(inpRet.value) || 0;
                sumRow += val;
                sumRetCols[subIdx] += val;

                let mainRow = rowsMain[rIdx];
                if(mainRow) {
                    let mainInput = mainRow.querySelector(`.col-ret-link-${subIdx}`);
                    if(mainInput) mainInput.value = val > 0 ? val : "";
                }
            });

            let rowTot = r.querySelector('.row-tot-ret');
            if(rowTot) rowTot.value = sumRow > 0 ? sumRow : "";
            sumRetTotal += sumRow;

            let mainRow = rowsMain[rIdx];
            if(mainRow) {
                let linkRet = mainRow.querySelector('.col-retiradas-causa-link');
                if(linkRet) linkRet.value = sumRow > 0 ? sumRow : "";
            }
        }
    });

    let totRetGen = document.getElementById('totRetGeneral');
    if(totRetGen) totRetGen.innerText = sumRetTotal > 0 ? sumRetTotal : "";
    let spanTotRetCol29 = document.getElementById('tot_col_ret_29');
    if(spanTotRetCol29) spanTotRetCol29.innerText = sumRetTotal > 0 ? sumRetTotal : "";

    sumRetCols.forEach((colSum, subIdx) => {
        let spanColTot = document.getElementById(`tot_col_ret_${subIdx}`);
        if(spanColTot) spanColTot.innerText = colSum > 0 ? colSum : "";
    });

    let rowsImpExp = document.querySelectorAll('#tablaImpExp tbody tr');
    let sumImpTotal = 0, sumExpTotal = 0;
    rowsImpExp.forEach((r, rIdx) => {
        if(rIdx < rowsImpExp.length - 1) {
            let impInp = r.querySelector('.col-imp');
            let expInp = r.querySelector('.col-exp');
            let vImp = impInp ? (parseFloat(impInp.value) || 0) : 0;
            let vExp = expInp ? (parseFloat(expInp.value) || 0) : 0;
            sumImpTotal += vImp; sumExpTotal += vExp;

            let mainRow = rowsMain[rIdx];
            if(mainRow) {
                let linkImp = mainRow.querySelector('.col-impexp-link-0');
                let linkExp = mainRow.querySelector('.col-impexp-link-1');
                if(linkImp) linkImp.value = vImp > 0 ? vImp : "";
                if(linkExp) linkExp.value = vExp > 0 ? vExp : "";
            }
        }
    });
    let totImpGen = document.getElementById('totImpGeneral');
    let totExpGen = document.getElementById('totExpGeneral');
    if(totImpGen) totImpGen.innerText = sumImpTotal > 0 ? sumImpTotal : "";
    if(totExpGen) totExpGen.innerText = sumExpTotal > 0 ? sumExpTotal : "";
    let spanImp0 = document.getElementById('tot_col_impexp_0');
    let spanExp1 = document.getElementById('tot_col_impexp_1');
    if(spanImp0) spanImp0.innerText = sumImpTotal > 0 ? sumImpTotal : "";
    if(spanExp1) spanExp1.innerText = sumExpTotal > 0 ? sumExpTotal : "";
}

function recalcularLotes() {
    let inputs = document.querySelectorAll('.col-lote-cant');
    let total = 0;
    inputs.forEach(i => total += parseFloat(i.value) || 0);
    let totLotesGen = document.getElementById('totLotesGeneral');
    if(totLotesGen) totLotesGen.innerText = total > 0 ? total : "";
}

function confirmarBorrado() {
    if (confirm("¿Estás seguro de que deseas limpiar este módulo en la nube?")) {
        db.ref('modulos/' + moduloActual).remove().then(() => {
            localStorage.removeItem('mac_datos_' + moduloActual);
            datosCargadosNube = {};
            if(configModulos[moduloActual]) {
                document.getElementById('txtResponsable').value = configModulos[moduloActual].responsable;
                document.getElementById('txtConfGlobal').value = configModulos[moduloActual].conf;
            }
            document.getElementById('inputCanjeGlobal').value = "";
            document.getElementById('inputScriptGlobal').value = "";
            document.getElementById('inputFolioNecGlobal').value = "";
            document.getElementById('inputInstPadron').value = "";
            document.getElementById('inputInstCarto').value = "";
            document.getElementById('inputNumReg').value = "";
            document.getElementById('inputRemInst').value = "";
            document.getElementById('txtObservaciones').value = "";

            construirTabla();
            alert("¡Módulo limpiado correctamente en la nube!");
        });
    }
}

function guardarDatosLocales() {
    if(!moduloActual) return;

    let datosDiarios = [];
    let rows = document.querySelectorAll('#cuerpoTablaCompleta tr');
    rows.forEach((r) => {
        let fecha = r.querySelector('.col-fecha').value;
        let horas = r.querySelector('.col-horas').value;
        let sede = r.querySelector('.col-sede').value;
        let fi = r.querySelector('.col-fi').value;
        let ff = r.querySelector('.col-ff').value;
        let ins = r.querySelector('.col-ins').value;
        let corr = r.querySelector('.col-corr').value;
        let cam = r.querySelector('.col-cam').value;
        let rep = r.querySelector('.col-rep').value;
        let cdir = r.querySelector('.col-cdir').value;
        let reinc = r.querySelector('.col-reinc').value;
        let reempl = r.querySelector('.col-reempl').value;
        let reimp = r.querySelector('.col-reimp').value;
        let cpvDev = r.querySelector('.col-cpvdev').value;
        let dispAnt = r.querySelector('.col-disp-ant').value;
        let rec = r.querySelector('.col-rec').value;
        let ent = r.querySelector('.col-ent').value;
        let v24 = r.querySelector('.col-v24').value;
        let v25 = r.querySelector('.col-v25').value;
        let v26 = r.querySelector('.col-v26').value;
        let v27 = r.querySelector('.col-v27').value;
        let v28 = r.querySelector('.col-v28').value;
        let canje = r.querySelector('.col-canje').value;
        let fichEnt = r.querySelector('.col-fichent').value;
        let fichAtend = r.querySelector('.col-fichatend').value;
        let exp = r.querySelector('.col-exp').value;
        let ord = r.querySelector('.col-ord').value;
        let rect = r.querySelector('.col-rect').value;
        let juicio = r.querySelector('.col-juicio').value;
        let remesa = r.querySelector('.col-remesa').value;

        let adic = [];
        r.querySelectorAll('.col-adic-val').forEach(inp => adic.push(inp.value));

        datosDiarios.push({
            dia: r.querySelector('.col-dia').innerText, fecha, horas, sede, fi, ff, ins, corr, cam, rep, cdir, reinc, reempl, reimp, cpvDev, dispAnt, rec, ent, v24, v25, v26, v27, v28, canje, fichEnt, fichAtend, exp, ord, rect, juicio, remesa, adic
        });
    });

    let rechazos = [];
    document.querySelectorAll('#tablaRechazos tbody tr').forEach((r, i) => {
        if(i < 7) {
            let vals = [];
            r.querySelectorAll('.col-rech-val').forEach(inp => vals.push(inp.value));
            rechazos.push(vals);
        }
    });

    let credRecibidas = [];
    document.querySelectorAll('#tablaCredRecibidas tbody tr').forEach((r, i) => {
        if(i < 7) {
            credRecibidas.push([
                r.querySelector('.col-cred-1').value,
                r.querySelector('.col-cred-2').value,
                r.querySelector('.col-cred-3').value,
                r.querySelector('.col-cred-resguardo').value
            ]);
        }
    });

    let cancelados = [];
    document.querySelectorAll('#tablaCancelados tbody tr').forEach((r, i) => {
        if(i < 7) {
            let vals = [];
            r.querySelectorAll('.col-canc-val').forEach(inp => vals.push(inp.value));
            cancelados.push(vals);
        }
    });

    let instancias = [];
    document.querySelectorAll('#tablaInstancias tbody tr').forEach((r, i) => {
        if(i < 7) {
            let vals = [];
            r.querySelectorAll('.col-inst-val').forEach(inp => vals.push(inp.value));
            instancias.push(vals);
        }
    });

    let impExp = [];
    document.querySelectorAll('#tablaImpExp tbody tr').forEach((r, i) => {
        if(i < 7) {
            impExp.push([r.querySelector('.col-imp').value, r.querySelector('.col-exp').value]);
        }
    });

    let retCausa = [];
    document.querySelectorAll('#tablaRetiradasCausa tbody tr').forEach((r, i) => {
        if(i < 7) {
            let vals = [];
            r.querySelectorAll('.col-ret-val').forEach(inp => vals.push(inp.value));
            retCausa.push(vals);
        }
    });

    let lotes = [];
    document.querySelectorAll('#tablaLotes tbody tr').forEach((r, i) => {
        if(i < 7) {
            lotes.push([r.querySelector('.col-lote-val').value, r.querySelector('.col-lote-cant').value]);
        }
    });

    let configGlobal = {
        entidad: document.getElementById('txtEntidadGlobal').value,
        distrito: document.getElementById('txtDistritoGlobal').value,
        remesa: document.getElementById('txtRemesaGlobal').value,
        conf: document.getElementById('txtConfGlobal').value,
        responsable: document.getElementById('txtResponsable').value,
        canje: document.getElementById('inputCanjeGlobal').value,
        script: document.getElementById('inputScriptGlobal').value,
        folioNec: document.getElementById('inputFolioNecGlobal').value,
        instPadron: document.getElementById('inputInstPadron').value,
        instCarto: document.getElementById('inputInstCarto').value,
        numReg: document.getElementById('inputNumReg').value,
        remInst: document.getElementById('inputRemInst').value,
        observaciones: document.getElementById('txtObservaciones').value
    };

    let objetoCompleto = { datosDiarios, rechazos, credRecibidas, cancelados, instancias, impExp, retCausa, lotes, configGlobal };
    
    localStorage.setItem('mac_datos_' + moduloActual, JSON.stringify(objetoCompleto));
    db.ref('modulos/' + moduloActual).set(objetoCompleto).catch(err => console.error("Error al sincronizar con nube:", err));
}

function recopilarColumnas1a75() {
    let filas1a75 = [];
    let rows = document.querySelectorAll('#cuerpoTablaCompleta tr');
    
    rows.forEach((r) => {
        let filaVals = [];
        let celdasTd = r.querySelectorAll('td');
        
        let col1 = celdasTd[0] ? celdasTd[0].innerText.trim() : "";
        filaVals.push(col1 !== "" ? col1 : "0");

        for(let i=1; i<75; i++) {
            let td = celdasTd[i];
            let val = "";
            if(td) {
                let inp = td.querySelector('input, select');
                if(inp) {
                    val = inp.value.trim();
                } else {
                    val = td.innerText.trim();
                }
            }
            if (val === "" || val === null || val === undefined) {
                filaVals.push("0");
            } else {
                filaVals.push(val);
            }
        }
        filas1a75.push(filaVals);
    });
    return filas1a75;
}

function guardarDatosManual() {
    let numRemesa = document.getElementById('txtRemesaGlobal').value.trim();
    let confirmacion = confirm(`¿Confirma que la remesa y el número de remesa (${numRemesa}) están completos?`);
    
    if (!confirmacion) {
        alert("❌ Guardado cancelado. La remesa no fue registrada porque no se confirmó como completa.");
        return;
    }

    guardarDatosLocales();

    let fechaHoraActual = new Date().toISOString();
    let filas1a75Datos = recopilarColumnas1a75();

    let registroHistorico = {
        mac: moduloActual,
        remesa: numRemesa,
        fechaHora: fechaHoraActual,
        filas1a75: filas1a75Datos
    };

    db.ref('remesas_completas/' + moduloActual + '/' + Date.now()).set(registroHistorico).then(() => {
        let btnGuardar = document.getElementById('btnGuardar');
        btnGuardar.classList.add('guardado-exito');
        let textoOriginal = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '✅ ¡Remesa Archivada!';
        setTimeout(() => {
            btnGuardar.classList.remove('guardado-exito');
            btnGuardar.innerHTML = textoOriginal;
        }, 2000);
    }).catch(err => {
        console.error("Error al archivar remesa:", err);
    });
}

function cargarDatosLocalesUI() {
    let data = datosCargadosNube;
    if(data.configGlobal) {
        document.getElementById('txtEntidadGlobal').value = data.configGlobal.entidad || 'COAHUILA 05';
        document.getElementById('txtDistritoGlobal').value = data.configGlobal.distrito || '03';
        document.getElementById('txtRemesaGlobal').value = data.configGlobal.remesa || '202640';
        document.getElementById('txtConfGlobal').value = data.configGlobal.conf || (configModulos[moduloActual] ? configModulos[moduloActual].conf : '');
        document.getElementById('txtResponsable').value = data.configGlobal.responsable || (configModulos[moduloActual] ? configModulos[moduloActual].responsable : '');
        document.getElementById('inputScriptGlobal').value = data.configGlobal.script || '';
        document.getElementById('inputFolioNecGlobal').value = data.configGlobal.folioNec || '';
        document.getElementById('inputInstPadron').value = data.configGlobal.instPadron || '';
        document.getElementById('inputInstCarto').value = data.configGlobal.instCarto || '';
        document.getElementById('inputNumReg').value = data.configGlobal.numReg || '';
        document.getElementById('inputRemInst').value = data.configGlobal.remInst || '';
        document.getElementById('txtObservaciones').value = data.configGlobal.observaciones || '';
    } else {
        document.getElementById('inputInstPadron').value = '';
        document.getElementById('inputInstCarto').value = '';
    }
}

function cargarValoresSubTablas(data) {
    if(!data) return;

    if(data.rechazos) {
        let rows = document.querySelectorAll('#tablaRechazos tbody tr');
        data.rechazos.forEach((vals, rIdx) => {
            let inps = rows[rIdx].querySelectorAll('.col-rech-val');
            vals.forEach((v, vIdx) => { if(inps[vIdx]) inps[vIdx].value = v; });
        });
    }

    if(data.credRecibidas) {
        let rows = document.querySelectorAll('#tablaCredRecibidas tbody tr');
        data.credRecibidas.forEach((vals, rIdx) => {
            if(rIdx < 7) {
                rows[rIdx].querySelector('.col-cred-1').value = vals[0] || '';
                rows[rIdx].querySelector('.col-cred-2').value = vals[1] || '';
                rows[rIdx].querySelector('.col-cred-3').value = vals[2] || '';
                rows[rIdx].querySelector('.col-cred-resguardo').value = vals[3] || '';
            }
        });
    }

    if(data.cancelados) {
        let rows = document.querySelectorAll('#tablaCancelados tbody tr');
        data.cancelados.forEach((vals, rIdx) => {
            let inps = rows[rIdx].querySelectorAll('.col-canc-val');
            vals.forEach((v, vIdx) => { if(inps[vIdx]) inps[vIdx].value = v; });
        });
    }

    if(data.instancias) {
        let rows = document.querySelectorAll('#tablaInstancias tbody tr');
        data.instancias.forEach((vals, rIdx) => {
            let inps = rows[rIdx].querySelectorAll('.col-inst-val');
            vals.forEach((v, vIdx) => { if(inps[vIdx]) inps[vIdx].value = v; });
        });
    }

    if(data.impExp) {
        let rows = document.querySelectorAll('#tablaImpExp tbody tr');
        data.impExp.forEach((vals, rIdx) => {
            if(rIdx < 7) {
                rows[rIdx].querySelector('.col-imp').value = vals[0] || '';
                rows[rIdx].querySelector('.col-exp').value = vals[1] || '';
            }
        });
    }

    if(data.retCausa) {
        let rows = document.querySelectorAll('#tablaRetiradasCausa tbody tr');
        data.retCausa.forEach((vals, rIdx) => {
            let inps = rows[rIdx].querySelectorAll('.col-ret-val');
            vals.forEach((v, vIdx) => { if(inps[vIdx]) inps[vIdx].value = v; });
        });
    }

    if(data.lotes) {
        let rows = document.querySelectorAll('#tablaLotes tbody tr');
        data.lotes.forEach((vals, rIdx) => {
            if(rIdx < 7) {
                rows[rIdx].querySelector('.col-lote-val').value = vals[0] || '';
                rows[rIdx].querySelector('.col-lote-cant').value = vals[1] || '';
            }
        });
    }
    recalcularTablasInferioresSinCiclo();
}

function copiarTablaAlPortapapeles() {
    let lineas = [];
    let rows = document.querySelectorAll('#cuerpoTablaCompleta tr');
    rows.forEach(r => {
        let cols = r.querySelectorAll('td');
        let filaValores = [];
        cols.forEach((td, idx) => {
            if(idx === 0) {
                filaValores.push(td.innerText.trim());
            } else {
                let inp = td.querySelector('input, select');
                filaValores.push(inp ? inp.value.trim() : '');
            }
        });
        lineas.push(filaValores.join('\t'));
    });

    let remesaVal = document.getElementById('txtRemesaGlobal').value;
    let confVal = document.getElementById('txtConfGlobal').value;
    let entVal = document.getElementById('txtEntidadGlobal').value;
    let dttoVal = document.getElementById('txtDistritoGlobal').value;
    let modVal = moduloActual;
    let canjeVal = document.getElementById('inputCanjeGlobal').value;
    let scriptVal = document.getElementById('inputScriptGlobal').value;
    let folionecVal = document.getElementById('inputFolioNecGlobal').value;

    let totalesValores = ["LÍNEA TOTALES", "", "", ""];
    for(let c=5; c<=75; c++) {
        if (c === 5) {
            totalesValores.push(document.getElementById('tot_col_min_5').innerText);
        } else if (c === 6) {
            totalesValores.push(document.getElementById('tot_col_max_6').innerText);
        } else if (c === 16) {
            totalesValores.push(document.getElementById('tot_col_16').innerText);
        } else if (c === 17) {
            totalesValores.push(document.getElementById('tot_col_canc_17').innerText);
        } else if (c === 18) {
            totalesValores.push(document.getElementById('tot_col_rech_18').innerText);
        } else if (c === 20) {
            totalesValores.push(document.getElementById('tot_col_primer_disp_20').innerText);
        } else if (c === 22) {
            totalesValores.push(document.getElementById('tot_col_recotr_22').innerText);
        } else if (c === 29) {
            totalesValores.push(document.getElementById('tot_col_ret_29').innerText);
        } else if (c === 30) {
            totalesValores.push(document.getElementById('tot_col_disp_fin_30').innerText);
        } else if (c === 31) {
            totalesValores.push(canjeVal);
        } else if (c === 34) {
            totalesValores.push(document.getElementById('tot_col_dias_trab_34').innerText);
        } else if (c === 39) {
            totalesValores.push(remesaVal);
        } else if (c === 44) {
            totalesValores.push(confVal);
        } else if (c === 45) {
            totalesValores.push(entVal);
        } else if (c === 46) {
            totalesValores.push(dttoVal);
        } else if (c === 47) {
            totalesValores.push(modVal);
        } else if (c === 48) {
            totalesValores.push(document.getElementById('tot_col_resguardo_48').innerText);
        } else if (c === 51) {
            totalesValores.push(scriptVal);
        } else if (c === 52) {
            totalesValores.push(folionecVal);
        } else if (c === 63 || c === 64) {
            let subIdx = c - 63;
            totalesValores.push(document.getElementById(`tot_col_impexp_${subIdx}`).innerText);
        } else if (c >= 66 && c <= 75) {
            let subIdx = c - 66;
            totalesValores.push(document.getElementById(`tot_col_ret_${subIdx}`).innerText);
        } else if (columnasSinSuma.includes(c)) {
            totalesValores.push("");
        } else {
            let span = document.getElementById(`tot_col_${c}`);
            totalesValores.push(span ? span.innerText : "");
        }
    }
    lineas.push(totalesValores.join('\t'));

    let textoFinal = lineas.join('\n');
    navigator.clipboard.writeText(textoFinal).then(() => {
        alert("¡Tabla principal copiada con éxito para Excel!");
    }).catch(err => {
        alert("Error al copiar al portapapeles.");
    });
}

function actualizarFechasConsecutivas(inputLunes) {
    let valLunes = inputLunes.value;
    if(!valLunes) return;

    let fechaBase = new Date(valLunes + 'T00:00:00');
    let inputsFecha = document.querySelectorAll('.col-fecha');

    inputsFecha.forEach((inpFecha, idx) => {
        let nuevaFecha = new Date(fechaBase);
        nuevaFecha.setDate(fechaBase.getDate() + idx);
        let yyyy = nuevaFecha.getFullYear();
        let mm = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
        let dd = String(nuevaFecha.getDate()).padStart(2, '0');
        inpFecha.value = `${yyyy}-${mm}-${dd}`;
    });
}

function validarHoras(input) {
    let row = input.closest('tr');
    let horasStr = input.value.trim();
    let horas = parseFloat(horasStr) || 0;
    let inputsFila = row.querySelectorAll('.col-editable:not(.col-horas):not(.col-fecha)');
    
    inputsFila.forEach(inp => {
        if (horasStr === "" || (horas === 0 && horasStr !== "")) {
            inp.disabled = true;
            inp.style.backgroundColor = '#e2e8f0';
        } else {
            inp.disabled = false;
            inp.style.backgroundColor = '#fff';
        }
    });
    inicializarNavegacionIndependientePorTablas();
    recalcularTodo();
}

function actualizarRemesaGlobal(valor) {
    let inputsRemesa = document.querySelectorAll('.col-remesa');
    inputsRemesa.forEach(input => input.value = valor);
    let spanRemesa39 = document.getElementById('tot_col_remesa_39');
    if(spanRemesa39) spanRemesa39.innerText = valor;
}

function actualizarConfGlobal(valor) {
    let spanConf44 = document.getElementById('tot_col_conf_44');
    if(spanConf44) spanConf44.innerText = valor;
}

function actualizarEntidadGlobal(valor) {
    let spanEnt45 = document.getElementById('tot_col_ent_45');
    if(spanEnt45) spanEnt45.innerText = valor;
}

function actualizarDistritoGlobal(valor) {
    let spanDtto46 = document.getElementById('tot_col_dtto_46');
    if(spanDtto46) spanDtto46.innerText = valor;
}

function recalcularFila(input) {
    recalcularTodo();
    guardarDatosLocales();
}

function recalcularTodo() {
    recalcularTablasInferioresSinCiclo();

    let rows = document.querySelectorAll('#cuerpoTablaCompleta tr');
    sumas = {};
    for(let c=1; c<=75; c++) sumas[c] = 0;

    let minFolioInicial = null;
    let maxFolioFinal = null;
    primerDispVal = 0;
    primerDispEncontrado = false;
    totalDiasTrabajados = 0;
    sumaCol16Total = 0;

    rows.forEach((r, rIdx) => {
        let inputs = r.querySelectorAll('input, select');
        let rowVals = {};
        inputs.forEach((inp, i) => {
            let colNum = i + 2; 
            rowVals[colNum] = parseFloat(inp.value) || 0;
        });

        let valRep = rowVals[11] || 0;
        let valReimp = rowVals[15] || 0;
        let sumaRepoReimp = valRep + valReimp;
        let colRepoReimp = r.querySelector('.col-adic-65');
        if(colRepoReimp) {
            colRepoReimp.value = sumaRepoReimp > 0 ? sumaRepoReimp : "";
        }
        rowVals[65] = sumaRepoReimp;

        let horasVal = rowVals[3] || 0;
        let diasTrabInput = r.querySelector('.col-dias-trab');
        let diasVal = 0;
        if(diasTrabInput) {
            diasVal = (horasVal > 0) ? 1 : 0;
            diasTrabInput.value = diasVal > 0 ? diasVal : "";
        }
        totalDiasTrabajados += diasVal;

        let fiInput = r.querySelector('.col-fi');
        let ffInput = r.querySelector('.col-ff');
        let fiStr = fiInput ? fiInput.value.trim() : "";
        let ffStr = ffInput ? ffInput.value.trim() : "";
        let fiVal = (fiStr !== "" && !isNaN(fiStr)) ? BigInt(fiStr) : 0n;
        let ffVal = (ffStr !== "" && !isNaN(ffStr)) ? BigInt(ffStr) : 0n;
        
        let totFolios = 0;
        let colTotFolios = r.querySelector('.col-tot-folios');
        if(fiVal > 0n) {
            totFolios = (ffVal >= fiVal) ? Number(ffVal - fiVal + 1n) : 0;
            if(colTotFolios) colTotFolios.value = totFolios > 0 ? totFolios : "";
            if(minFolioInicial === null || fiVal < BigInt(minFolioInicial)) minFolioInicial = fiStr;
            if(maxFolioFinal === null || ffVal > BigInt(maxFolioFinal)) maxFolioFinal = ffStr;
        } else {
            if(colTotFolios) colTotFolios.value = "";
        }

        let sumaFormatosUnicos = 0;
        for(let c=8; c<=15; c++) {
            sumaFormatosUnicos += (rowVals[c] || 0);
        }
        let valCanc = rowVals[17] || 0;
        let valRech = rowVals[18] || 0;

        let totalCol16Final = sumaFormatosUnicos + valCanc + valRech;
        let totTramInput = r.querySelector('.col-tot-tram');
        if(totTramInput) {
            totTramInput.value = totalCol16Final > 0 ? totalCol16Final : "";
            if (totFolios > 0 && totalCol16Final !== totFolios) {
                totTramInput.style.color = 'red';
            } else {
                totTramInput.style.color = 'black';
            }
        }

        sumaCol16Total += totalCol16Final;

        let dispAntVal = rowVals[20] || 0;

        if (!primerDispEncontrado && dispAntVal > 0) {
            primerDispVal = dispAntVal;
            primerDispEncontrado = true;
        }

        let recVal = rowVals[21] || 0, recOtrVal = rowVals[22] || 0, entVal = rowVals[23] || 0;
        let v24 = rowVals[24] || 0, v25 = rowVals[25] || 0, v26 = rowVals[26] || 0, v27 = rowVals[27] || 0, v28 = rowVals[28] || 0, v29 = rowVals[29] || 0;
        let impVal = rowVals[63] || 0, expVal = rowVals[64] || 0;

        let dispActual = dispAntVal + recVal + recOtrVal - (entVal + v24 + v25 + v26 + v27 + v28 + v29) + impVal - expVal;
        let colDisp = r.querySelector('.col-disp');
        if(colDisp) colDisp.value = dispActual !== 0 ? dispActual : "";

        inputs.forEach((inp, i) => {
            let colNum = i + 2; 
            if (colNum === 65) {
                sumas[65] += sumaRepoReimp;
            } else if(colNum <= 75 && colNum !== 16) {
                sumas[colNum] += (parseFloat(inp.value) || 0);
            }
        });
    });

    sumas[16] = sumaCol16Total;

    let sumaCol19Total = sumas[19] || 0;
    let inputCanje = document.getElementById('inputCanjeGlobal');
    if(inputCanje) {
        inputCanje.value = sumaCol19Total > 0 ? sumaCol19Total : "";
    }

    document.getElementById('tot_col_min_5').innerText = minFolioInicial !== null && minFolioInicial !== "0" ? minFolioInicial : "";
    document.getElementById('tot_col_max_6').innerText = maxFolioFinal !== null && maxFolioFinal !== "0" ? maxFolioFinal : "";
    document.getElementById('tot_col_16').innerText = sumas[16] > 0 ? sumas[16] : "";
    document.getElementById('tot_col_primer_disp_20').innerText = primerDispVal > 0 ? primerDispVal : "";
    document.getElementById('tot_col_canje_31').innerText = sumaCol19Total > 0 ? sumaCol19Total : "";
    document.getElementById('tot_col_dias_trab_34').innerText = totalDiasTrabajados > 0 ? totalDiasTrabajados : "";
    document.getElementById('tot_col_remesa_39').innerText = document.getElementById('txtRemesaGlobal').value;
    document.getElementById('tot_col_conf_44').innerText = document.getElementById('txtConfGlobal').value;
    document.getElementById('tot_col_ent_45').innerText = document.getElementById('txtEntidadGlobal').value;
    document.getElementById('tot_col_dtto_46').innerText = document.getElementById('txtDistritoGlobal').value;
    document.getElementById('tot_col_modulo_47').innerText = moduloActual;
    document.getElementById('tot_col_script_51').innerText = document.getElementById('inputScriptGlobal').value;
    document.getElementById('tot_col_folionec_52').innerText = document.getElementById('inputFolioNecGlobal').value;

    for(let c=7; c<=75; c++) {
        if(!columnasSinSuma.includes(c)) {
            let span = document.getElementById(`tot_col_${c}`);
            if(span) span.innerText = sumas[c] > 0 ? sumas[c] : "";
        }
    }

    let totCol30Val = (sumas[20]||0) + (sumas[21]||0) + (sumas[22]||0) - ((sumas[23]||0) + (sumas[24]||0) + (sumas[25]||0) + (sumas[26]||0) + (sumas[27]||0) + (sumas[28]||0) + (sumas[29]||0)) + (sumas[63]||0) - (sumas[64]||0);
    let spanTotCol30 = document.getElementById('tot_col_disp_fin_30');
    if(spanTotCol30) spanTotCol30.innerText = totCol30Val !== 0 ? totCol30Val : "";
}