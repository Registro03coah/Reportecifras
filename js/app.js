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

        let remesaActualTxt = document.getElementById('txtRemesaGlobal') ? document.getElementById('txtRemesaGlobal').value : (d.remesa || '202640');

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
            <td class="col-oculta-modulo"><input type="text" class="cell-input col-editable col-remesa" value="${remesaActualTxt}"></td>
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
