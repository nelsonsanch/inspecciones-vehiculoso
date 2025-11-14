
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo, Inspeccion } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Car,
  Calendar,
  Gauge,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function VehiculoDetailPage() {
  const params = useParams();
  const vehiculoId = params?.id as string;
  
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehiculo = async () => {
      if (!vehiculoId) return;

      try {
        // Obtener datos del vehículo
        const vehiculoDoc = await getDoc(doc(db, 'vehiculos', vehiculoId));
        
        if (vehiculoDoc.exists()) {
          const vehiculoData = { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo;
          setVehiculo(vehiculoData);

          // Obtener historial de inspecciones
          const inspeccionesQuery = query(
            collection(db, 'inspecciones'),
            where('vehiculoId', '==', vehiculoId)
          );
          
          const inspeccionesSnapshot = await getDocs(inspeccionesQuery);
          const inspeccionesData = inspeccionesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Inspeccion))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setInspecciones(inspeccionesData);
        } else {
          toast.error('Vehículo no encontrado');
        }
      } catch (error) {
        console.error('Error fetching vehiculo:', error);
        toast.error('Error al cargar la información del vehículo');
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculo();
  }, [vehiculoId]);

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      activo: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      inactivo: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
      mantenimiento: { label: 'Mantenimiento', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.activo;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
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

  if (!vehiculo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/vehiculos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehículo no encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  const inspeccionesAprobadas = inspecciones.filter(i => i.estado === 'aprobado').length;
  const inspeccionesRechazadas = inspecciones.filter(i => i.estado === 'rechazado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/vehiculos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehiculo.placa}</h1>
            <p className="text-gray-600">{vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})</p>
          </div>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={`/admin/vehiculos/${vehiculo.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Vehículo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles Principales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Placa</p>
                  <p className="text-lg font-semibold">{vehiculo.placa}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  {getStatusBadge(vehiculo.estado)}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Marca</p>
                  <p className="text-base">{vehiculo.marca}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Modelo</p>
                  <p className="text-base">{vehiculo.modelo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Año</p>
                  <p className="text-base">{vehiculo.año}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-base capitalize">{vehiculo.tipoVehiculo}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Color</p>
                  <p className="text-base capitalize">{vehiculo.color}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Gauge className="h-4 w-4" />
                    Kilometraje
                  </p>
                  <p className="text-base">{vehiculo.kilometraje?.toLocaleString() || '0'} km</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <p>Creado: {new Date(vehiculo.createdAt).toLocaleDateString('es-CO')}</p>
                </div>
                <div>
                  <p>Actualizado: {new Date(vehiculo.updatedAt).toLocaleDateString('es-CO')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Inspecciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Historial de Inspecciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspecciones.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay inspecciones registradas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inspecciones.slice(0, 5).map((inspeccion) => (
                    <div 
                      key={inspeccion.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {inspeccion.estado === 'aprobado' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(inspeccion.fecha).toLocaleDateString('es-CO')} - {inspeccion.hora}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inspeccion.kilometrajeActual?.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={inspeccion.estado === 'aprobado' ? 'default' : 'destructive'}
                        className={inspeccion.estado === 'aprobado' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {inspeccion.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </div>
                  ))}
                  
                  {inspecciones.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/inspecciones?vehiculo=${vehiculo.id}`}>
                          Ver todas las inspecciones ({inspecciones.length})
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{inspecciones.length}</p>
                <p className="text-sm text-gray-600">Total Inspecciones</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{inspeccionesAprobadas}</p>
                  <p className="text-xs text-gray-600">Aprobadas</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">{inspeccionesRechazadas}</p>
                  <p className="text-xs text-gray-600">Rechazadas</p>
                </div>
              </div>

              {inspecciones.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Última inspección:</span>
                      <span className="font-medium">
                        {new Date(inspecciones[0]?.fecha || '').toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado:</span>
                      <Badge 
                        variant={inspecciones[0]?.estado === 'aprobado' ? 'default' : 'destructive'}
                        className={`text-xs ${inspecciones[0]?.estado === 'aprobado' ? 'bg-green-100 text-green-800' : ''}`}
                      >
                        {inspecciones[0]?.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/vehiculos/${vehiculo.id}/editar`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Vehículo
                </Link>
              </Button>
              
              <Button asChild className="w-full" variant="outline">
                <Link href={`/admin/inspecciones?vehiculo=${vehiculo.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver Inspecciones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
