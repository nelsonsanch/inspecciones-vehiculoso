import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
const auth = getAuth(app);
const db = getFirestore(app);

async function fixAdmin() {
  try {
    console.log('🔧 Verificando usuario admin...');
    
    // Intentar hacer login para obtener el UID
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    const uid = userCredential.user.uid;
    
    console.log(`✅ Admin autenticado. UID: ${uid}`);
    
    // Crear/actualizar el documento en Firestore
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      email: 'admin@test.com',
      name: 'Administrador Sistema',
      role: 'administrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log('✅ Documento del admin creado en Firestore');
    console.log('🎉 ¡Listo! Ahora puedes hacer login con: admin@test.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixAdmin();
