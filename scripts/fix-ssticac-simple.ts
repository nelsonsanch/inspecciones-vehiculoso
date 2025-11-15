
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixUser() {
  // UID del usuario según la imagen de Firebase Authentication
  const uid = '89PqbXFlhNQ18merYqPje5qN2gy1';
  const email = 'ssticac@gmail.com';
  
  try {
    console.log(`\n🔍 Verificando usuario en Firestore...`);
    console.log(`   UID: ${uid}`);
    console.log(`   Email: ${email}`);
    
    // Verificar si existe el documento
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`\n📄 Documento existente:`, userData);
      
      if (!userData?.role) {
        console.log(`\n⚠️  Agregando campo 'role'...`);
        await setDoc(userDocRef, {
          ...userData,
          role: 'administrador',
          updatedAt: new Date(),
        }, { merge: true });
        console.log(`✅ Campo 'role' agregado`);
      } else {
        console.log(`✅ El usuario ya tiene el rol: ${userData.role}`);
      }
    } else {
      console.log(`\n❌ Documento no existe. Creando...`);
      
      await setDoc(userDocRef, {
        email: email,
        nombre: 'Sebastian Stickel',
        role: 'administrador',
        createdAt: new Date(),
      });
      
      console.log(`✅ Documento creado exitosamente`);
    }
    
    console.log(`\n✨ Usuario ${email} está listo para iniciar sesión`);
    console.log(`\n📋 Credenciales:`);
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: chhvgtja0NHG`);
    
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    process.exit(1);
  }
}

fixUser()
  .then(() => {
    console.log('\n🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
