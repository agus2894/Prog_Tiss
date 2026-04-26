# 🏥 TISS Web – Sistema de Gestión para UTI

## � Acceso Directo

**[👉 Usar la aplicación aquí](https://agus2894.github.io/Prog_Tiss/)**

---

## �📌 Overview

Aplicación web desarrollada para digitalizar y estructurar el uso del sistema **TISS** (Therapeutic Intervention Scoring System) en unidades de terapia intensiva.

### El sistema permite:

- Registrar intervenciones clínicas
- Calcular automáticamente puntajes TISS
- Clasificar pacientes según complejidad asistencial
- Visualizar estado global del servicio
- Generar reportes imprimibles por turno

Diseñada como herramienta de apoyo informativo para la planificación clínica.

---

## 🎯 Problema que resuelve

En entornos de UTI, el cálculo manual del TISS:

- ❌ Consume tiempo
- ❌ No siempre queda sistematizado
- ❌ Dificulta la visualización global del servicio
- ❌ No deja trazabilidad estructurada por turno

✅ La aplicación transforma un sistema descriptivo en una herramienta digital estructurada, clara y visual.

---

## 🧠 Decisiones de Diseño

### 1️⃣ Aplicación 100% client-side

- No requiere servidor
- Funciona offline
- Persistencia mediante LocalStorage
- Garantiza que los datos permanezcan en el dispositivo

**Motivo:** priorizar simplicidad, portabilidad y privacidad.

### 2️⃣ Separación explícita entre datos y decisiones

**El sistema:**
- Calcula puntajes
- Clasifica según reglas definidas
- Muestra ratios referenciales

**Pero:**
- ❌ No toma decisiones operativas
- ❌ No recomienda ajustes de personal
- ❌ No automatiza asignaciones

Se implementó deliberadamente esta limitación para evitar uso indebido como herramienta de gestión automática.

### 3️⃣ Lógica estructurada por categorías clínicas

Las intervenciones TISS están organizadas en **7 grupos:**

1. Básicas
2. Ventilatorio
3. Renal
4. Neurológico
5. Metabólico
6. Cardiovascular
7. Procedimientos

Cada selección actualiza el puntaje en tiempo real mediante lógica modular.

### 4️⃣ Visualización centrada en flujo real de trabajo

- Mapa de camas con código de colores
- Indicador de días de internación automático
- Selector de turnos persistente
- Panel resumen global
- Vista optimizada para impresión

La interfaz fue pensada para uso en rondas y cambios de turno.

---

## 🏗️ Arquitectura

Frontend puro sin dependencias externas:

- **HTML5**
- **CSS3** responsive
- **JavaScript** Vanilla
- **LocalStorage** para persistencia
- Cálculos ejecutados completamente en cliente

No utiliza frameworks ni librerías externas.

---

## 📊 Funcionalidades Principales

- ✅ Registro y edición de pacientes
- ✅ Cálculo automático TISS en tiempo real
- ✅ Clasificación por rangos (I–IV)
- ✅ Resumen global del servicio
- ✅ Gestión por turnos
- ✅ Registro de enfermeros disponibles
- ✅ Sistema de alertas visuales
- ✅ Vista imprimible optimizada
- ✅ Atajos de teclado

---

## 📱 Diseño Responsive

Adaptación automática a:

- 💻 Desktop
- 📱 Tablet
- 📲 Mobile

Interfaz optimizada para uso táctil.

---

## 🔒 Privacidad

- ✅ No requiere login
- ✅ No envía datos a servidores
- ✅ No utiliza APIs externas
- ✅ Persistencia local

Pensado para uso en entornos sensibles.

---

## 📌 Limitaciones Intencionales

- ❌ No base de datos centralizada
- ❌ No multiusuario
- ❌ No control de versiones
- ❌ No integración institucional

Estas limitaciones fueron definidas para mantener la herramienta como **apoyo informativo** y no como sistema de gestión formal.

---

## 🚀 Mejoras Futuras Planificadas

### Funcionalidades Propuestas

**UX / Visual:**
- 🔍 Búsqueda rápida de pacientes/camas con filtrado en tiempo real
- 📊 Indicador visual de capacidad (barras de progreso con código de colores)
- ⚡ Atajos de teclado completos para usuarios expertos
- 📋 Historial de actividad del turno con timestamps
- 🌙 Modo oscuro para uso nocturno en UTI

**Rendimiento:**
- 🗑️ Limpieza automática de datos antiguos
- ⚡ Caché de clasificaciones para optimizar renders
- 📱 PWA completa (instalable, offline-first)

**Funcionales:**
- 📥 Exportar a Excel/CSV con formato
- 📋 Plantillas de intervenciones frecuentes
- 📈 Comparación entre turnos
- 🔄 Backend opcional con Supabase
- 🔐 Autenticación por roles (enfermero/coordinador/auditor)

### Prioridad de Implementación

**Fase 1** (1-2 semanas) - Quick wins
- Búsqueda/filtro de camas
- Exportar CSV
- Atajos de teclado

**Fase 2** (2-3 semanas) - Mejoras visuales
- Indicadores de capacidad
- Historial de actividad
- Plantillas de intervenciones

**Fase 3** (1-2 semanas) - Optimización
- Caché y limpieza automática
- PWA completa

**Fase 4** (3-4 semanas) - Features avanzadas
- Comparación entre turnos
- Gráficos estadísticos
- Backend opcional

> **Filosofía:** Cada mejora debe resolver un problema real. No agregar complejidad innecesaria.

---

## ✅ Validación de Cálculos

Los cálculos TISS implementados han sido verificados contra la bibliografía médica estándar (Miranda et al., 1996; Reis Miranda et al., 2003):

| Clase | Puntos TISS | Ratio Enfermera:Paciente | Estado |
|-------|-------------|--------------------------|--------|
| I     | < 10        | 1:4 (0.25)              | ✅ Correcto |
| II    | 10-19       | 1:3 (0.33)              | ✅ Correcto |
| III   | 20-39       | 1:2 (0.50)              | ✅ Correcto |
| IV    | ≥ 40        | 1:1 (1.00)              | ✅ Correcto |

**Los cálculos son precisos y confiables para distribución de personal.**

---

## 📎 Contexto Profesional

Proyecto desarrollado como solución digital aplicada a entorno clínico real, con validación funcional a nivel de servicio.

**Versión actual:** 1.3 · Última actualización: Abril 2026