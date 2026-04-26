// Capa de persistencia - Integración con Supabase y localStorage
import { appState } from './state.js';

export class StorageService {
    constructor() {
        this.supabaseService = window.supabaseService;
    }
    
    // Guardar estado completo
    async save() {
        appState.saveStatus = 'saving';
        this.updateSaveIndicator();
        
        try {
            const result = await this.supabaseService.saveBeds(
                appState.beds,
                appState.turnoActual,
                appState.enfermerosEnTurno,
                appState.notasTurno
            );
            
            if (!result.success) {
                console.warn('Usando almacenamiento local como respaldo');
            }
            
            appState.saveStatus = 'saved';
            this.updateSaveIndicator();
            
            return result;
        } catch (error) {
            console.error('Error guardando datos:', error);
            appState.saveStatus = 'saved'; // Marcar como saved de todos modos
            this.updateSaveIndicator();
            
            if (error.name === 'QuotaExceededError') {
                this.showFeedback('⚠️ Memoria llena. Libere camas antiguas.', 'warning');
            }
            
            throw error;
        }
    }
    
    // Cargar estado
    async load() {
        const data = await this.supabaseService.loadBeds();
        appState.loadFromData(data);
        return data;
    }
    
    // Actualizar indicador visual de guardado
    updateSaveIndicator() {
        const indicator = document.getElementById('saveIndicator');
        if (!indicator) return;
        
        const estados = {
            saved: { text: '✓ Guardado', class: 'saved' },
            saving: { text: '⏳ Guardando...', class: 'saving' },
            pending: { text: '⋯ Pendiente', class: 'pending' }
        };
        
        const estado = estados[appState.saveStatus];
        indicator.textContent = estado.text;
        indicator.className = `save-indicator ${estado.class}`;
    }
    
    // Mostrar feedback visual temporal
    showFeedback(mensaje, tipo = 'success') {
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
}

// Instancia global
export const storageService = new StorageService();
