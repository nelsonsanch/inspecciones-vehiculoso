
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Inspeccion, RespuestaInspeccion, AlertaMantenimiento, PrioridadAlerta } from './auth-types';

// Mapeo de ítems críticos que requieren alerta inmediata
const ITEMS_CRITICOS = [
  'documentacion.soat',
  'documentacion.tecnomecanica',
  'documentacion.licenciaConductor',
  'inspeccionExterior.lucesFrenos',
  'inspeccionInterior.frenos',
  'inspeccionInterior.direccion',
  'elementosSeguridad.botiquin',
  'elementosSeguridad.extintor',
  'nivealesFluidos.liquidoFrenos'
];

const ITEMS_ALTA_PRIORIDAD = [
  'documentacion.polizaSeguro',
  'documentacion.tarjetaPropiedad',
  'inspeccionExterior.lucesDelanteras',
  'inspeccionExterior.lucesTraseras',
  'inspeccionExterior.lucesDireccionales',
  'inspeccionExterior.llantasEstado',
  'inspeccionExterior.llantasPresion',
  'inspeccionInterior.cinturones',
  'elementosSeguridad.kitCarreteras',
  'elementosSeguridad.chalecoReflectivo',
  'nivealesFluidos.aceiteMotor'
];

// Nombres legibles para los ítems
const NOMBRES_ITEMS: Record<string, string> = {
  // Documentación
  'documentacion.soat': 'SOAT',
  'documentacion.tecnomecanica': 'Tecnomecánica',
  'documentacion.tarjetaPropiedad': 'Tarjeta de Propiedad',
  'documentacion.polizaSeguro': 'Póliza de Seguro',
  'documentacion.licenciaConductor': 'Licencia del Conductor',
  
  // Inspección Exterior
  'inspeccionExterior.carroceria': 'Carrocería',
  'inspeccionExterior.espejos': 'Espejos',
  'inspeccionExterior.lucesDelanteras': 'Luces Delanteras',
  'inspeccionExterior.lucesTraseras': 'Luces Traseras',
  'inspeccionExterior.lucesDireccionales': 'Luces Direccionales',
  'inspeccionExterior.lucesFrenos': 'Luces de Frenos',
  'inspeccionExterior.llantasEstado': 'Estado de Llantas',
  'inspeccionExterior.llantasPresion': 'Presión de Llantas',
  'inspeccionExterior.limpiabrisas': 'Limpiaparabrisas',
  'inspeccionExterior.vidrios': 'Vidrios',
  
  // Inspección Interior
  'inspeccionInterior.cinturones': 'Cinturones de Seguridad',
  'inspeccionInterior.asientos': 'Asientos',
  'inspeccionInterior.tableroInstrumentos': 'Tablero de Instrumentos',
  'inspeccionInterior.frenos': 'Sistema de Frenos',
  'inspeccionInterior.direccion': 'Sistema de Dirección',
  'inspeccionInterior.claxon': 'Claxon',
  'inspeccionInterior.pitoReversa': 'Pito de Reversa',
  
  // Elementos de Seguridad
  'elementosSeguridad.botiquin': 'Botiquín',
  'elementosSeguridad.extintor': 'Extintor',
  'elementosSeguridad.kitCarreteras': 'Kit de Carreteras',
  'elementosSeguridad.chalecoReflectivo': 'Chaleco Reflectivo',
  'elementosSeguridad.tacos': 'Tacos',
  
  // Niveles de Fluidos
  'nivealesFluidos.aceiteMotor': 'Aceite de Motor',
  'nivealesFluidos.liquidoFrenos': 'Líquido de Frenos',
  'nivealesFluidos.refrigerante': 'Refrigerante',
  'nivealesFluidos.aguaLimpiaparabrisas': 'Agua Limpiaparabrisas',
};

/**
 * Obtiene el valor de un ítem anidado usando notación de punto
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

/**
 * Determina la prioridad de un ítem
 */
function determinarPrioridad(path: string): PrioridadAlerta {
  if (ITEMS_CRITICOS.includes(path)) return 'critica';
  if (ITEMS_ALTA_PRIORIDAD.includes(path)) return 'alta';
  return 'media';
}

/**
 * Analiza una inspección y genera alertas automáticamente si encuentra problemas
 */
export async function generarAlertasDesdeInspeccion(
  inspeccion: Inspeccion & { id: string },
  vehiculoPlaca: string,
  userId: string
): Promise<void> {
  const itemsFallidos: { path: string; nombre: string; prioridad: PrioridadAlerta }[] = [];

  // Recorrer todas las secciones de la inspección
  const secciones = [
    'documentacion',
    'inspeccionExterior',
    'inspeccionInterior',
    'elementosSeguridad',
    'nivealesFluidos'
  ];

  secciones.forEach(seccion => {
    const seccionData = (inspeccion as any)[seccion];
    if (!seccionData) return;

    Object.keys(seccionData).forEach(item => {
      const path = `${seccion}.${item}`;
      const valor: RespuestaInspeccion = seccionData[item];
      
      if (valor === 'malo') {
        itemsFallidos.push({
          path,
          nombre: NOMBRES_ITEMS[path] || item,
          prioridad: determinarPrioridad(path)
        });
      }
    });
  });

  // Si no hay ítems fallidos, no generar alertas
  if (itemsFallidos.length === 0) return;

  // Determinar la prioridad general de la alerta (la más alta de todos los ítems)
  const prioridadGeneral = itemsFallidos.some(i => i.prioridad === 'critica')
    ? 'critica'
    : itemsFallidos.some(i => i.prioridad === 'alta')
    ? 'alta'
    : 'media';

  // Crear descripción de la alerta
  const itemsCriticos = itemsFallidos.filter(i => i.prioridad === 'critica');
  const itemsAltos = itemsFallidos.filter(i => i.prioridad === 'alta');
  const itemsMedios = itemsFallidos.filter(i => i.prioridad === 'media');

  let descripcion = `Se detectaron ${itemsFallidos.length} problema(s) en la inspección del vehículo ${vehiculoPlaca}:\n\n`;
  
  if (itemsCriticos.length > 0) {
    descripcion += `🔴 CRÍTICO (${itemsCriticos.length}):\n`;
    itemsCriticos.forEach(i => descripcion += `  • ${i.nombre}\n`);
    descripcion += '\n';
  }
  
  if (itemsAltos.length > 0) {
    descripcion += `🟠 ALTA PRIORIDAD (${itemsAltos.length}):\n`;
    itemsAltos.forEach(i => descripcion += `  • ${i.nombre}\n`);
    descripcion += '\n';
  }
  
  if (itemsMedios.length > 0) {
    descripcion += `🟡 MEDIA PRIORIDAD (${itemsMedios.length}):\n`;
    itemsMedios.forEach(i => descripcion += `  • ${i.nombre}\n`);
  }

  // Crear la alerta en Firestore
  const alerta: Omit<AlertaMantenimiento, 'id'> = {
    vehiculoId: inspeccion.vehiculoId,
    inspeccionId: inspeccion.id,
    tipo: 'inspeccion_fallida',
    prioridad: prioridadGeneral,
    titulo: `${itemsFallidos.length} problema(s) detectado(s) en ${vehiculoPlaca}`,
    descripcion: descripcion.trim(),
    itemsAfectados: itemsFallidos.map(i => i.nombre),
    estado: 'pendiente',
    fechaDeteccion: new Date().toISOString(),
    creadoPor: 'sistema',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'alertas'), alerta);
    console.log('✅ Alerta generada automáticamente:', alerta.titulo);
  } catch (error) {
    console.error('❌ Error al generar alerta:', error);
  }
}

/**
 * Genera alertas para documentos próximos a vencer
 */
export async function generarAlertasDocumentosVencimiento(
  vehiculoId: string,
  vehiculoPlaca: string,
  soatVencimiento?: string,
  tecnomecanicaVencimiento?: string
): Promise<void> {
  const hoy = new Date();
  const alertas: Omit<AlertaMantenimiento, 'id'>[] = [];

  // Función auxiliar para calcular días
  const calcularDias = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    const diff = fecha.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Verificar SOAT
  if (soatVencimiento) {
    const dias = calcularDias(soatVencimiento);
    
    if (dias <= 0) {
      alertas.push({
        vehiculoId,
        tipo: 'documento_vencido',
        prioridad: 'critica',
        titulo: `SOAT VENCIDO - ${vehiculoPlaca}`,
        descripcion: `El SOAT del vehículo ${vehiculoPlaca} está vencido desde hace ${Math.abs(dias)} día(s). Es urgente renovarlo para cumplir con la normatividad.`,
        itemsAfectados: ['SOAT'],
        estado: 'pendiente',
        fechaDeteccion: hoy.toISOString(),
        creadoPor: 'sistema',
        createdAt: hoy.toISOString(),
        updatedAt: hoy.toISOString()
      });
    } else if (dias <= 15) {
      alertas.push({
        vehiculoId,
        tipo: 'documento_por_vencer',
        prioridad: dias <= 7 ? 'alta' : 'media',
        titulo: `SOAT por vencer - ${vehiculoPlaca}`,
        descripcion: `El SOAT del vehículo ${vehiculoPlaca} vence en ${dias} día(s). Por favor, gestione su renovación.`,
        itemsAfectados: ['SOAT'],
        estado: 'pendiente',
        fechaDeteccion: hoy.toISOString(),
        creadoPor: 'sistema',
        createdAt: hoy.toISOString(),
        updatedAt: hoy.toISOString()
      });
    }
  }

  // Verificar Tecnomecánica
  if (tecnomecanicaVencimiento) {
    const dias = calcularDias(tecnomecanicaVencimiento);
    
    if (dias <= 0) {
      alertas.push({
        vehiculoId,
        tipo: 'documento_vencido',
        prioridad: 'critica',
        titulo: `Tecnomecánica VENCIDA - ${vehiculoPlaca}`,
        descripcion: `La tecnomecánica del vehículo ${vehiculoPlaca} está vencida desde hace ${Math.abs(dias)} día(s). Es urgente renovarla para cumplir con la normatividad.`,
        itemsAfectados: ['Tecnomecánica'],
        estado: 'pendiente',
        fechaDeteccion: hoy.toISOString(),
        creadoPor: 'sistema',
        createdAt: hoy.toISOString(),
        updatedAt: hoy.toISOString()
      });
    } else if (dias <= 15) {
      alertas.push({
        vehiculoId,
        tipo: 'documento_por_vencer',
        prioridad: dias <= 7 ? 'alta' : 'media',
        titulo: `Tecnomecánica por vencer - ${vehiculoPlaca}`,
        descripcion: `La tecnomecánica del vehículo ${vehiculoPlaca} vence en ${dias} día(s). Por favor, gestione su renovación.`,
        itemsAfectados: ['Tecnomecánica'],
        estado: 'pendiente',
        fechaDeteccion: hoy.toISOString(),
        creadoPor: 'sistema',
        createdAt: hoy.toISOString(),
        updatedAt: hoy.toISOString()
      });
    }
  }

  // Guardar todas las alertas generadas
  for (const alerta of alertas) {
    try {
      await addDoc(collection(db, 'alertas'), alerta);
      console.log('✅ Alerta de vencimiento generada:', alerta.titulo);
    } catch (error) {
      console.error('❌ Error al generar alerta de vencimiento:', error);
    }
  }
}
