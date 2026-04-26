// Lógica de negocio pura del sistema TISS
import { CONSTANTS } from './constants.js';

export class BusinessLogic {
    // Clasificar paciente según puntos TISS
    static clasificarPaciente(puntos) {
        if (puntos < 10) return CONSTANTS.CLASIFICACIONES.clase1;
        if (puntos >= 10 && puntos < 20) return CONSTANTS.CLASIFICACIONES.clase2;
        if (puntos >= 20 && puntos < 40) return CONSTANTS.CLASIFICACIONES.clase3;
        return CONSTANTS.CLASIFICACIONES.clase4;
    }
    
    // Calcular días internado
    static calcularDiasInternado(fechaIngreso) {
        if (!fechaIngreso) return null;
        try {
            const ingreso = new Date(fechaIngreso + 'T00:00:00');
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const dias = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24));
            return dias >= 0 ? dias : 0;
        } catch (e) {
            console.error('Error calculando días:', e);
            return null;
        }
    }
    
    // Calcular puntuación desde checkboxes
    static calcularPuntuacionDesdeCheckboxes(checkboxes) {
        let total = 0;
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += parseInt(checkbox.dataset.points);
            }
        });
        return total;
    }
    
    // Obtener intervenciones seleccionadas
    static obtenerIntervencionesSeleccionadas(checkboxes) {
        return Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.points + '-' + cb.dataset.category);
    }
    
    // Validar datos de paciente
    static validarPaciente(data) {
        const errors = [];
        
        if (!data.patientName.trim() && data.tiss === 0) {
            errors.push('Debe ingresar al menos el nombre del paciente o seleccionar intervenciones');
        }
        
        if (data.fechaIngreso) {
            const fecha = new Date(data.fechaIngreso);
            const hoy = new Date();
            if (fecha > hoy) {
                errors.push('La fecha de ingreso no puede ser futura');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    // Verificar si una cama cambió (para renderizado diferencial)
    static bedHasChanged(bed, previousBed) {
        if (!previousBed) return true;
        
        return bed.occupied !== previousBed.occupied ||
               bed.patientName !== previousBed.patientName ||
               bed.tiss !== previousBed.tiss ||
               bed.fechaIngreso !== previousBed.fechaIngreso;
    }
    
    // Sanitizar texto (prevención básica de XSS)
    static sanitizeText(text) {
        if (!text) return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
