
import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataUrl } = body;
    
    if (!dataUrl) {
      return NextResponse.json(
        { error: "No se proporcionó la firma" },
        { status: 400 }
      );
    }

    // Convertir data URL a Buffer
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    
    // Generar nombre único para el archivo
    const fileName = `signature-${Date.now()}.png`;
    
    // Subir a S3
    const cloudStoragePath = await uploadFile(buffer, fileName);
    
    return NextResponse.json({ 
      success: true,
      cloudStoragePath 
    });
  } catch (error) {
    console.error("Error al subir firma:", error);
    return NextResponse.json(
      { error: "Error al subir la firma" },
      { status: 500 }
    );
  }
}
