import * as dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

// Cargar variables de entorno
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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Crear usuarios de prueba
    console.log('👤 Creando usuarios...');
    
    let adminUid = '';
    let conductorUid = '';

    // Admin user
    try {
      const adminUserCredential = await createUserWithEmailAndPassword(auth, 'admin@test.com', 'admin123');
      adminUid = adminUserCredential.user.uid;
      await setDoc(doc(db, 'users', adminUserCredential.user.uid), {
        id: adminUserCredential.user.uid,
        email: 'admin@test.com',
        name: 'Administrador Sistema',
        role: 'administrador',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Admin creado');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Admin ya existe, omitiendo...');
        // Necesitamos obtener el UID del usuario existente
        // Por simplicidad, usaremos un ID conocido o lo buscaremos
      } else {
        throw error;
      }
    }

    // Conductor user
    try {
      const conductorUserCredential = await createUserWithEmailAndPassword(auth, 'conductor@test.com', 'conductor123');
      conductorUid = conductorUserCredential.user.uid;
      await setDoc(doc(db, 'users', conductorUserCredential.user.uid), {
        id: conductorUserCredential.user.uid,
        email: 'conductor@test.com',
        name: 'Carlos Rodríguez',
        role: 'conductor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log('✅ Conductor creado');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️  Conductor ya existe, omitiendo...');
      } else {
        throw error;
      }
    }

    // Crear vehículos de prueba
    console.log('🚗 Creando vehículos...');
    const vehiculosData = [
      {
        placa: 'ABC123',
        marca: 'Chevrolet',
        modelo: 'Aveo',
        año: 2020,
        tipoVehiculo: 'automovil',
        color: 'blanco',
        kilometraje: 45000,
        estado: 'activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        placa: 'XYZ789',
        marca: 'Toyota',
        modelo: 'Corolla',
        año: 2019,
        tipoVehiculo: 'automovil',
        color: 'gris',
        kilometraje: 62000,
        estado: 'activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        placa: 'DEF456',
        marca: 'Mazda',
        modelo: 'CX-5',
        año: 2021,
        tipoVehiculo: 'camioneta',
        color: 'negro',
        kilometraje: 28000,
        estado: 'activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const vehiculoIds = [];
    for (const vehiculo of vehiculosData) {
      const docRef = await addDoc(collection(db, 'vehiculos'), vehiculo);
      vehiculoIds.push(docRef.id);
      console.log(`✅ Vehículo ${vehiculo.placa} creado`);
    }

    // Crear conductor en la colección conductores
    console.log('👨‍💼 Creando registro de conductor...');
    const conductorDocRef = await addDoc(collection(db, 'conductores'), {
      nombre: 'Carlos Rodríguez',
      cedula: '12345678',
      numeroLicencia: 'LC123456',
      categoriaLicencia: 'B1',
      telefono: '3001234567',
      email: 'conductor@test.com',
      userId: conductorUid || 'existing-conductor-uid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Conductor registrado');

    // Crear inspecciones de ejemplo
    console.log('📋 Creando inspecciones de ejemplo...');
    const inspeccionesData = [
      {
        vehiculoId: vehiculoIds[0],
        conductorId: conductorDocRef.id,
        fecha: new Date().toISOString().split('T')[0],
        hora: '08:30',
        kilometrajeActual: 45050,
        documentacion: {
          soatVigente: true,
          tecnomecanicaVigente: true,
          tarjetaPropiedad: true,
          polizaSeguro: true,
        },
        inspeccionExterior: {
          carroceria: true,
          espejos: true,
          lucesDelanteras: true,
          lucesTraseras: true,
          lucesDireccionales: true,
          lucesFrenos: true,
          llantasEstado: true,
          llantasPresion: true,
          limpiabrisas: true,
          vidrios: true,
        },
        inspeccionInterior: {
          cinturones: true,
          asientos: true,
          tableroInstrumentos: true,
          frenos: true,
          direccion: true,
          claxon: true,
          pitoReversa: true,
        },
        elementosSeguridad: {
          botiquin: true,
          extintor: true,
          kitCarreteras: true,
          chalecoReflectivo: true,
          tacos: true,
        },
        nivealesFluidos: {
          aceiteMotor: true,
          liquidoFrenos: true,
          refrigerante: true,
          aguaLimpiaparabrisas: true,
        },
        observaciones: 'Vehículo en excelente estado. Todos los sistemas funcionando correctamente.',
        estado: 'aprobado',
        createdAt: new Date().toISOString(),
      },
      {
        vehiculoId: vehiculoIds[1],
        conductorId: conductorDocRef.id,
        fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        hora: '07:15',
        kilometrajeActual: 62100,
        documentacion: {
          soatVigente: true,
          tecnomecanicaVigente: false, // Problema aquí
          tarjetaPropiedad: true,
          polizaSeguro: true,
        },
        inspeccionExterior: {
          carroceria: true,
          espejos: true,
          lucesDelanteras: true,
          lucesTraseras: false, // Problema aquí
          lucesDireccionales: true,
          lucesFrenos: true,
          llantasEstado: true,
          llantasPresion: true,
          limpiabrisas: true,
          vidrios: true,
        },
        inspeccionInterior: {
          cinturones: true,
          asientos: true,
          tableroInstrumentos: true,
          frenos: true,
          direccion: true,
          claxon: true,
          pitoReversa: true,
        },
        elementosSeguridad: {
          botiquin: false, // Problema aquí
          extintor: true,
          kitCarreteras: true,
          chalecoReflectivo: true,
          tacos: true,
        },
        nivealesFluidos: {
          aceiteMotor: true,
          liquidoFrenos: true,
          refrigerante: true,
          aguaLimpiaparabrisas: true,
        },
        observaciones: 'PROBLEMAS ENCONTRADOS: Tecnomecánica vencida, luces traseras no funcionan, falta botiquín. Vehículo NO APTO para operación.',
        estado: 'rechazado',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    for (const inspeccion of inspeccionesData) {
      await addDoc(collection(db, 'inspecciones'), inspeccion);
      console.log(`✅ Inspección para vehículo ${inspeccion.vehiculoId} creada`);
    }

    console.log('🎉 Seeding completado exitosamente!');
    console.log('');
    console.log('📝 Credenciales de prueba:');
    console.log('👨‍💼 Admin: admin@test.com / admin123');
    console.log('🚗 Conductor: conductor@test.com / conductor123');
    console.log('');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

seed();
