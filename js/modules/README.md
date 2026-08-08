# 📁 Estructura Modular del JavaScript

## 🎯 Objetivo

Esta carpeta contiene módulos JavaScript ES6 que organizan el código del sistema TISS en componentes lógicos y reutilizables, mejorando la mantenibilidad y escalabilidad del proyecto.

---

## 📦 Módulos Disponibles

### **1. `constants.js`**
**Responsabilidad**: Constantes y configuraciones globales

**Exports**:
- `clasificaciones`: Objeto con las 4 clases TISS (I, II, III, IV)
- `NUM_CAMAS`: Número de camas en la UTI (22)
- `SAVE_STATUS`: Estados de guardado (saved, saving, pending)
- `DEBOUNCE_SAVE_TIME`: Tiempo de debounce para guardado automático
- `RETRY_CONFIG`: Configuración de reintentos para Supabase

**Uso**:
```javascript
import { clasificaciones, NUM_CAMAS } from './modules/constants.js';
```

---

### **2. `utils.js`**
**Responsabilidad**: Funciones utilitarias y helpers

**Exports**:
- `formatNumber(num)`: Formatea números con separadores (optimizado con Intl)
- `debounce(func, wait)`: Implementación de debounce
- `cloneBedsState(beds)`: Clonación eficiente de estado de camas
- `calcularDiasInternado(fechaIngreso)`: Calcula días de internación
- `sanitizeHTML(text)`: Sanitiza texto para prevenir XSS

**Uso**:
```javascript
import { formatNumber, debounce } from './modules/utils.js';

const formattedNum = formatNumber(1234); // "1.234"
const debouncedSave = debounce(saveBeds, 800);
```

---

### **3. `calculations.js`**
**Responsabilidad**: Cálculos TISS y clasificaciones

**Exports**:
- `clasificarPaciente(puntos)`: Clasifica paciente según puntaje TISS
- `calcularEnfermerosNecesarios(beds)`: Calcula enfermeros requeridos
- `calcularTISSTotal(beds)`: Suma total de puntos TISS
- `calcularDistribucionClases(beds)`: Distribución de pacientes por clase

**Uso**:
```javascript
import { clasificarPaciente, calcularTISSTotal } from './modules/calculations.js';

const clase = clasificarPaciente(25); // Retorna clase3
const total = calcularTISSTotal(beds); // Suma de todos los TISS
```

---

### **4. `dom-cache.js`**
**Responsabilidad**: Cache de elementos DOM para optimización

**Exports**:
- `DOMCache`: Objeto singleton con referencias a elementos DOM
  - `init()`: Inicializa todas las referencias
  - `getModalCheckboxes()`: Obtiene checkboxes frescos del modal
  - `invalidateCheckboxCache()`: Invalida caché de checkboxes

**Uso**:
```javascript
import { DOMCache } from './modules/dom-cache.js';

// Al cargar la página
DOMCache.init();

// Usar elementos cacheados
DOMCache.bedsGrid.innerHTML = '';
DOMCache.saveIndicator.textContent = 'Guardado';
```

**Beneficio**: Evita múltiples llamadas a `document.getElementById()` mejorando el rendimiento.

---

### **5. `ui-feedback.js`**
**Responsabilidad**: Feedback visual y notificaciones

**Exports**:
- `mostrarFeedback(mensaje, tipo)`: Muestra toast notifications
- `confirmarAccion(mensaje, callback)`: Confirmación de acciones
- `updateSaveIndicator(saveStatus)`: Actualiza indicador de guardado
- `updateSupabaseStatus(isOnline)`: Actualiza estado de conexión

**Uso**:
```javascript
import { mostrarFeedback, confirmarAccion } from './modules/ui-feedback.js';

mostrarFeedback('✓ Paciente guardado correctamente', 'success');
mostrarFeedback('⚠️ Error de conexión', 'warning');

confirmarAccion('¿Seguro de eliminar?', () => {
    // Acción confirmada
});
```

---

## 🚀 Cómo Usar los Módulos

### **Opción 1: Migración Gradual** (Recomendada)

Puedes mantener `script.js` actual y gradualmente reemplazar partes del código con imports:

```javascript
// Al inicio de script.js
import { clasificaciones, NUM_CAMAS } from './js/modules/constants.js';
import { formatNumber, debounce } from './js/modules/utils.js';
import { DOMCache } from './js/modules/dom-cache.js';

// Usar las funciones importadas en lugar de las locales
// (comentar o eliminar las definiciones duplicadas)
```

### **Opción 2: Refactorización Completa**

Crear un nuevo archivo principal que importe y orqueste todos los módulos:

```javascript
// js/main.js
import { DOMCache } from './modules/dom-cache.js';
import { initializeBeds, renderBedsGrid } from './modules/beds-manager.js';
import { openModal, closeModal } from './modules/modal-handler.js';
import { updateSupabaseStatus } from './modules/ui-feedback.js';

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    DOMCache.init();
    await supabaseService.init();
    updateSupabaseStatus(supabaseService.isOnline());
    await initializeBeds();
    renderBedsGrid();
    setupEventListeners();
});
```

---

## 📝 Ventajas de la Modularización

✅ **Mantenibilidad**: Código organizado y fácil de encontrar  
✅ **Reutilización**: Funciones compartidas entre diferentes partes  
✅ **Testing**: Módulos pueden ser testeados unitariamente  
✅ **Performance**: Import solo lo que necesitas  
✅ **Escalabilidad**: Agregar features sin tocar código existente  
✅ **Colaboración**: Múltiples desarrolladores sin conflictos  

---

## 🔄 Estado de Migración

**Módulos Creados**: ✅ 5/5  
**Integración con script.js**: ⚠️ Pendiente  

### Próximos Pasos:

1. ✅ Crear módulos base (completado)
2. ⏳ Crear `beds-manager.js` (gestión de camas)
3. ⏳ Crear `modal-handler.js` (lógica del modal)
4. ⏳ Actualizar `script.js` para usar imports
5. ⏳ Actualizar `index.html` para usar `type="module"`
6. ⏳ Testing completo de la migración

---

## 🔗 Compatibilidad

Los módulos ES6 requieren:
- ✅ Navegadores modernos (Chrome 61+, Firefox 60+, Safari 11+, Edge 16+)
- ✅ Servidor HTTP (no funcionan con file://)
- ✅ Etiqueta `<script type="module">` en HTML

---

## 📚 Recursos

- [MDN - JavaScript Modules](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [ES6 Import/Export](https://javascript.info/import-export)
