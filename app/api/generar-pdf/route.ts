
import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { uploadFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inspeccion, vehiculo, conductor, firmaBase64 } = body;

    // Crear nuevo PDF
    const doc = new jsPDF();
    let y = 20;

    // Título
    doc.setFontSize(18);
    doc.text('Inspección Preoperacional de Vehículo', 20, y);
    y += 15;

    // Información del vehículo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Vehículo', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Placa: ${vehiculo.placa}`, 20, y);
    y += 6;
    doc.text(`Marca: ${vehiculo.marca}`, 20, y);
    y += 6;
    doc.text(`Modelo: ${vehiculo.modelo}`, 20, y);
    y += 6;
    doc.text(`Tipo: ${vehiculo.tipoVehiculo}`, 20, y);
    y += 10;

    // Información del conductor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Conductor', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${conductor.nombre}`, 20, y);
    y += 6;
    doc.text(`Licencia: ${conductor.numeroLicencia}`, 20, y);
    y += 10;

    // Información de la inspección
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles de la Inspección', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date(inspeccion.fecha).toLocaleString('es-CO')}`, 20, y);
    y += 6;
    doc.text(`Kilometraje: ${inspeccion.kilometrajeActual} km`, 20, y);
    y += 6;
    doc.text(`Destino: ${inspeccion.destino || 'No especificado'}`, 20, y);
    y += 6;
    doc.text(`Estado: ${inspeccion.estado}`, 20, y);
    y += 10;

    // Salud del conductor
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado de Salud del Conductor', 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`¿Se encuentra en condiciones para conducir?: ${inspeccion.saludConductor.aptoConducir}`, 20, y);
    y += 6;
    if (inspeccion.saludConductor.observaciones) {
      doc.text(`Observaciones: ${inspeccion.saludConductor.observaciones}`, 20, y);
      y += 6;
    }
    y += 10;

    // Resultados por categoría
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados de la Inspección', 20, y);
    y += 8;

    const categorias = [
      { key: 'documentos', titulo: 'Documentos' },
      { key: 'estadoGeneral', titulo: 'Estado General' },
      { key: 'motorCapo', titulo: 'Motor y Capó' },
      { key: 'sistemaElectrico', titulo: 'Sistema Eléctrico' },
      { key: 'sistemaFrenos', titulo: 'Sistema de Frenos' },
      { key: 'llantas', titulo: 'Llantas' },
      { key: 'carroceria', titulo: 'Carrocería' },
      { key: 'cabina', titulo: 'Cabina' },
      { key: 'equipoSeguridad', titulo: 'Equipo de Seguridad' },
    ];

    for (const categoria of categorias) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(categoria.titulo, 20, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const items = inspeccion[categoria.key];
      if (items && typeof items === 'object') {
        for (const [key, value] of Object.entries(items)) {
          if (y > 275) {
            doc.addPage();
            y = 20;
          }
          const estado = typeof value === 'object' ? (value as any).estado : value;
          const color = estado === 'Bueno' ? [0, 128, 0] : estado === 'Malo' ? [255, 0, 0] : [128, 128, 128];
          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(`  • ${key}: ${estado}`, 25, y);
          doc.setTextColor(0, 0, 0);
          y += 5;
        }
      }
      y += 5;
    }

    // Observaciones
    if (inspeccion.observaciones) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones', 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(inspeccion.observaciones, 170);
      doc.text(lines, 20, y);
      y += lines.length * 6 + 10;
    }

    // Firma
    if (firmaBase64) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Firma del Conductor', 20, y);
      y += 10;
      
      try {
        doc.addImage(firmaBase64, 'PNG', 20, y, 80, 30);
      } catch (error) {
        console.error('Error al agregar firma:', error);
      }
    }

    // Generar PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    // Subir a Firebase Storage
    const fileName = `inspecciones/${inspeccion.vehiculoId}_${Date.now()}.pdf`;
    const pdfPath = await uploadFile(pdfBuffer, fileName);

    return NextResponse.json({ 
      success: true, 
      pdfPath,
      message: 'PDF generado exitosamente'
    });

  } catch (error: any) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: 'Error al generar PDF', details: error.message },
      { status: 500 }
    );
  }
}
