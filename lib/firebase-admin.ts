import * as admin from 'firebase-admin';

// Función para inicializar Firebase Admin SDK de forma lazy
let adminInitialized = false;

function initializeAdmin() {
  if (adminInitialized || admin.apps.length > 0) {
    return;
  }

  try {
    // Verificar que las credenciales están disponibles
    if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.warn('Firebase Admin SDK credentials not configured. Delete functionality will not work.');
      return;
    }

    // Configuración usando variables de entorno
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // La private key viene como string con \n, hay que reemplazarlos
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
    
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
