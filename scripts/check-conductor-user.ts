import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

async function checkConductorUsers() {
  console.log('🔍 Verificando conductores y usuarios en Firestore...\n');

  // Primero, autenticarse como admin
  try {
    await signInWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
    console.log('✅ Autenticado como admin\n');
  } catch (error: any) {
    console.error('❌ Error al autenticar:', error.message);
    process.exit(1);
  }

  // 1. Listar todos los conductores
  console.log('=== CONDUCTORES ===');
  const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
  console.log(`Total de conductores: ${conductoresSnapshot.size}\n`);

  for (const conductorDoc of conductoresSnapshot.docs) {
    const conductor = conductorDoc.data();
    console.log(`Conductor: ${conductor.nombre}`);
    console.log(`  - Email: ${conductor.email}`);
    console.log(`  - UserId: ${conductor.userId}`);
    
    // Verificar si existe el usuario correspondiente
    if (conductor.userId) {
      const userDoc = await getDoc(doc(db, 'users', conductor.userId));
      if (userDoc.exists()) {
        console.log(`  ✅ Usuario existe en Firestore`);
        console.log(`     - Role: ${userDoc.data().role}`);
      } else {
        console.log(`  ❌ Usuario NO existe en Firestore`);
      }
    } else {
      console.log(`  ⚠️ No tiene userId asignado`);
    }
    console.log('');
  }

  // 2. Listar todos los usuarios
  console.log('\n=== USUARIOS ===');
  const usersSnapshot = await getDocs(collection(db, 'users'));
  console.log(`Total de usuarios: ${usersSnapshot.size}\n`);

  for (const userDoc of usersSnapshot.docs) {
    const user = userDoc.data();
    console.log(`Usuario: ${user.email}`);
    console.log(`  - ID: ${userDoc.id}`);
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Role: ${user.role}`);
    console.log('');
  }

  // 3. Listar vehículos
  console.log('\n=== VEHÍCULOS ===');
  const vehiculosSnapshot = await getDocs(collection(db, 'vehiculos'));
  console.log(`Total de vehículos: ${vehiculosSnapshot.size}\n`);

  for (const vehiculoDoc of vehiculosSnapshot.docs) {
    const vehiculo = vehiculoDoc.data();
    console.log(`Vehículo: ${vehiculo.placa}`);
    console.log(`  - Marca: ${vehiculo.marca}`);
    console.log(`  - Modelo: ${vehiculo.modelo}`);
    console.log(`  - Estado: ${vehiculo.estado}`);
    console.log('');
  }

  process.exit(0);
}

checkConductorUsers().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
