
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function setupAdmin() {
  const email = 'nelson@sanchezcya.com';
  const password = 'ELrey@28';
  
  console.log('\n🔧 Configurando administrador principal...\n');
  
  try {
    // Intentar crear el usuario
    console.log('1️⃣ Creando usuario en Firebase Authentication...');
    let userCredential;
    let isNewUser = false;
    
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      isNewUser = true;
      console.log('   ✅ Usuario creado exitosamente');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('   ℹ️  Usuario ya existe, verificando credenciales...');
        // Intentar iniciar sesión para verificar que la contraseña es correcta
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log('   ✅ Credenciales verificadas correctamente');
        } catch (loginError: any) {
          if (loginError.code === 'auth/wrong-password') {
            console.log('   ⚠️  La contraseña almacenada en Firebase es diferente a la solicitada');
            console.log('   ⚠️  Necesitas resetear la contraseña desde la consola de Firebase');
            console.log('   ⚠️  O eliminar el usuario y ejecutar este script nuevamente');
            process.exit(1);
          }
          throw loginError;
        }
      } else {
        throw error;
      }
    }
    
    const uid = userCredential.user.uid;
    console.log(`   UID: ${uid}`);
    
    // Crear/actualizar documento en Firestore
    console.log('\n2️⃣ Configurando documento en Firestore...');
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    const userData = {
      email: email,
      nombre: 'Nelson Sanchez',
      role: 'administrador',
      updatedAt: new Date(),
    };
    
    if (userDoc.exists()) {
      console.log('   ℹ️  Actualizando documento existente...');
      await setDoc(userDocRef, userData, { merge: true });
      console.log('   ✅ Documento actualizado');
    } else {
      console.log('   ℹ️  Creando nuevo documento...');
      await setDoc(userDocRef, {
        ...userData,
        createdAt: new Date(),
      });
      console.log('   ✅ Documento creado');
    }
    
    // Verificar ssticac@gmail.com también
    console.log('\n3️⃣ Verificando usuario ssticac@gmail.com...');
    const ssticacUid = '89PqbXFlhNQ18merYqPje5qN2gy1';
    const ssticacDocRef = doc(db, 'users', ssticacUid);
    const ssticacDoc = await getDoc(ssticacDocRef);
    
    if (ssticacDoc.exists()) {
      console.log('   ✅ Usuario ssticac@gmail.com configurado correctamente');
      console.log('   📧 Email: ssticac@gmail.com');
      console.log('   🔑 Contraseña: chhvgtja0NHG');
    } else {
      console.log('   ⚠️  Creando documento para ssticac@gmail.com...');
      await setDoc(ssticacDocRef, {
        email: 'ssticac@gmail.com',
        nombre: 'Sebastian Stickel',
        role: 'administrador',
        createdAt: new Date(),
      });
      console.log('   ✅ Usuario ssticac@gmail.com configurado');
    }
    
    console.log('\n✨ ¡CONFIGURACIÓN COMPLETA!\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES DE ACCESO - ADMINISTRADOR PRINCIPAL');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('   📧 Email:      nelson@sanchezcya.com');
    console.log('   🔑 Contraseña: ELrey@28');
    console.log('   👤 Rol:        Administrador\n');
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES ALTERNATIVAS - ADMINISTRADOR');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('   📧 Email:      ssticac@gmail.com');
    console.log('   🔑 Contraseña: chhvgtja0NHG');
    console.log('   👤 Rol:        Administrador\n');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('🎯 PRÓXIMOS PASOS:\n');
    console.log('   1. Accede a la aplicación con: nelson@sanchezcya.com');
    console.log('   2. Ve a la sección "Conductores"');
    console.log('   3. Haz clic en "Agregar Conductor"');
    console.log('   4. Completa el formulario');
    console.log('   5. IMPORTANTE: Guarda las credenciales generadas\n');
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('Código de error:', error.code);
    process.exit(1);
  }
}

setupAdmin()
  .then(() => {
    console.log('🎉 Script completado exitosamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
