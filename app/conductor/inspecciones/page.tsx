
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Inspeccion, Vehiculo, Conductor } from '@/lib/auth-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  History,
  Search,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface InspeccionWithVehiculo extends Inspeccion {
  vehiculo?: Vehiculo;
}

export default function InspeccionesConductorPage() {
  const { user } = useAuth();
  const [inspecciones, setInspecciones] = useState<InspeccionWithVehiculo[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<InspeccionWithVehiculo[]>([]);
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInspecciones = async () => {
      if (!user) return;

      try {
        // Primero obtener el conductor
        const conductoresSnapshot = await getDocs(collection(db, 'conductores'));
        const conductorData = conductoresSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Conductor))
          .find(c => c.userId === user.id);

        if (!conductorData) {
          toast.error('No se encontró información del conductor');
          return;
        }

        setConductor(conductorData);

        // Obtener inspecciones del conductor
        const inspeccionesQuery = query(
          collection(db, 'inspecciones'),
          where('conductorId', '==', conductorData.id)
        );
        
        const inspeccionesSnapshot = await getDocs(inspeccionesQuery);
        const inspeccionesData = inspeccionesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Inspeccion));

        // Obtener información de vehículos para cada inspección
        const inspeccionesWithVehiculos = await Promise.all(
          inspeccionesData.map(async (inspeccion) => {
            try {
              const vehiculoDoc = await getDoc(doc(db, 'vehiculos', inspeccion.vehiculoId));
              return {
                ...inspeccion,
                vehiculo: vehiculoDoc.exists() ? { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo : undefined
              };
            } catch (error) {
              console.error('Error fetching vehiculo for inspection:', inspeccion.id, error);
              return inspeccion;
            }
          })
        );

        // Ordenar por fecha más reciente
        const sortedInspecciones = inspeccionesWithVehiculos.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setInspecciones(sortedInspecciones);
        setFilteredInspecciones(sortedInspecciones);

      } catch (error) {
        console.error('Error fetching inspecciones:', error);
        toast.error('Error al cargar las inspecciones');
      } finally {
        setLoading(false);
      }
    };

    fetchInspecciones();
  }, [user]);

  useEffect(() => {
    let filtered = inspecciones;

    if (searchTerm) {
      filtered = filtered.filter(inspeccion =>
        inspeccion.vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspeccion.vehiculo?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspeccion.vehiculo?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspeccion.fecha.includes(searchTerm)
      );
    }

    setFilteredInspecciones(filtered);
  }, [searchTerm, inspecciones]);

  const getEstadoBadge = (estado: string) => {
    return estado === 'aprobado' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Aprobado
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Rechazado
      </Badge>
    );
  };

  const estadisticas = {
    total: inspecciones.length,
    aprobadas: inspecciones.filter(i => i.estado === 'aprobado').length,
    rechazadas: inspecciones.filter(i => i.estado === 'rechazado').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mis Inspecciones</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Inspecciones</h1>
        <p className="text-gray-600">Historial de inspecciones realizadas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <History className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.aprobadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                <p className="text-2xl font-semibold text-gray-900">{estadisticas.rechazadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Inspecciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por placa, marca, modelo o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FileText className="h-4 w-4" />
        <span>
          Mostrando {filteredInspecciones.length} de {inspecciones.length} inspecciones
        </span>
      </div>

      {/* Inspections List */}
      {filteredInspecciones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No se encontraron inspecciones con el término "{searchTerm}"
                </p>
              </>
            ) : (
              <>
                <History className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No has realizado inspecciones aún
                </p>
                <Button asChild className="mt-4" variant="outline">
                  <a href="/conductor/nueva-inspeccion">
                    Realizar Primera Inspección
                  </a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInspecciones.map((inspeccion) => (
            <Card key={inspeccion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Car className="h-6 w-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {inspeccion.vehiculo?.placa || 'Vehículo no encontrado'}
                        </h3>
                        {getEstadoBadge(inspeccion.estado)}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {inspeccion.vehiculo?.marca} {inspeccion.vehiculo?.modelo} ({inspeccion.vehiculo?.año})
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(inspeccion.fecha).toLocaleDateString('es-CO')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{inspeccion.hora}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-400" />
                          <span>{inspeccion.kilometrajeActual?.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Estado:</span>
                          <span className={`font-medium ${
                            inspeccion.estado === 'aprobado' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {inspeccion.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                          </span>
                        </div>
                      </div>

                      {inspeccion.observaciones && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Observaciones:</strong> {inspeccion.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
