const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();

/**
 * Cloud Function para eliminar un conductor
 * 
 * Esta función elimina un conductor tanto de Firebase Auth como de Firestore.
 * Solo puede ser llamada por usuarios autenticados.
 * 
 * @param {string} conductorId - UID del conductor a eliminar
 * @returns {object} - Resultado de la operación
 */
exports.deleteConductor = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario esté autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado para eliminar conductores.'
    );
  }

  const { conductorId } = data;

  if (!conductorId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'El ID del conductor es requerido.'
    );
  }

  try {
    console.log(`Iniciando eliminación del conductor: ${conductorId}`);

    // 1. Eliminar de Firebase Authentication
    try {
      await admin.auth().deleteUser(conductorId);
      console.log(`✅ Usuario eliminado de Firebase Auth: ${conductorId}`);
    } catch (authError) {
      // Si el usuario ya no existe en Auth, continuar
      if (authError.code === 'auth/user-not-found') {
        console.log(`⚠️  Usuario ya no existe en Auth: ${conductorId}`);
      } else {
        throw authError;
      }
    }

    // 2. Eliminar de la colección 'conductores'
    const conductorRef = admin.firestore().collection('conductores').doc(conductorId);
    const conductorDoc = await conductorRef.get();
    
    if (conductorDoc.exists) {
      await conductorRef.delete();
      console.log(`✅ Conductor eliminado de Firestore: ${conductorId}`);
    } else {
      console.log(`⚠️  Conductor no encontrado en Firestore: ${conductorId}`);
    }

    // 3. Eliminar de la colección 'users'
    const userRef = admin.firestore().collection('users').doc(conductorId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.delete();
      console.log(`✅ Usuario eliminado de la colección users: ${conductorId}`);
    } else {
      console.log(`⚠️  Usuario no encontrado en la colección users: ${conductorId}`);
    }

    console.log(`✅ Eliminación completa del conductor: ${conductorId}`);

    return {
      success: true,
      message: 'Conductor eliminado completamente',
      conductorId: conductorId
    };

  } catch (error) {
    console.error('Error al eliminar conductor:', error);
    
    throw new functions.https.HttpsError(
      'internal',
      `Error al eliminar el conductor: ${error.message}`,
      { originalError: error.message }
    );
  }
});

/**
 * Cloud Function para desactivar un conductor
 * 
 * Esta función cambia el estado del conductor a 'inactivo'.
 * Solo puede ser llamada por usuarios autenticados.
 * 
 * @param {string} conductorId - UID del conductor a desactivar
 * @returns {object} - Resultado de la operación
 */
exports.deactivateConductor = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado.'
    );
  }

  const { conductorId } = data;

  if (!conductorId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'El ID del conductor es requerido.'
    );
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    // Actualizar en 'conductores'
    const conductorRef = db.collection('conductores').doc(conductorId);
    batch.update(conductorRef, { estado: 'inactivo' });

    // Actualizar en 'users'
    const userRef = db.collection('users').doc(conductorId);
    batch.update(userRef, { estado: 'inactivo' });

    await batch.commit();

    return {
      success: true,
      message: 'Conductor desactivado exitosamente'
    };

  } catch (error) {
    console.error('Error al desactivar conductor:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Error al desactivar el conductor: ${error.message}`
    );
  }
});

/**
 * Cloud Function para activar un conductor
 * 
 * Esta función cambia el estado del conductor a 'activo'.
 * Solo puede ser llamada por usuarios autenticados.
 * 
 * @param {string} conductorId - UID del conductor a activar
 * @returns {object} - Resultado de la operación
 */
exports.activateConductor = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'El usuario debe estar autenticado.'
    );
  }

  const { conductorId } = data;

  if (!conductorId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'El ID del conductor es requerido.'
    );
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    // Actualizar en 'conductores'
    const conductorRef = db.collection('conductores').doc(conductorId);
    batch.update(conductorRef, { estado: 'activo' });

    // Actualizar en 'users'
    const userRef = db.collection('users').doc(conductorId);
    batch.update(userRef, { estado: 'activo' });

    await batch.commit();

    return {
      success: true,
      message: 'Conductor activado exitosamente'
    };

  } catch (error) {
    console.error('Error al activar conductor:', error);
    throw new functions.https.HttpsError(
      'internal',
      `Error al activar el conductor: ${error.message}`
    );
  }
});
