import * as admin from 'firebase-admin';

// Función para inicializar Firebase Admin SDK de forma lazy
let adminInitialized = false;

function initializeAdmin() {
  if (adminInitialized || admin.apps.length > 0) {
    return;
  }

  try {
    // Estrategia de inicialización flexible:
    // 1. (Producción en Netlify/Vercel): Usar un token de acceso si está disponible.
    // 2. (Local/Google Cloud): Usar Application Default Credentials (ADC).

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Método para producción (Netlify/Vercel con Workload Identity Federation).
      // El SDK lee esta variable automáticamente.
      console.log('Inicializando Firebase Admin SDK con Workload Identity Federation...');
      admin.initializeApp();
    } else {
      // Método para desarrollo local (usando `gcloud auth application-default login`).
      console.log('Inicializando Firebase Admin SDK con Application Default Credentials...');
      admin.initializeApp();
    }
    
    adminInitialized = true;
    console.log('Firebase Admin SDK inicializado correctamente');
  } catch (error) {
    console.error('Error inicializando Firebase Admin SDK:', error);
    throw error;
  }
}

// Getters lazy que inicializan cuando se necesitan
export function getAdminAuth() {
  initializeAdmin();
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK no está inicializado. Verifica las credenciales.');
  }
  return admin.auth();
}

export function getAdminDb() {
  initializeAdmin();
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK no está inicializado. Verifica las credenciales.');
  }
  return admin.firestore();
}

export default admin;
