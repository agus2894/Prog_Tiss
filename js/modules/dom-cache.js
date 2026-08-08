// ============================================
// CACHE DE ELEMENTOS DOM
// ============================================

// Cache de elementos DOM (optimización de rendimiento)
export const DOMCache = {
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
