
import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDW8OnWRWiON9C9S-TWDf51XBIyBQQqUR4',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'inspecciones-vehiculoso.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'inspecciones-vehiculoso',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'inspecciones-vehiculoso.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1010250133434',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1010250133434:web:fe83cd4cbf51f3a2d33783',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-NQ4BF5SHMR'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function resetPassword() {
  try {
    console.log('🔐 Script para resetear contraseña de conductor');
    console.log('⚠️  NOTA: Este script requiere Firebase Admin SDK con credenciales de administrador\n');
    
    // Listar conductores disponibles
    console.log('📋 Conductores disponibles:');
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    const conductores: any[] = [];
    
    conductoresSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        conductores.push({
          nombre: data.nombre,
          email: data.email,
          userId: data.userId
        });
        console.log(`  ${conductores.length}. ${data.nombre} (${data.email})`);
      }
    });

    console.log('\n📝 INSTRUCCIONES:');
    console.log('Para resetear la contraseña de un conductor, tienes dos opciones:\n');
    
    console.log('OPCIÓN A - Desde la Consola de Firebase (Recomendado):');
    console.log('1. Ve a https://console.firebase.google.com/');
    console.log('2. Selecciona tu proyecto "inspecciones-vehiculoso"');
    console.log('3. Ve a "Authentication" > "Users"');
    console.log('4. Busca el usuario por email');
    console.log('5. Haz clic en el menú de 3 puntos (⋮) > "Reset password"');
    console.log('6. Se enviará un email de recuperación al conductor\n');
    
    console.log('OPCIÓN B - Crear un nuevo conductor:');
    console.log('1. Inicia sesión como administrador');
    console.log('2. Ve a "Conductores" > "Agregar Conductor"');
    console.log('3. Completa el formulario con un email diferente');
    console.log('4. GUARDA las credenciales que se muestran en pantalla\n');
    
    console.log('OPCIÓN C - Eliminar y recrear:');
    console.log('1. Elimina el conductor desde la interfaz de administrador');
    console.log('2. Créalo nuevamente con el mismo email');
    console.log('3. GUARDA las credenciales generadas\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetPassword();
