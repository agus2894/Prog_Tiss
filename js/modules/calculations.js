// ============================================
// CÁLCULOS TISS Y CLASIFICACIÓN
// ============================================

import { clasificaciones } from './constants.js';

// Función para clasificar según puntos
export function clasificarPaciente(puntos) {
    if (puntos < 10) return clasificaciones.clase1;
    if (puntos >= 10 && puntos < 20) return clasificaciones.clase2;
    if (puntos >= 20 && puntos < 40) return clasificaciones.clase3;
    return clasificaciones.clase4;
}

// Calcular enfermeros necesarios basado en camas ocupadas
export function calcularEnfermerosNecesarios(beds) {
    const occupied = beds.filter(b => b.occupied);
    let enfermerosNecesarios = 0;
    
    occupied.forEach(bed => {
        const clase = clasificarPaciente(bed.tiss);
        enfermerosNecesarios += clase.ratio;
    });
    
    return Math.ceil(enfermerosNecesarios);
}

// Calcular TISS total
export function calcularTISSTotal(beds) {
    const occupied = beds.filter(b => b.occupied);
    return occupied.reduce((sum, b) => sum + b.tiss, 0);
}

// Calcular distribución de clases
export function calcularDistribucionClases(beds) {
    const occupied = beds.filter(b => b.occupied);
    const counts = { clase1: 0, clase2: 0, clase3: 0, clase4: 0 };
    
    occupied.forEach(bed => {
        if (bed.tiss < 10) counts.clase1++;
        else if (bed.tiss < 20) counts.clase2++;
        else if (bed.tiss < 40) counts.clase3++;
        else counts.clase4++;
    });
    
    return counts;
}
