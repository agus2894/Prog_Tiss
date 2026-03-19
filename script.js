// Clasificaciones TISS
const clasificaciones = {
    clase1: {
        nombre: "Clase I",
        rango: "< 10 puntos",
        ratio: 0.25,
        ratioTexto: "1:4",
        color: "class-1",
        className: "clase1"
    },
    clase2: {
        nombre: "Clase II",
        rango: "10-19 puntos",
        ratio: 1/3,
        ratioTexto: "1:3",
        color: "class-2",
        className: "clase2"
    },
    clase3: {
        nombre: "Clase III",
        rango: "20-39 puntos",
        ratio: 0.5,
        ratioTexto: "1:2",
        color: "class-3",
        className: "clase3"
    },
    clase4: {
        nombre: "Clase IV",
        rango: "≥ 40 puntos",
        ratio: 1,
        ratioTexto: "1:1",
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

// Función para actualizar el texto del turno
function updateTurnoDisplay() {
    const turnoTextos = {
        'mañana': 'Mañana (7-14hs)',
        'tarde': 'Tarde (14-21hs)',
        'noche': 'Noche (21-07hs)',
        'franquero': 'Franquero (7-21hs)'
    };
    const turnoDisplayEl = document.getElementById('turnoDisplay');
    if (turnoDisplayEl) {
        turnoDisplayEl.textContent = turnoTextos[turnoActual] || turnoActual;
    }
}

// Actualizar indicador de estado de Supabase
function updateSupabaseStatus() {
    const statusDiv = document.getElementById('supabaseStatus');
    const statusIcon = document.getElementById('supabaseStatusIcon');
    const statusText = document.getElementById('supabaseStatusText');
    
    if (!statusDiv || !statusIcon || !statusText) return;
    
    if (supabaseService.isOnline()) {
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#d4edda';
        statusDiv.style.color = '#155724';
        statusIcon.textContent = '✅';
        statusText.textContent = 'Conectado a Supabase - Datos sincronizados';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    } else {
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = '#fff3cd';
        statusDiv.style.color = '#856404';
        statusIcon.textContent = '📴';
        statusText.textContent = 'Modo offline - Datos guardados localmente';
        
        // Mantener visible en modo offline
    }
}

// Función utilitaria para calcular días internados
function calcularDiasInternado(fechaIngreso) {
    if (!fechaIngreso) return null;
    try {
        // Parsear fecha como UTC para evitar problemas de timezone
        const ingreso = new Date(fechaIngreso + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
        const dias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
        // No mostrar días negativos (fechas futuras)
        return dias >= 0 ? dias : 0;
    } catch (e) {
        console.error('Error calculando días:', e);
        return null;
    }
}

// Inicializar 22 camas
async function initializeBeds() {
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
    
    // Cargar desde Supabase (con fallback a localStorage)
    const data = await supabaseService.loadBeds();
    
    if (data.beds && data.beds.length > 0) {
        beds = data.beds;
    }
    
    if (data.turno) {
        turnoActual = data.turno;
        document.getElementById('turnoSelect').value = turnoActual;
    }
    
    // Actualizar texto del turno
    updateTurnoDisplay();
    
    if (data.enfermeros !== undefined) {
        enfermerosEnTurno = data.enfermeros;
        document.getElementById('enfermerosEnTurno').value = enfermerosEnTurno;
    }
    
    if (data.notas) {
        notasTurno = data.notas;
        document.getElementById('notasTurno').value = notasTurno;
    }
}

// Guardar en Supabase (con fallback a localStorage)
async function saveBeds() {
    try {
        const result = await supabaseService.saveBeds(
            beds,
            turnoActual,
            enfermerosEnTurno,
            notasTurno
        );
        
        if (!result.success) {
            console.warn('Usando almacenamiento local como respaldo');
        }
    } catch (e) {
        console.error('Error guardando datos:', e);
        // Si falla por quota exceeded, mostrar mensaje al usuario
        if (e.name === 'QuotaExceededError') {
            mostrarFeedback('⚠️ Memoria llena. Libere camas antiguas.', 'warning');
        }
    }
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
                const dias = calcularDiasInternado(bed.fechaIngreso);
                if (dias !== null) {
                    diasInternado = `<div class="bed-dias">📅 ${dias} día${dias !== 1 ? 's' : ''}</div>`;
                }
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
    
    let enfermerosNecesarios = 0;
    occupied.forEach(bed => {
        const clase = clasificarPaciente(bed.tiss);
        enfermerosNecesarios += clase.ratio;
    });
    
    document.getElementById('camasOcupadas').textContent = `${occupied.length}/22`;
    document.getElementById('tissTotal').textContent = tissTotal;
    document.getElementById('enfermerosNecesarios').textContent = Math.ceil(enfermerosNecesarios);
    document.getElementById('enfermerosEnTurnoDisplay').textContent = enfermerosEnTurno;
    updateTurnoDisplay();
    
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
    
    // Mostrar distribución por clases
    const distribucionDiv = document.getElementById('distribucionClases');
    if (distribucionDiv) {
        if (occupied.length > 0) {
            const partes = [];
            if (counts.clase1 > 0) partes.push(`I: ${counts.clase1}`);
            if (counts.clase2 > 0) partes.push(`II: ${counts.clase2}`);
            if (counts.clase3 > 0) partes.push(`III: ${counts.clase3}`);
            if (counts.clase4 > 0) partes.push(`IV: ${counts.clase4}`);
            distribucionDiv.textContent = partes.length > 0 ? `Distribución: ${partes.join(' | ')}` : '';
        } else {
            distribucionDiv.textContent = '';
        }
    }
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
    
    // Si la cama está vacía, usar fecha actual por defecto
    if (!bed.occupied && !bed.fechaIngreso) {
        document.getElementById('fechaIngreso').value = new Date().toISOString().split('T')[0];
    } else {
        document.getElementById('fechaIngreso').value = bed.fechaIngreso || '';
    }
    
    // SIEMPRE desmarcar todos los checkboxes primero
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Si la cama está OCUPADA (paciente existente), marcar las intervenciones guardadas
    if (bed.occupied && bed.selectedInterventions && bed.selectedInterventions.length > 0) {
        checkboxes.forEach(checkbox => {
            const key = checkbox.dataset.points + '-' + checkbox.dataset.category;
            if (bed.selectedInterventions.includes(key)) {
                checkbox.checked = true;
            }
        });
    }
    // Si la cama está VACÍA (nuevo paciente), todos los checkboxes quedan desmarcados
    
    updateModalResults();
    modal.classList.add('active');
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('patientModal');
    modal.classList.remove('active');
    
    // Limpiar todos los checkboxes al cerrar para evitar residuos
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
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
        <h3 style="color: inherit; margin-bottom: 0.25rem;">${clasificacion.nombre}</h3>
        <p style="margin: 0.15rem 0;"><strong>Rango:</strong> ${clasificacion.rango}</p>
        <p style="margin: 0.25rem 0 0 0; font-weight: 700;"><strong>Ratio:</strong> ${clasificacion.ratioTexto}</p>
    `;
}

// Guardar paciente
function guardarPaciente() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    const puntos = calcularPuntuacionModal();
    const nombre = document.getElementById('patientName').value.trim();
    
    // Validación: al menos debe tener nombre o puntaje
    if (!nombre && puntos === 0) {
        mostrarFeedback('⚠️ Ingrese al menos el nombre del paciente', 'warning');
        return;
    }
    
    bed.occupied = true;
    bed.patientName = nombre;
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
    
    // Feedback visual
    mostrarFeedback('✓ Paciente guardado correctamente');
    
    closeModal();
}

// Mostrar feedback visual temporal
function mostrarFeedback(mensaje, tipo = 'success') {
    const feedback = document.createElement('div');
    feedback.textContent = mensaje;
    
    const colores = {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
    };
    
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colores[tipo] || colores.success};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

// Liberar cama
function liberarCama() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    const nombrePaciente = bed.patientName || 'este paciente';
    
    if (confirm(`¿Está seguro de liberar la Cama ${bed.number}${bed.patientName ? ` (${bed.patientName})` : ''}?\n\nEsta acción eliminará todos los datos y no se puede deshacer.`)) {
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
        mostrarFeedback('✓ Cama liberada correctamente');
        closeModal();
    }
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
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar Supabase
    await supabaseService.init();
    updateSupabaseStatus();
    
    // Cargar y renderizar datos
    await initializeBeds();
    renderBedsGrid();
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelarBtn').addEventListener('click', closeModal);
    document.getElementById('guardarPacienteBtn').addEventListener('click', guardarPaciente);
    document.getElementById('liberarCamaBtn').addEventListener('click', liberarCama);
    document.getElementById('limpiarTodoBtn').addEventListener('click', limpiarTodo);
    
    document.getElementById('turnoSelect').addEventListener('change', function(e) {
        turnoActual = e.target.value;
        updateTurnoDisplay();
        saveBeds();
    });
    
    document.getElementById('enfermerosEnTurno').addEventListener('input', function(e) {
        let valor = parseInt(e.target.value) || 0;
        // Evitar valores negativos
        if (valor < 0) {
            valor = 0;
            e.target.value = 0;
        }
        enfermerosEnTurno = valor;
        saveBeds();
        updateGlobalSummary();
    });
    
    document.getElementById('notasTurno').addEventListener('input', function(e) {
        notasTurno = e.target.value;
        saveBeds();
    });
    
    document.getElementById('imprimirBtn').addEventListener('click', imprimirReporte);
    
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
    
    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        const modalAbierto = document.getElementById('patientModal').classList.contains('active');
        
        // ESC para cerrar modal
        if (e.key === 'Escape' && modalAbierto) {
            closeModal();
        }
        
        // CTRL+ENTER para guardar (solo en modal de paciente)
        if (e.ctrlKey && e.key === 'Enter' && modalAbierto) {
            e.preventDefault();
            guardarPaciente();
        }
    });
});

