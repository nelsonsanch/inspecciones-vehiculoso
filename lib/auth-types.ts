
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
  createdAt: string;
  updatedAt: string;
}

export interface Inspeccion {
  id: string;
  vehiculoId: string;
  conductorId: string;
  fecha: string;
  hora: string;
  kilometrajeActual: number;
  documentacion: {
    soatVigente: boolean;
    tecnomecanicaVigente: boolean;
    tarjetaPropiedad: boolean;
    polizaSeguro: boolean;
  };
  inspeccionExterior: {
    carroceria: boolean;
    espejos: boolean;
    lucesDelanteras: boolean;
    lucesTraseras: boolean;
    lucesDireccionales: boolean;
    lucesFrenos: boolean;
    llantasEstado: boolean;
    llantasPresion: boolean;
    limpiabrisas: boolean;
    vidrios: boolean;
  };
  inspeccionInterior: {
    cinturones: boolean;
    asientos: boolean;
    tableroInstrumentos: boolean;
    frenos: boolean;
    direccion: boolean;
    claxon: boolean;
    pitoReversa: boolean;
  };
  elementosSeguridad: {
    botiquin: boolean;
    extintor: boolean;
    kitCarreteras: boolean;
    chalecoReflectivo: boolean;
    tacos: boolean;
  };
  nivealesFluidos: {
    aceiteMotor: boolean;
    liquidoFrenos: boolean;
    refrigerante: boolean;
    aguaLimpiaparabrisas: boolean;
  };
  observaciones: string;
  estado: 'aprobado' | 'rechazado';
  createdAt: string;
}
