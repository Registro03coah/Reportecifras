function renderTabla() {
    const tbody = document.querySelector('#tablaCampana tbody'); 
    if(!tbody) return; 
    tbody.innerHTML = "";

    let rIniVal = document.getElementById('inputCampanaInicio').value.trim();
    let rFinVal = document.getElementById('inputCampanaFin').value.trim();

    let dataF = bdtotalesGlobal.length > 0 ? bdtotalesGlobal : bdMadreGlobal;
    if(dataF.length === 0) return;

    let remesasDisponibles = [...new Set(dataF.map(x => parseInt(x.REMESA, 10)).filter(x => !isNaN(x)))].sort((a, b) => a - b);
    if(remesasDisponibles.length === 0) return;

    let rIni = rIniVal !== "" ? parseInt(rIniVal, 10) : remesasDisponibles[0];
    let rFin = rFinVal !== "" ? parseInt(rFinVal, 10) : remesasDisponibles[remesasDisponibles.length - 1];

    let registros = dataF.filter(f => { 
        let rNum = parseInt(f.REMESA, 10); 
        return !isNaN(rNum) && rNum >= rIni && rNum <= rFin; 
    });

    // 1. Renderizar estrictamente las 3 líneas de los módulos en orden (robusto contra ceros a la izquierda)
    ['050351','050353','050354'].forEach(modTarget => {
        let modNumTarget = parseInt(modTarget, 10);
        
        let regs = registros.filter(r => {
            let rMod = parseInt(r.MODULO, 10);
            return !isNaN(rMod) && rMod === modNumTarget;
        }).sort((a, b) => parseInt(a.REMESA, 10) - parseInt(b.REMESA, 10));

        if(regs.length === 0) return;

        let tr = document.createElement('tr');
        let pR = regs[0]; 
        let uR = regs[regs.length - 1];

        COLUMNAS_CAMPANA_KEYS.forEach(col => {
            let td = document.createElement('td');
            if(col === 'MODULO') {
                td.innerText = modTarget;
            } else if(col === 'INICIAL') {
                td.innerText = pR['INICIAL'] || "0";
            } else if(col === 'FINAL') {
                td.innerText = uR['FINAL'] || "0";
            } else if(col === 'INICIALES_C') {
                td.innerText = pR['INICIALES_C'] || "0";
            } else if(col === 'CONFIGURACION') {
                td.innerText = uR['CONFIGURACION'] || "0";
            } else if(['ENT', 'DTTO'].includes(col)) {
                td.innerText = pR[col] || "";
            } else { 
                let s = 0; 
                regs.forEach(r => {
                    let v = parseFloat(r[col] || 0); 
                    if(!isNaN(v)) s += v;
                }); 
                td.innerText = s; 
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // 2. Renderizar al final la fila de Gran Total con negritas y diseño destacado
    let trT = document.createElement('tr'); 
    trT.className = 'fila-totales fw-bold';
    
    COLUMNAS_CAMPANA_KEYS.forEach(col => {
        let td = document.createElement('td');
        td.style.fontWeight = 'bold'; // Forzar negritas en cada celda del total
        if(col === 'MODULO') {
            td.innerText = "GRAN TOTAL";
        } else if(['INICIAL', 'FINAL', 'INICIALES_C', 'CONFIGURACION', 'ENT', 'DTTO'].includes(col)) {
            td.innerText = "";
        } else { 
            let s = 0; 
            registros.forEach(r => {
                let v = parseFloat(r[col] || 0); 
                if(!isNaN(v)) s += v;
            }); 
            td.innerText = s; 
        }
        trT.appendChild(td);
    });
    tbody.appendChild(trT);
}
