# 🔌 Guía de Configuración de Supabase

## 📋 Pasos para Conectar tu App a Supabase

### 1️⃣ Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, ve a **Settings** → **API**
3. Copia los siguientes datos:
   - **Project URL**: `https://pzfsjqknypojcmbokkus.supabase.co` ✅ (ya configurada)
   - **anon/public key**: Empieza con `eyJ...` ⚠️ **NECESARIO**

⚠️ **IMPORTANTE**: NO uses la `service_role` key en el código del cliente. Solo usa la **anon key**.

### 2️⃣ Configurar la Anon Key

Edita el archivo [supabase-config.js](supabase-config.js):

```javascript
const SUPABASE_CONFIG = {
    url: 'https://pzfsjqknypojcmbokkus.supabase.co',
    anonKey: 'TU_ANON_KEY_AQUI'  // ← Pegar aquí tu anon key
};
```

### 3️⃣ Crear las Tablas en Supabase

1. En Supabase Dashboard, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega todo el contenido de [supabase-schema.sql](supabase-schema.sql)
4. Ejecuta el script (botón **Run**)

Esto creará:
- ✅ Tabla `uti_state` - Estado actual de las camas
- ✅ Tabla `shift_history` - Historial de turnos
- ✅ Políticas de seguridad (RLS)
- ✅ Índices para performance
- ✅ Triggers automáticos

### 4️⃣ Verificar la Instalación

Abre la consola del navegador (F12) y busca:
- ✅ `"✅ Supabase inicializado correctamente"`
- ✅ `"✅ Datos cargados desde Supabase"` o `"ℹ️ No hay datos en Supabase, usando localStorage"`

Si ves ⚠️ mensajes de advertencia, revisa que la anon key esté correctamente configurada.

---

## 🔄 Cómo Funciona

### Modo Híbrido (Online + Offline)

La app funciona en **modo híbrido**:

| Situación | Comportamiento |
|-----------|---------------|
| ✅ Supabase disponible | Guarda en Supabase + localStorage (respaldo) |
| ⚠️ Supabase no disponible | Guarda solo en localStorage |
| 🔄 Vuelve conexión | Datos persisten en localStorage hasta próxima carga |

### Sincronización Automática

Cada vez que guardas datos (al editar una cama, cambiar turno, etc.):
1. Se intenta guardar en Supabase
2. Si falla, se guarda en localStorage
3. Al cargar la app, se priorizan datos de Supabase
4. localStorage siempre mantiene respaldo local

---

## 🔐 Seguridad

### Configuración Actual: Acceso Público

Por defecto, las políticas RLS permiten **acceso público**:
- ✅ Cualquiera con la URL puede leer/escribir
- ⚠️ Apropiado para uso interno en una red privada
- ⚠️ NO recomendado si la app está expuesta públicamente

### Opción: Habilitar Autenticación

Si necesitas restringir el acceso:

1. Implementa autenticación de Supabase
2. En [supabase-schema.sql](supabase-schema.sql), comenta las políticas públicas
3. Descomenta las políticas para usuarios autenticados
4. Ejecuta de nuevo el script SQL

---

## 📊 Funcionalidades

### Estado Actual (Tabla `uti_state`)
- Mantiene **UN ÚNICO** registro con el estado actual
- Se actualiza cada vez que modificas algo
- Incluye todas las camas, turno, enfermeros y notas

### Historial de Turnos (Tabla `shift_history`)
- Opcional pero recomendado para auditoría
- Para implementar: llamar a `supabaseService.saveShiftHistory()` al finalizar turno
- Ver historial: `supabaseService.getShiftHistory(10)`

---

## 🛠️ Comandos Útiles

### Ver Estado de Conexión
```javascript
// En consola del navegador
supabaseService.isOnline()
// true = conectado a Supabase
// false = modo offline (localStorage)
```

### Forzar Sincronización Manual
```javascript
// En consola del navegador
await supabaseService.syncFromLocalStorage()
// Sube datos de localStorage a Supabase
```

### Ver Datos en Supabase
```sql
-- En SQL Editor de Supabase
SELECT * FROM uti_state ORDER BY updated_at DESC LIMIT 1;
SELECT * FROM shift_history ORDER BY fecha DESC LIMIT 10;
```

---

## 🐛 Troubleshooting

### ❌ Error: "ANON KEY no configurada"
**Solución**: Edita [supabase-config.js](supabase-config.js) y agrega tu anon key.

### ❌ Error: "relation 'uti_state' does not exist"
**Solución**: Ejecuta el script [supabase-schema.sql](supabase-schema.sql) en SQL Editor.

### ❌ Error: "new row violates row-level security policy"
**Solución**: Verifica que las políticas RLS estén creadas correctamente en Supabase.

### ⚠️ Modo offline persistente
**Solución**: Abre consola y verifica errores de red o credenciales incorrectas.

---

## 📁 Archivos Nuevos

| Archivo | Descripción |
|---------|-------------|
| [supabase-config.js](supabase-config.js) | Configuración (URL + anon key) |
| [supabase-service.js](supabase-service.js) | Lógica de conexión y sincronización |
| [supabase-schema.sql](supabase-schema.sql) | Script para crear tablas en Supabase |
| [SUPABASE-SETUP.md](SUPABASE-SETUP.md) | Esta guía |

---

## ✅ Checklist de Instalación

- [ ] Obtener anon key de Supabase Dashboard
- [ ] Configurar anon key en [supabase-config.js](supabase-config.js)
- [ ] Ejecutar [supabase-schema.sql](supabase-schema.sql) en SQL Editor
- [ ] Abrir la app y verificar mensaje "✅ Supabase inicializado correctamente"
- [ ] Probar guardar/cargar una cama
- [ ] Verificar datos en Supabase Dashboard → Table Editor

---

## 🚀 Próximos Pasos Opcionales

1. **Historial de Turnos**: Agregar botón "Finalizar Turno" que guarde snapshot en `shift_history`
2. **Autenticación**: Implementar login para restringir acceso
3. **Multi-usuario**: Permitir que varios dispositivos vean datos en tiempo real
4. **Reportes**: Generar estadísticas desde el historial
5. **Backup Automático**: Export periódico de datos a CSV

---

¿Necesitas ayuda? Revisa la [documentación de Supabase](https://supabase.com/docs) o consulta los logs en la consola del navegador.
