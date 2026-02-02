// Clasificaciones TISS
const clasificaciones = {
    clase1: {
        nombre: "Clase I",
        rango: "< 10 puntos",
        descripcion: "Paciente no necesita UTI.",
        ratio: 0.25,
        ratioTexto: "1:4",
        color: "class-1",
        className: "clase1"
    },
    clase2: {
        nombre: "Clase II",
        rango: "10-19 puntos",
        descripcion: "Vigilancia activa. Paciente estable que requiere observación.",
        ratio: 0.25,
        ratioTexto: "1:4",
        color: "class-2",
        className: "clase2"
    },
    clase3: {
        nombre: "Clase III",
        rango: "20-39 puntos",
        descripcion: "Inestabilidad hemodinámica. Precisan monitorización (invasiva o no) y vigilancia intensiva.",
        ratio: 2,
        ratioTexto: "2:1",
        color: "class-3",
        className: "clase3"
    },
    clase4: {
        nombre: "Clase IV",
        rango: "≥ 40 puntos",
        descripcion: "Gran inestabilidad hemodinámica que requiere cuidados médicos y de enfermería intensiva.",
        ratio: 1.5,
        ratioTexto: "1:1 o 2:1",
        color: "class-4",
        className: "clase4"
    }
};

// Estado global
let beds = [];
let currentBedIndex = null;
let turnoActual = 'mañana';
let enfermerosEnTurno = 0;
let notasTurno = '';

// Inicializar 22 camas
function initializeBeds() {
    beds = Array.from({ length: 22 }, (_, i) => ({
        number: i + 1,
        occupied: false,
        patientName: '',
        diagnostico: '',
        observaciones: '',
        fechaIngreso: '',
        tiss: 0,
        selectedInterventions: []
    }));
    
    const saved = localStorage.getItem('tissUTIBeds');
    if (saved) {
        try {
            beds = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
    
    const savedTurno = localStorage.getItem('tissUTITurno');
    if (savedTurno) {
        turnoActual = savedTurno;
        document.getElementById('turnoSelect').value = turnoActual;
    }
    
    const savedEnfermeros = localStorage.getItem('tissUTIEnfermeros');
    if (savedEnfermeros) {
        enfermerosEnTurno = parseInt(savedEnfermeros);
        document.getElementById('enfermerosEnTurno').value = enfermerosEnTurno;
    }
    
    const savedNotas = localStorage.getItem('tissUTINotas');
    if (savedNotas) {
        notasTurno = savedNotas;
        document.getElementById('notasTurno').value = notasTurno;
    }
}

// Guardar en localStorage
function saveBeds() {
    localStorage.setItem('tissUTIBeds', JSON.stringify(beds));
    localStorage.setItem('tissUTITurno', turnoActual);
    localStorage.setItem('tissUTIEnfermeros', enfermerosEnTurno);
    localStorage.setItem('tissUTINotas', notasTurno);
}

// Función para clasificar según puntos
function clasificarPaciente(puntos) {
    if (puntos < 10) return clasificaciones.clase1;
    if (puntos >= 10 && puntos < 20) return clasificaciones.clase2;
    if (puntos >= 20 && puntos < 40) return clasificaciones.clase3;
    return clasificaciones.clase4;
}

// Renderizar grid de camas
function renderBedsGrid() {
    const grid = document.getElementById('bedsGrid');
    grid.innerHTML = '';
    
    beds.forEach((bed, index) => {
        const bedCard = document.createElement('div');
        bedCard.className = 'bed-card';
        
        if (bed.occupied) {
            const clase = clasificarPaciente(bed.tiss);
            bedCard.classList.add(clase.className);
            
            let diasInternado = '';
            if (bed.fechaIngreso) {
                const ingreso = new Date(bed.fechaIngreso);
                const hoy = new Date();
                const dias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
                diasInternado = `<div class="bed-dias">📅 ${dias} día${dias !== 1 ? 's' : ''}</div>`;
            }
            
            bedCard.innerHTML = `
                <div class="bed-number">Cama ${bed.number}</div>
                <div class="bed-icon">🛏️</div>
                <div class="bed-status">${bed.patientName || 'Paciente'}</div>
                <div class="bed-tiss">${bed.tiss} pts</div>
                ${diasInternado}
            `;
        } else {
            bedCard.classList.add('empty');
            bedCard.innerHTML = `
                <div class="bed-number">Cama ${bed.number}</div>
                <div class="bed-icon">➕</div>
                <div class="bed-status">Disponible</div>
            `;
        }
        
        bedCard.addEventListener('click', () => openModal(index));
        grid.appendChild(bedCard);
    });
    
    updateGlobalSummary();
}

// Actualizar resumen global
function updateGlobalSummary() {
    const occupied = beds.filter(b => b.occupied);
    const tissTotal = occupied.reduce((sum, b) => sum + b.tiss, 0);
    const tissPromedio = occupied.length > 0 ? (tissTotal / occupied.length).toFixed(1) : 0;
    
    let enfermerosNecesarios = 0;
    occupied.forEach(bed => {
        const clase = clasificarPaciente(bed.tiss);
        enfermerosNecesarios += clase.ratio;
    });
    
    document.getElementById('camasOcupadas').textContent = `${occupied.length}/22`;
    document.getElementById('tissTotal').textContent = tissTotal;
    document.getElementById('enfermerosNecesarios').textContent = Math.ceil(enfermerosNecesarios);
    document.getElementById('enfermerosEnTurnoDisplay').textContent = enfermerosEnTurno;
    document.getElementById('tissPromedio').textContent = tissPromedio;
    
    // Mostrar nota solo si faltan enfermeros
    const diferencia = enfermerosEnTurno - Math.ceil(enfermerosNecesarios);
    const notaDiv = document.getElementById('diferenciaNota');
    if (diferencia < 0 && enfermerosEnTurno > 0) {
        notaDiv.textContent = `(Faltan ${Math.abs(diferencia)} según estimado)`;
    } else {
        notaDiv.textContent = '';
    }
    
    const counts = { clase1: 0, clase2: 0, clase3: 0, clase4: 0 };
    occupied.forEach(bed => {
        if (bed.tiss < 10) counts.clase1++;
        else if (bed.tiss < 20) counts.clase2++;
        else if (bed.tiss < 40) counts.clase3++;
        else counts.clase4++;
    });
    
    document.getElementById('countClase1').textContent = counts.clase1;
    document.getElementById('countClase2').textContent = counts.clase2;
    document.getElementById('countClase3').textContent = counts.clase3;
    document.getElementById('countClase4').textContent = counts.clase4;
}

// Abrir modal
function openModal(bedIndex) {
    currentBedIndex = bedIndex;
    const bed = beds[bedIndex];
    const modal = document.getElementById('patientModal');
    
    document.getElementById('modalTitle').textContent = `Cama ${bed.number}`;
    document.getElementById('patientName').value = bed.patientName || '';
    document.getElementById('diagnostico').value = bed.diagnostico || '';
    document.getElementById('observaciones').value = bed.observaciones || '';
    document.getElementById('fechaIngreso').value = bed.fechaIngreso || '';
    
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = bed.selectedInterventions.includes(checkbox.dataset.points + '-' + checkbox.dataset.category);
    });
    
    updateModalResults();
    modal.classList.add('active');
}

// Cerrar modal
function closeModal() {
    document.getElementById('patientModal').classList.remove('active');
    currentBedIndex = null;
}

// Calcular puntuación del modal
function calcularPuntuacionModal() {
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]:checked');
    let total = 0;
    checkboxes.forEach(checkbox => {
        total += parseInt(checkbox.dataset.points);
    });
    return total;
}

// Actualizar resultados del modal
function updateModalResults() {
    const puntos = calcularPuntuacionModal();
    const clasificacion = clasificarPaciente(puntos);
    
    document.getElementById('scoreNumber').textContent = puntos;
    
    const classificationDiv = document.getElementById('classification');
    classificationDiv.className = `classification-modal ${clasificacion.color}`;
    classificationDiv.innerHTML = `
        <h3 style="color: inherit; margin-bottom: 0.5rem;">${clasificacion.nombre}</h3>
        <p style="margin: 0.25rem 0;"><strong>Rango:</strong> ${clasificacion.rango}</p>
        <p style="margin: 0.25rem 0; font-size: 0.85rem;">${clasificacion.descripcion}</p>
        <p style="margin: 0.5rem 0 0 0; font-weight: 700;"><strong>Ratio:</strong> ${clasificacion.ratioTexto}</p>
    `;
}

// Guardar paciente
function guardarPaciente() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    const puntos = calcularPuntuacionModal();
    
    bed.occupied = true;
    bed.patientName = document.getElementById('patientName').value.trim();
    bed.diagnostico = document.getElementById('diagnostico').value.trim();
    bed.observaciones = document.getElementById('observaciones').value.trim();
    bed.fechaIngreso = document.getElementById('fechaIngreso').value;
    bed.tiss = puntos;
    
    if (!bed.fechaIngreso && bed.occupied) {
        bed.fechaIngreso = new Date().toISOString().split('T')[0];
    }
    
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]:checked');
    bed.selectedInterventions = Array.from(checkboxes).map(cb => 
        cb.dataset.points + '-' + cb.dataset.category
    );
    
    saveBeds();
    renderBedsGrid();
    closeModal();
}

// Liberar cama
function liberarCama() {
    if (currentBedIndex === null) return;
    
    if (confirm(`¿Está seguro de liberar la Cama ${beds[currentBedIndex].number}?`)) {
        beds[currentBedIndex] = {
            number: beds[currentBedIndex].number,
            occupied: false,
            patientName: '',
            diagnostico: '',
            observaciones: '',
            fechaIngreso: '',
            tiss: 0,
            selectedInterventions: []
        };
        
        saveBeds();
        renderBedsGrid();
        closeModal();
    }
}

// Ver lista de pacientes
function verLista() {
    const modal = document.getElementById('listaModal');
    const contenido = document.getElementById('listaContenido');
    const turnoNombre = {
        'mañana': 'Mañana (7-14hs)',
        'tarde': 'Tarde (14-21hs)',
        'noche': 'Noche (21-07hs)',
        'franquero': 'Franquero (7-21hs)'
    };
    
    document.getElementById('listaTurno').textContent = turnoNombre[turnoActual];
    
    const occupied = beds.filter(b => b.occupied);
    
    if (occupied.length === 0) {
        contenido.innerHTML = '<div class="lista-vacia">📋 No hay pacientes registrados</div>';
    } else {
        let html = '<div class="lista-resumen">';
        html += '<h3>Resumen del Turno</h3>';
        html += '<div class="lista-resumen-grid">';
        html += `<div class="lista-resumen-item"><div class="lista-resumen-valor">${occupied.length}</div><div class="lista-resumen-label">Pacientes</div></div>`;
        html += `<div class="lista-resumen-item"><div class="lista-resumen-valor">${enfermerosEnTurno}</div><div class="lista-resumen-label">Enfermeros</div></div>`;
        
        const tissTotal = occupied.reduce((sum, b) => sum + b.tiss, 0);
        html += `<div class="lista-resumen-item"><div class="lista-resumen-valor">${tissTotal}</div><div class="lista-resumen-label">TISS Total</div></div>`;
        html += '</div>';
        
        if (notasTurno) {
            html += `<div style="margin-top: 1rem;"><strong>Notas:</strong> ${notasTurno}</div>`;
        }
        html += '</div>';
        
        html += '<div class="lista-pacientes">';
        
        occupied.forEach(bed => {
            const clase = clasificarPaciente(bed.tiss);
            let diasInternado = '';
            if (bed.fechaIngreso) {
                const ingreso = new Date(bed.fechaIngreso);
                const hoy = new Date();
                const dias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
                diasInternado = `${dias} día${dias !== 1 ? 's' : ''}`;
            }
            
            html += `<div class="lista-paciente-card ${clase.className}">`;
            html += '<div class="lista-paciente-header">';
            html += `<div class="lista-paciente-nombre">${bed.patientName || 'Sin nombre'}</div>`;
            html += `<div class="lista-paciente-cama">Cama ${bed.number}</div>`;
            html += '</div>';
            html += '<div class="lista-paciente-info">';
            html += `<div class="lista-info-item"><strong>TISS:</strong> ${bed.tiss} pts (${clase.nombre})</div>`;
            if (diasInternado) {
                html += `<div class="lista-info-item"><strong>Internación:</strong> ${diasInternado}</div>`;
            }
            if (bed.diagnostico) {
                html += `<div class="lista-info-item"><strong>Diagnóstico:</strong> ${bed.diagnostico}</div>`;
            }
            if (bed.observaciones) {
                html += `<div class="lista-info-item" style="grid-column: 1 / -1;"><strong>Observaciones:</strong> ${bed.observaciones}</div>`;
            }
            html += '</div>';
            html += '</div>';
        });
        
        html += '</div>';
        contenido.innerHTML = html;
    }
    
    modal.classList.add('active');
}

function closeListaModal() {
    document.getElementById('listaModal').classList.remove('active');
}

// Imprimir
function imprimirReporte() {
    window.print();
}

// Limpiar todo
function limpiarTodo() {
    if (confirm('¿Está seguro de liberar TODAS las camas? Esta acción no se puede deshacer.')) {
        beds = Array.from({ length: 22 }, (_, i) => ({
            number: i + 1,
            occupied: false,
            patientName: '',
            diagnostico: '',
            observaciones: '',
            fechaIngreso: '',
            tiss: 0,
            selectedInterventions: []
        }));
        saveBeds();
        renderBedsGrid();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeBeds();
    renderBedsGrid();
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelarBtn').addEventListener('click', closeModal);
    document.getElementById('guardarPacienteBtn').addEventListener('click', guardarPaciente);
    document.getElementById('liberarCamaBtn').addEventListener('click', liberarCama);
    document.getElementById('limpiarTodoBtn').addEventListener('click', limpiarTodo);
    
    document.getElementById('turnoSelect').addEventListener('change', function(e) {
        turnoActual = e.target.value;
        saveBeds();
    });
    
    document.getElementById('enfermerosEnTurno').addEventListener('input', function(e) {
        enfermerosEnTurno = parseInt(e.target.value) || 0;
        saveBeds();
        updateGlobalSummary();
    });
    
    document.getElementById('notasTurno').addEventListener('input', function(e) {
        notasTurno = e.target.value;
        saveBeds();
    });
    
    document.getElementById('verListaBtn').addEventListener('click', verLista);
    document.getElementById('imprimirBtn').addEventListener('click', imprimirReporte);
    document.getElementById('closeListaModal').addEventListener('click', closeListaModal);
    
    document.getElementById('listaModal').addEventListener('click', function(e) {
        if (e.target === this) closeListaModal();
    });
    
    document.getElementById('patientModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            this.classList.add('active');
            document.querySelector(`.tab-panel[data-tab="${tabName}"]`).classList.add('active');
        });
    });
    
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateModalResults);
    });
    
    // Atajos de teclado mejorados
    document.addEventListener('keydown', function(e) {
        const modalAbierto = document.getElementById('patientModal').classList.contains('active');
        const listaAbierta = document.getElementById('listaModal').classList.contains('active');
        
        // ESC para cerrar modales
        if (e.key === 'Escape') {
            if (modalAbierto) closeModal();
            if (listaAbierta) closeListaModal();
        }
        
        // CTRL+ENTER para guardar (solo en modal de paciente)
        if (e.ctrlKey && e.key === 'Enter' && modalAbierto) {
            e.preventDefault();
            guardarPaciente();
        }
        
        // CTRL+L para ver lista (cuando no hay modales abiertos)
        if (e.ctrlKey && e.key === 'l' && !modalAbierto && !listaAbierta) {
            e.preventDefault();
            verLista();
        }
        
        // CTRL+P para imprimir (ya lo maneja el navegador, pero agregamos confirmación visual)
        if (e.ctrlKey && e.key === 'p') {
            // El navegador maneja esto automáticamente
        }
    });
});

