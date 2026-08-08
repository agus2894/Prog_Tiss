// ============================================
// CONSTANTES Y CLASIFICACIONES TISS
// ============================================

// Clasificaciones TISS
export const clasificaciones = {
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

// Número de camas en la UTI
export const NUM_CAMAS = 22;

// Estados de guardado
export const SAVE_STATUS = {
    SAVED: 'saved',
    SAVING: 'saving',
    PENDING: 'pending'
};

// Tiempos de debounce
export const DEBOUNCE_SAVE_TIME = 800; // ms

// Configuración de retry
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    BASE_WAIT_TIME: 1000, // ms
    MAX_WAIT_TIME: 5000 // ms
};
