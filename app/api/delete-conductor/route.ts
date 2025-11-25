import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

/**
 * API Route para eliminar COMPLETAMENTE un conductor
 * Elimina de:
 * 1. Firebase Authentication (usando Admin SDK)
 * 2. Firestore - colección 'users'
 * 3. Firestore - colección 'conductores'
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener instancias de Admin SDK
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Paso 1: Obtener datos del usuario antes de eliminar
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'Usuario no encontrado en Firestore' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // No permitir eliminar administradores
    if (userData?.role === 'administrador') {
      return NextResponse.json(
        { error: 'No se pueden eliminar administradores' },
        { status: 403 }
      );
    }

    // Paso 2: Eliminar de Firebase Authentication (Admin SDK)
    try {
      await adminAuth.deleteUser(userId);
      console.log(`Usuario ${userId} eliminado de Firebase Auth`);
    } catch (authError: any) {
      // Si el usuario no existe en Auth, continuamos (puede haber sido eliminado antes)
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
      console.log(`Usuario ${userId} no encontrado en Firebase Auth (puede haber sido eliminado antes)`);
    }

    // Paso 3: Eliminar de Firestore - colección 'conductores'
    try {
      await adminDb.collection('conductores').doc(userId).delete();
      console.log(`Usuario ${userId} eliminado de colección conductores`);
    } catch (error) {
      console.log('No se pudo eliminar de conductores (puede que no exista):', error);
    }

    // Paso 4: Eliminar de Firestore - colección 'users'
    await adminDb.collection('users').doc(userId).delete();
    console.log(`Usuario ${userId} eliminado de colección users`);

    return NextResponse.json({
      success: true,
      message: 'Conductor eliminado completamente',
      email: userData?.email,
    });

  } catch (error: any) {
    console.error('Error al eliminar conductor:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar el conductor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
