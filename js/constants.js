// Constantes del sistema TISS
export const CONSTANTS = {
    TOTAL_BEDS: 22,
    DEBOUNCE_DELAY: 800,
    AUTO_SAVE_INTERVAL: 60000, // 1 minuto
    
    TURNOS: {
        mañana: { nombre: 'Mañana', horario: '7-14hs' },
        tarde: { nombre: 'Tarde', horario: '14-21hs' },
        noche: { nombre: 'Noche', horario: '21-07hs' },
        franquero: { nombre: 'Franquero', horario: '7-21hs' }
    },
    
    CLASIFICACIONES: {
        clase1: {
            nombre: "Clase I",
            rango: "< 10 puntos",
            rangoMin: 0,
            rangoMax: 9,
            ratio: 0.25,
            ratioTexto: "1:4",
            color: "class-1",
            className: "clase1"
        },
        clase2: {
            nombre: "Clase II",
            rango: "10-19 puntos",
            rangoMin: 10,
            rangoMax: 19,
            ratio: 1/3,
            ratioTexto: "1:3",
            color: "class-2",
            className: "clase2"
        },
        clase3: {
            nombre: "Clase III",
            rango: "20-39 puntos",
            rangoMin: 20,
            rangoMax: 39,
            ratio: 0.5,
            ratioTexto: "1:2",
            color: "class-3",
            className: "clase3"
        },
        clase4: {
            nombre: "Clase IV",
            rango: "≥ 40 puntos",
            rangoMin: 40,
            rangoMax: Infinity,
            ratio: 1,
            ratioTexto: "1:1",
            color: "class-4",
            className: "clase4"
        }
    }
};

// Estructura de datos de cama vacía
export function createEmptyBed(number) {
    return {
        number: number,
        occupied: false,
        patientName: '',
        diagnostico: '',
        observaciones: '',
        fechaIngreso: '',
        tiss: 0,
        selectedInterventions: []
    };
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
