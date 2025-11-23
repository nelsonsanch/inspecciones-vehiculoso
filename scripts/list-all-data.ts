import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function listAllData() {
  try {
    // Autenticar como admin
    await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✅ Autenticado como admin\n');
    
    // Listar usuarios
    console.log('=== USUARIOS ===');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Total: ${usersSnapshot.docs.length}`);
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.email} (${data.role}) - UID: ${doc.id}`);
    });
    
    // Listar conductores
    console.log('\n=== CONDUCTORES ===');
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    console.log(`Total: ${conductoresSnapshot.docs.length}`);
    conductoresSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.nombre} (${data.email}) - userId: ${data.userId || '❌ NO TIENE'}`);
    });
    
    // Listar vehículos
    console.log('\n=== VEHÍCULOS ===');
    const vehiculosSnapshot = await getDocs(collection(db, 'vehiculos'));
    console.log(`Total: ${vehiculosSnapshot.docs.length}`);
    vehiculosSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${data.placa} (${data.marca} ${data.modelo})`);
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAllData();
