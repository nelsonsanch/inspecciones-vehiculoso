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

async function testAdminLogin() {
  try {
    console.log('🧪 Probando login de administrador...\n');
    
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✅ Login exitoso!');
    console.log(`   Usuario: ${userCredential.user.email}`);
    console.log(`   UID: ${userCredential.user.uid}\n`);
    
    // Verificar documento en Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Documento de usuario encontrado en Firestore');
      console.log(`   Nombre: ${userData.name}`);
      console.log(`   Rol: ${userData.role}\n`);
      
      console.log('🎉 ¡El administrador está correctamente configurado!');
      console.log('\n📋 PASOS PARA CREAR UN CONDUCTOR:');
      console.log('1. Inicia sesión en la app con: admin@test.com / admin123');
      console.log('2. Ve a la sección "Conductores"');
      console.log('3. Haz clic en "Agregar Conductor"');
      console.log('4. Completa el formulario');
      console.log('5. ⚠️  IMPORTANTE: Cuando veas las credenciales generadas, CÓPIALAS y guárdalas');
      console.log('6. Envía esas credenciales al conductor por email o WhatsApp\n');
    } else {
      console.log('❌ Documento de usuario NO encontrado en Firestore');
    }
    
  } catch (error: any) {
    console.error('❌ Error al probar login:', error.message);
  }
}

testAdminLogin();
