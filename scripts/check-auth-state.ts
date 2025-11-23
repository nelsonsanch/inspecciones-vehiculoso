import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
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

async function checkAuthState() {
  console.log('🔍 Verificando estado de autenticación...\n');

  // Intentar login como admin
  console.log('=== ADMIN ===');
  try {
    const adminCred = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✅ Login exitoso');
    console.log('   UID:', adminCred.user.uid);
    
    // Verificar documento en Firestore
    const userDoc = await getDoc(doc(db, 'users', adminCred.user.uid));
    if (userDoc.exists()) {
      console.log('✅ Documento en Firestore existe');
      console.log('   Datos:', userDoc.data());
    } else {
      console.log('❌ Documento en Firestore NO existe');
    }
  } catch (error: any) {
    console.log('❌ Error en login:', error.code || error.message);
  }

  console.log('\n=== CONDUCTOR ===');
  try {
    const conductorCred = await signInWithEmailAndPassword(auth, 'conductor@test.com', 'conductor123');
    console.log('✅ Login exitoso');
    console.log('   UID:', conductorCred.user.uid);
    
    // Verificar documento en Firestore
    const userDoc = await getDoc(doc(db, 'users', conductorCred.user.uid));
    if (userDoc.exists()) {
      console.log('✅ Documento en Firestore existe');
      console.log('   Datos:', userDoc.data());
    } else {
      console.log('❌ Documento en Firestore NO existe');
    }
    
    // Verificar documento de conductor
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    const conductorDoc = conductoresSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.userId === conductorCred.user.uid || data.email === 'conductor@test.com';
    });
    
    if (conductorDoc) {
      console.log('✅ Documento de conductor existe');
      console.log('   Datos:', conductorDoc.data());
    } else {
      console.log('❌ Documento de conductor NO existe');
    }
  } catch (error: any) {
    console.log('❌ Error en login:', error.code || error.message);
  }

  process.exit(0);
}

checkAuthState().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
