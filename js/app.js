function actualizarRemesaGlobal(valor) {
    let inputsRemesa = document.querySelectorAll('.col-remesa');
    inputsRemesa.forEach(input => input.value = valor);
    let spanRemesa39 = document.getElementById('tot_col_remesa_39');
    if(spanRemesa39) spanRemesa39.innerText = valor;
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

    let ultimoDispVal = 0; // Para capturar el último disponible válido (sin contar 0)

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

        // Capturar el último valor mayor a 0 en la columna de disponibles para el total
        if (dispActual > 0) {
            ultimoDispVal = dispActual;
        }

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

    let remesaEscritaActual = document.getElementById('txtRemesaGlobal').value.trim();
    let entidadEscritaActual = document.getElementById('txtEntidadGlobal').value.trim();

    document.getElementById('tot_col_min_5').innerText = minFolioInicial !== null && minFolioInicial !== "0" ? minFolioInicial : "";
    document.getElementById('tot_col_max_6').innerText = maxFolioFinal !== null && maxFolioFinal !== "0" ? maxFolioFinal : "";
    document.getElementById('tot_col_16').innerText = sumas[16] > 0 ? sumas[16] : "";
    document.getElementById('tot_col_primer_disp_20').innerText = primerDispVal > 0 ? primerDispVal : "";
    document.getElementById('tot_col_canje_31').innerText = sumaCol19Total > 0 ? sumaCol19Total : "";
    document.getElementById('tot_col_dias_trab_34').innerText = totalDiasTrabajados > 0 ? totalDiasTrabajados : "";
    
    // Toma exactamente la remesa escrita arriba en lugar de 202640 fijo
    document.getElementById('tot_col_remesa_39').innerText = remesaEscritaActual;
    document.querySelectorAll('.col-remesa').forEach(inp => { if(!inp.value) inp.value = remesaEscritaActual; });

    document.getElementById('tot_col_conf_44').innerText = document.getElementById('txtConfGlobal').value;
    
    // Toma exactamente el valor de la entidad superior para cada módulo
    document.getElementById('tot_col_ent_45').innerText = entidadEscritaActual;
    
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

    // Columna 30 (Disponibles Total): Muestra el último valor válido de los días sin contar ceros
    let spanTotCol30 = document.getElementById('tot_col_disp_fin_30');
    if(spanTotCol30) spanTotCol30.innerText = ultimoDispVal > 0 ? ultimoDispVal : "";
}
