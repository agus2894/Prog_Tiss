# 🏥 Calculadora TISS - Sistema de Gestión UTI 22 Camas

## 📋 Descripción

Aplicación web completa para la gestión de pacientes en unidades de terapia intensiva, utilizando el sistema TISS (Therapeutic Intervention Scoring System) para calcular puntuaciones, clasificar pacientes y proporcionar información de referencia sobre necesidades de enfermería.

## ⚠️ IMPORTANTE - Herramienta Informativa

**Esta aplicación NO toma decisiones operativas.**

- ❌ NO decide dotación de personal
- ❌ NO recomienda recortes o ajustes
- ❌ NO define staffing final
- ✅ Proporciona datos referenciales
- ✅ TISS es una variable descriptiva
- ✅ **Las decisiones finales corresponden exclusivamente a jefatura de enfermería y dirección médica**

---

## 🎯 Funcionalidades Principales

### 1. **Mapa Visual de 22 Camas**

Visualización en tiempo real del estado de todas las camas de la UTI con código de colores según clasificación TISS.

![Mapa de Camas]()
*Agregar imagen del mapa de camas aquí*

**Características:**
- 🟢 **Verde** - Clase I (< 10 pts): Paciente estable
- 🔵 **Azul** - Clase II (10-19 pts): Vigilancia activa
- 🟠 **Naranja** - Clase III (20-39 pts): Inestable
- 🔴 **Rojo** - Clase IV (≥ 40 pts): Gran inestabilidad
- ⚪ **Gris** - Cama disponible
- Muestra nombre del paciente en lugar de "Ocupada"
- Indicador de días de internación

---

### 2. **Gestión Individual de Pacientes**

Modal completo para registrar y editar información de cada paciente.

![Modal de Paciente]()
*Agregar imagen del modal de edición aquí*

**Información registrada:**
- 👤 Nombre del paciente
- 📅 Fecha de ingreso (calcula días automáticamente)
- 🩺 Diagnóstico
- 📝 Observaciones adicionales
- ✅ Intervenciones TISS seleccionadas

**Intervenciones organizadas en 7 categorías:**
1. **Básicas** - Monitorización, vías, medicación
2. **Ventilatorio** - Ventilación mecánica, oxigenoterapia
3. **Renal** - Diálisis, técnicas de reemplazo renal
4. **Neurológico** - Monitoreo PIC, sedación
5. **Metabólico** - Nutrición parenteral, corrección metabólica
6. **Cardiovascular** - Drogas vasoactivas, monitoreo hemodinámico
7. **Intervenciones** - Procedimientos especiales, traslados

---

### 3. **Cálculo Automático TISS**

Puntuación en tiempo real mientras seleccionas intervenciones.

![Resultado TISS]()
*Agregar imagen del panel de resultados aquí*

**Muestra:**
- Puntaje total
- Clasificación según rango
- Ratio enfermero:paciente referencial
- Descripción de la clase

---

### 4. **Gestión por Turnos**

Selector de turno para organizar la información por horarios.

![Selector de Turno]()
*Agregar imagen del selector aquí*

**Turnos disponibles:**
- 🌅 **Mañana** (7-14hs)
- ☀️ **Tarde** (14-21hs)
- 🌙 **Noche** (21-07hs)
- ⏰ **Franquero** (7-21hs)

El turno seleccionado se guarda automáticamente.

---

### 5. **Registro de Enfermeros en Turno**

Input para registrar cuántos enfermeros hay en el turno actual.

![Enfermeros en Turno]()
*Agregar imagen del input aquí*

**Características:**
- Comparación visual: Enfermeros Disponibles / Necesarios (Estimado)
- ⚠️ Alerta solo cuando faltan enfermeros (no sugiere reducir personal)
- Protege al equipo de reasignaciones innecesarias

---

### 6. **Notas del Turno**

Campo de texto para observaciones generales del servicio.

![Notas del Turno]()
*Agregar imagen del campo de notas aquí*

**Usos:**
- Situaciones especiales
- Cambios importantes
- Incidentes relevantes
- Observaciones para próximo turno

Se guarda automáticamente en cada cambio.

---

### 7. **Resumen Global**

Panel con estadísticas generales de la UTI.

![Resumen Global]()
*Agregar imagen del resumen aquí*

**Indicadores:**
- 🛏️ Camas ocupadas / Total
- 📊 TISS Total acumulado
- 👩‍⚕️ Enfermeros: En turno / Necesarios
- 📈 TISS Promedio
- Contadores por clase (I, II, III, IV)

---

### 8. **Lista de Pacientes**

Modal con vista detallada de todos los pacientes ingresados.

![Lista de Pacientes]()
*Agregar imagen de la lista aquí*

**Incluye:**
- Resumen del turno actual
- Notas generales
- Lista completa de pacientes con:
  - Nombre y número de cama
  - Puntaje TISS y clasificación
  - Días de internación
  - Diagnóstico
  - Observaciones

**Acceso rápido:** Botón "📋 Ver Lista" o atajo `Ctrl+L`

---

### 9. **Impresión Optimizada**

Vista especialmente diseñada para impresión de reportes.

![Vista de Impresión]()
*Agregar imagen de la vista de impresión aquí*

**Características:**
- Oculta elementos innecesarios (botones, controles)
- Optimiza layout para papel
- Incluye todas las camas y resumen
- Muestra notas del turno
- Formato compacto y legible

**Acceso:** Botón "🖨️ Imprimir" o `Ctrl+P`

---

### 10. **Persistencia de Datos**

Todos los datos se guardan automáticamente en el navegador.

**Se guarda:**
- Estado de las 22 camas
- Información completa de pacientes
- Turno seleccionado
- Enfermeros en turno
- Notas del turno

**Nota:** Los datos persisten incluso al cerrar el navegador. Para limpiar: usar botón "🗑️ Limpiar Todo"

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `ESC` | Cerrar modales abiertos |
| `Ctrl+Enter` | Guardar paciente (dentro del modal) |
| `Ctrl+L` | Ver lista de pacientes |
| `Ctrl+P` | Imprimir reporte |

---

## 📊 Clasificación TISS

### Clase I (< 10 puntos)
- **Descripción:** Paciente no necesita UTI
- **Ratio:** 1:4 (1 Enfermero : 4 Pacientes)
- **Color:** 🟢 Verde

### Clase II (10-19 puntos)
- **Descripción:** Vigilancia activa, paciente estable que requiere observación
- **Ratio:** 1:4 (1 Enfermero : 4 Pacientes)
- **Color:** 🔵 Azul

### Clase III (20-39 puntos)
- **Descripción:** Inestabilidad hemodinámica. Precisan monitorización y vigilancia intensiva
- **Ratio:** 2:1 (2 Enfermeros : 1 Paciente)
- **Color:** 🟠 Naranja

### Clase IV (≥ 40 puntos)
- **Descripción:** Gran inestabilidad hemodinámica que requiere cuidados intensivos
- **Ratio:** 1:1 o 2:1 (1-2 Enfermeros : 1 Paciente)
- **Color:** 🔴 Rojo

---

## 🚀 Cómo Usar

### Inicio Rápido
1. Abrir `index.html` en cualquier navegador web moderno
2. Seleccionar el turno actual
3. Registrar número de enfermeros disponibles
4. Hacer clic en una cama para agregar/editar paciente

### Agregar un Paciente
1. Clic en cama vacía o paciente existente
2. Completar información del paciente
3. Seleccionar intervenciones TISS aplicables
4. Ver clasificación en tiempo real
5. Clic en "💾 Guardar"

### Ver Reporte
1. Clic en "📋 Ver Lista" para vista detallada
2. Clic en "🖨️ Imprimir" para reporte imprimible

### Gestión de Turnos
1. Cambiar turno en selector superior
2. Ajustar enfermeros disponibles
3. Agregar notas del turno si es necesario

---

## 💻 Requisitos Técnicos

- **Navegador:** Cualquier navegador moderno (Chrome, Firefox, Edge, Safari)
- **Conexión:** No requiere internet (funciona offline)
- **Instalación:** No requiere instalación, solo abrir el archivo HTML
- **Almacenamiento:** Usa localStorage del navegador

---

## 📱 Responsive Design

La aplicación se adapta automáticamente a diferentes tamaños de pantalla:
- 💻 **Desktop:** Vista completa con todos los elementos
- 📱 **Tablet:** Layout optimizado
- 📱 **Mobile:** Interfaz táctil adaptada

---

## 🔒 Privacidad y Datos

- ✅ Todos los datos se almacenan localmente en el navegador
- ✅ No se envía información a ningún servidor
- ✅ No requiere registro ni login
- ✅ Los datos permanecen en el dispositivo
- ⚠️ Limpiar caché del navegador eliminará los datos

---

## 📞 Soporte

Para reportar problemas o sugerencias, contactar con el equipo de desarrollo.

---

## 📄 Licencia

Herramienta de uso interno para apoyo en la gestión de UTI.

---

**Versión:** 2.0  
**Última actualización:** Febrero 2026  
**Desarrollada para:** Gestión UTI 22 Camas


## 🛠️ Tecnologías

- HTML5
- CSS3 (diseño responsive)
- JavaScript vanilla (sin dependencias)

## 📱 Compatibilidad

- ✅ Chrome / Edge
- ✅ Firefox
- ✅ Safari
- ✅ Móviles (iOS/Android)

## 🎨 Características de diseño

- Gradientes modernos
- Animaciones suaves
- Código de colores por categoría
- Scroll sticky para resultados
- Interface intuitiva

## ⚖️ Disclaimer Legal

Esta herramienta es de carácter **informativo y educativo**. Los valores mostrados son referenciales según el sistema TISS estándar. 

Las decisiones sobre dotación de personal deben considerar:
- Contexto clínico específico
- Recursos disponibles
- Normativas locales
- Criterio profesional del equipo de salud
- Evaluación de jefatura de enfermería

## 📝 Notas de desarrollo

- Sin base de datos (aplicación estática)
- No requiere instalación
- Funciona offline una vez cargada
- Todos los cálculos en cliente

## 👥 Uso recomendado

Esta aplicación está diseñada para:
- Apoyo en rondas de evaluación
- Estimación inicial de recursos
- Fines educativos y formativos
- Documentación orientativa

**NO para**:
- Toma de decisiones automáticas
- Justificación de recortes de personal
- Sustitución del criterio profesional

---

**Versión:** 1.0  
**Última actualización:** Febrero 2026
