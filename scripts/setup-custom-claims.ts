import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuración usando las credenciales del cliente
const serviceAccount: ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: `firebase-adminsdk@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);
const db = getFirestore(app);

async function setupCustomClaims() {
  try {
    console.log('\n🔧 Configurando Custom Claims para usuarios...\n');
    
    // Obtener todos los usuarios de Firestore
    const usersSnapshot = await db.collection('users').get();
    
    let updated = 0;
    let errors = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const role = userData.role;
      
      try {
        // Establecer custom claim con el rol
        await auth.setCustomUserClaims(uid, { role: role });
        console.log(`✅ Custom claim configurado para ${userData.email}: role=${role}`);
        updated++;
      } catch (error: any) {
        console.error(`❌ Error con ${userData.email}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('\n✨ Los usuarios deben cerrar sesión y volver a iniciar para que los cambios surtan efecto.\n');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.log('\n⚠️  Este script requiere credenciales de Firebase Admin SDK.');
    console.log('    Por ahora, vamos a implementar las reglas sin custom claims.\n');
    process.exit(1);
  }
}

setupCustomClaims();
