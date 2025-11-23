
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'administrador' | 'conductor';
  createdAt: string;
  updatedAt: string;
}

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  tipoVehiculo: string;
  color: string;
  kilometraje: number; // Kilometraje inicial (al momento de compra)
  kilometrajeActual?: number; // Kilometraje actual (se actualiza con cada inspección)
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  // Fechas de vencimiento de documentos
  soatVencimiento?: string; // Formato: YYYY-MM-DD
  tecnomecanicaVencimiento?: string; // Formato: YYYY-MM-DD
  // Fotos del vehículo
  fotos?: {
    delantera?: string; // URL de S3
    lateralIzquierda?: string; // URL de S3
    lateralDerecha?: string; // URL de S3
    trasera?: string; // URL de S3
  };
  createdAt: string;
  updatedAt: string;
}

export interface Conductor {
  id: string;
  nombre: string;
  cedula: string;
  numeroLicencia: string;
  categoriaLicencia: string;
  telefono: string;
  email: string;
  userId: string;
  fotoUrl?: string; // URL de Firebase Storage con la foto del conductor
  // Fecha de vencimiento de licencia
  licenciaVencimiento?: string; // Formato: YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export type RespuestaInspeccion = 'bueno' | 'malo' | 'no-aplica';

export interface Inspeccion {
  id: string;
  vehiculoId: string;
  conductorId: string;
  fecha: string;
  hora: string;
  kilometrajeActual: number;
  destino: string; // A dónde va el vehículo
  // Estado de salud del conductor
  estadoSalud: {
    horasSueno: number;
    estadoSaludActual: string; // Bueno, Regular, Malo
    consumeMedicamentos: string; // Sí/No y cuáles
  };
  // Documentación con sistema de 3 opciones
  documentacion: {
    soat: RespuestaInspeccion;
    tecnomecanica: RespuestaInspeccion;
    tarjetaPropiedad: RespuestaInspeccion;
    polizaSeguro: RespuestaInspeccion;
    licenciaConductor: RespuestaInspeccion;
  };
  inspeccionExterior: {
    carroceria: RespuestaInspeccion;
    espejos: RespuestaInspeccion;
    lucesDelanteras: RespuestaInspeccion;
    lucesTraseras: RespuestaInspeccion;
    lucesDireccionales: RespuestaInspeccion;
    lucesFrenos: RespuestaInspeccion;
    llantasEstado: RespuestaInspeccion;
    llantasPresion: RespuestaInspeccion;
    limpiabrisas: RespuestaInspeccion;
    vidrios: RespuestaInspeccion;
  };
  inspeccionInterior: {
    cinturones: RespuestaInspeccion;
    asientos: RespuestaInspeccion;
    tableroInstrumentos: RespuestaInspeccion;
    frenos: RespuestaInspeccion;
    direccion: RespuestaInspeccion;
    claxon: RespuestaInspeccion;
    pitoReversa: RespuestaInspeccion;
  };
  elementosSeguridad: {
    botiquin: RespuestaInspeccion;
    extintor: RespuestaInspeccion;
    kitCarreteras: RespuestaInspeccion;
    chalecoReflectivo: RespuestaInspeccion;
    tacos: RespuestaInspeccion;
  };
  nivealesFluidos: {
    aceiteMotor: RespuestaInspeccion;
    liquidoFrenos: RespuestaInspeccion;
    refrigerante: RespuestaInspeccion;
    aguaLimpiaparabrisas: RespuestaInspeccion;
  };
  observaciones: string;
  firmaConductor?: string; // URL de S3 con la firma digital (deprecated - usar pdfUrl)
  pdfUrl?: string; // URL del PDF generado con los resultados de la inspección y firma
  estado: 'aprobado' | 'rechazado';
  createdAt: string;
}

export interface EventoVehiculo {
  id?: string;
  vehiculoId: string;
  tipo: 'mantenimiento' | 'reparacion' | 'actualizacion_documental' | 'cambio_parte' | 'otro';
  titulo: string;
  descripcion: string;
  fecha: string;
  kilometraje?: number;
  costo?: number;
  responsable?: string;
  proveedor?: string;
  documentos?: string[]; // URLs de documentos adjuntos
  proximoMantenimiento?: {
    fecha?: string;
    kilometraje?: number;
  };
  createdAt: string;
  createdBy: string; // UID del usuario que creó el evento
}

// Sistema de alertas y mantenimiento
export type PrioridadAlerta = 'critica' | 'alta' | 'media' | 'baja';
export type EstadoAlerta = 'pendiente' | 'en_proceso' | 'resuelta' | 'pospuesta';
export type TipoAlerta = 'inspeccion_fallida' | 'documento_vencido' | 'documento_por_vencer' | 'mantenimiento_programado' | 'kilometraje_alto';

export interface AlertaMantenimiento {
  id?: string;
  vehiculoId: string;
  inspeccionId?: string; // Si la alerta proviene de una inspección
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  titulo: string;
  descripcion: string;
  itemsAfectados?: string[]; // Ítems de inspección que fallaron
  estado: EstadoAlerta;
  fechaDeteccion: string;
  fechaResolucion?: string;
  eventoMantenimientoId?: string; // Si se creó un evento de mantenimiento
  notas?: string;
  creadoPor: string; // UID del usuario (o 'sistema' si es automático)
  createdAt: string;
  updatedAt: string;
}
