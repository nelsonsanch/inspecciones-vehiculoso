import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, collection } from 'firebase/firestore';
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

async function fixUsersFirestore() {
  console.log('🔧 Creando documentos faltantes en Firestore...\n');

  // Crear documento para admin
  console.log('=== ADMIN ===');
  try {
    const adminCred = await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    const adminUid = adminCred.user.uid;
    console.log('✅ Admin UID:', adminUid);
    
    await setDoc(doc(db, 'users', adminUid), {
      id: adminUid,
      email: 'admin@test.com',
      name: 'Administrador',
      role: 'administrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Documento de usuario admin creado');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  // Crear documento para conductor
  console.log('\n=== CONDUCTOR ===');
  try {
    const conductorCred = await signInWithEmailAndPassword(auth, 'conductor@test.com', 'conductor123');
    const conductorUid = conductorCred.user.uid;
    console.log('✅ Conductor UID:', conductorUid);
    
    await setDoc(doc(db, 'users', conductorUid), {
      id: conductorUid,
      email: 'conductor@test.com',
      name: 'Conductor de Prueba',
      role: 'conductor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Documento de usuario conductor creado');
    
    // Crear documento de conductor
    const conductorData = {
      nombre: 'Conductor de Prueba',
      cedula: '123456789',
      numeroLicencia: 'C1234567',
      categoriaLicencia: 'C2',
      telefono: '3001234567',
      email: 'conductor@test.com',
      userId: conductorUid,
      licenciaVencimiento: '2025-12-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await addDoc(collection(db, 'conductores'), conductorData);
    console.log('✅ Documento de conductor creado');
  } catch (error: any) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n✅ ¡Proceso completado!');
  process.exit(0);
}

fixUsersFirestore().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
