# 🎯 Guía Completa: Gestión de Conductores

## 📋 Resumen

La aplicación ahora tiene **DOS** formas de gestionar conductores:
1. ✅ **Activar/Desactivar** - Temporal y reversible
2. ❌ **Eliminar Permanentemente** - Definitivo e irreversible

---

## 🔄 **OPCIÓN 1: Activar/Desactivar (Recomendado)**

### ¿Cuándo usar esto?
- ✅ Conductor que renunció pero puede volver
- ✅ Suspensión temporal
- ✅ Conductor de vacaciones
- ✅ Error administrativo que necesitas revertir
- ✅ Quieres mantener el historial completo

### Características:
- 🟢 **REVERSIBLE** - Puedes reactivarlo cuando quieras
- 💾 **Conserva datos** - Todo el historial se mantiene
- 🔒 **Bloquea acceso** - El conductor no puede iniciar sesión
- ⚡ **Instantáneo** - Efecto inmediato
- 🎯 **Sin complicaciones** - Un solo clic

### Cómo usar:

#### Para DESACTIVAR:
1. Ve a `/admin/conductores`
2. Busca al conductor
3. Haz clic en el **botón naranja** 🔴 (icono UserX)
4. Confirma la acción
5. ✅ **Listo** - El conductor no puede iniciar sesión

#### Para REACTIVAR:
1. Ve a `/admin/conductores`
2. Filtra por **"Solo Inactivos"**
3. Busca al conductor
4. Haz clic en el **botón verde** 🟢 (icono UserCheck)
5. Confirma la acción
6. ✅ **Listo** - El conductor puede volver a trabajar

---

## ❌ **OPCIÓN 2: Eliminar Permanentemente**

### ⚠️ **IMPORTANTE: Esta opción es IRREVERSIBLE**

### ¿Cuándo usar esto?
- ❌ Conductor que NUNCA volverá
- ❌ Cuenta creada por error
- ❌ Datos duplicados
- ❌ Quieres ELIMINAR completamente el registro

### Características:
- 🔴 **IRREVERSIBLE** - No hay vuelta atrás
- 🗑️ **Elimina de Firestore** - Se borra de la base de datos
- ⚠️ **Requiere paso manual** - Debes eliminar de Firebase Auth también
- 📋 **Mantiene inspecciones** - El historial de inspecciones NO se elimina (por integridad)

### Cómo usar:

#### Paso 1: Eliminar desde la APP
1. Ve a `/admin/conductores`
2. Busca al conductor
3. Haz clic en el **botón rojo** 🗑️ (icono Trash)
4. Lee CUIDADOSAMENTE la advertencia
5. Confirma escribiendo o haciendo clic en "Sí, Eliminar Permanentemente"
6. ✅ Se eliminará de Firestore

#### Paso 2: Eliminar de Firebase Auth (MANUAL)
Después de eliminar desde la APP, **se abrirá automáticamente** la consola de Firebase.

**¿Por qué este paso manual?**
> Firebase no permite eliminar usuarios de Auth desde el cliente por seguridad. Debes hacerlo desde la consola.

**Instrucciones:**
1. La consola de Firebase se abrirá en una nueva pestaña
2. Ve a **Authentication** → **Users**
3. Busca el email del conductor eliminado
4. Haz clic en los **3 puntos** ⋮ a la derecha
5. Selecciona **"Delete account"**
6. Confirma la eliminación
7. ✅ **Ahora sí el email está liberado**

### 📸 Captura de pantalla del proceso:
```
┌─────────────────────────────────────────────────┐
│ Firebase Console → Authentication → Users      │
├─────────────────────────────────────────────────┤
│                                                 │
│ Email                        │ Actions         │
│ ─────────────────────────────────────────────  │
│ conductor@ejemplo.com        │ ⋮              │
│                                │ ▼              │
│                                │ • Delete account │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🆚 **Comparación: Desactivar vs Eliminar**

| Característica | Desactivar | Eliminar |
|----------------|------------|----------|
| Reversible | ✅ Sí | ❌ No |
| Conserva datos | ✅ Sí | ⚠️ Parcial |
| Libera email | ✅ Sí* | ✅ Sí** |
| Bloquea login | ✅ Sí | ✅ Sí |
| Pasos requeridos | 1 | 2 |
| Velocidad | ⚡ Instantáneo | ⏱️ Manual |
| Seguridad | 🟢 Alta | 🔴 Irreversible |
| Recomendado para | Gestión diaria | Casos extremos |

*El email técnicamente sigue en Firebase Auth, pero no puede iniciar sesión  
**Solo después de completar AMBOS pasos

---

## 📊 **Flujos de Trabajo Recomendados**

### Escenario 1: Conductor renunció
```
❓ ¿Va a volver?
   ├─ Sí o No sé → DESACTIVAR
   └─ No, nunca → ELIMINAR
```

### Escenario 2: Conductor suspendido
```
🔒 DESACTIVAR temporalmente
   (Puedes reactivar cuando termine la suspensión)
```

### Escenario 3: Error al crear conductor
```
❌ ELIMINAR (si no ha hecho nada)
   O
🔄 DESACTIVAR (si ya tiene inspecciones)
```

### Escenario 4: Conductor de vacaciones
```
🔄 DESACTIVAR (opcional)
   (Si quieres que no pueda acceder durante vacaciones)
```

---

## 🚨 **Advertencias Importantes**

### Al DESACTIVAR:
- ✅ Todo es reversible
- ✅ El conductor no puede iniciar sesión
- ✅ Los datos se mantienen intactos
- ⚠️ El email sigue "ocupado" en Firebase Auth

### Al ELIMINAR:
- 🔴 **NO HAY VUELTA ATRÁS**
- 🔴 Debes completar AMBOS pasos (APP + Firebase Console)
- 🔴 Si solo eliminas de la APP, el email sigue bloqueado
- ✅ Las inspecciones del conductor se mantienen

---

## 📝 **Preguntas Frecuentes**

### P: ¿Qué opción uso normalmente?
**R:** DESACTIVAR. Es más seguro y puedes revertirlo.

### P: ¿Por qué no se elimina automáticamente de Firebase Auth?
**R:** Por seguridad, Firebase no permite eso desde el cliente. Debes hacerlo manualmente.

### P: ¿Se pierden las inspecciones al eliminar un conductor?
**R:** NO. Las inspecciones se mantienen por integridad referencial.

### P: ¿Puedo reutilizar el email de un conductor eliminado?
**R:** SÍ, pero SOLO después de eliminarlo TAMBIÉN de Firebase Auth (paso 2).

### P: ¿Puedo reutilizar el email de un conductor desactivado?
**R:** Técnicamente NO (el email sigue en Firebase Auth). Pero es mejor reactivar el conductor existente.

### P: Eliminé de la APP pero el email sigue bloqueado. ¿Por qué?
**R:** Porque NO completaste el paso 2 (eliminar de Firebase Auth). Ve a la consola de Firebase.

### P: ¿Los administradores pueden ser eliminados?
**R:** NO. Solo los conductores.

### P: ¿Cómo saber si un conductor está desactivado?
**R:** Usa el filtro "Solo Inactivos" o busca el badge gris.

---

## 🎯 **Recomendaciones**

### ✅ HACER:
1. Usar DESACTIVAR para gestión diaria
2. Reactivar conductores en lugar de crear nuevos
3. Verificar el estado antes de eliminar
4. Completar AMBOS pasos al eliminar
5. Documentar por qué eliminas un conductor

### ❌ NO HACER:
1. Eliminar a la ligera
2. Olvidar el paso 2 (Firebase Auth)
3. Crear conductores nuevos si existe uno desactivado
4. Eliminar conductores con inspecciones importantes
5. Usar eliminar para suspensiones temporales

---

## 🔍 **Solución de Problemas**

### Problema: "Email already in use" al crear conductor
**Solución:** El conductor ya existe. Búscalo y reactívalo en lugar de crear uno nuevo.

### Problema: Eliminé pero el email sigue bloqueado
**Solución:** No completaste el paso 2. Ve a Firebase Console → Authentication → Users y elimínalo manualmente.

### Problema: No encuentro el botón de eliminar
**Solución:** El botón rojo 🗑️ está a la derecha de cada conductor, junto al de activar/desactivar.

### Problema: No puedo reactivar un conductor
**Solución:** Busca en el filtro "Solo Inactivos" y usa el botón verde 🟢.

---

## 🚀 **La Aplicación ya está Desplegada**

**URL:** https://inspeccionpesv.abacusai.app

Ahora tienes:
- ✅ Botón de Activar/Desactivar (naranja/verde)
- ✅ Botón de Eliminar (rojo)
- ✅ Filtros de estado
- ✅ Badges visuales
- ✅ Diálogos de confirmación claros

---

## 📚 **Archivos Relacionados**

- `app/admin/conductores/page.tsx` - Página principal de conductores
- `app/api/delete-user/route.ts` - API de eliminación
- `components/auth/login-form.tsx` - Bloqueo de login
- `contexts/auth-context.tsx` - Verificación de estado
- `CONDUCTORES-ESTADO.md` - Documentación de activación/desactivación

---

## ✨ **Resumen Final**

| Situación | Acción Recomendada |
|-----------|-------------------|
| Renuncia temporal | 🔄 Desactivar |
| Renuncia definitiva | ❌ Eliminar |
| Suspensión | 🔄 Desactivar |
| Error al crear | ❌ Eliminar |
| Vacaciones | 🔄 Desactivar (opcional) |
| Conductor duplicado | ❌ Eliminar |
| No estás seguro | 🔄 Desactivar (siempre más seguro) |

**Regla de oro:** Cuando tengas dudas, **DESACTIVA**. Siempre puedes reactivar después. ✅
