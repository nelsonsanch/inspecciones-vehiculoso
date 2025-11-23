import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
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

async function checkAdminUser() {
  try {
    console.log('🔍 Intentando autenticar admin@test.com...');
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'admin@test.com',
      'admin123'
    );
    
    const uid = userCredential.user.uid;
    console.log('✅ Autenticación exitosa');
    console.log('UID:', uid);
    
    // Verificar documento en Firestore
    console.log('\n🔍 Verificando documento en Firestore...');
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      console.log('✅ Documento encontrado en /users/' + uid);
      console.log('Datos:', JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('❌ NO se encontró documento en /users/' + uid);
      console.log('⚠️  Esto causará error de permisos');
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminUser();
