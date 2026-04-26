// Gestión centralizada del estado de la aplicación
import { CONSTANTS, createEmptyBed } from './constants.js';

class AppState {
    constructor() {
        this.beds = [];
        this.turnoActual = 'mañana';
        this.enfermerosEnTurno = 0;
        this.notasTurno = '';
        this.currentBedIndex = null;
        this.previousBedsState = null;
        this.saveStatus = 'saved'; // Estados: 'saved', 'saving', 'pending'
    }
    
    // Inicializar camas vacías
    initializeBeds() {
        this.beds = Array.from(
            { length: CONSTANTS.TOTAL_BEDS }, 
            (_, i) => createEmptyBed(i + 1)
        );
    }
    
    // Obtener cama por índice
    getBed(index) {
        return this.beds[index];
    }
    
    // Actualizar cama
    updateBed(index, bedData) {
        this.beds[index] = { ...this.beds[index], ...bedData };
    }
    
    // Liberar cama
    freeBed(index) {
        this.beds[index] = createEmptyBed(this.beds[index].number);
    }
    
    // Liberar todas las camas
    clearAllBeds() {
        this.initializeBeds();
        this.previousBedsState = null; // Forzar render completo
    }
    
    // Obtener camas ocupadas
    getOccupiedBeds() {
        return this.beds.filter(bed => bed.occupied);
    }
    
    // Calcular TISS total
    getTotalTISS() {
        return this.getOccupiedBeds().reduce((sum, bed) => sum + bed.tiss, 0);
    }
    
    // Calcular enfermeros necesarios
    getRequiredNurses() {
        let total = 0;
        this.getOccupiedBeds().forEach(bed => {
            const clase = this.clasificarPaciente(bed.tiss);
            total += clase.ratio;
        });
        return Math.ceil(total);
    }
    
    // Clasificar paciente según puntos TISS
    clasificarPaciente(puntos) {
        if (puntos < 10) return CONSTANTS.CLASIFICACIONES.clase1;
        if (puntos >= 10 && puntos < 20) return CONSTANTS.CLASIFICACIONES.clase2;
        if (puntos >= 20 && puntos < 40) return CONSTANTS.CLASIFICACIONES.clase3;
        return CONSTANTS.CLASIFICACIONES.clase4;
    }
    
    // Obtener distribución de camas por clase
    getDistribucionClases() {
        const counts = { clase1: 0, clase2: 0, clase3: 0, clase4: 0 };
        this.getOccupiedBeds().forEach(bed => {
            if (bed.tiss < 10) counts.clase1++;
            else if (bed.tiss < 20) counts.clase2++;
            else if (bed.tiss < 40) counts.clase3++;
            else counts.clase4++;
        });
        return counts;
    }
    
    // Cargar estado desde datos externos
    loadFromData(data) {
        if (data.beds && data.beds.length > 0) {
            this.beds = data.beds;
        }
        if (data.turno) {
            this.turnoActual = data.turno;
        }
        if (data.enfermeros !== undefined) {
            this.enfermerosEnTurno = data.enfermeros;
        }
        if (data.notas) {
            this.notasTurno = data.notas;
        }
        
        // Forzar render completo en la primera carga
        this.previousBedsState = null;
    }
}

// Instancia singleton
export const appState = new AppState();
