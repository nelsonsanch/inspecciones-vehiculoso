
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inspeccion, Vehiculo, Conductor } from '@/lib/auth-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Car,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  MapPin,
  Gauge,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DetalleInspeccionPage() {
  const params = useParams();
  const router = useRouter();
  const [inspeccion, setInspeccion] = useState<Inspeccion | null>(null);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspeccion = async () => {
      try {
        const inspeccionId = params.id as string;
        
        // Obtener inspección
        const inspeccionDoc = await getDoc(doc(db, 'inspecciones', inspeccionId));
        
        if (!inspeccionDoc.exists()) {
          toast.error('Inspección no encontrada');
          router.push('/conductor/inspecciones');
          return;
        }

        const inspeccionData = { id: inspeccionDoc.id, ...inspeccionDoc.data() } as Inspeccion;
        setInspeccion(inspeccionData);

        // Obtener vehículo
        const vehiculoDoc = await getDoc(doc(db, 'vehiculos', inspeccionData.vehiculoId));
        if (vehiculoDoc.exists()) {
          setVehiculo({ id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo);
        }

        // Obtener conductor
        const conductorDoc = await getDoc(doc(db, 'conductores', inspeccionData.conductorId));
        if (conductorDoc.exists()) {
          setConductor({ id: conductorDoc.id, ...conductorDoc.data() } as Conductor);
        }

      } catch (error) {
        console.error('Error fetching inspección:', error);
        toast.error('Error al cargar la inspección');
      } finally {
        setLoading(false);
      }
    };

    fetchInspeccion();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!inspeccion) {
    return null;
  }

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case 'bueno':
        return <Badge className="bg-green-100 text-green-800">Bueno</Badge>;
      case 'malo':
        return <Badge variant="destructive">Malo</Badge>;
      case 'no_aplica':
        return <Badge variant="outline">No Aplica</Badge>;
      default:
        return <Badge variant="outline">{resultado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/conductor/inspecciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Inspección</h1>
          <p className="text-gray-600">Información completa de la inspección</p>
        </div>
        {inspeccion.estado === 'aprobado' ? (
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            <CheckCircle className="h-5 w-5 mr-2" />
            Aprobado
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            <XCircle className="h-5 w-5 mr-2" />
            Rechazado
          </Badge>
        )}
      </div>

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Información del Vehículo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Placa</p>
                <p className="font-semibold">{vehiculo?.placa}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-semibold">{vehiculo?.tipoVehiculo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marca</p>
                <p className="font-semibold">{vehiculo?.marca}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Modelo</p>
                <p className="font-semibold">{vehiculo?.modelo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Año</p>
                <p className="font-semibold">{vehiculo?.año}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-semibold">{vehiculo?.color}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conductor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Información del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold">{conductor?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cédula</p>
                <p className="font-semibold">{conductor?.cedula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Licencia</p>
                <p className="font-semibold">{conductor?.numeroLicencia}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p className="font-semibold">{conductor?.categoriaLicencia}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de Inspección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Datos de la Inspección
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-semibold">{new Date(inspeccion.fecha).toLocaleDateString('es-CO')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Hora</p>
                <p className="font-semibold">{inspeccion.hora}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Kilometraje</p>
                <p className="font-semibold">{inspeccion.kilometrajeActual?.toLocaleString()} km</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Destino</p>
                <p className="font-semibold">{inspeccion.destino || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Salud del Conductor */}
      {inspeccion.estadoSalud && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Estado de Salud del Conductor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Estado General</p>
                {getResultadoBadge(inspeccion.estadoSalud.estadoSaludActual.toLowerCase())}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Horas de Sueño</p>
                <p className="font-semibold">{inspeccion.estadoSalud.horasSueno} horas</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Medicamentos</p>
                <p className="font-semibold text-sm">{inspeccion.estadoSalud.consumeMedicamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados de Inspección */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Inspección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Documentación */}
          <div>
            <h3 className="font-semibold text-lg mb-3 pb-2 border-b">Documentación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(inspeccion.documentacion).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getResultadoBadge(value)}
                </div>
              ))}
            </div>
          </div>

          {/* Exterior */}
          <div>
            <h3 className="font-semibold text-lg mb-3 pb-2 border-b">Exterior del Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(inspeccion.inspeccionExterior).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getResultadoBadge(value)}
                </div>
              ))}
            </div>
          </div>

          {/* Interior */}
          <div>
            <h3 className="font-semibold text-lg mb-3 pb-2 border-b">Interior del Vehículo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(inspeccion.inspeccionInterior).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getResultadoBadge(value)}
                </div>
              ))}
            </div>
          </div>

          {/* Elementos de Seguridad */}
          <div>
            <h3 className="font-semibold text-lg mb-3 pb-2 border-b">Elementos de Seguridad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(inspeccion.elementosSeguridad).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getResultadoBadge(value)}
                </div>
              ))}
            </div>
          </div>

          {/* Niveles de Fluidos */}
          <div>
            <h3 className="font-semibold text-lg mb-3 pb-2 border-b">Niveles de Fluidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(inspeccion.nivealesFluidos).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getResultadoBadge(value)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {inspeccion.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Observaciones Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{inspeccion.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Botón de regreso */}
      <div className="flex justify-center pt-4">
        <Button asChild size="lg" variant="outline">
          <Link href="/conductor/inspecciones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Mis Inspecciones
          </Link>
        </Button>
      </div>
    </div>
  );
}
