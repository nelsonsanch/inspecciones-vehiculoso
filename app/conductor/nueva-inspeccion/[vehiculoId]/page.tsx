
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Vehiculo, Conductor } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface InspeccionFormData {
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
}

export default function FormularioInspeccionPage() {
  const params = useParams();
  const vehiculoId = params?.vehiculoId as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<InspeccionFormData>({
    kilometrajeActual: 0,
    documentacion: {
      soatVigente: false,
      tecnomecanicaVigente: false,
      tarjetaPropiedad: false,
      polizaSeguro: false,
    },
    inspeccionExterior: {
      carroceria: false,
      espejos: false,
      lucesDelanteras: false,
      lucesTraseras: false,
      lucesDireccionales: false,
      lucesFrenos: false,
      llantasEstado: false,
      llantasPresion: false,
      limpiabrisas: false,
      vidrios: false,
    },
    inspeccionInterior: {
      cinturones: false,
      asientos: false,
      tableroInstrumentos: false,
      frenos: false,
      direccion: false,
      claxon: false,
      pitoReversa: false,
    },
    elementosSeguridad: {
      botiquin: false,
      extintor: false,
      kitCarreteras: false,
      chalecoReflectivo: false,
      tacos: false,
    },
    nivealesFluidos: {
      aceiteMotor: false,
      liquidoFrenos: false,
      refrigerante: false,
      aguaLimpiaparabrisas: false,
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

  const handleCheckboxChange = (section: string, field: string, checked: boolean) => {
    setFormData(prev => {
      const currentSection = prev[section as keyof InspeccionFormData];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: checked
          }
        };
      }
      return prev;
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateEstado = () => {
    // Elementos críticos que causan rechazo si fallan
    const elementosCriticos = [
      // Documentación crítica
      formData.documentacion.soatVigente,
      formData.documentacion.tecnomecanicaVigente,
      // Elementos de seguridad críticos
      formData.inspeccionExterior.lucesFrenos,
      formData.inspeccionExterior.llantasEstado,
      formData.inspeccionInterior.frenos,
      formData.inspeccionInterior.direccion,
      formData.elementosSeguridad.botiquin,
      formData.elementosSeguridad.extintor,
    ];

    return elementosCriticos.every(elemento => elemento) ? 'aprobado' : 'rechazado';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculo || !conductor) return;

    setSaving(true);

    try {
      const now = new Date();
      const estado = calculateEstado();

      const inspeccionData = {
        vehiculoId: vehiculo.id,
        conductorId: conductor.id,
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5),
        ...formData,
        estado,
        createdAt: now.toISOString(),
      };

      await addDoc(collection(db, 'inspecciones'), inspeccionData);

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
        {/* Vehicle and General Info */}
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
            <div>
              <Label htmlFor="kilometraje">Kilometraje Actual</Label>
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
          </CardContent>
        </Card>

        {/* Documentación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Documentación del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(formData.documentacion).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('documentacion', key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="flex-1 capitalize">
                  {key === 'soatVigente' && 'SOAT Vigente'}
                  {key === 'tecnomecanicaVigente' && 'Tecnomecánica Vigente'}
                  {key === 'tarjetaPropiedad' && 'Tarjeta de Propiedad'}
                  {key === 'polizaSeguro' && 'Póliza de Seguro'}
                </Label>
                {(key === 'soatVigente' || key === 'tecnomecanicaVigente') && (
                  <span className="text-xs text-red-500">*Crítico</span>
                )}
              </div>
            ))}
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
            {Object.entries(formData.inspeccionExterior).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('inspeccionExterior', key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="flex-1 capitalize">
                  {key === 'carroceria' && 'Carrocería (sin daños)'}
                  {key === 'espejos' && 'Espejos (completos y funcionales)'}
                  {key === 'lucesDelanteras' && 'Luces Delanteras'}
                  {key === 'lucesTraseras' && 'Luces Traseras'}
                  {key === 'lucesDireccionales' && 'Luces Direccionales'}
                  {key === 'lucesFrenos' && 'Luces de Frenos'}
                  {key === 'llantasEstado' && 'Estado de Llantas'}
                  {key === 'llantasPresion' && 'Presión de Llantas'}
                  {key === 'limpiabrisas' && 'Limpiabrisas'}
                  {key === 'vidrios' && 'Vidrios (sin fracturas)'}
                </Label>
                {(key === 'lucesFrenos' || key === 'llantasEstado') && (
                  <span className="text-xs text-red-500">*Crítico</span>
                )}
              </div>
            ))}
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
            {Object.entries(formData.inspeccionInterior).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('inspeccionInterior', key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="flex-1 capitalize">
                  {key === 'cinturones' && 'Cinturones de Seguridad'}
                  {key === 'asientos' && 'Asientos (buen estado)'}
                  {key === 'tableroInstrumentos' && 'Tablero de Instrumentos'}
                  {key === 'frenos' && 'Sistema de Frenos'}
                  {key === 'direccion' && 'Sistema de Dirección'}
                  {key === 'claxon' && 'Claxon'}
                  {key === 'pitoReversa' && 'Pito de Reversa'}
                </Label>
                {(key === 'frenos' || key === 'direccion') && (
                  <span className="text-xs text-red-500">*Crítico</span>
                )}
              </div>
            ))}
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
            {Object.entries(formData.elementosSeguridad).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('elementosSeguridad', key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="flex-1 capitalize">
                  {key === 'botiquin' && 'Botiquín de Primeros Auxilios'}
                  {key === 'extintor' && 'Extintor'}
                  {key === 'kitCarreteras' && 'Kit de Carreteras'}
                  {key === 'chalecoReflectivo' && 'Chaleco Reflectivo'}
                  {key === 'tacos' && 'Tacos de Seguridad'}
                </Label>
                {(key === 'botiquin' || key === 'extintor') && (
                  <span className="text-xs text-red-500">*Crítico</span>
                )}
              </div>
            ))}
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
            {Object.entries(formData.nivealesFluidos).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-3">
                <Checkbox
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('nivealesFluidos', key, checked as boolean)
                  }
                />
                <Label htmlFor={key} className="flex-1 capitalize">
                  {key === 'aceiteMotor' && 'Aceite de Motor'}
                  {key === 'liquidoFrenos' && 'Líquido de Frenos'}
                  {key === 'refrigerante' && 'Refrigerante'}
                  {key === 'aguaLimpiaparabrisas' && 'Agua Limpiaparabrisas'}
                </Label>
              </div>
            ))}
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
