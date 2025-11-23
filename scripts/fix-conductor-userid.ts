import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
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

async function fixConductorUserId() {
  try {
    console.log('🔍 Intentando autenticar como admin...');
    
    // Autenticar como admin primero
    const adminCred = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✅ Autenticado como admin');
    console.log('Admin UID:', adminCred.user.uid);
    
    // Ahora autenticar como conductor para obtener su UID
    console.log('\n🔍 Intentando autenticar como conductor...');
    const conductorCred = await signInWithEmailAndPassword(auth, 'conductor@test.com', 'conductor123');
    console.log('✅ Autenticado como conductor');
    console.log('Conductor UID:', conductorCred.user.uid);
    
    const conductorUid = conductorCred.user.uid;
    
    // Volver a autenticar como admin para poder actualizar Firestore
    await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    
    // Buscar el documento del conductor en Firestore
    console.log('\n🔍 Buscando conductor en Firestore...');
    const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
    
    let conductorDoc = null;
    conductoresSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.email === 'conductor@test.com') {
        conductorDoc = { id: doc.id, ...data };
      }
    });
    
    if (conductorDoc) {
      console.log('✅ Conductor encontrado en Firestore');
      console.log('   ID del documento:', (conductorDoc as any).id);
      console.log('   Email:', (conductorDoc as any).email);
      console.log('   userId actual:', (conductorDoc as any).userId || 'NO TIENE');
      
      // Actualizar el userId
      console.log('\n🔧 Actualizando userId en el documento del conductor...');
      await updateDoc(doc(db, 'conductores', (conductorDoc as any).id), {
        userId: conductorUid,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ userId actualizado correctamente');
      console.log('   Nuevo userId:', conductorUid);
    } else {
      console.log('❌ No se encontró conductor con email conductor@test.com');
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixConductorUserId();
