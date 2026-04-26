// Gestión de interfaz de usuario y manipulación del DOM
import { appState } from './state.js';
import { BusinessLogic } from './business.js';
import { CONSTANTS } from './constants.js';

export class UIManager {
    // Renderizar grid de camas con actualización diferencial
    static renderBedsGrid() {
        const grid = document.getElementById('bedsGrid');
        
        // Primera renderización o render forzado: crear todos los elementos
        if (!appState.previousBedsState || grid.children.length === 0) {
            grid.innerHTML = '';
            appState.beds.forEach((bed, index) => {
                const bedCard = UIManager.createBedCard(bed, index);
                grid.appendChild(bedCard);
            });
            appState.previousBedsState = JSON.parse(JSON.stringify(appState.beds));
            UIManager.updateGlobalSummary();
            return;
        }
        
        // Renderización diferencial: actualizar solo lo necesario
        appState.beds.forEach((bed, index) => {
            if (BusinessLogic.bedHasChanged(bed, appState.previousBedsState[index])) {
                const existingCard = grid.children[index];
                const newCard = UIManager.createBedCard(bed, index);
                grid.replaceChild(newCard, existingCard);
            }
        });
        
        appState.previousBedsState = JSON.parse(JSON.stringify(appState.beds));
        UIManager.updateGlobalSummary();
    }
    
    // Crear elemento de cama
    static createBedCard(bed, index) {
        const bedCard = document.createElement('div');
        bedCard.className = 'bed-card';
        
        if (bed.occupied) {
            const clase = BusinessLogic.clasificarPaciente(bed.tiss);
            bedCard.classList.add(clase.className);
            
            let diasInternado = '';
            if (bed.fechaIngreso) {
                const dias = BusinessLogic.calcularDiasInternado(bed.fechaIngreso);
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
        
        bedCard.addEventListener('click', () => UIManager.openModal(index));
        return bedCard;
    }
    
    // Actualizar resumen global
    static updateGlobalSummary() {
        const occupied = appState.getOccupiedBeds();
        const tissTotal = appState.getTotalTISS();
        const enfermerosNecesarios = appState.getRequiredNurses();
        
        document.getElementById('camasOcupadas').textContent = `${occupied.length}/${CONSTANTS.TOTAL_BEDS}`;
        document.getElementById('tissTotal').textContent = tissTotal;
        document.getElementById('enfermerosNecesarios').textContent = enfermerosNecesarios;
        document.getElementById('enfermerosEnTurnoDisplay').textContent = appState.enfermerosEnTurno;
        UIManager.updateTurnoDisplay();
        
        // Mostrar nota solo si faltan enfermeros
        const diferencia = appState.enfermerosEnTurno - enfermerosNecesarios;
        const notaDiv = document.getElementById('diferenciaNota');
        if (diferencia < 0 && appState.enfermerosEnTurno > 0) {
            notaDiv.textContent = `(Faltan ${Math.abs(diferencia)} según estimado)`;
        } else {
            notaDiv.textContent = '';
        }
        
        // Mostrar distribución por clases
        const counts = appState.getDistribucionClases();
        const distribucionDiv = document.getElementById('distribucionClases');
        if (distribucionDiv && occupied.length > 0) {
            const partes = [];
            if (counts.clase1 > 0) partes.push(`I: ${counts.clase1}`);
            if (counts.clase2 > 0) partes.push(`II: ${counts.clase2}`);
            if (counts.clase3 > 0) partes.push(`III: ${counts.clase3}`);
            if (counts.clase4 > 0) partes.push(`IV: ${counts.clase4}`);
            distribucionDiv.textContent = partes.length > 0 ? `Distribución: ${partes.join(' | ')}` : '';
        } else if (distribucionDiv) {
            distribucionDiv.textContent = '';
        }
    }
    
    // Actualizar texto del turno
    static updateTurnoDisplay() {
        const turnoDisplayEl = document.getElementById('turnoDisplay');
        if (turnoDisplayEl) {
            const turnoInfo = CONSTANTS.TURNOS[appState.turnoActual];
            turnoDisplayEl.textContent = turnoInfo ? `${turnoInfo.nombre} (${turnoInfo.horario})` : appState.turnoActual;
        }
    }
    
    // Abrir modal de edición de paciente
    static openModal(bedIndex) {
        appState.currentBedIndex = bedIndex;
        const bed = appState.getBed(bedIndex);
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
        
        // Desmarcar todos los checkboxes primero
        const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Si la cama está ocupada, marcar intervenciones guardadas
        if (bed.occupied && bed.selectedInterventions && bed.selectedInterventions.length > 0) {
            checkboxes.forEach(checkbox => {
                const key = checkbox.dataset.points + '-' + checkbox.dataset.category;
                if (bed.selectedInterventions.includes(key)) {
                    checkbox.checked = true;
                }
            });
        }
        
        UIManager.updateModalResults();
        modal.classList.add('active');
    }
    
    // Cerrar modal
    static closeModal() {
        const modal = document.getElementById('patientModal');
        modal.classList.remove('active');
        
        // Limpiar checkboxes
        const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        appState.currentBedIndex = null;
    }
    
    // Calcular puntuación del modal
    static calcularPuntuacionModal() {
        const checkboxes = document.querySelectorAll('.modal input[type="checkbox"]:checked');
        return BusinessLogic.calcularPuntuacionDesdeCheckboxes(checkboxes);
    }
    
    // Actualizar resultados del modal
    static updateModalResults() {
        const puntos = UIManager.calcularPuntuacionModal();
        const clasificacion = BusinessLogic.clasificarPaciente(puntos);
        
        document.getElementById('scoreNumber').textContent = puntos;
        
        const classificationDiv = document.getElementById('classification');
        classificationDiv.className = `classification-modal ${clasificacion.color}`;
        classificationDiv.innerHTML = `
            <h3 style="color: inherit; margin-bottom: 0.25rem;">${clasificacion.nombre}</h3>
            <p style="margin: 0.15rem 0;"><strong>Rango:</strong> ${clasificacion.rango}</p>
            <p style="margin: 0.25rem 0 0 0; font-weight: 700;"><strong>Ratio:</strong> ${clasificacion.ratioTexto}</p>
        `;
    }
    
    // Actualizar estado de conexión Supabase
    static updateSupabaseStatus() {
        const statusDiv = document.getElementById('supabaseStatus');
        const statusIcon = document.getElementById('supabaseStatusIcon');
        const statusText = document.getElementById('supabaseStatusText');
        
        if (!statusDiv || !statusIcon || !statusText) return;
        
        if (window.supabaseService.isOnline()) {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#d4edda';
            statusDiv.style.color = '#155724';
            statusIcon.textContent = '✅';
            statusText.textContent = 'Conectado a Supabase - Datos sincronizados';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            statusDiv.style.display = 'block';
            statusDiv.style.backgroundColor = '#fff3cd';
            statusDiv.style.color = '#856404';
            statusIcon.textContent = '📴';
            statusText.textContent = 'Modo offline - Datos guardados localmente';
        }
    }
}
