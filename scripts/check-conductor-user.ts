import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
const db = getFirestore(app);

async function checkConductores() {
  try {
    console.log('🔍 Verificando conductores en Firestore...\n');
    
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    
    console.log(`Total de conductores encontrados: ${conductoresSnapshot.docs.length}\n`);
    
    conductoresSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Conductor ${index + 1}:`);
      console.log(`  ID del documento: ${doc.id}`);
      console.log(`  Email: ${data.email || 'No especificado'}`);
      console.log(`  Nombre: ${data.nombre || 'No especificado'}`);
      console.log(`  userId: ${data.userId || '❌ NO TIENE userId'}`);
      console.log(`  Datos completos:`, JSON.stringify(data, null, 2));
      console.log('---\n');
    });
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkConductores();
