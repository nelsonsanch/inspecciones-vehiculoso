# 🚀 Instrucciones para Agregar el Workflow de GitHub Actions

## ⚠️ Paso Importante

Debido a restricciones de seguridad de GitHub, necesitas **agregar manualmente** el archivo de workflow.

---

## 📋 Pasos (5 minutos)

### **Opción A: Desde GitHub Web (MÁS FÁCIL)**

1. **Ve a tu repositorio en GitHub:**
   ```
   https://github.com/nelsonsanch/inspecciones-vehiculoso
   ```

2. **Crea la estructura de carpetas:**
   - Haz clic en "Add file" → "Create new file"
   - En el nombre del archivo, escribe: `.github/workflows/deploy-functions.yml`
   - (GitHub creará automáticamente las carpetas)

3. **Copia y pega este contenido:**

```yaml
name: Deploy Firebase Cloud Functions

on:
  push:
    branches:
      - main
    paths:
      - 'functions/**'
      - '.github/workflows/deploy-functions.yml'

jobs:
  deploy:
    name: Deploy to Firebase
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd functions
          npm ci
          cd ..

      - name: Deploy to Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          npm install -g firebase-tools
          firebase deploy --only functions --token "$FIREBASE_TOKEN" --project inspecciones-vehiculoso
```

4. **Commit el archivo:**
   - Scroll hacia abajo
   - Commit message: "Agregar workflow de GitHub Actions"
   - Haz clic en "Commit new file"

---

### **Opción B: Desde tu Computadora**

1. **Clona el repositorio (si no lo tienes):**
   ```bash
   git clone https://github.com/nelsonsanch/inspecciones-vehiculoso.git
   cd inspecciones-vehiculoso/nextjs_space
   ```

2. **Crea las carpetas:**
   ```bash
   mkdir -p .github/workflows
   ```

3. **Crea el archivo:**
   ```bash
   nano .github/workflows/deploy-functions.yml
   ```

4. **Pega el contenido del paso 3 de la Opción A**

5. **Guarda y haz push:**
   ```bash
   git add .github/workflows/deploy-functions.yml
   git commit -m "Agregar workflow de GitHub Actions"
   git push origin main
   ```

---

## ✅ Verificación

1. **Ve a GitHub Actions:**
   ```
   https://github.com/nelsonsanch/inspecciones-vehiculoso/actions
   ```

2. **Deberías ver:**
   - ⚠️ Un workflow que falló (normal, porque aún no has configurado el token)
   - O ningún workflow (esperando cambios en `functions/`)

---

## 🔐 Siguiente Paso: Configurar el Token

Una vez que agregues el workflow, continúa con el **Paso 1** de `GITHUB-ACTIONS-SETUP.md`:

1. Generar token: `firebase login:ci`
2. Agregar secreto `FIREBASE_TOKEN` en GitHub
3. Hacer push para probar

---

## 🎯 Resumen

### **Lo que ya está hecho:**
- ✅ Documentación completa
- ✅ Configuración de Firebase
- ✅ Cloud Functions listas

### **Lo que te falta:**
1. ⏳ Agregar el archivo de workflow (5 minutos)
2. ⏳ Configurar el token FIREBASE_TOKEN (5 minutos)

**Total: 10 minutos para tener despliegue automático** 🚀

---

## 🆘 ¿Necesitas ayuda?

- **Ver logs del workflow:** https://github.com/nelsonsanch/inspecciones-vehiculoso/actions
- **Documentación completa:** Ver `GITHUB-ACTIONS-SETUP.md`
- **Guía de despliegue:** Ver `DESPLIEGUE-COMPLETO.md`
