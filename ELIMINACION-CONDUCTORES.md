# 🗑️ Guía Completa: Eliminación de Conductores

## 📋 Proceso de 2 Pasos

Cuando eliminas un conductor desde la aplicación, **debes completar 2 pasos**:

### ✅ Paso 1: Eliminación desde la App (Automático)
- Se elimina de la colección `conductores` en Firestore
- Se elimina de la colección `users` en Firestore
- **El conductor ya NO aparecerá** en la lista de conductores

### ⚠️ Paso 2: Eliminación desde Firebase Auth (Manual)
- Se abre automáticamente Firebase Console
- **DEBES eliminar manualmente** el email de Firebase Authentication
- **Sin este paso, el email NO estará disponible** para crear un nuevo conductor

---

## 🚨 Problema Común

### Error: "Ya existe un usuario con este email"

**Causa:** El conductor fue eliminado de Firestore (Paso 1), pero **NO fue eliminado de Firebase Authentication (Paso 2)**.

**Solución:** Completa el Paso 2 siguiendo las instrucciones abajo.

---

## 📝 Instrucciones Detalladas - Paso 2

### **Opción A: Desde la Aplicación**

1. Ve a `/admin/conductores`
2. Haz clic en el botón rojo 🗑️ del conductor
3. Lee la advertencia completa
4. Haz clic en **"Sí, Eliminar Permanentemente"**
5. **Espera 3 segundos** - Se abrirá automáticamente Firebase Console
6. Continúa con las instrucciones de "Opción B" (paso 2 en adelante)

### **Opción B: Manual desde Firebase Console**

1. **Abrir Firebase Console**
   - URL: https://console.firebase.google.com/project/inspecciones-vehiculoso/authentication/users
   - O haz clic en el botón que aparece en el toast de error

2. **Buscar el Email**
   - En la lista de usuarios, busca el email que quieres liberar
   - Ejemplo: `ssticac@gmail.com`
   - **Verás que todavía existe en la lista**

3. **Eliminar el Usuario**
   - Haz clic en los **3 puntos** (⋮) al lado derecho del usuario
   - Selecciona **"Delete account"** (Eliminar cuenta)
   - Confirma la eliminación en el diálogo que aparece

4. **Verificar**
   - El email desaparecerá de la lista
   - Recarga la página para confirmar
   - **Ahora SÍ puedes crear un nuevo conductor** con ese email

---

## 🎯 Alternativa Recomendada: DESACTIVAR

### ¿Por qué Desactivar en lugar de Eliminar?

| Ventaja | Desactivar | Eliminar |
|---------|------------|----------|
| **Preserva Historial** | ✅ Sí | ❌ No |
| **Reversible** | ✅ Sí | ❌ No |
| **Email Disponible** | ❌ No | ✅ Sí |
| **Pasos Requeridos** | 1 | 2 |
| **Tiempo** | Inmediato | 2-3 minutos |

### Cómo Desactivar

1. Ve a `/admin/conductores`
2. Haz clic en el botón naranja **"Desactivar"**
3. Confirma la acción
4. ✅ **Listo** - El conductor no podrá iniciar sesión

### Cómo Reactivar

1. Ve a `/admin/conductores`
2. Filtra por **"Inactivos"** en el dropdown
3. Encuentra al conductor desactivado
4. Haz clic en el botón verde **"Activar"**
5. ✅ **Listo** - El conductor puede volver a iniciar sesión

---

## 📊 Comparación de Métodos

### Desactivar (Recomendado)
- ✅ **1 clic** - Proceso completo
- ✅ **Inmediato** - Sin pasos manuales
- ✅ **Reversible** - Puedes reactivar después
- ✅ **Preserva historial** - Todas las inspecciones se mantienen
- ❌ Email NO queda disponible (pero puedes reactivar)

### Eliminar (Solo si necesario)
- ⚠️ **2 pasos** - App + Firebase Console
- ⚠️ **2-3 minutos** - Proceso manual
- ❌ **Irreversible** - No hay vuelta atrás
- ❌ **Pierde historial** - Todas las inspecciones se eliminan
- ✅ Email queda disponible

---

## 🔍 Verificación del Estado

### Verificar en Firestore
1. Ir a: https://console.firebase.google.com/project/inspecciones-vehiculoso/firestore
2. Buscar en colección `users`
3. Buscar en colección `conductores`
4. **Si NO aparece** = Eliminado de Firestore ✅

### Verificar en Firebase Auth
1. Ir a: https://console.firebase.google.com/project/inspecciones-vehiculoso/authentication/users
2. Buscar el email
3. **Si NO aparece** = Email disponible ✅
4. **Si SÍ aparece** = Email NO disponible ❌ (Completa Paso 2)

---

## ❓ Preguntas Frecuentes

### ¿Por qué no se elimina automáticamente de Firebase Auth?
Porque la aplicación usa Firebase Client SDK, que no tiene permisos para eliminar usuarios de Firebase Authentication. Solo Firebase Admin SDK (servidor) puede hacer eso.

### ¿Puedo automatizar el Paso 2?
Sí, pero requiere:
1. Configurar Firebase Admin SDK
2. Crear un servidor/API que ejecute la eliminación
3. Mayor complejidad y costos de infraestructura

Para este proyecto, el proceso manual es más simple y seguro.

### ¿Qué pasa si olvido hacer el Paso 2?
Nada grave. El email queda "atrapado" en Firebase Auth, pero:
- No puede iniciar sesión (no existe en Firestore)
- No afecta al resto de la app
- Simplemente no podrás reutilizar ese email hasta que lo elimines

### ¿Cuál es mejor: Desactivar o Eliminar?
**Desactivar** es mejor en el 95% de los casos:
- Más rápido
- Más seguro
- Reversible
- Preserva historial

**Eliminar** solo cuando:
- Necesitas reutilizar el email específico
- Quieres eliminar permanentemente todos los datos
- Cumplir con solicitud de "derecho al olvido" (GDPR)

---

## 📚 Documentos Relacionados

- **CONDUCTORES-ESTADO.md** - Sistema de activación/desactivación
- **GESTION-CONDUCTORES.md** - Guía completa de gestión de conductores
- **SEGURIDAD.md** - Estrategia de seguridad de la aplicación

---

## 🆘 Soporte

Si tienes problemas:
1. Lee esta guía completa
2. Verifica el estado en Firebase Console
3. Revisa los mensajes de error en la aplicación
4. Contacta al equipo de desarrollo

---

**Última actualización:** 24 de noviembre de 2025
