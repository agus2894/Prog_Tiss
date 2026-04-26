// Punto de entrada y coordinación de la aplicación
import { appState } from './state.js';
import { storageService } from './storage.js';
import { UIManager } from './ui.js';
import { BusinessLogic } from './business.js';
import { CONSTANTS, debounce } from './constants.js';

class App {
    constructor() {
        this.storage = storageService;
        // Crear versión debounced del guardado
        this.debouncedSave = debounce(async () => {
            appState.saveStatus = 'pending';
            this.storage.updateSaveIndicator();
            await this.storage.save();
        }, CONSTANTS.DEBOUNCE_DELAY);
    }
    
    async init() {
        // Inicializar Supabase
        await window.supabaseService.init();
        UIManager.updateSupabaseStatus();
        
        // Cargar datos
        appState.initializeBeds();
        await this.storage.load();
        
        // Renderizar UI inicial
        UIManager.renderBedsGrid();
        UIManager.updateTurnoDisplay();
        this.storage.updateSaveIndicator();
        
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Cambio de turno
        document.getElementById('turnoSelect').addEventListener('change', (e) => {
            appState.turnoActual = e.target.value;
            UIManager.updateTurnoDisplay();
            this.debouncedSave();
        });
        
        // Cambio de enfermeros
        document.getElementById('enfermerosEnTurno').addEventListener('input', (e) => {
            let valor = parseInt(e.target.value) || 0;
            if (valor < 0) {
                valor = 0;
                e.target.value = 0;
            }
            appState.enfermerosEnTurno = valor;
            UIManager.updateGlobalSummary();
            this.debouncedSave();
        });
        
        // Notas del turno
        document.getElementById('notasTurno').addEventListener('input', (e) => {
            appState.notasTurno = e.target.value;
            this.debouncedSave();
        });
        
        // Modal - Cerrar
        document.getElementById('closeModal').addEventListener('click', () => UIManager.closeModal());
        document.getElementById('cancelarBtn').addEventListener('click', () => UIManager.closeModal());
        
        // Modal - Guardar paciente
        document.getElementById('guardarPacienteBtn').addEventListener('click', () => this.guardarPaciente());
        
        // Modal - Liberar cama
        document.getElementById('liberarCamaBtn').addEventListener('click', () => this.liberarCama());
        
        // Botón limpiar todo
        document.getElementById('limpiarTodoBtn').addEventListener('click', () => this.limpiarTodo());
        
        // Botón imprimir
        document.getElementById('imprimirBtn').addEventListener('click', () => window.print());
        
        // Cerrar modal al hacer clic fuera
        document.getElementById('patientModal').addEventListener('click', function(e) {
            if (e.target === this) UIManager.closeModal();
        });
        
        // Tabs del modal
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
        
        // Checkboxes del modal - actualizar resultados
        const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => UIManager.updateModalResults());
        });
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    async guardarPaciente() {
        if (appState.currentBedIndex === null) return;
        
        const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]:checked');
        
        // Recopilar datos del formulario
        const data = {
            patientName: document.getElementById('patientName').value.trim(),
            diagnostico: document.getElementById('diagnostico').value.trim(),
            observaciones: document.getElementById('observaciones').value.trim(),
            fechaIngreso: document.getElementById('fechaIngreso').value,
            tiss: BusinessLogic.calcularPuntuacionDesdeCheckboxes(checkboxes),
            selectedInterventions: BusinessLogic.obtenerIntervencionesSeleccionadas(checkboxes),
            occupied: true
        };
        
        // Validar
        const validation = BusinessLogic.validarPaciente(data);
        if (!validation.valid) {
            this.storage.showFeedback(validation.errors[0], 'warning');
            return;
        }
        
        // Establecer fecha por defecto si no hay
        if (!data.fechaIngreso && data.occupied) {
            data.fechaIngreso = new Date().toISOString().split('T')[0];
        }
        
        // Actualizar estado
        appState.updateBed(appState.currentBedIndex, data);
        
        // Guardar y actualizar UI
        await this.storage.save();
        UIManager.renderBedsGrid();
        this.storage.showFeedback('✓ Paciente guardado correctamente');
        UIManager.closeModal();
    }
    
    async liberarCama() {
        if (appState.currentBedIndex === null) return;
        
        const bed = appState.getBed(appState.currentBedIndex);
        const confirmMsg = `¿Está seguro de liberar la Cama ${bed.number}${bed.patientName ? ` (${bed.patientName})` : ''}?\n\nEsta acción no se puede deshacer.`;
        
        if (confirm(confirmMsg)) {
            appState.freeBed(appState.currentBedIndex);
            await this.storage.save();
            UIManager.renderBedsGrid();
            this.storage.showFeedback('✓ Cama liberada correctamente');
            UIManager.closeModal();
        }
    }
    
    async limpiarTodo() {
        if (confirm('¿Está seguro de liberar TODAS las camas? Esta acción no se puede deshacer.')) {
            appState.clearAllBeds();
            await this.storage.save();
            UIManager.renderBedsGrid();
            this.storage.showFeedback('✓ Todas las camas liberadas');
        }
    }
    
    handleKeyboard(e) {
        const modalAbierto = document.getElementById('patientModal').classList.contains('active');
        
        // ESC para cerrar modal
        if (e.key === 'Escape' && modalAbierto) {
            UIManager.closeModal();
        }
        
        // CTRL+ENTER para guardar
        if (e.ctrlKey && e.key === 'Enter' && modalAbierto) {
            e.preventDefault();
            this.guardarPaciente();
        }
    }
}

// Inicializar aplicación cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
