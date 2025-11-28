import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { conductorData, password } = await request.json();

    if (
      !conductorData ||
      !password ||
      !conductorData.email ||
      !conductorData.nombre
    ) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // 1. Crear usuario en Firebase Auth (Admin SDK)
    const userRecord = await getAdminAuth().createUser({
      email: conductorData.email,
      password: password,
      displayName: conductorData.nombre,
      disabled: false,
    });

    const uid = userRecord.uid;

    // 2. Crear documento del usuario en la colección 'users'
    const userDocRef = getAdminDb().collection("users").doc(uid);
    await userDocRef.set({
      id: uid,
      email: conductorData.email,
      name: conductorData.nombre,
      role: "conductor",
      estado: "activo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 3. Crear documento del conductor en la colección 'conductores'
    const conductorDocRef = getAdminDb().collection("conductores").doc(uid);
    await conductorDocRef.set({
      ...conductorData,
      userId: uid,
      estado: "activo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, userId: uid });
  } catch (error: any) {
    console.error("Error creando conductor (API):", error);
    // Devolver un error más específico si es posible
    const errorCode = error.code || "unknown";
    const errorMessage = error.message || "Ocurrió un error en el servidor.";
    return NextResponse.json(
      { error: errorMessage, code: errorCode },
      { status: 500 }
    );
  }
}
