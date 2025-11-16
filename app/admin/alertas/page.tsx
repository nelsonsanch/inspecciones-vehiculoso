
'use client';

import { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertaMantenimiento, Vehiculo, EstadoAlerta, PrioridadAlerta } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  FileText,
  Wrench,
  Loader2,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface AlertaConVehiculo extends AlertaMantenimiento {
  id: string;
  vehiculo?: Vehiculo;
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaConVehiculo[]>([]);
  const [vehiculos, setVehiculos] = useState<Map<string, Vehiculo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaConVehiculo | null>(null);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [dialogDetalle, setDialogDetalle] = useState(false);
  const [dialogAccion, setDialogAccion] = useState(false);
  const [accionTipo, setAccionTipo] = useState<'resolver' | 'en_proceso' | 'posponer'>('resolver');
  const [notasAccion, setNotasAccion] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar vehículos
      const vehiculosSnapshot = await getDocs(collection(db, 'vehiculos'));
      const vehiculosMap = new Map<string, Vehiculo>();
      vehiculosSnapshot.forEach(doc => {
        vehiculosMap.set(doc.id, { ...doc.data(), id: doc.id } as Vehiculo);
      });
      setVehiculos(vehiculosMap);

      // Cargar alertas
      const alertasSnapshot = await getDocs(collection(db, 'alertas'));
      const alertasData: AlertaConVehiculo[] = [];
      
      alertasSnapshot.forEach(doc => {
        const data = doc.data() as AlertaMantenimiento;
        alertasData.push({
          ...data,
          id: doc.id,
          vehiculo: vehiculosMap.get(data.vehiculoId)
        });
      });

      // Ordenar por fecha de detección (más recientes primero) y luego por prioridad
      alertasData.sort((a, b) => {
        // Primero ordenar por estado (pendientes primero)
        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
        if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
        
        // Luego por prioridad
        const prioridadOrden = { 'critica': 0, 'alta': 1, 'media': 2, 'baja': 3 };
        const diffPrioridad = prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
        if (diffPrioridad !== 0) return diffPrioridad;
        
        // Finalmente por fecha (más recientes primero)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setAlertas(alertasData);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const alertasFiltradas = alertas.filter(alerta => {
    // Filtro de búsqueda
    if (searchTerm) {
      const termino = searchTerm.toLowerCase();
      const coincide = 
        alerta.titulo.toLowerCase().includes(termino) ||
        alerta.vehiculo?.placa.toLowerCase().includes(termino) ||
        alerta.descripcion.toLowerCase().includes(termino);
      if (!coincide) return false;
    }

    // Filtro de estado
    if (filtroEstado !== 'todas' && alerta.estado !== filtroEstado) {
      return false;
    }

    // Filtro de prioridad
    if (filtroPrioridad !== 'todas' && alerta.prioridad !== filtroPrioridad) {
      return false;
    }

    return true;
  });

  const handleCambiarEstado = async (nuevoEstado: EstadoAlerta) => {
    if (!alertaSeleccionada) return;

    try {
      const updateData: any = {
        estado: nuevoEstado,
        updatedAt: new Date().toISOString()
      };

      if (notasAccion) {
        updateData.notas = notasAccion;
      }

      if (nuevoEstado === 'resuelta') {
        updateData.fechaResolucion = new Date().toISOString();
      }

      await updateDoc(doc(db, 'alertas', alertaSeleccionada.id), updateData);
      
      toast.success(`Alerta marcada como ${nuevoEstado === 'resuelta' ? 'resuelta' : nuevoEstado === 'en_proceso' ? 'en proceso' : 'pospuesta'}`);
      setDialogAccion(false);
      setNotasAccion('');
      cargarDatos();
    } catch (error) {
      console.error('Error al actualizar alerta:', error);
      toast.error('Error al actualizar alerta');
    }
  };

  const handleEliminar = async () => {
    if (!alertaSeleccionada) return;

    try {
      await deleteDoc(doc(db, 'alertas', alertaSeleccionada.id));
      toast.success('Alerta eliminada correctamente');
      setDialogEliminar(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar alerta:', error);
      toast.error('Error al eliminar alerta');
    }
  };

  const handleCrearMantenimiento = (alerta: AlertaConVehiculo) => {
    // Redirigir a la página de historial del vehículo para crear el mantenimiento
    if (alerta.vehiculoId) {
      window.location.href = `/admin/vehiculos/${alerta.vehiculoId}`;
    }
  };

  const getBadgeEstado = (estado: EstadoAlerta) => {
    const badges = {
      'pendiente': { variant: 'default' as const, icon: Clock, label: 'Pendiente' },
      'en_proceso': { variant: 'secondary' as const, icon: Wrench, label: 'En Proceso' },
      'resuelta': { variant: 'outline' as const, icon: CheckCircle, label: 'Resuelta' },
      'pospuesta': { variant: 'outline' as const, icon: XCircle, label: 'Pospuesta' }
    };
    const config = badges[estado];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getBadgePrioridad = (prioridad: PrioridadAlerta) => {
    const badges = {
      'critica': { className: 'bg-red-600 text-white hover:bg-red-700', label: '🔴 CRÍTICA' },
      'alta': { className: 'bg-orange-500 text-white hover:bg-orange-600', label: '🟠 ALTA' },
      'media': { className: 'bg-yellow-500 text-white hover:bg-yellow-600', label: '🟡 MEDIA' },
      'baja': { className: 'bg-blue-500 text-white hover:bg-blue-600', label: '🔵 BAJA' }
    };
    const config = badges[prioridad];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const estadisticas = {
    total: alertas.length,
    pendientes: alertas.filter(a => a.estado === 'pendiente').length,
    enProceso: alertas.filter(a => a.estado === 'en_proceso').length,
    criticas: alertas.filter(a => a.prioridad === 'critica' && a.estado === 'pendiente').length,
    resueltas: alertas.filter(a => a.estado === 'resuelta').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cargando alertas...</h1>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-7 w-7 text-blue-600" />
            Gestión de Alertas
          </h1>
          <p className="text-gray-600 mt-1">Sistema automático de alertas y mantenimiento</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{estadisticas.total}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">{estadisticas.pendientes}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">{estadisticas.enProceso}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Críticas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">{estadisticas.criticas}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Resueltas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">{estadisticas.resueltas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="resuelta">Resuelta</SelectItem>
                <SelectItem value="pospuesta">Pospuesta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alertasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron alertas con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          alertasFiltradas.map((alerta) => (
            <Card key={alerta.id} className={`hover:shadow-md transition-shadow ${
              alerta.prioridad === 'critica' && alerta.estado === 'pendiente' 
                ? 'border-l-4 border-l-red-600' 
                : ''
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getBadgePrioridad(alerta.prioridad)}
                      {getBadgeEstado(alerta.estado)}
                      {alerta.vehiculo && (
                        <Badge variant="outline" className="font-mono">
                          {alerta.vehiculo.placa}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{alerta.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">
                      {alerta.descripcion}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Detectado: {new Date(alerta.fechaDeteccion).toLocaleDateString('es-CO')}
                      </span>
                      {alerta.inspeccionId && (
                        <Link 
                          href={`/admin/inspecciones/${alerta.inspeccionId}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <FileText className="h-3 w-3" />
                          Ver inspección
                        </Link>
                      )}
                    </div>
                    {alerta.notas && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Notas:</strong> {alerta.notas}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertaSeleccionada(alerta);
                        setDialogDetalle(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {alerta.estado !== 'resuelta' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAlertaSeleccionada(alerta);
                            setAccionTipo('resolver');
                            setDialogAccion(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAlertaSeleccionada(alerta);
                            setAccionTipo('en_proceso');
                            setDialogAccion(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCrearMantenimiento(alerta)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Crear evento de mantenimiento"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAlertaSeleccionada(alerta);
                        setDialogEliminar(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Detalle */}
      <Dialog open={dialogDetalle} onOpenChange={setDialogDetalle}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de la Alerta</DialogTitle>
          </DialogHeader>
          {alertaSeleccionada && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getBadgePrioridad(alertaSeleccionada.prioridad)}
                {getBadgeEstado(alertaSeleccionada.estado)}
              </div>
              <div>
                <h3 className="font-semibold mb-2">{alertaSeleccionada.titulo}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {alertaSeleccionada.descripcion}
                </p>
              </div>
              {alertaSeleccionada.vehiculo && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Vehículo:</p>
                    <p className="font-medium">{alertaSeleccionada.vehiculo.placa}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Marca/Modelo:</p>
                    <p className="font-medium">
                      {alertaSeleccionada.vehiculo.marca} {alertaSeleccionada.vehiculo.modelo}
                    </p>
                  </div>
                </div>
              )}
              {alertaSeleccionada.itemsAfectados && alertaSeleccionada.itemsAfectados.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Ítems afectados:</p>
                  <div className="flex flex-wrap gap-2">
                    {alertaSeleccionada.itemsAfectados.map((item, index) => (
                      <Badge key={index} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Fecha de Detección:</p>
                  <p className="font-medium">
                    {new Date(alertaSeleccionada.fechaDeteccion).toLocaleString('es-CO')}
                  </p>
                </div>
                {alertaSeleccionada.fechaResolucion && (
                  <div>
                    <p className="text-gray-500">Fecha de Resolución:</p>
                    <p className="font-medium">
                      {new Date(alertaSeleccionada.fechaResolucion).toLocaleString('es-CO')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Acción */}
      <Dialog open={dialogAccion} onOpenChange={setDialogAccion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accionTipo === 'resolver' ? 'Resolver Alerta' : 
               accionTipo === 'en_proceso' ? 'Marcar como En Proceso' : 
               'Posponer Alerta'}
            </DialogTitle>
            <DialogDescription>
              {accionTipo === 'resolver' 
                ? 'Marque esta alerta como resuelta si el problema ya fue solucionado.'
                : accionTipo === 'en_proceso'
                ? 'Marque esta alerta como en proceso si está trabajando en ella.'
                : 'Posponga esta alerta para revisarla más tarde.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                value={notasAccion}
                onChange={(e) => setNotasAccion(e.target.value)}
                placeholder="Agregue notas sobre esta acción..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAccion(false)}>
              Cancelar
            </Button>
            <Button onClick={() => handleCambiarEstado(
              accionTipo === 'resolver' ? 'resuelta' : 
              accionTipo === 'en_proceso' ? 'en_proceso' : 
              'pospuesta'
            )}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Eliminar */}
      <AlertDialog open={dialogEliminar} onOpenChange={setDialogEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar alerta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La alerta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
