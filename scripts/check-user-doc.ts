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

async function checkUserDocument() {
  try {
    console.log('\n🔍 Verificando documento de usuario en Firestore...\n');
    
    // Login como admin
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    const user = userCredential.user;
    
    console.log('✅ Usuario autenticado:', user.email);
    console.log('📌 UID:', user.uid);
    
    // Verificar documento en Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('\n✅ Documento de usuario EXISTE en Firestore');
      console.log('📄 Datos del documento:');
      console.log(JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log('\n❌ ERROR: Documento de usuario NO EXISTE en Firestore');
      console.log('🔧 El documento debería estar en: /users/' + user.uid);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserDocument();
