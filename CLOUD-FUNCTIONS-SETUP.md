# 🚀 Configuración de Cloud Functions

## 🎯 ¿Qué son las Cloud Functions?

Las **Firebase Cloud Functions** son funciones que se ejecutan en el servidor de Firebase, sin necesidad de configurar claves de Admin SDK manualmente. Son perfectas para operaciones sensibles como eliminar usuarios.

---

## ✨ **Ventajas de usar Cloud Functions**

✅ **Sin configuración de claves** - Firebase Admin SDK ya está configurado automáticamente  
✅ **Más seguro** - Las credenciales nunca salen del servidor de Firebase  
✅ **Multicliente** - Tus clientes pueden eliminar conductores sin acceso a Firebase Console  
✅ **Automatizado** - Todo funciona con un solo clic desde la app  
✅ **Sin restricciones de organización** - No depende de políticas de Google Cloud  

---

## 🛠️ **Funciones Implementadas**

### **1. `deleteConductor`**
Elimina completamente un conductor:
- ❌ Elimina de Firebase Authentication
- ❌ Elimina de Firestore (`conductores` collection)
- ❌ Elimina de Firestore (`users` collection)
- ✅ Email queda disponible inmediatamente

### **2. `deactivateConductor`**
Desactiva un conductor sin eliminarlo:
- 🚫 Marca como 'inactivo' en Firestore
- 🚫 Bloquea el login
- 💾 Mantiene todos los datos históricos

### **3. `activateConductor`**
Reactiva un conductor desactivado:
- ✅ Marca como 'activo' en Firestore
- ✅ Permite el login nuevamente

---

## 💻 **Configuración Paso a Paso**

### **Paso 1: Instalar Firebase CLI**

Si aún no tienes Firebase CLI instalado:

```bash
npm install -g firebase-tools
```

### **Paso 2: Iniciar Sesión en Firebase**

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con Google.

### **Paso 3: Seleccionar el Proyecto**

```bash
cd /tu/proyecto/nextjs_space
firebase use inspecciones-vehiculoso
```

### **Paso 4: Instalar Dependencias de las Functions**

```bash
cd functions
npm install
cd ..
```

### **Paso 5: Desplegar las Cloud Functions**

```bash
firebase deploy --only functions
```

Esto desplegará las 3 funciones:
- ✅ `deleteConductor`
- ✅ `deactivateConductor`
- ✅ `activateConductor`

**Tiempo aproximado:** 2-3 minutos

---

## ✅ **Verificación**

### **En Firebase Console:**

1. Ve a: https://console.firebase.google.com/project/inspecciones-vehiculoso/functions
2. Deberías ver las 3 funciones listadas
3. Estado: 🟢 **Active**

### **En la App:**

1. Abre la app: https://inspeccionpesv.abacusai.app/admin/conductores
2. Intenta eliminar un conductor
3. Deberías ver: ✅ **"Conductor eliminado completamente"**
4. Verifica en Firebase Console que el usuario ya no existe

---

## 🔍 **Solución de Problemas**

### **Error: "Permission denied"**

**Causa:** Tu cuenta de Google no tiene permisos para desplegar funciones.

**Solución:**
1. Ve a: https://console.cloud.google.com/iam-admin/iam?project=inspecciones-vehiculoso
2. Verifica que tu cuenta tiene el rol: **Editor** o **Owner**
3. Si no, pide al propietario del proyecto que te agregue

---

### **Error: "Firebase CLI not found"**

**Causa:** Firebase CLI no está instalado.

**Solución:**
```bash
npm install -g firebase-tools
```

---

### **Error: "CORS blocked"**

**Causa:** La app no tiene permisos para llamar a las Cloud Functions.

**Solución:**
1. Verifica que Firebase está inicializado correctamente en `lib/firebase.ts`
2. Asegúrate de que el usuario esté autenticado antes de llamar a la función

---

### **Error: "Function not found"**

**Causa:** Las funciones no se desplegaron correctamente.

**Solución:**
```bash
firebase deploy --only functions
```

Revisa los logs:
```bash
firebase functions:log
```

---

## 📊 **Monitoreo**

### **Ver Logs de las Functions:**

```bash
firebase functions:log
```

### **Ver Logs en Firebase Console:**

https://console.firebase.google.com/project/inspecciones-vehiculoso/functions/logs

---

## 💰 **Costos**

### **Plan Spark (Gratis):**
- ❌ No permite Cloud Functions
- ⚠️ Necesitas actualizar a **Blaze** (Pay as you go)

### **Plan Blaze (Pay as you go):**
- ✅ 2 millones de invocaciones gratis al mes
- ✅ 400,000 GB-segundos gratis al mes
- ✅ 200,000 CPU-segundos gratis al mes

**Para tu caso de uso:**
- Eliminaciones: ~0.5 segundos por función
- 1,000 eliminaciones al mes = **GRATIS**
- 10,000 eliminaciones al mes = **GRATIS**
- 100,000 eliminaciones al mes = ~$0.40 USD

**Conclusion:** Prácticamente gratis para tu app. 🚀

---

## 🔄 **Actualización de Funciones**

Si necesitas modificar las funciones:

1. Edita `functions/index.js`
2. Despliega de nuevo:
   ```bash
   firebase deploy --only functions
   ```

---

## 📄 **Estructura de Archivos**

```
nextjs_space/
├── functions/
│   ├── index.js              # Código de las Cloud Functions
│   ├── package.json          # Dependencias de las functions
│   └── .gitignore            # Archivos a ignorar
├── firebase.json             # Configuración de Firebase
└── firestore.rules           # Reglas de Firestore
```

---

## 🎯 **Resumen**

### **Antes (Sin Cloud Functions):**
- ❌ Requiere claves de Admin SDK
- ❌ Políticas de organización bloqueaban la creación de claves
- ❌ Clientes no podían eliminar conductores automáticamente
- ❌ Necesitabas acceso a Firebase Console

### **Ahora (Con Cloud Functions):**
- ✅ Sin configuración de claves
- ✅ Sin restricciones de organización
- ✅ Eliminación automática con 1 clic
- ✅ Funciona para todos tus clientes
- ✅ Más seguro
- ✅ Prácticamente gratis

---

## ❓ **Preguntas Frecuentes**

### **¿Necesito configurar algo en Netlify?**
No. Las Cloud Functions se ejecutan en Firebase, no en Netlify.

### **¿Qué pasa con las variables de entorno?**
Ya no las necesitas. Firebase Admin SDK se configura automáticamente en Cloud Functions.

### **¿Puedo probar localmente?**
Sí, usa el emulador:
```bash
firebase emulators:start --only functions
```

### **¿Cómo sé si está funcionando?**
Revisa los logs:
```bash
firebase functions:log
```

### **¿Qué pasa si elimino un conductor que no existe?**
La función maneja ese caso gracefully y no lanza error.

---

## 🚀 **Siguiente Paso**

**Desplegar las funciones:**

```bash
cd /tu/proyecto/nextjs_space
firebase use inspecciones-vehiculoso
cd functions
npm install
cd ..
firebase deploy --only functions
```

**¡Listo! Tus clientes ya pueden eliminar conductores automáticamente.** 🎉
