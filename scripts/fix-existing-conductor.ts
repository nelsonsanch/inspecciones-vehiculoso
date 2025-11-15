
import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

// Cargar variables de entorno
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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

async function fixExistingConductor() {
  try {
    console.log('🔧 Buscando conductores que necesiten corrección...');

    // Obtener todos los conductores que tengan un userId
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    
    for (const conductorDoc of conductoresSnapshot.docs) {
      const conductorData = conductorDoc.data();
      
      if (conductorData.userId && conductorData.email) {
        console.log(`\n📋 Verificando conductor: ${conductorData.nombre} (${conductorData.email})`);
        
        // Verificar si existe el documento de usuario correcto
        try {
          const userDocRef = doc(db, 'users', conductorData.userId);
          
          // Crear/actualizar el documento de usuario con el UID correcto
          await setDoc(userDocRef, {
            id: conductorData.userId,
            email: conductorData.email,
            name: conductorData.nombre,
            role: 'conductor',
            createdAt: conductorData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          console.log(`✅ Documento de usuario creado/actualizado para ${conductorData.email}`);
        } catch (error) {
          console.error(`❌ Error procesando ${conductorData.email}:`, error);
        }
      }
    }

    console.log('\n🎉 Corrección completada!');
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    process.exit(1);
  }
}

fixExistingConductor();
