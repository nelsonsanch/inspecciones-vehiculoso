# 🔑 Configuración de Firebase Admin SDK

## 🎯 Objetivo

Para que la eliminación de conductores sea **completamente automática** desde la aplicación (sin necesidad de ir a Firebase Console), necesitamos configurar Firebase Admin SDK.

---

## 📄 Paso 1: Obtener Credenciales de Firebase Admin

### **1.1 Ir a Firebase Console**
```
https://console.firebase.google.com/project/inspecciones-vehiculoso/settings/serviceaccounts/adminsdk
```

### **1.2 Generar Nueva Clave Privada**

1. Ve a **Configuración del proyecto** (⛙️ arriba a la izquierda)
2. Haz clic en la pestaña **"Cuentas de servicio"**
3. Haz clic en el botón **"Generar nueva clave privada"**
4. Confirma haciendo clic en **"Generar clave"**
5. Se descargará un archivo JSON con el nombre:
   ```
   inspecciones-vehiculoso-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
   ```

### **1.3 Abrir el Archivo JSON**

El archivo descargado tendrá esta estructura:

```json
{
  "type": "service_account",
  "project_id": "inspecciones-vehiculoso",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@inspecciones-vehiculoso.iam.gserviceaccount.com",
  "client_id": "xxxxxxxxxxxxxxxxxxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 📝 Paso 2: Agregar Variables de Entorno

### **2.1 Variables Locales (Archivo .env)**

Agrega estas líneas al archivo `.env` en `nextjs_space/.env`:

```bash
# Firebase Admin SDK
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@inspecciones-vehiculoso.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...TU CLAVE COMPLETA AQUI...\n-----END PRIVATE KEY-----\n"
```

**⚠️ IMPORTANTE:**
- Copia el `client_email` completo del JSON
- Copia la `private_key` **COMPLETA** (incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`)
- **Mantén los saltos de línea** (`\n`) en la private key

### **2.2 Variables en Netlify (Producción)**

1. Ve a tu dashboard de Netlify: https://app.netlify.com/
2. Selecciona tu sitio **inspecciones-vehiculoso**
3. Ve a **Site configuration** → **Environment variables**
4. Agrega las siguientes variables:

| Key | Value |
|-----|-------|
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@inspecciones-vehiculoso.iam.gserviceaccount.com` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n` |

**⚠️ Para la PRIVATE_KEY en Netlify:**
- Copia la clave completa con los `\n` literales
- Netlify los interpretará correctamente

---

## ✅ Paso 3: Verificar la Configuración

### **3.1 Verificar Archivo .env**

Tu archivo `.env` debe tener estas líneas:

```bash
# Firebase Client SDK (ya existían)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=inspecciones-vehiculoso.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=inspecciones-vehiculoso
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=inspecciones-vehiculoso.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx

# Firebase Admin SDK (NUEVAS)
FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@inspecciones-vehiculoso.iam.gserviceaccount.com"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...TU CLAVE COMPLETA...\n-----END PRIVATE KEY-----\n"
```

### **3.2 Reiniciar el Servidor de Desarrollo**

```bash
cd /home/ubuntu/inspecciones-vehiculoso/nextjs_space
yarn dev
```

### **3.3 Probar la Eliminación**

1. Ve a `/admin/conductores`
2. Intenta eliminar un conductor de prueba
3. Deberías ver el mensaje: **"✅ Conductor eliminado completamente"**
4. Verifica que:
   - El conductor desaparece de la lista
   - El email queda disponible inmediatamente
   - Puedes crear un nuevo conductor con el mismo email

---

## 🚨 Solución de Problemas

### **Error: "Error inicializando Firebase Admin SDK"**

**Causa:** Las variables de entorno no están correctamente configuradas.

**Solución:**
1. Verifica que las variables estén en el archivo `.env`
2. Asegúrate de que no hay espacios extra
3. Verifica que la `private_key` está completa
4. Reinicia el servidor

### **Error: "Error al eliminar el conductor"**

**Causa:** El endpoint API no puede acceder al Admin SDK.

**Solución:**
1. Revisa la consola del servidor (terminal donde corre `yarn dev`)
2. Busca mensajes de error específicos
3. Verifica que las credenciales sean válidas
4. Asegúrate de que Firebase Admin SDK esté instalado: `yarn add firebase-admin`

### **Error: "ENOENT: no such file or directory" (Netlify)**

**Causa:** Las variables de entorno no están configuradas en Netlify.

**Solución:**
1. Ve a Netlify → Site configuration → Environment variables
2. Agrega ambas variables (`FIREBASE_ADMIN_CLIENT_EMAIL` y `FIREBASE_ADMIN_PRIVATE_KEY`)
3. Haz un nuevo deploy

---

## 🔒 Seguridad

### **⚠️ IMPORTANTE:**

1. **NUNCA** subas el archivo JSON de credenciales a Git
2. **NUNCA** compartas las credenciales públicamente
3. El archivo `.env` ya está en `.gitignore` (no se subirá a GitHub)
4. Las credenciales de Netlify están cifradas y son privadas
5. Si crees que las credenciales fueron comprometidas:
   - Ve a Firebase Console
   - Elimina la cuenta de servicio actual
   - Genera una nueva clave privada
   - Actualiza las variables de entorno

---

## ✅ Resultado Final

### **Antes (Proceso Manual):**
```
1. Eliminar desde la app → Solo borra de Firestore
2. Ir a Firebase Console → Buscar email
3. Eliminar manualmente de Firebase Auth
4. Esperar 2-3 minutos
5. Email finalmente disponible
```

### **Ahora (Proceso Automático):**
```
1. Clic en "Eliminar" → Confirmación
2. ✅ LISTO - Eliminación completa en segundos
3. Email disponible inmediatamente
4. Sin pasos manuales
5. Sin acceso a Firebase Console necesario
```

---

## 📚 Archivos Relacionados

- **`lib/firebase-admin.ts`** - Configuración del Admin SDK
- **`app/api/delete-conductor/route.ts`** - Endpoint de eliminación
- **`app/admin/conductores/page.tsx`** - Interfaz de gestión
- **`.env`** - Variables de entorno locales
- **Netlify Environment Variables** - Variables de producción

---

**Última actualización:** 24 de noviembre de 2025
