# 📋 Mejoras Futuras - Sistema TISS UTI

Este documento contiene propuestas de mejoras para implementar en futuras versiones del sistema.

---

## 🎨 MEJORAS VISUALES/UX

### 1️⃣ Búsqueda/Filtro Rápido de Camas ⭐
**Impacto:** Alto | **Complejidad:** Baja | **Tiempo estimado:** 1-2 horas

**Descripción:**
Campo de búsqueda arriba del grid de camas que permite filtrar en tiempo real por:
- Nombre del paciente
- Número de cama
- Clase TISS (I, II, III, IV)
- Diagnóstico

**Funcionalidad:**
```
[🔍 Buscar paciente, cama o clase...]
```
- Búsqueda incremental (mientras escribes)
- Oculta camas que no coinciden con fade-out
- Resalta coincidencias con highlight
- Botón "X" para limpiar búsqueda
- Contador: "Mostrando 3 de 22 camas"

**Beneficio:** Encontrar rápidamente un paciente específico entre 22 camas ocupadas

**Implementación:**
- HTML: Input de búsqueda con ícono
- CSS: Animaciones fade-out, highlight
- JS: ~50 líneas (filtrado de array, actualización DOM)

---

### 2️⃣ Indicador Visual de Capacidad ⭐⭐⭐
**Impacto:** Alto | **Complejidad:** Media | **Tiempo estimado:** 2-3 horas

**Descripción:**
Barras de progreso visuales en el header del sistema que muestran de forma gráfica:

1. **Ocupación de Camas:**
```
Ocupación: ████████░░░░░░░░ 10/22 (45%)
```

2. **Disponibilidad de Personal:**
```
Personal:  ████░░░░░░░░░░░░ 4/7 enfermeros necesarios
```

**Código de colores:**
- 🟢 Verde: < 70% ocupación (situación óptima)
- 🟡 Amarillo: 70-85% (alerta temprana)
- 🔴 Rojo: > 85% (saturación)

**Beneficio:** Vista rápida de la situación general del turno, ideal para coordinadores

**Implementación:**
- HTML: Elementos de barra de progreso
- CSS: Animaciones de llenado, transiciones de color
- JS: ~100 líneas (cálculos, actualización dinámica)

---

### 3️⃣ Atajos de Teclado Completos ⭐
**Impacto:** Medio | **Complejidad:** Baja | **Tiempo estimado:** 1 hora

**Descripción:**
Sistema completo de atajos de teclado para usuarios expertos.

**Atajos actuales:**
- `ESC`: Cerrar modal
- `Ctrl+Enter`: Guardar paciente

**Nuevos atajos propuestos:**
- `Ctrl+F`: Focus en búsqueda
- `Ctrl+S`: Guardar manual (forzar guardado inmediato)
- `Ctrl+1` a `Ctrl+9`: Abrir camas 1-9
- `Ctrl+0`: Abrir cama 10
- `/`: Focus rápido en campo de búsqueda
- `N`: Nueva cama (siguiente disponible)
- `Tab/Shift+Tab`: Navegación mejorada entre tabs del modal

**Beneficio:** Usuarios expertos pueden trabajar más rápido sin usar el mouse

**Implementación:**
- JS: ~60 líneas (event listeners, prevención de defaults)
- Tooltip de ayuda: "Presiona ? para ver atajos"

---

### 4️⃣ Historial de Actividad del Turno ⭐⭐
**Impacto:** Medio | **Complejidad:** Media | **Tiempo estimado:** 3-4 horas

**Descripción:**
Panel colapsable que registra todas las acciones del turno actual:

```
📋 Actividad del Turno (Expandir/Colapsar)
─────────────────────────────────────────
• 14:30 - Cama 3: Ingreso Juan Pérez (Clase III, 25 pts)
• 15:15 - Cama 7: Alta María López (Clase II, 15 pts)
• 15:45 - Cama 3: Actualización TISS 25 → 28 pts
• 16:00 - Enfermeros: 5 → 6
• 16:20 - Cama 12: Ingreso Ana García (Clase IV, 42 pts)
```

**Funcionalidades:**
- Registro automático de todas las acciones
- Timestamps precisos
- Filtros por tipo de evento (ingresos, altas, actualizaciones)
- Exportable a texto plano
- Se limpia al cambiar de turno

**Beneficio:** Auditoría, trazabilidad, pase de turno más completo

**Implementación:**
- HTML: Panel colapsable con lista
- CSS: Estilos de timeline
- JS: ~150 líneas (logging, persistencia, filtrado)
- Supabase: Nueva tabla `shift_activity_log`

---

## 🚀 MEJORAS DE RENDIMIENTO/MEMORIA

### 5️⃣ Limpieza Automática de Datos Antiguos ⭐⭐
**Impacto:** Medio | **Complejidad:** Baja | **Tiempo estimado:** 2 horas

**Descripción:**
Sistema de gestión de almacenamiento que previene errores de cuota excedida.

**Funcionalidades:**
1. Detectar cuando localStorage está > 80% lleno
2. Mostrar advertencia: "⚠️ Almacenamiento local casi lleno"
3. Botón "🗑️ Liberar Memoria" que:
   - Muestra lista de datos > 30 días
   - Permite seleccionar qué eliminar
   - Confirma antes de borrar
   - Mantiene datos en Supabase (solo limpia local)

**Beneficio:** Prevenir pérdida de datos por QuotaExceededError

**Implementación:**
- JS: ~100 líneas (cálculo de uso, interfaz de limpieza)
- Modal de gestión de almacenamiento

---

### 6️⃣ Caché de Clasificaciones ⭐
**Impacto:** Bajo | **Complejidad:** Muy Baja | **Tiempo estimado:** 30 min

**Descripción:**
Micro-optimización para evitar recálculo de clasificaciones.

**Cambio:**
```javascript
// Antes: Calcular en cada render
const clase = clasificarPaciente(bed.tiss);

// Después: Guardar en la cama
bed.clasificacionCache = clasificarPaciente(bed.tiss);
// Invalidar solo cuando cambia bed.tiss
```

**Beneficio:** Reducción de ~15% en tiempo de render del grid

**Implementación:**
- JS: ~20 líneas (cache + invalidación)

---

### 7️⃣ PWA Completa (Progressive Web App) ⭐⭐⭐
**Impacto:** Alto | **Complejidad:** Media | **Tiempo estimado:** 4-6 horas

**Descripción:**
Convertir la aplicación en PWA instalable con funcionalidad offline completa.

**Características:**
1. **Service Worker:** Caché de todos los assets (HTML, CSS, JS)
2. **Manifest:** Icono instalable en móvil/escritorio
3. **Offline-first:** Funciona 100% sin conexión
4. **Sincronización:** Background sync cuando vuelve conexión
5. **Notificaciones push (opcional):** Alertas de cambios

**Ventajas:**
- Icono en escritorio/home screen
- Funciona en áreas sin WiFi
- Carga instantánea (todo en caché)
- Se siente como app nativa

**Implementación:**
- `service-worker.js`: ~200 líneas
- `manifest.json`: Configuración PWA
- Iconos en múltiples tamaños (192x192, 512x512)
- JS: Lógica de sincronización ~100 líneas

---

## 📊 MEJORAS FUNCIONALES

### 8️⃣ Exportar a Excel/CSV ⭐⭐
**Impacto:** Alto | **Complejidad:** Baja | **Tiempo estimado:** 1-2 horas

**Descripción:**
Botón de exportación que genera archivo descargable con datos del turno.

**Formatos:**
1. **CSV** (Excel-compatible):
```csv
Cama,Paciente,Diagnóstico,TISS,Clase,Días,Ratio,Fecha Ingreso
1,Juan Pérez,SDRA,25,III,3,1:2,2026-04-23
2,María López,Post-quirúrgico,15,II,1,1:3,2026-04-25
...
```

2. **Excel** (con formato):
- Colores por clase
- Totales al final
- Gráfico de distribución

**Funcionalidades:**
- Botón "📥 Exportar" junto a Imprimir
- Menú: CSV / Excel / PDF (futuro)
- Nombre automático: `TISS_UTI_Mañana_2026-04-26.csv`
- Incluye metadatos: turno, fecha, enfermeros

**Beneficio:** Reportes para dirección, análisis estadístico, auditorías

**Implementación:**
- JS: ~80 líneas para CSV
- Librería opcional: SheetJS para Excel con formato
- HTML: Botón + menú desplegable

---

### 9️⃣ Plantillas de Intervenciones Frecuentes ⭐⭐
**Impacto:** Medio | **Complejidad:** Media | **Tiempo estimado:** 3 horas

**Descripción:**
Sistema de plantillas para cargar rápidamente configuraciones típicas de pacientes.

**Plantillas predefinidas:**
```
📋 Plantillas Rápidas
├── VM Invasiva Básica (Clase III - ~25 pts)
│   ✓ Monitoreo estándar
│   ✓ Ventilación mecánica
│   ✓ Laboratorios
│
├── Post-quirúrgico Estándar (Clase II - ~15 pts)
│   ✓ Monitoreo básico
│   ✓ Laboratorios
│   ✓ Medicación IV múltiple
│
├── Cuidados Mínimos (Clase I - ~8 pts)
│   ✓ Monitoreo horario
│   ✓ Vía periférica única
│
└── ➕ Crear Plantilla Personalizada
```

**Funcionalidades:**
- Botón "📋 Plantillas" en modal
- Aplicar plantilla con un clic
- Editable después de aplicar
- Guardar plantillas personalizadas
- Compartir plantillas entre usuarios (futuro)

**Beneficio:** Agilizar carga de pacientes típicos, reducir errores por olvido

**Implementación:**
- HTML: Modal de selección de plantillas
- JS: ~150 líneas (aplicar, guardar, editar plantillas)
- LocalStorage: Guardar plantillas personalizadas
- Supabase (futuro): Plantillas compartidas

---

### 🔟 Comparación Entre Turnos ⭐⭐
**Impacto:** Medio | **Complejidad:** Media | **Tiempo estimado:** 3-4 horas

**Descripción:**
Vista que permite comparar métricas entre diferentes turnos.

**Vista comparativa:**
```
┌─────────────────────────────────────────┐
│ Comparación de Turnos - Última Semana   │
├─────────────────────────────────────────┤
│ Turno          | Ocupación | TISS Prom  │
├─────────────────────────────────────────┤
│ Hoy Mañana     | 18/22     | 22.4       │
│ Ayer Mañana    | 16/22     | 19.8       │
│ Ayer Tarde     | 15/22     | 18.2       │
│ Ayer Noche     | 14/22     | 16.5       │
└─────────────────────────────────────────┘

📊 Gráfico de tendencia (Chart.js)
```

**Métricas comparables:**
- Ocupación de camas
- TISS promedio
- Distribución por clases
- Enfermeros asignados vs necesarios
- Cantidad de ingresos/altas

**Beneficio:** Identificar patrones, mejorar planificación de recursos

**Implementación:**
- HTML: Tabla comparativa + canvas para gráfico
- JS: ~200 líneas (consultas, cálculos, visualización)
- Librería: Chart.js para gráficos
- Supabase: Consultas históricas

---

## 🎯 ROADMAP SUGERIDO

### Fase 1 - Quick Wins (1-2 semanas)
1. ✅ **Tooltip** (COMPLETADO)
2. Búsqueda/Filtro Rápido
3. Exportar a CSV
4. Atajos de teclado completos

### Fase 2 - Mejoras Visuales (2-3 semanas)
5. Indicador visual de capacidad
6. Historial de actividad
7. Plantillas de intervenciones

### Fase 3 - Optimización (1-2 semanas)
8. Caché de clasificaciones
9. Limpieza automática de datos

### Fase 4 - Features Avanzadas (3-4 semanas)
10. PWA completa
11. Comparación entre turnos
12. Gráficos y estadísticas

---

## 💡 OTRAS IDEAS EN CONSIDERACIÓN

### Modo Oscuro 🌙
Para uso nocturno en UTI, reducir fatiga visual.

### Multi-idioma 🌍
Soporte para inglés/portugués si se expande a otras instituciones.

### Roles de Usuario 👥
Diferenciar entre enfermero, coordinador, auditor (permisos distintos).

### Integración con HIS 🏥
Conectar con sistema de historia clínica del hospital.

### App Móvil Nativa 📱
Versión para iOS/Android con React Native.

---

## 📝 NOTAS

- Priorizar mejoras según feedback de usuarios reales
- Testear cada mejora antes de producción
- Mantener principio "Menos es más"
- No agregar complejidad innecesaria
- Cada mejora debe resolver un problema real

---

**Última actualización:** 26 de abril de 2026
**Versión actual del sistema:** 1.3 (con Tooltip, Debounce, Renderizado Diferencial, Modal Mejorado)
