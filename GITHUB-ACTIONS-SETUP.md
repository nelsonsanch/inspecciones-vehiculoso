# 🚀 Despliegue Automático con GitHub Actions

## ✨ ¿Qué es GitHub Actions?

GitHub Actions permite automatizar el despliegue de tus Cloud Functions. **Cada vez que hagas push a GitHub**, las Cloud Functions se desplegarán automáticamente a Firebase.

---

## 🎯 Ventajas

✅ **100% automático** - Un push despliega todo  
✅ **Sin instalar nada** - No necesitas Firebase CLI en tu PC  
✅ **Igual que Netlify** - Frontend y Backend se despliegan automáticamente  
✅ **Sin configuración manual** - Se configura una sola vez  
✅ **Historial completo** - Puedes ver cada despliegue en GitHub  

---

## ⚙️ Configuración (Solo una vez)

### **Paso 1: Generar Token de Firebase**

Desde tu computadora, ejecuta:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Generar el token
firebase login:ci
```

**¿Qué hace?**
- Abre tu navegador
- Inicias sesión con Google
- Te da un token (algo como: `1//abc123...xyz`)

**⚠️ IMPORTANTE: Copia el token completo**

---

### **Paso 2: Agregar el Token a GitHub**

1. **Ve a tu repositorio en GitHub:**
   ```
   https://github.com/nelsonsanch/inspecciones-vehiculoso
   ```

2. **Haz clic en "Settings"** (en la barra superior)

3. **En el menú izquierdo:**
   - Haz clic en **"Secrets and variables"**
   - Haz clic en **"Actions"**

4. **Haz clic en "New repository secret"**

5. **Configura el secreto:**
   - **Name:** `FIREBASE_TOKEN`
   - **Value:** Pega el token que copiaste en el Paso 1

6. **Haz clic en "Add secret"**

---

## ✅ Verificación

### **Paso 3: Probar el Despliegue Automático**

1. **Haz un cambio cualquiera** (ejemplo: agrega un comentario en `functions/index.js`)

2. **Haz commit y push:**
   ```bash
   git add .
   git commit -m "Test: Probar despliegue automático"
   git push origin main
   ```

3. **Ve a GitHub Actions:**
   ```
   https://github.com/nelsonsanch/inspecciones-vehiculoso/actions
   ```

4. **Deberías ver:**
   - 🟡 Un workflow en progreso "Deploy Firebase Cloud Functions"
   - Después de 2-3 minutos: 🟢 "Deploy Firebase Cloud Functions" completado

---

## 🔍 Revisar el Despliegue

### **En GitHub:**

1. Ve a: https://github.com/nelsonsanch/inspecciones-vehiculoso/actions
2. Haz clic en el workflow más reciente
3. Puedes ver los logs de cada paso

### **En Firebase:**

1. Ve a: https://console.firebase.google.com/project/inspecciones-vehiculoso/functions
2. Deberías ver las 3 funciones activas:
   - ✅ `deleteConductor`
   - ✅ `deactivateConductor`
   - ✅ `activateConductor`

### **En la App:**

1. Ve a: https://inspeccionpesv.abacusai.app/admin/conductores
2. Intenta eliminar un conductor
3. Debería funcionar automáticamente

---

## 🚨 Solución de Problemas

### **Error: "FIREBASE_TOKEN secret not found"**

**Causa:** No agregaste el secreto en GitHub.

**Solución:**
1. Ve al Paso 2 de esta guía
2. Verifica que el secreto se llame exactamente `FIREBASE_TOKEN` (en mayúsculas)

---

### **Error: "Permission denied"**

**Causa:** El token no tiene permisos para desplegar.

**Solución:**
1. Genera un nuevo token:
   ```bash
   firebase login:ci
   ```
2. Asegúrate de iniciar sesión con la cuenta que tiene permisos en el proyecto
3. Actualiza el secreto en GitHub con el nuevo token

---

### **Error: "Project not found"**

**Causa:** El proyecto no está correctamente configurado.

**Solución:**
1. Verifica que `.firebaserc` existe y contiene:
   ```json
   {
     "projects": {
       "default": "inspecciones-vehiculoso"
     }
   }
   ```
2. Haz push de nuevo

---

### **El workflow no se ejecuta**

**Causa:** No hay cambios en la carpeta `functions/`

**Solución:**
El workflow solo se ejecuta cuando:
- Haces cambios en la carpeta `functions/`
- Modificas el archivo de workflow

Si quieres forzar el despliegue, agrega un comentario en `functions/index.js` y haz push.

---

## 📊 ¿Cómo funciona?

```
1. Tú haces push a GitHub
        ↓
2. GitHub detecta cambios en functions/
        ↓
3. GitHub Actions inicia el workflow
        ↓
4. Instala dependencias de las functions
        ↓
5. Despliega a Firebase usando el token
        ↓
6. ✅ Cloud Functions actualizadas
```

---

## 🔄 Flujo de Trabajo Normal

### **Para hacer cambios en las Cloud Functions:**

```bash
# 1. Editar el código
vim functions/index.js

# 2. Commit y push
git add .
git commit -m "Actualizar función deleteConductor"
git push origin main

# 3. GitHub Actions despliega automáticamente
# (no necesitas hacer nada más)
```

### **Para hacer cambios en el Frontend:**

```bash
# 1. Editar el código
vim app/admin/conductores/page.tsx

# 2. Commit y push
git add .
git commit -m "Mejorar UI de conductores"
git push origin main

# 3. Netlify despliega automáticamente
# (GitHub Actions no se ejecuta porque no hay cambios en functions/)
```

---

## 💰 Costos

### **GitHub Actions:**
- ✅ **2,000 minutos gratis al mes** (cuenta pública)
- Cada despliegue: ~2-3 minutos
- 2,000 minutos = ~700 despliegues al mes
- **Conclusion: GRATIS** para tu caso de uso

### **Firebase Cloud Functions:**
- ✅ **2 millones de invocaciones gratis al mes**
- **Conclusion: GRATIS** (como ya sabemos)

---

## 🎯 Resumen

### **Configuración inicial:**
1. ✅ Generar token: `firebase login:ci`
2. ✅ Agregar secreto `FIREBASE_TOKEN` en GitHub
3. ✅ Hacer push para probar

### **A partir de ahora:**
- Cada push despliega automáticamente
- No necesitas hacer nada manual
- Funciona igual que Netlify

---

## 📚 Enlaces Útiles

- **GitHub Actions:** https://github.com/nelsonsanch/inspecciones-vehiculoso/actions
- **Firebase Console:** https://console.firebase.google.com/project/inspecciones-vehiculoso/functions
- **App Desplegada:** https://inspeccionpesv.abacusai.app/admin/conductores

---

## 🚀 ¡Listo!

Una vez configurado el token, **cada push desplegará automáticamente las Cloud Functions**. 🎉

Si tienes problemas, revisa la sección de Solución de Problemas o los logs en GitHub Actions.
