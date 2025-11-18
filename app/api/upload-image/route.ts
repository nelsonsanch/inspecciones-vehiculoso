
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Convertir el archivo a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generar nombre único para el archivo
    const fileName = `${Date.now()}-${file.name}`;
    
    // Subir a S3
    const cloudStoragePath = await uploadFile(buffer, fileName);
    
    return NextResponse.json({ 
      success: true,
      cloudStoragePath 
    });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      { error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}
