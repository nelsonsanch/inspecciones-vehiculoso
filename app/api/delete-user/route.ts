import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * API Route para eliminar un usuario de Firebase Auth y Firestore
 * 
 * IMPORTANTE: Esta ruta NO puede eliminar usuarios de Firebase Auth directamente
 * desde el cliente porque requiere Firebase Admin SDK que no está disponible.
 * 
 * Por ahora, solo eliminamos de Firestore. Para eliminar de Auth, hay que hacerlo
 * manualmente desde la consola de Firebase.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // No permitir eliminar administradores
    if (userData.role === 'administrador') {
      return NextResponse.json(
        { error: 'No se pueden eliminar administradores' },
        { status: 403 }
      );
    }

    // Eliminar de la colección 'conductores'
    try {
      await deleteDoc(doc(db, 'conductores', userId));
    } catch (error) {
      console.log('No se pudo eliminar de conductores (puede que no exista):', error);
    }

    // Eliminar de la colección 'users'
    await deleteDoc(doc(db, 'users', userId));

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado de Firestore correctamente',
      warning: 'NOTA: Debes eliminar manualmente este usuario de Firebase Auth desde la consola de Firebase para que el email quede disponible.',
      email: userData.email,
      authConsoleUrl: `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/authentication/users`
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
}
