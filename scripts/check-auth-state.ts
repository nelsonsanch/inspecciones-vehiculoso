import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function checkAuthState() {
  try {
    console.log('🔍 Verificando estado de autenticación...\n');

    // 1. Listar todos los conductores
    console.log('📋 CONDUCTORES EN FIRESTORE:');
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    conductoresSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.nombre} (${data.email})`);
      console.log(`    userId: ${data.userId}`);
      console.log(`    docId: ${doc.id}\n`);
    });

    // 2. Listar todos los usuarios
    console.log('\n👤 USUARIOS EN FIRESTORE (colección users):');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.email})`);
      console.log(`    role: ${data.role}`);
      console.log(`    docId: ${doc.id}\n`);
    });

    console.log('\n🎉 Verificación completada');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAuthState();
