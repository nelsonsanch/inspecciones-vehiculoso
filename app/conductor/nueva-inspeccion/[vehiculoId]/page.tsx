'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Vehiculo, Conductor, RespuestaInspeccion } from '@/lib/auth-types';
import { generarAlertasDesdeInspeccion } from '@/lib/alertas-helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SignaturePad } from '@/components/ui/signature-pad';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  Car,
  FileText,
  Shield,
  Wrench,
  Droplets,
  Loader2,
  CheckCircle,
  XCircle,
  Heart,
  AlertTriangle,
  Clock,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ItemInspeccion } from '@/components/inspeccion/item-inspeccion';

interface InspeccionFormData {
  kilometrajeActual: number;
  destino: string;
  estadoSalud: {
    horasSueno: number;
    estadoSaludActual: string;
    consumeMedicamentos: string;
  };
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
}

// Función para calcular días hasta vencimiento
const calcularDiasVencimiento = (fechaVencimiento?: string): number | null => {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Componente para mostrar estado de vencimiento
const EstadoVencimiento = ({ dias }: { dias: number | null }) => {
  if (dias === null) {
    return <span className="text-gray-400 text-sm">No registrado</span>;
  }
  
  if (dias < 0) {
    return (
      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
        <AlertTriangle className="h-4 w-4" />
        Vencido hace {Math.abs(dias)} días
      </span>
    );
  }
  
  if (dias === 0) {
    return <span className="text-red-600 text-sm font-medium">Vence hoy</span>;
  }
  
  if (dias <= 30) {
    return (
      <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
        <Clock className="h-4 w-4" />
        Vence en {dias} días
      </span>
    );
  }
  
  return (
    <span className="text-green-600 text-sm">
      Vigente ({dias} días restantes)
    </span>
  );
};

export default function FormularioInspeccionPage() {
  const params = useParams();
  const vehiculoId = params?.vehiculoId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firmaDataUrl, setFirmaDataUrl] = useState<string>('');

  const [formData, setFormData] = useState<InspeccionFormData>({
    kilometrajeActual: 0,
    destino: '',
    estadoSalud: {
      horasSueno: 0,
      estadoSaludActual: '',
      consumeMedicamentos: '',
    },
    documentacion: {
      soat: 'bueno',
      tecnomecanica: 'bueno',
      tarjetaPropiedad: 'bueno',
      polizaSeguro: 'bueno',
      licenciaConductor: 'bueno',
    },
    inspeccionExterior: {
      carroceria: 'bueno',
      espejos: 'bueno',
      lucesDelanteras: 'bueno',
      lucesTraseras: 'bueno',
      lucesDireccionales: 'bueno',
      lucesFrenos: 'bueno',
      llantasEstado: 'bueno',
      llantasPresion: 'bueno',
      limpiabrisas: 'bueno',
      vidrios: 'bueno',
    },
    inspeccionInterior: {
      cinturones: 'bueno',
      asientos: 'bueno',
      tableroInstrumentos: 'bueno',
      frenos: 'bueno',
      direccion: 'bueno',
      claxon: 'bueno',
      pitoReversa: 'bueno',
    },
    elementosSeguridad: {
      botiquin: 'bueno',
      extintor: 'bueno',
      kitCarreteras: 'bueno',
      chalecoReflectivo: 'bueno',
      tacos: 'bueno',
    },
    nivealesFluidos: {
      aceiteMotor: 'bueno',
      liquidoFrenos: 'bueno',
      refrigerante: 'bueno',
      aguaLimpiaparabrisas: 'bueno',
    },
    observaciones: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!vehiculoId || !user) return;

      try {
        // Obtener vehículo
        const vehiculoDoc = await getDoc(doc(db, 'vehiculos', vehiculoId));
        if (vehiculoDoc.exists()) {
          const vehiculoData = { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo;
          setVehiculo(vehiculoData);
          setFormData(prev => ({
            ...prev,
            kilometrajeActual: vehiculoData.kilometraje || 0
          }));
        }

        // Obtener conductor
        const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
        const conductorData = conductoresSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Conductor))
          .find(c => c.userId === user.id);
        
        if (conductorData) {
          setConductor(conductorData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vehiculoId, user]);

  const handleChange = (section: string, field: string, value: RespuestaInspeccion) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof InspeccionFormData] as Record<string, any>),
        [field]: value
      }
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaludChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      estadoSalud: {
        ...prev.estadoSalud,
        [field]: value
      }
    }));
  };

  const calculateEstado = () => {
    // Elementos críticos que causan rechazo si están en "malo"
    const elementosCriticos = [
      formData.documentacion.soat,
      formData.documentacion.tecnomecanica,
      formData.documentacion.licenciaConductor,
      formData.inspeccionExterior.lucesFrenos,
      formData.inspeccionExterior.llantasEstado,
      formData.inspeccionInterior.frenos,
      formData.inspeccionInterior.direccion,
      formData.elementosSeguridad.botiquin,
      formData.elementosSeguridad.extintor,
    ];

    return elementosCriticos.every(elemento => elemento === 'bueno' || elemento === 'no-aplica') ? 'aprobado' : 'rechazado';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculo || !conductor) return;

    // Validaciones
    if (!formData.destino.trim()) {
      toast.error('Por favor indique el destino del vehículo');
      return;
    }

    if (formData.estadoSalud.horasSueno <= 0) {
      toast.error('Por favor indique las horas de sueño');
      return;
    }

    if (!formData.estadoSalud.estadoSaludActual) {
      toast.error('Por favor indique el estado de salud actual');
      return;
    }

    if (!firmaDataUrl) {
      toast.error('Por favor firme la inspección');
      return;
    }

    setSaving(true);

    try {
      const now = new Date();
      const estado = calculateEstado();

      // Subir firma directamente a Firebase Storage
      let firmaConductor = '';
      if (firmaDataUrl) {
        const { getStorage, ref, uploadBytes } = await import('firebase/storage');
        const storage = getStorage();
        const timestamp = Date.now();
        const storagePath = `signatures/${timestamp}-firma.png`;
        const storageRef = ref(storage, storagePath);
        
        // Convertir dataURL a Blob
        const base64Data = firmaDataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        // Subir el blob
        await uploadBytes(storageRef, blob, {
          contentType: 'image/png',
        });
        
        firmaConductor = storagePath;
      }

      const inspeccionData = {
        vehiculoId: vehiculo.id,
        conductorId: conductor.id,
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        ...formData,
        firmaConductor,
        estado,
        createdAt: now.toISOString(),
      };

      const docRef = await addDoc(collection(db, 'inspecciones'), inspeccionData);

      // Actualizar el kilometraje actual del vehículo
      await updateDoc(doc(db, 'vehiculos', vehiculo.id), {
        kilometrajeActual: formData.kilometrajeActual,
        updatedAt: now.toISOString()
      });

      // Generar alertas automáticamente si hay problemas
      await generarAlertasDesdeInspeccion(
        { ...inspeccionData, id: docRef.id } as any,
        vehiculo.placa,
        user?.id || 'sistema'
      );

      toast.success(`Inspección ${estado} guardada correctamente`);
      router.push('/conductor/inspecciones');
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast.error('Error al guardar la inspección');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!vehiculo || !conductor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/conductor/nueva-inspeccion">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Error</h1>
            <p className="text-red-600">No se pudieron cargar los datos necesarios</p>
          </div>
        </div>
      </div>
    );
  }

  const estado = calculateEstado();
  const diasSoat = calcularDiasVencimiento(vehiculo.soatVencimiento);
  const diasTecnomecanica = calcularDiasVencimiento(vehiculo.tecnomecanicaVencimiento);
  const diasLicencia = calcularDiasVencimiento(conductor.licenciaVencimiento);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/conductor/nueva-inspeccion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspección Preoperacional</h1>
          <p className="text-gray-600">{vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha:</p>
                <p className="font-medium">{new Date().toLocaleDateString('es-CO')}</p>
              </div>
              <div>
                <p className="text-gray-500">Hora:</p>
                <p className="font-medium">{new Date().toTimeString().slice(0, 5)}</p>
              </div>
              <div>
                <p className="text-gray-500">Conductor:</p>
                <p className="font-medium">{conductor.nombre}</p>
              </div>
              <div>
                <p className="text-gray-500">Licencia:</p>
                <p className="font-medium">{conductor.numeroLicencia}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kilometraje">Kilometraje Actual *</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={formData.kilometrajeActual}
                  onChange={(e) => handleInputChange('kilometrajeActual', parseInt(e.target.value) || 0)}
                  min={vehiculo.kilometraje || 0}
                  placeholder={`Mínimo ${vehiculo.kilometraje || 0} km`}
                  required
                />
              </div>
              <div>
                <Label htmlFor="destino">Destino del Vehículo *</Label>
                <Input
                  id="destino"
                  type="text"
                  value={formData.destino}
                  onChange={(e) => handleInputChange('destino', e.target.value)}
                  placeholder="Ej: Bogotá - Medellín"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de Salud del Conductor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Estado de Salud del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="horasSueno">Horas de Sueño (última noche) *</Label>
                <Input
                  id="horasSueno"
                  type="number"
                  value={formData.estadoSalud.horasSueno}
                  onChange={(e) => handleSaludChange('horasSueno', parseInt(e.target.value) || 0)}
                  min={0}
                  max={24}
                  placeholder="Ej: 7"
                  required
                />
              </div>
              <div>
                <Label htmlFor="estadoSaludActual">Estado de Salud Actual *</Label>
                <Select 
                  value={formData.estadoSalud.estadoSaludActual} 
                  onValueChange={(value) => handleSaludChange('estadoSaludActual', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bueno">Bueno</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="malo">Malo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="consumeMedicamentos">¿Consume medicamentos? *</Label>
              <Input
                id="consumeMedicamentos"
                type="text"
                value={formData.estadoSalud.consumeMedicamentos}
                onChange={(e) => handleSaludChange('consumeMedicamentos', e.target.value)}
                placeholder="Ej: No, o Sí - Nombre del medicamento"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documentación del Vehículo y Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">SOAT</span>
                <EstadoVencimiento dias={diasSoat} />
              </div>
              <ItemInspeccion
                id="soat"
                label=""
                value={formData.documentacion.soat}
                onChange={(value) => handleChange('documentacion', 'soat', value)}
                critico
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Tecnomecánica</span>
                <EstadoVencimiento dias={diasTecnomecanica} />
              </div>
              <ItemInspeccion
                id="tecnomecanica"
                label=""
                value={formData.documentacion.tecnomecanica}
                onChange={(value) => handleChange('documentacion', 'tecnomecanica', value)}
                critico
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Licencia de Conducción</span>
                <EstadoVencimiento dias={diasLicencia} />
              </div>
              <ItemInspeccion
                id="licencia"
                label=""
                value={formData.documentacion.licenciaConductor}
                onChange={(value) => handleChange('documentacion', 'licenciaConductor', value)}
                critico
              />
            </div>

            <ItemInspeccion
              id="tarjeta"
              label="Tarjeta de Propiedad"
              value={formData.documentacion.tarjetaPropiedad}
              onChange={(value) => handleChange('documentacion', 'tarjetaPropiedad', value)}
            />

            <ItemInspeccion
              id="poliza"
              label="Póliza de Seguro"
              value={formData.documentacion.polizaSeguro}
              onChange={(value) => handleChange('documentacion', 'polizaSeguro', value)}
            />
          </CardContent>
        </Card>

        {/* Inspección Exterior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-green-600" />
              Inspección Exterior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemInspeccion
              id="carroceria"
              label="Carrocería (sin daños)"
              value={formData.inspeccionExterior.carroceria}
              onChange={(value) => handleChange('inspeccionExterior', 'carroceria', value)}
            />
            <ItemInspeccion
              id="espejos"
              label="Espejos (completos y funcionales)"
              value={formData.inspeccionExterior.espejos}
              onChange={(value) => handleChange('inspeccionExterior', 'espejos', value)}
            />
            <ItemInspeccion
              id="lucesDelanteras"
              label="Luces Delanteras"
              value={formData.inspeccionExterior.lucesDelanteras}
              onChange={(value) => handleChange('inspeccionExterior', 'lucesDelanteras', value)}
            />
            <ItemInspeccion
              id="lucesTraseras"
              label="Luces Traseras"
              value={formData.inspeccionExterior.lucesTraseras}
              onChange={(value) => handleChange('inspeccionExterior', 'lucesTraseras', value)}
            />
            <ItemInspeccion
              id="lucesDireccionales"
              label="Luces Direccionales"
              value={formData.inspeccionExterior.lucesDireccionales}
              onChange={(value) => handleChange('inspeccionExterior', 'lucesDireccionales', value)}
            />
            <ItemInspeccion
              id="lucesFrenos"
              label="Luces de Frenos"
              value={formData.inspeccionExterior.lucesFrenos}
              onChange={(value) => handleChange('inspeccionExterior', 'lucesFrenos', value)}
              critico
            />
            <ItemInspeccion
              id="llantasEstado"
              label="Estado de Llantas"
              value={formData.inspeccionExterior.llantasEstado}
              onChange={(value) => handleChange('inspeccionExterior', 'llantasEstado', value)}
              critico
            />
            <ItemInspeccion
              id="llantasPresion"
              label="Presión de Llantas"
              value={formData.inspeccionExterior.llantasPresion}
              onChange={(value) => handleChange('inspeccionExterior', 'llantasPresion', value)}
            />
            <ItemInspeccion
              id="limpiabrisas"
              label="Limpiabrisas"
              value={formData.inspeccionExterior.limpiabrisas}
              onChange={(value) => handleChange('inspeccionExterior', 'limpiabrisas', value)}
            />
            <ItemInspeccion
              id="vidrios"
              label="Vidrios (sin fracturas)"
              value={formData.inspeccionExterior.vidrios}
              onChange={(value) => handleChange('inspeccionExterior', 'vidrios', value)}
            />
          </CardContent>
        </Card>

        {/* Inspección Interior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              Inspección Interior
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemInspeccion
              id="cinturones"
              label="Cinturones de Seguridad"
              value={formData.inspeccionInterior.cinturones}
              onChange={(value) => handleChange('inspeccionInterior', 'cinturones', value)}
            />
            <ItemInspeccion
              id="asientos"
              label="Asientos (buen estado)"
              value={formData.inspeccionInterior.asientos}
              onChange={(value) => handleChange('inspeccionInterior', 'asientos', value)}
            />
            <ItemInspeccion
              id="tableroInstrumentos"
              label="Tablero de Instrumentos"
              value={formData.inspeccionInterior.tableroInstrumentos}
              onChange={(value) => handleChange('inspeccionInterior', 'tableroInstrumentos', value)}
            />
            <ItemInspeccion
              id="frenos"
              label="Sistema de Frenos"
              value={formData.inspeccionInterior.frenos}
              onChange={(value) => handleChange('inspeccionInterior', 'frenos', value)}
              critico
            />
            <ItemInspeccion
              id="direccion"
              label="Sistema de Dirección"
              value={formData.inspeccionInterior.direccion}
              onChange={(value) => handleChange('inspeccionInterior', 'direccion', value)}
              critico
            />
            <ItemInspeccion
              id="claxon"
              label="Claxon"
              value={formData.inspeccionInterior.claxon}
              onChange={(value) => handleChange('inspeccionInterior', 'claxon', value)}
            />
            <ItemInspeccion
              id="pitoReversa"
              label="Pito de Reversa"
              value={formData.inspeccionInterior.pitoReversa}
              onChange={(value) => handleChange('inspeccionInterior', 'pitoReversa', value)}
            />
          </CardContent>
        </Card>

        {/* Elementos de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Elementos de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemInspeccion
              id="botiquin"
              label="Botiquín de Primeros Auxilios"
              value={formData.elementosSeguridad.botiquin}
              onChange={(value) => handleChange('elementosSeguridad', 'botiquin', value)}
              critico
            />
            <ItemInspeccion
              id="extintor"
              label="Extintor"
              value={formData.elementosSeguridad.extintor}
              onChange={(value) => handleChange('elementosSeguridad', 'extintor', value)}
              critico
            />
            <ItemInspeccion
              id="kitCarreteras"
              label="Kit de Carreteras"
              value={formData.elementosSeguridad.kitCarreteras}
              onChange={(value) => handleChange('elementosSeguridad', 'kitCarreteras', value)}
            />
            <ItemInspeccion
              id="chalecoReflectivo"
              label="Chaleco Reflectivo"
              value={formData.elementosSeguridad.chalecoReflectivo}
              onChange={(value) => handleChange('elementosSeguridad', 'chalecoReflectivo', value)}
            />
            <ItemInspeccion
              id="tacos"
              label="Tacos de Seguridad"
              value={formData.elementosSeguridad.tacos}
              onChange={(value) => handleChange('elementosSeguridad', 'tacos', value)}
            />
          </CardContent>
        </Card>

        {/* Niveles de Fluidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              Niveles de Fluidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ItemInspeccion
              id="aceiteMotor"
              label="Aceite de Motor"
              value={formData.nivealesFluidos.aceiteMotor}
              onChange={(value) => handleChange('nivealesFluidos', 'aceiteMotor', value)}
            />
            <ItemInspeccion
              id="liquidoFrenos"
              label="Líquido de Frenos"
              value={formData.nivealesFluidos.liquidoFrenos}
              onChange={(value) => handleChange('nivealesFluidos', 'liquidoFrenos', value)}
            />
            <ItemInspeccion
              id="refrigerante"
              label="Refrigerante"
              value={formData.nivealesFluidos.refrigerante}
              onChange={(value) => handleChange('nivealesFluidos', 'refrigerante', value)}
            />
            <ItemInspeccion
              id="aguaLimpiaparabrisas"
              label="Agua Limpiaparabrisas"
              value={formData.nivealesFluidos.aguaLimpiaparabrisas}
              onChange={(value) => handleChange('nivealesFluidos', 'aguaLimpiaparabrisas', value)}
            />
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Describa cualquier observación, anomalía o problema encontrado durante la inspección..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Firma del Conductor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Firma del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignaturePad
              onSave={setFirmaDataUrl}
              currentSignature={firmaDataUrl}
            />
            <p className="text-xs text-gray-500 mt-2">
              * La firma es obligatoria para completar la inspección
            </p>
          </CardContent>
        </Card>

        {/* Estado Previo */}
        <Card className={estado === 'aprobado' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {estado === 'aprobado' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${estado === 'aprobado' ? 'text-green-900' : 'text-red-900'}`}>
                  Estado Previo: {estado === 'aprobado' ? 'APROBADO' : 'RECHAZADO'}
                </h3>
                <p className={`text-sm ${estado === 'aprobado' ? 'text-green-700' : 'text-red-700'}`}>
                  {estado === 'aprobado' 
                    ? 'El vehículo cumple con los requisitos mínimos para operación'
                    : 'El vehículo NO cumple con los requisitos críticos. Revisar elementos marcados.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/conductor/nueva-inspeccion">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={saving} 
            className={estado === 'aprobado' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Inspección {estado === 'aprobado' ? 'APROBADA' : 'RECHAZADA'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
