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

// Constantes de configuración de camas
const DEFAULT_NUM_CAMAS = 22;
const MIN_CAMAS = 1;
const MAX_CAMAS = 60;

// Utilidad: Formatear números con separadores de miles (optimizado con Intl)
const numberFormatter = new Intl.NumberFormat('es-AR');
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return numberFormatter.format(num);
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

// Cache de elementos DOM (optimización de rendimiento)
const DOMCache = {
    turnoDisplay: null,
    supabaseStatus: null,
    supabaseStatusIcon: null,
    supabaseStatusText: null,
    turnoSelect: null,
    enfermerosInput: null,
    notasTurnoTextarea: null,
    saveIndicator: null,
    bedsGrid: null,
    camasOcupadas: null,
    tissTotal: null,
    enfermerosNecesarios: null,
    enfermerosEnTurnoDisplay: null,
    diferenciaNota: null,
    distribucionClases: null,
    patientModal: null,
    transferModal: null,
    configModal: null,
    configModalTitle: null,
    numCamasInput: null,
    btnDecrementarCamas: null,
    btnIncrementarCamas: null,
    configCurrentTotal: null,
    configCurrentOccupied: null,
    configCurrentAvailable: null,
    configWarning: null,
    guardarCapacidadBtn: null,
    cancelarConfigBtn: null,
    closeConfigModal: null,
    configCamasBtn: null,
    modalTitle: null,
    patientName: null,
    diagnostico: null,
    observaciones: null,
    fechaIngreso: null,
    scoreNumber: null,
    classification: null,
    toastContainer: null,
    bedsSelectionGrid: null,
    transferModalTitle: null,
    transferDescription: null,
    modalCheckboxes: null,
    
    // Inicializar cache
    init() {
        this.turnoDisplay = document.getElementById('turnoDisplay');
        this.supabaseStatus = document.getElementById('supabaseStatus');
        this.supabaseStatusIcon = document.getElementById('supabaseStatusIcon');
        this.supabaseStatusText = document.getElementById('supabaseStatusText');
        this.turnoSelect = document.getElementById('turnoSelect');
        this.enfermerosInput = document.getElementById('enfermerosEnTurno');
        this.notasTurnoTextarea = document.getElementById('notasTurno');
        this.saveIndicator = document.getElementById('saveIndicator');
        this.bedsGrid = document.getElementById('bedsGrid');
        this.camasOcupadas = document.getElementById('camasOcupadas');
        this.tissTotal = document.getElementById('tissTotal');
        this.enfermerosNecesarios = document.getElementById('enfermerosNecesarios');
        this.enfermerosEnTurnoDisplay = document.getElementById('enfermerosEnTurnoDisplay');
        this.diferenciaNota = document.getElementById('diferenciaNota');
        this.distribucionClases = document.getElementById('distribucionClases');
        this.patientModal = document.getElementById('patientModal');
        this.transferModal = document.getElementById('transferModal');
        this.configModal = document.getElementById('configModal');
        this.configModalTitle = document.getElementById('configModalTitle');
        this.numCamasInput = document.getElementById('numCamasInput');
        this.btnDecrementarCamas = document.getElementById('btnDecrementarCamas');
        this.btnIncrementarCamas = document.getElementById('btnIncrementarCamas');
        this.configCurrentTotal = document.getElementById('configCurrentTotal');
        this.configCurrentOccupied = document.getElementById('configCurrentOccupied');
        this.configCurrentAvailable = document.getElementById('configCurrentAvailable');
        this.configWarning = document.getElementById('configWarning');
        this.guardarCapacidadBtn = document.getElementById('guardarCapacidadBtn');
        this.cancelarConfigBtn = document.getElementById('cancelarConfigBtn');
        this.closeConfigModal = document.getElementById('closeConfigModal');
        this.configCamasBtn = document.getElementById('configCamasBtn');
        this.modalTitle = document.getElementById('modalTitle');
        this.patientName = document.getElementById('patientName');
        this.diagnostico = document.getElementById('diagnostico');
        this.observaciones = document.getElementById('observaciones');
        this.fechaIngreso = document.getElementById('fechaIngreso');
        this.scoreNumber = document.getElementById('scoreNumber');
        this.classification = document.getElementById('classification');
        this.toastContainer = document.getElementById('toastContainer');
        this.bedsSelectionGrid = document.getElementById('bedsSelectionGrid');
        this.transferModalTitle = document.getElementById('transferModalTitle');
        this.transferDescription = document.getElementById('transferDescription');
        // Cachear checkboxes se hace después de que el DOM esté completamente cargado
    },
    
    // Obtener checkboxes del modal (se actualizan dinámicamente)
    getModalCheckboxes() {
        // Siempre obtener checkboxes frescos para evitar problemas de caché
        return document.querySelectorAll('.modal input[type="checkbox"]');
    },
    
    // Invalidar cache de checkboxes (llamar cuando sea necesario refrescar)
    invalidateCheckboxCache() {
        this.modalCheckboxes = null;
    }
};

// Clonación eficiente de objetos (reemplazo de JSON.parse/stringify)
function cloneBedsState(beds) {
    return beds.map(bed => ({
        number: bed.number,
        occupied: bed.occupied,
        patientName: bed.patientName,
        diagnostico: bed.diagnostico,
        observaciones: bed.observaciones,
        fechaIngreso: bed.fechaIngreso,
        tiss: bed.tiss,
        selectedInterventions: [...(bed.selectedInterventions || [])]
    }));
}

// Función para actualizar el texto del turno
function updateTurnoDisplay() {
    const turnoTextos = {
        'mañana': 'Mañana (7-14hs)',
        'tarde': 'Tarde (14-21hs)',
        'noche': 'Noche (21-07hs)',
        'franquero': 'Franquero (7-21hs)'
    };
    if (DOMCache.turnoDisplay) {
        DOMCache.turnoDisplay.textContent = turnoTextos[turnoActual] || turnoActual;
    }
}

// Actualizar indicador de estado de Supabase
function updateSupabaseStatus() {
    if (!DOMCache.supabaseStatus || !DOMCache.supabaseStatusIcon || !DOMCache.supabaseStatusText) return;
    
    if (supabaseService.isOnline()) {
        DOMCache.supabaseStatus.style.display = 'block';
        DOMCache.supabaseStatus.style.backgroundColor = '#d4edda';
        DOMCache.supabaseStatus.style.color = '#155724';
        DOMCache.supabaseStatusIcon.textContent = '✅';
        DOMCache.supabaseStatusText.textContent = 'Conectado a Supabase - Datos sincronizados';
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
            DOMCache.supabaseStatus.style.display = 'none';
        }, 3000);
    } else {
        DOMCache.supabaseStatus.style.display = 'block';
        DOMCache.supabaseStatus.style.backgroundColor = '#fff3cd';
        DOMCache.supabaseStatus.style.color = '#856404';
        DOMCache.supabaseStatusIcon.textContent = '📴';
        DOMCache.supabaseStatusText.textContent = 'Modo offline - Datos guardados localmente';
        
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

// Inicializar camas (dinámico con fallback por defecto)
async function initializeBeds() {
    beds = Array.from({ length: DEFAULT_NUM_CAMAS }, (_, i) => ({
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
        if (DOMCache.turnoSelect) DOMCache.turnoSelect.value = turnoActual;
    }
    
    // Actualizar texto del turno
    updateTurnoDisplay();
    
    if (data.enfermeros !== undefined) {
        enfermerosEnTurno = data.enfermeros;
        if (DOMCache.enfermerosInput) DOMCache.enfermerosInput.value = enfermerosEnTurno;
    }
    
    if (data.notas) {
        notasTurno = data.notas;
        if (DOMCache.notasTurnoTextarea) DOMCache.notasTurnoTextarea.value = notasTurno;
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
    if (!DOMCache.saveIndicator) return;
    
    const estados = {
        saved: { text: '✓ Guardado', class: 'saved' },
        saving: { text: '⏳ Guardando...', class: 'saving' },
        pending: { text: '⋯ Pendiente', class: 'pending' }
    };
    
    const estado = estados[saveStatus];
    DOMCache.saveIndicator.textContent = estado.text;
    DOMCache.saveIndicator.className = `save-indicator ${estado.class}`;
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
    if (!DOMCache.bedsGrid) return;
    const grid = DOMCache.bedsGrid;
    
    // Primera renderización o render forzado: crear todos los elementos
    if (!previousBedsState || grid.children.length === 0) {
        // Usar DocumentFragment para mejor rendimiento
        const fragment = document.createDocumentFragment();
        beds.forEach((bed, index) => {
            const bedCard = createBedCard(bed, index);
            fragment.appendChild(bedCard);
        });
        grid.innerHTML = '';
        grid.appendChild(fragment);
        previousBedsState = cloneBedsState(beds);
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
    
    previousBedsState = cloneBedsState(beds);
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
    
    // Usar DOMCache para todas las actualizaciones
    if (DOMCache.camasOcupadas) DOMCache.camasOcupadas.textContent = `${occupied.length}/${beds.length}`;
    if (DOMCache.tissTotal) DOMCache.tissTotal.textContent = formatNumber(tissTotal);
    if (DOMCache.enfermerosNecesarios) DOMCache.enfermerosNecesarios.textContent = formatNumber(Math.ceil(enfermerosNecesarios));
    if (DOMCache.enfermerosEnTurnoDisplay) DOMCache.enfermerosEnTurnoDisplay.textContent = formatNumber(enfermerosEnTurno);
    updateTurnoDisplay();
    
    // Mostrar nota solo si faltan enfermeros
    const diferencia = enfermerosEnTurno - Math.ceil(enfermerosNecesarios);
    if (DOMCache.diferenciaNota) {
        DOMCache.diferenciaNota.textContent = (diferencia < 0 && enfermerosEnTurno > 0) 
            ? `(Faltan ${Math.abs(diferencia)} según estimado)` 
            : '';
    }
    
    const counts = { clase1: 0, clase2: 0, clase3: 0, clase4: 0 };
    occupied.forEach(bed => {
        if (bed.tiss < 10) counts.clase1++;
        else if (bed.tiss < 20) counts.clase2++;
        else if (bed.tiss < 40) counts.clase3++;
        else counts.clase4++;
    });
    
    // Mostrar distribución por clases
    if (DOMCache.distribucionClases) {
        if (occupied.length > 0) {
            const partes = [];
            if (counts.clase1 > 0) partes.push(`I: ${counts.clase1}`);
            if (counts.clase2 > 0) partes.push(`II: ${counts.clase2}`);
            if (counts.clase3 > 0) partes.push(`III: ${counts.clase3}`);
            if (counts.clase4 > 0) partes.push(`IV: ${counts.clase4}`);
            DOMCache.distribucionClases.textContent = partes.length > 0 ? `Distribución: ${partes.join(' | ')}` : '';
        } else {
            DOMCache.distribucionClases.textContent = '';
        }
    }
}

// Función para resetear completamente todos los checkboxes del modal
function resetearCheckboxes() {
    // Obtener checkboxes frescos del DOM (sin caché)
    const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.removeAttribute('checked');
        // Forzar actualización del DOM
        checkbox.defaultChecked = false;
    });
}

// Sanitizar texto para prevenir XSS
function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Abrir modal
function openModal(bedIndex) {
    currentBedIndex = bedIndex;
    const bed = beds[bedIndex];
    if (!DOMCache.patientModal) return;
    
    // PASO 1: Invalidar caché y resetear TODOS los checkboxes primero (limpieza total)
    DOMCache.invalidateCheckboxCache();
    resetearCheckboxes();
    
    // PASO 2: Limpiar campos de texto
    if (DOMCache.modalTitle) DOMCache.modalTitle.textContent = `Cama ${bed.number}`;
    if (DOMCache.patientName) DOMCache.patientName.value = '';
    if (DOMCache.diagnostico) DOMCache.diagnostico.value = '';
    if (DOMCache.observaciones) DOMCache.observaciones.value = '';
    if (DOMCache.fechaIngreso) DOMCache.fechaIngreso.value = '';
    
    // PASO 3: Cargar datos del paciente (solo si existe)
    if (bed.occupied) {
        if (DOMCache.patientName) DOMCache.patientName.value = bed.patientName || '';
        if (DOMCache.diagnostico) DOMCache.diagnostico.value = bed.diagnostico || '';
        if (DOMCache.observaciones) DOMCache.observaciones.value = bed.observaciones || '';
        if (DOMCache.fechaIngreso) DOMCache.fechaIngreso.value = bed.fechaIngreso || '';
        
        // PASO 4: Marcar solo las intervenciones guardadas del paciente existente
        // Usar setTimeout para asegurar que el DOM está completamente limpio antes de marcar
        setTimeout(() => {
            if (bed.selectedInterventions && bed.selectedInterventions.length > 0) {
                const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    const key = checkbox.dataset.points + '-' + checkbox.dataset.category;
                    if (bed.selectedInterventions.includes(key)) {
                        checkbox.checked = true;
                    }
                });
                // Actualizar resultados después de marcar checkboxes
                updateModalResults();
            }
        }, 0);
    } else {
        // PASO 5: Si es nueva cama, usar fecha actual por defecto
        if (DOMCache.fechaIngreso) DOMCache.fechaIngreso.value = new Date().toISOString().split('T')[0];
    }
    
    // PASO 6: Actualizar resultados y abrir modal
    updateModalResults();
    DOMCache.patientModal.classList.add('active');
}

// Cerrar modal
function closeModal() {
    if (!DOMCache.patientModal) return;
    DOMCache.patientModal.classList.remove('active');
    
    // Resetear todos los checkboxes y campos al cerrar
    resetearCheckboxes();
    
    // Limpiar también los campos de texto para evitar cualquier residuo
    if (DOMCache.patientName) DOMCache.patientName.value = '';
    if (DOMCache.diagnostico) DOMCache.diagnostico.value = '';
    if (DOMCache.observaciones) DOMCache.observaciones.value = '';
    if (DOMCache.fechaIngreso) DOMCache.fechaIngreso.value = '';
    
    currentBedIndex = null;
}

// Calcular puntuación del modal
function calcularPuntuacionModal() {
    const checkboxes = Array.from(DOMCache.getModalCheckboxes()).filter(cb => cb.checked);
    return checkboxes.reduce((total, checkbox) => total + parseInt(checkbox.dataset.points), 0);
}

// Actualizar resultados del modal
function updateModalResults() {
    const puntos = calcularPuntuacionModal();
    const clasificacion = clasificarPaciente(puntos);
    
    if (DOMCache.scoreNumber) DOMCache.scoreNumber.textContent = puntos;
    
    if (DOMCache.classification) {
        DOMCache.classification.className = `classification-modal ${clasificacion.color}`;
        DOMCache.classification.innerHTML = `
            <h3 style="color: inherit; margin-bottom: 0.25rem;">${sanitizeHTML(clasificacion.nombre)}</h3>
            <p style="margin: 0.15rem 0;"><strong>Rango:</strong> ${sanitizeHTML(clasificacion.rango)}</p>
            <p style="margin: 0.25rem 0 0 0; font-weight: 700;"><strong>Ratio:</strong> ${sanitizeHTML(clasificacion.ratioTexto)}</p>
        `;
    }
}

// Guardar paciente
function guardarPaciente() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    const puntos = calcularPuntuacionModal();
    const nombre = DOMCache.patientName ? DOMCache.patientName.value.trim() : '';
    
    // Validación: al menos debe tener nombre o puntaje
    if (!nombre && puntos === 0) {
        mostrarFeedback('⚠️ Ingrese al menos el nombre del paciente', 'warning');
        return;
    }
    
    bed.occupied = true;
    bed.patientName = nombre;
    bed.diagnostico = DOMCache.diagnostico ? DOMCache.diagnostico.value.trim() : '';
    bed.observaciones = DOMCache.observaciones ? DOMCache.observaciones.value.trim() : '';
    bed.fechaIngreso = DOMCache.fechaIngreso ? DOMCache.fechaIngreso.value : '';
    bed.tiss = puntos;
    
    if (!bed.fechaIngreso && bed.occupied) {
        bed.fechaIngreso = new Date().toISOString().split('T')[0];
    }
    
    const checkboxes = Array.from(DOMCache.getModalCheckboxes()).filter(cb => cb.checked);
    bed.selectedInterventions = checkboxes.map(cb => cb.dataset.points + '-' + cb.dataset.category);
    
    saveBeds();
    renderBedsGrid();
    
    // Feedback visual
    mostrarFeedback('✓ Paciente guardado correctamente');
    
    closeModal();
}

// Mostrar notificación Toast profesional
function mostrarFeedback(mensaje, tipo = 'success') {
    if (!DOMCache.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
    };
    
    // Usar textContent para seguridad
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = iconos[tipo] || iconos.success;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = mensaje;
    
    toast.appendChild(icon);
    toast.appendChild(messageSpan);
    
    DOMCache.toastContainer.appendChild(toast);
    
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
    window.print();
}

// Limpiar todo
function limpiarTodo() {
    confirmarAccion(
        '¿Está seguro de liberar TODAS las camas? Esta acción no se puede deshacer.',
        () => {
            const totalCamas = beds.length || DEFAULT_NUM_CAMAS;
            beds = Array.from({ length: totalCamas }, (_, i) => ({
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

// ========================================
// FUNCIONALIDAD DE TRANSFERENCIA DE PACIENTES
// ========================================

// Abrir modal de transferencia
function abrirModalTransferencia() {
    if (currentBedIndex === null) return;
    
    const bed = beds[currentBedIndex];
    
    // Verificar que la cama esté ocupada
    if (!bed.occupied) {
        mostrarFeedback('⚠️ No hay paciente en esta cama para transferir', 'warning');
        return;
    }
    
    // Actualizar título del modal
    if (DOMCache.transferModalTitle) {
        DOMCache.transferModalTitle.textContent = `Transferir Paciente: ${bed.patientName || 'Sin nombre'}`;
    }
    if (DOMCache.transferDescription) {
        DOMCache.transferDescription.textContent = `Desde Cama ${bed.number} → Seleccione cama destino:`;
    }
    
    // Renderizar grid de camas disponibles
    renderBedsSelectionGrid();
    
    // Mostrar modal de transferencia
    if (DOMCache.transferModal) {
        DOMCache.transferModal.classList.add('active');
    }
}

// Cerrar modal de transferencia
function cerrarModalTransferencia() {
    if (DOMCache.transferModal) {
        DOMCache.transferModal.classList.remove('active');
    }
}

// Renderizar grid de selección de camas
function renderBedsSelectionGrid() {
    if (!DOMCache.bedsSelectionGrid) return;
    const grid = DOMCache.bedsSelectionGrid;
    
    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    beds.forEach((bed, index) => {
        // No mostrar la cama actual en la lista
        if (index === currentBedIndex) return;
        
        const bedCard = document.createElement('div');
        bedCard.className = 'bed-selection-card';
        
        if (bed.occupied) {
            bedCard.classList.add('occupied');
            bedCard.title = 'Esta cama ya está ocupada';
            
            const numberDiv = document.createElement('div');
            numberDiv.className = 'bed-number-small';
            numberDiv.textContent = `Cama ${bed.number}`;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'bed-status-small';
            statusDiv.textContent = 'Ocupada';
            
            const patientDiv = document.createElement('div');
            patientDiv.className = 'bed-patient-small';
            patientDiv.textContent = bed.patientName || 'Paciente';
            
            bedCard.appendChild(numberDiv);
            bedCard.appendChild(statusDiv);
            bedCard.appendChild(patientDiv);
        } else {
            bedCard.classList.add('available');
            bedCard.title = `Transferir a Cama ${bed.number}`;
            
            const numberDiv = document.createElement('div');
            numberDiv.className = 'bed-number-small';
            numberDiv.textContent = `Cama ${bed.number}`;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'bed-status-small';
            statusDiv.textContent = 'Disponible';
            
            const iconDiv = document.createElement('div');
            iconDiv.className = 'bed-icon-small';
            iconDiv.textContent = '✓';
            
            bedCard.appendChild(numberDiv);
            bedCard.appendChild(statusDiv);
            bedCard.appendChild(iconDiv);
            
            // Solo agregar event listener si está disponible
            bedCard.addEventListener('click', () => confirmarTransferencia(index));
        }
        
        fragment.appendChild(bedCard);
    });
    
    grid.innerHTML = '';
    grid.appendChild(fragment);
}

// Confirmar y ejecutar transferencia
function confirmarTransferencia(camaDestinoIndex) {
    if (currentBedIndex === null) return;
    
    const bedOrigen = beds[currentBedIndex];
    const bedDestino = beds[camaDestinoIndex];
    
    // Verificar que la cama destino esté libre
    if (bedDestino.occupied) {
        mostrarFeedback('⚠️ La cama destino ya está ocupada', 'warning');
        return;
    }
    
    const nombrePaciente = bedOrigen.patientName || 'el paciente';
    
    confirmarAccion(
        `¿Confirma transferir a ${nombrePaciente} de la Cama ${bedOrigen.number} a la Cama ${bedDestino.number}?`,
        () => {
            // Copiar todos los datos del paciente a la cama destino
            beds[camaDestinoIndex] = {
                number: bedDestino.number, // Mantener el número de cama correcto
                occupied: true,
                patientName: bedOrigen.patientName,
                diagnostico: bedOrigen.diagnostico,
                observaciones: bedOrigen.observaciones,
                fechaIngreso: bedOrigen.fechaIngreso,
                tiss: bedOrigen.tiss,
                selectedInterventions: [...bedOrigen.selectedInterventions] // Copia profunda del array
            };
            
            // Liberar la cama original
            beds[currentBedIndex] = {
                number: bedOrigen.number,
                occupied: false,
                patientName: '',
                diagnostico: '',
                observaciones: '',
                fechaIngreso: '',
                tiss: 0,
                selectedInterventions: []
            };
            
            // Guardar cambios
            saveBeds();
            renderBedsGrid();
            
            // Cerrar modales
            cerrarModalTransferencia();
            closeModal();
            
            // Mostrar confirmación
            mostrarFeedback(`✓ Paciente transferido de Cama ${bedOrigen.number} a Cama ${bedDestino.number}`, 'success');
        }
    );
}

// ========================================
// FUNCIONALIDAD DE CONFIGURACIÓN DE CAMAS
// ========================================

// Abrir modal de configuración de capacidad
function openConfigModal() {
    if (!DOMCache.configModal) return;
    
    const totalActual = beds.length;
    const ocupadas = beds.filter(b => b.occupied).length;
    const disponibles = totalActual - ocupadas;
    
    if (DOMCache.numCamasInput) {
        DOMCache.numCamasInput.value = totalActual;
    }
    
    if (DOMCache.configCurrentTotal) {
        DOMCache.configCurrentTotal.textContent = `Camas actuales: ${totalActual}`;
    }
    if (DOMCache.configCurrentOccupied) {
        DOMCache.configCurrentOccupied.textContent = `Ocupadas: ${ocupadas}`;
    }
    if (DOMCache.configCurrentAvailable) {
        DOMCache.configCurrentAvailable.textContent = `Disponibles: ${disponibles}`;
    }
    
    actualizarAdvertenciaConfig();
    DOMCache.configModal.classList.add('active');
}

// Cerrar modal de configuración
function closeConfigModal() {
    if (!DOMCache.configModal) return;
    DOMCache.configModal.classList.remove('active');
}

// Actualizar advertencia si la reducción afectaría camas ocupadas
function actualizarAdvertenciaConfig() {
    if (!DOMCache.numCamasInput || !DOMCache.configWarning) return;
    
    const valor = parseInt(DOMCache.numCamasInput.value) || 0;
    if (valor < beds.length && valor >= MIN_CAMAS) {
        const camasAfectadas = beds.slice(valor).filter(b => b.occupied);
        if (camasAfectadas.length > 0) {
            const numeros = camasAfectadas.map(b => `#${b.number}`).join(', ');
            DOMCache.configWarning.innerHTML = `⚠️ <strong>Atención:</strong> Reducir a ${valor} camas eliminará ${camasAfectadas.length} cama(s) con pacientes (${numeros}).`;
            DOMCache.configWarning.style.display = 'block';
            return;
        }
    }
    DOMCache.configWarning.style.display = 'none';
}

// Ajustar capacidad de camas
function ajustarCapacidadCamas(nuevaCantidad) {
    if (isNaN(nuevaCantidad) || nuevaCantidad < MIN_CAMAS || nuevaCantidad > MAX_CAMAS) {
        mostrarFeedback(`⚠️ La cantidad de camas debe estar entre ${MIN_CAMAS} y ${MAX_CAMAS}`, 'warning');
        return;
    }
    
    const cantidadActual = beds.length;
    if (nuevaCantidad === cantidadActual) {
        closeConfigModal();
        return;
    }
    
    if (nuevaCantidad > cantidadActual) {
        // Agregar nuevas camas vacías
        for (let i = cantidadActual; i < nuevaCantidad; i++) {
            beds.push({
                number: i + 1,
                occupied: false,
                patientName: '',
                diagnostico: '',
                observaciones: '',
                fechaIngreso: '',
                tiss: 0,
                selectedInterventions: []
            });
        }
        previousBedsState = null;
        saveBeds();
        renderBedsGrid();
        closeConfigModal();
        mostrarFeedback(`✓ Capacidad aumentada a ${nuevaCantidad} camas`, 'success');
    } else {
        // Reducir camas: chequear si hay pacientes
        const camasAfectadas = beds.slice(nuevaCantidad).filter(b => b.occupied);
        if (camasAfectadas.length > 0) {
            const listaPacientes = camasAfectadas.map(b => `Cama ${b.number}: ${b.patientName || 'Sin nombre'}`).join('\n');
            confirmarAccion(
                `⚠️ ATENCIÓN: Al reducir la capacidad a ${nuevaCantidad} camas se perderán los siguientes pacientes internados:\n\n${listaPacientes}\n\n¿Desea continuar de todos modos?`,
                () => {
                    beds = beds.slice(0, nuevaCantidad);
                    previousBedsState = null;
                    saveBeds();
                    renderBedsGrid();
                    closeConfigModal();
                    mostrarFeedback(`✓ Capacidad reducida a ${nuevaCantidad} camas`, 'warning');
                }
            );
        } else {
            beds = beds.slice(0, nuevaCantidad);
            previousBedsState = null;
            saveBeds();
            renderBedsGrid();
            closeConfigModal();
            mostrarFeedback(`✓ Capacidad ajustada a ${nuevaCantidad} camas`, 'success');
        }
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar cache de elementos DOM
    DOMCache.init();
    
    // Inicializar Supabase
    await supabaseService.init();
    updateSupabaseStatus();
    
    // Limpiar todos los checkboxes al cargar la página (medida preventiva)
    resetearCheckboxes();
    
    // Cargar y renderizar datos
    await initializeBeds();
    renderBedsGrid();
    
    // Event listeners con verificación de existencia
    const closeModalBtn = document.getElementById('closeModal');
    const cancelarBtn = document.getElementById('cancelarBtn');
    const guardarPacienteBtn = document.getElementById('guardarPacienteBtn');
    const transferirPacienteBtn = document.getElementById('transferirPacienteBtn');
    const liberarCamaBtn = document.getElementById('liberarCamaBtn');
    const limpiarTodoBtn = document.getElementById('limpiarTodoBtn');
    const closeTransferModalBtn = document.getElementById('closeTransferModal');
    const cancelarTransferenciaBtn = document.getElementById('cancelarTransferenciaBtn');
    const imprimirBtn = document.getElementById('imprimirBtn');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelarBtn) cancelarBtn.addEventListener('click', closeModal);
    if (guardarPacienteBtn) guardarPacienteBtn.addEventListener('click', guardarPaciente);
    if (transferirPacienteBtn) transferirPacienteBtn.addEventListener('click', abrirModalTransferencia);
    if (liberarCamaBtn) liberarCamaBtn.addEventListener('click', liberarCama);
    if (limpiarTodoBtn) limpiarTodoBtn.addEventListener('click', limpiarTodo);
    if (closeTransferModalBtn) closeTransferModalBtn.addEventListener('click', cerrarModalTransferencia);
    if (cancelarTransferenciaBtn) cancelarTransferenciaBtn.addEventListener('click', cerrarModalTransferencia);
    if (imprimirBtn) imprimirBtn.addEventListener('click', imprimirReporte);
    
    // Event listeners de Configuración de Capacidad
    if (DOMCache.configCamasBtn) DOMCache.configCamasBtn.addEventListener('click', openConfigModal);
    if (DOMCache.closeConfigModal) DOMCache.closeConfigModal.addEventListener('click', closeConfigModal);
    if (DOMCache.cancelarConfigBtn) DOMCache.cancelarConfigBtn.addEventListener('click', closeConfigModal);
    
    if (DOMCache.guardarCapacidadBtn) {
        DOMCache.guardarCapacidadBtn.addEventListener('click', function() {
            const nuevaCantidad = parseInt(DOMCache.numCamasInput ? DOMCache.numCamasInput.value : 0);
            ajustarCapacidadCamas(nuevaCantidad);
        });
    }
    
    if (DOMCache.btnDecrementarCamas) {
        DOMCache.btnDecrementarCamas.addEventListener('click', function() {
            if (DOMCache.numCamasInput) {
                let val = parseInt(DOMCache.numCamasInput.value) || DEFAULT_NUM_CAMAS;
                if (val > MIN_CAMAS) {
                    DOMCache.numCamasInput.value = val - 1;
                    actualizarAdvertenciaConfig();
                }
            }
        });
    }
    
    if (DOMCache.btnIncrementarCamas) {
        DOMCache.btnIncrementarCamas.addEventListener('click', function() {
            if (DOMCache.numCamasInput) {
                let val = parseInt(DOMCache.numCamasInput.value) || DEFAULT_NUM_CAMAS;
                if (val < MAX_CAMAS) {
                    DOMCache.numCamasInput.value = val + 1;
                    actualizarAdvertenciaConfig();
                }
            }
        });
    }
    
    if (DOMCache.numCamasInput) {
        DOMCache.numCamasInput.addEventListener('input', function() {
            let val = parseInt(this.value);
            if (val > MAX_CAMAS) this.value = MAX_CAMAS;
            actualizarAdvertenciaConfig();
        });
    }
    
    // Cerrar modales al hacer click fuera
    if (DOMCache.transferModal) {
        DOMCache.transferModal.addEventListener('click', function(e) {
            if (e.target === this) cerrarModalTransferencia();
        });
    }
    
    if (DOMCache.patientModal) {
        DOMCache.patientModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
    
    if (DOMCache.configModal) {
        DOMCache.configModal.addEventListener('click', function(e) {
            if (e.target === this) closeConfigModal();
        });
    }
    
    // Event listeners con DOMCache
    if (DOMCache.turnoSelect) {
        DOMCache.turnoSelect.addEventListener('change', function(e) {
            turnoActual = e.target.value;
            updateTurnoDisplay();
            debouncedSaveBeds();
        });
    }
    
    if (DOMCache.enfermerosInput) {
        DOMCache.enfermerosInput.addEventListener('input', function(e) {
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
    }
    
    if (DOMCache.notasTurnoTextarea) {
        DOMCache.notasTurnoTextarea.addEventListener('input', function(e) {
            notasTurno = e.target.value;
            debouncedSaveBeds();
        });
    }
    
    // Delegación de eventos para tabs
    document.querySelector('.tabs-navigation')?.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (!tabBtn) return;
        
        const tabName = tabBtn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        tabBtn.classList.add('active');
        document.querySelector(`.tab-panel[data-tab="${tabName}"]`)?.classList.add('active');
    });
    
    // Delegación de eventos para checkboxes del modal
    document.querySelector('.modal')?.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            updateModalResults();
        }
    });
    
    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        const modalAbierto = DOMCache.patientModal?.classList.contains('active');
        const configModalAbierto = DOMCache.configModal?.classList.contains('active');
        const transferModalAbierto = DOMCache.transferModal?.classList.contains('active');
        
        // ESC para cerrar modales
        if (e.key === 'Escape') {
            if (modalAbierto) closeModal();
            if (configModalAbierto) closeConfigModal();
            if (transferModalAbierto) cerrarModalTransferencia();
        }
        
        // CTRL+ENTER para guardar (solo en modal de paciente)
        if (e.ctrlKey && e.key === 'Enter' && modalAbierto) {
            e.preventDefault();
            guardarPaciente();
        }
        
        // ENTER en modal de configuración de capacidad
        if (e.key === 'Enter' && configModalAbierto) {
            e.preventDefault();
            const nuevaCantidad = parseInt(DOMCache.numCamasInput ? DOMCache.numCamasInput.value : 0);
            ajustarCapacidadCamas(nuevaCantidad);
        }
    });
});

