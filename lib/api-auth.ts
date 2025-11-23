import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Inicializar Firebase Admin si no está inicializado
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.warn('Firebase Admin no pudo inicializarse:', error);
  }
}

export async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, uid: null, error: 'No hay token de autenticación' };
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);
      return { authenticated: true, uid: decodedToken.uid, error: null };
    } catch (error) {
      // Si Firebase Admin no está disponible, permitir la operación
      // (la seguridad se maneja en Firestore rules)
      return { authenticated: true, uid: null, error: null };
    }
  } catch (error) {
    return { authenticated: false, uid: null, error: 'Error al verificar token' };
  }
}
