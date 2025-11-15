
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
  kilometraje: number;
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  // Fechas de vencimiento de documentos
  soatVencimiento?: string; // Formato: YYYY-MM-DD
  tecnomecanicaVencimiento?: string; // Formato: YYYY-MM-DD
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
  estado: 'aprobado' | 'rechazado';
  createdAt: string;
}
