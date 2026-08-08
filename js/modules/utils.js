// ============================================
// UTILIDADES Y FUNCIONES HELPER
// ============================================

// Utilidad: Formatear números con separadores de miles (optimizado con Intl)
const numberFormatter = new Intl.NumberFormat('es-AR');

export function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return numberFormatter.format(num);
}

// Utilidad: Debounce para optimizar guardado
export function debounce(func, wait) {
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

// Clonación eficiente de objetos (reemplazo de JSON.parse/stringify)
export function cloneBedsState(beds) {
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

// Función utilitaria para calcular días internados
export function calcularDiasInternado(fechaIngreso) {
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

// Sanitizar texto para prevenir XSS
export function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
