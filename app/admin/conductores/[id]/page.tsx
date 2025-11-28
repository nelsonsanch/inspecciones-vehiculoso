
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Car,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ImageFromStorage } from '@/components/ui/image-from-storage';
import { es } from 'date-fns/locale';

interface Conductor {
  id: string;
  nombre: string;
  email: string;
  cedula: string;
  telefono: string;
  licencia: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
  fotoUrl?: string;
}

interface Inspeccion {
  id: string;
  vehiculoId: string;
  vehiculoPlaca?: string;
  conductorId: string;
  fecha: string;
  estado: 'aprobada' | 'rechazada' | 'pendiente';
  observaciones?: string;
}

export default function ConductorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const conductorId = params?.id as string;

  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'administrador') {
      router.push('/login');
      return;
    }

    fetchData();
  }, [user, conductorId]);

  const fetchData = async () => {
    if (!conductorId) return;

    try {
      // Obtener datos del conductor
      const conductorDoc = await getDoc(doc(db, 'conductores', conductorId));

      if (conductorDoc.exists()) {
        const conductorData = {
          id: conductorDoc.id,
          ...conductorDoc.data(),
        } as Conductor;
        setConductor(conductorData);

        // Obtener inspecciones del conductor
        const inspeccionesQuery = query(
          collection(db, 'inspecciones'),
          where('conductorId', '==', conductorId),
          orderBy('fecha', 'desc')
        );

        const inspeccionesSnapshot = await getDocs(inspeccionesQuery);
        const inspeccionesData = inspeccionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Inspeccion[];

        setInspecciones(inspeccionesData);
      } else {
        router.push('/admin/conductores');
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!conductor) {
    return null;
  }

  const inspeccionesAprobadas = inspecciones.filter((i) => i.estado === 'aprobada').length;
  const inspeccionesRechazadas = inspecciones.filter((i) => i.estado === 'rechazada').length;
  const inspeccionesTotales = inspecciones.length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/conductores">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{conductor.nombre}</h1>
            <p className="text-muted-foreground">Detalles del conductor</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/conductores/${conductorId}/editar`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información General */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {conductor.fotoUrl ? (
                  <ImageFromStorage
                    storagePath={conductor.fotoUrl}
                    alt={`Foto de ${conductor.nombre}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{conductor.nombre}</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-muted-foreground">Estado:</label>
                  <Badge variant={conductor.estado === 'activo' ? 'default' : 'destructive'}>
                    {conductor.estado === 'activo' ? (
                      <CheckCircle className="h-3 w-3 mr-1.5" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1.5" />
                    )}
                    {conductor.estado.charAt(0).toUpperCase() + conductor.estado.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-base">{conductor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </label>
                <p className="text-base">{conductor.telefono || 'No registrado'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Cédula</label>
                <p className="text-base">{conductor.cedula}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Licencia de Conducción
                </label>
                <p className="text-base">{conductor.licencia}</p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Registro
              </label>
              <p className="text-base">
                {conductor.createdAt
                  ? format(new Date(conductor.createdAt), "d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })
                  : 'No disponible'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estadísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {inspeccionesTotales}
              </div>
              <div className="text-sm text-muted-foreground">Total Inspecciones</div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {inspeccionesAprobadas}
              </div>
              <div className="text-sm text-muted-foreground">Aprobadas</div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {inspeccionesRechazadas}
              </div>
              <div className="text-sm text-muted-foreground">Rechazadas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial de Inspecciones */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Historial de Inspecciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inspecciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay inspecciones registradas para este conductor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inspecciones.map((inspeccion) => (
                <Link
                  key={inspeccion.id}
                  href={`/admin/inspecciones/${inspeccion.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          Vehículo: {inspeccion.vehiculoPlaca || inspeccion.vehiculoId}
                        </p>
                        <Badge
                          variant={
                            inspeccion.estado === 'aprobada'
                              ? 'default'
                              : inspeccion.estado === 'rechazada'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {inspeccion.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(inspeccion.fecha), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                      {inspeccion.observaciones && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {inspeccion.observaciones}
                        </p>
                      )}
                    </div>
                    <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
