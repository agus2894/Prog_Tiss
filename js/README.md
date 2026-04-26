# Estructura de Módulos - Sistema TISS UTI

Esta carpeta contiene la aplicación refactorizada en módulos especializados.

## Arquitectura

La aplicación está organizada en 6 módulos con responsabilidades bien definidas:

### 📋 `constants.js`
**Propósito:** Configuración y valores constantes
- Definición de clasificaciones TISS
- Configuración de turnos
- Constantes del sistema (número de camas, delays, etc.)
- Función `createEmptyBed()` para estructura de datos
- Función `debounce()` utilitaria

### 🗄️ `state.js`
**Propósito:** Gestión centralizada del estado global
- Clase `AppState` que encapsula todo el estado
- Camas, turno actual, enfermeros, notas
- Métodos para manipular el estado (getBed, updateBed, freeBed, etc.)
- Cálculos basados en estado (TISS total, enfermeros necesarios)
- Instancia singleton `appState`

### 🧮 `business.js`
**Propósito:** Lógica de negocio pura (sin efectos secundarios)
- Clase `BusinessLogic` con métodos estáticos
- Clasificación de pacientes según TISS
- Cálculo de días internados
- Validación de datos de paciente
- Comparación de camas (para renderizado diferencial)
- Sanitización básica de texto

### 💾 `storage.js`
**Propósito:** Capa de persistencia
- Clase `StorageService` para interacción con Supabase/localStorage
- Métodos `save()` y `load()`
- Manejo de indicadores de guardado
- Feedback visual (toasts)
- Instancia singleton `storageService`

### 🎨 `ui.js`
**Propósito:** Manipulación del DOM y renderizado
- Clase `UIManager` con métodos estáticos
- Renderizado diferencial del grid de camas
- Creación de elementos de cama
- Gestión del modal
- Actualización de resumen global
- Todas las interacciones visuales

### 🚀 `app.js`
**Propósito:** Coordinación y punto de entrada
- Clase `App` que inicializa y coordina todo
- Configuración de event listeners
- Manejo de acciones del usuario (guardar, liberar, etc.)
- Atajos de teclado
- Inicialización en `DOMContentLoaded`

## Flujo de Datos

```
Usuario interactúa con UI
         ↓
    app.js (event listeners)
         ↓
    state.js (actualiza estado)
         ↓
    storage.js (persiste cambios)
         ↓
    ui.js (actualiza visualización)
```

## Beneficios de esta Arquitectura

✅ **Separación de Responsabilidades:** Cada módulo tiene un propósito claro
✅ **Mantenibilidad:** Fácil localizar y modificar funcionalidad específica
✅ **Testeable:** Lógica de negocio aislada, fácil de testear
✅ **Escalable:** Agregar funcionalidades sin afectar otros módulos
✅ **Reutilizable:** Componentes pueden usarse independientemente
✅ **Legible:** Código organizado y documentado

## Migración desde script.js

El archivo `script.js.backup` contiene el código original como respaldo.
La funcionalidad es idéntica, solo la estructura cambió.

## Próximos Pasos Sugeridos

1. **Testing:** Agregar tests unitarios para `business.js` y `state.js`
2. **TypeScript:** Migrar a TypeScript para type safety
3. **Documentación:** Agregar JSDoc comments en funciones públicas
4. **Performance:** Agregar métricas de rendimiento
5. **Features:** Nuevas funcionalidades más fáciles de implementar ahora
