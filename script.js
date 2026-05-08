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

// Utilidad: Formatear números con separadores de miles
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Utilidad: Debounce para optimizar guardado
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Estado global
let beds = [];
let currentBedIndex = null;
let turnoActual = 'mañana';
let enfermerosEnTurno = 0;
let notasTurno = '';
let saveStatus = 'saved'; // Estados: 'saved', 'saving', 'pending'
let previousBedsState = null; // Para renderizado diferencial

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
    
    // Forzar render completo en la primera carga
    previousBedsState = null;
    
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
    saveStatus = 'saving';
    updateSaveIndicator();
    
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
        
        saveStatus = 'saved';
        updateSaveIndicator();
    } catch (e) {
        console.error('Error guardando datos:', e);
        saveStatus = 'saved'; // Marcar como saved de todos modos
        updateSaveIndicator();
        
        // Si falla por quota exceeded, mostrar mensaje al usuario
        if (e.name === 'QuotaExceededError') {
            mostrarFeedback('⚠️ Memoria llena. Libere camas antiguas.', 'warning');
        }
    }
}

// Versión debounced de saveBeds (800ms de espera)
const debouncedSaveBeds = debounce(async () => {
    saveStatus = 'pending';
    updateSaveIndicator();
    await saveBeds();
}, 800);

// Actualizar indicador visual de guardado
function updateSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (!indicator) return;
    
    const estados = {
        saved: { text: '✓ Guardado', class: 'saved' },
        saving: { text: '⏳ Guardando...', class: 'saving' },
        pending: { text: '⋯ Pendiente', class: 'pending' }
    };
    
    const estado = estados[saveStatus];
    indicator.textContent = estado.text;
    indicator.className = `save-indicator ${estado.class}`;
}

// Verificar si una cama cambió (para renderizado diferencial)
function bedHasChanged(bed, previousBed) {
    if (!previousBed) return true;
    
    return bed.occupied !== previousBed.occupied ||
           bed.patientName !== previousBed.patientName ||
           bed.tiss !== previousBed.tiss ||
           bed.fechaIngreso !== previousBed.fechaIngreso;
}

// Crear elemento de cama (extraído para reutilización)
function createBedCard(bed, index) {
    const bedCard = document.createElement('div');
    bedCard.className = 'bed-card';
    
    if (bed.occupied) {
        const clase = clasificarPaciente(bed.tiss);
        bedCard.classList.add(clase.className);
        
        let diasInternado = '';
        let diasTexto = '';
        if (bed.fechaIngreso) {
            const dias = calcularDiasInternado(bed.fechaIngreso);
            if (dias !== null) {
                diasInternado = `<div class="bed-dias">📅 ${dias} día${dias !== 1 ? 's' : ''}</div>`;
                diasTexto = `${dias} día${dias !== 1 ? 's' : ''} internado`;
            }
        }
        
        // Crear contenido del tooltip
        const diagnosticoTexto = bed.diagnostico ? `<div class="tooltip-diagnostico">${bed.diagnostico}</div>` : '';
        const tooltipContent = `
            <div class="bed-tooltip">
                <div class="tooltip-header">Cama ${bed.number} - ${bed.patientName || 'Paciente'}</div>
                ${diagnosticoTexto}
                ${diasTexto ? `<div class="tooltip-dias">📅 ${diasTexto}</div>` : ''}
                <div class="tooltip-clase">${clase.nombre} - ${bed.tiss} puntos</div>
                <div class="tooltip-ratio">Ratio: ${clase.ratioTexto}</div>
                <div class="tooltip-hint">Click para editar</div>
            </div>
        `;
        
        bedCard.innerHTML = `
            <div class="bed-number">Cama ${bed.number}</div>
            <div class="bed-icon">🛏️</div>
            <div class="bed-status">${bed.patientName || 'Paciente'}</div>
            <div class="bed-tiss">${bed.tiss} pts</div>
            ${diasInternado}
            ${tooltipContent}
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
    return bedCard;
}

// Función para clasificar según puntos
function clasificarPaciente(puntos) {
    if (puntos < 10) return clasificaciones.clase1;
    if (puntos >= 10 && puntos < 20) return clasificaciones.clase2;
    if (puntos >= 20 && puntos < 40) return clasificaciones.clase3;
    return clasificaciones.clase4;
}

// Renderizar grid de camas con actualización diferencial
function renderBedsGrid() {
    const grid = document.getElementById('bedsGrid');
    
    // Primera renderización o render forzado: crear todos los elementos
    if (!previousBedsState || grid.children.length === 0) {
        grid.innerHTML = '';
        beds.forEach((bed, index) => {
            const bedCard = createBedCard(bed, index);
            grid.appendChild(bedCard);
        });
        previousBedsState = JSON.parse(JSON.stringify(beds));
        updateGlobalSummary();
        return;
    }
    
    // Renderización diferencial: actualizar solo lo necesario
    beds.forEach((bed, index) => {
        if (bedHasChanged(bed, previousBedsState[index])) {
            const existingCard = grid.children[index];
            const newCard = createBedCard(bed, index);
            grid.replaceChild(newCard, existingCard);
        }
    });
    
    previousBedsState = JSON.parse(JSON.stringify(beds));
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
    document.getElementById('tissTotal').textContent = formatNumber(tissTotal);
    document.getElementById('enfermerosNecesarios').textContent = formatNumber(Math.ceil(enfermerosNecesarios));
    document.getElementById('enfermerosEnTurnoDisplay').textContent = formatNumber(enfermerosEnTurno);
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

// Mostrar notificación Toast profesional
function mostrarFeedback(mensaje, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${iconos[tipo] || iconos.success}</span>
        <span class="toast-message">${mensaje}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confirmación elegante (reemplazo de confirm())
function confirmarAccion(mensaje, callback) {
    const confirmacion = confirm(mensaje);
    if (confirmacion) {
        callback();
    }
}

// Liberar cama
function liberarCama() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    const nombrePaciente = bed.patientName || 'este paciente';
    
    confirmarAccion(
        `¿Está seguro de liberar la Cama ${bed.number}${bed.patientName ? ` (${bed.patientName})` : ''}?\n\nEsta acción eliminará todos los datos y no se puede deshacer.`,
        () => {
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
    );
}

// Imprimir
function imprimirReporte() {
    const notasTextarea = document.getElementById('notasTurno');
    const alturaOriginal = notasTextarea.style.height;
    
    // Ajustar altura del textarea al contenido completo antes de imprimir
    notasTextarea.style.height = 'auto';
    notasTextarea.style.height = notasTextarea.scrollHeight + 'px';
    
    // Esperar un momento para que el navegador aplique los cambios
    setTimeout(() => {
        window.print();
        
        // Restaurar altura original después de imprimir
        setTimeout(() => {
            notasTextarea.style.height = alturaOriginal;
        }, 100);
    }, 100);
}

// Ajustar textarea también cuando se detecte el evento beforeprint
window.addEventListener('beforeprint', () => {
    const notasTextarea = document.getElementById('notasTurno');
    notasTextarea.style.height = 'auto';
    notasTextarea.style.height = notasTextarea.scrollHeight + 'px';
});

window.addEventListener('afterprint', () => {
    const notasTextarea = document.getElementById('notasTurno');
    notasTextarea.style.height = '';
});

// Limpiar todo
function limpiarTodo() {
    confirmarAccion(
        '¿Está seguro de liberar TODAS las camas? Esta acción no se puede deshacer.',
        () => {
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
            previousBedsState = null; // Forzar render completo
            saveBeds();
            renderBedsGrid();
            mostrarFeedback('✓ Todas las camas liberadas', 'success');
        }
    );
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
        debouncedSaveBeds();
    });
    
    document.getElementById('enfermerosEnTurno').addEventListener('input', function(e) {
        let valor = parseInt(e.target.value) || 0;
        // Evitar valores negativos
        if (valor < 0) {
            valor = 0;
            e.target.value = 0;
        }
        enfermerosEnTurno = valor;
        updateGlobalSummary();
        debouncedSaveBeds();
    });
    
    document.getElementById('notasTurno').addEventListener('input', function(e) {
        notasTurno = e.target.value;
        debouncedSaveBeds();
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

