
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo, Inspeccion, EventoVehiculo } from '@/lib/auth-types';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  ArrowLeft, 
  Edit, 
  Car,
  Calendar,
  Gauge,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Wrench,
  ClipboardList,
  DollarSign,
  User,
  Trash2,
  Clock,
  AlertTriangle,
  Camera
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { downloadFile } from '@/lib/s3';

export default function VehiculoDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const vehiculoId = params?.id as string;
  
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [eventos, setEventos] = useState<EventoVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoToDelete, setEventoToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<EventoVehiculo>>({
    tipo: 'mantenimiento',
    titulo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    kilometraje: undefined,
    costo: undefined,
    responsable: '',
    proveedor: '',
  });

  const fetchData = async () => {
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

        // Obtener eventos de la hoja de vida (sin orderBy para evitar índice compuesto)
        const eventosQuery = query(
          collection(db, 'eventos_vehiculo'),
          where('vehiculoId', '==', vehiculoId)
        );
        
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventosData = eventosSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as EventoVehiculo))
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

        setEventos(eventosData);
      } else {
        toast.error('Vehículo no encontrado');
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
      toast.error(`Error al cargar la información: ${error?.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vehiculoId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitEvento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descripcion || !formData.fecha) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    try {
      const nuevoEvento: Partial<EventoVehiculo> = {
        ...formData,
        vehiculoId: vehiculoId,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'admin',
      };

      await addDoc(collection(db, 'eventos_vehiculo'), nuevoEvento);

      toast.success('Evento agregado exitosamente');
      setDialogOpen(false);
      setFormData({
        tipo: 'mantenimiento',
        titulo: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        kilometraje: undefined,
        costo: undefined,
        responsable: '',
        proveedor: '',
      });
      
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error adding evento:', error);
      toast.error('Error al agregar el evento');
    }
  };

  const handleDeleteEvento = async () => {
    if (!eventoToDelete) return;

    try {
      await deleteDoc(doc(db, 'eventos_vehiculo', eventoToDelete));
      toast.success('Evento eliminado exitosamente');
      setDeleteDialogOpen(false);
      setEventoToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting evento:', error);
      toast.error('Error al eliminar el evento');
    }
  };

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

  const getTipoEventoBadge = (tipo: string) => {
    const tipoConfig = {
      mantenimiento: { label: 'Mantenimiento', className: 'bg-blue-100 text-blue-800', icon: Wrench },
      reparacion: { label: 'Reparación', className: 'bg-red-100 text-red-800', icon: AlertTriangle },
      actualizacion_documental: { label: 'Act. Documental', className: 'bg-green-100 text-green-800', icon: FileText },
      cambio_parte: { label: 'Cambio de Parte', className: 'bg-purple-100 text-purple-800', icon: Settings },
      otro: { label: 'Otro', className: 'bg-gray-100 text-gray-800', icon: ClipboardList },
    };

    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.otro;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
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

          {/* Fotos del Vehículo */}
          {vehiculo.fotos && Object.keys(vehiculo.fotos).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Fotos del Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehiculo.fotos.delantera && (
                    <FotoVehiculo 
                      label="Vista Delantera" 
                      cloudStoragePath={vehiculo.fotos.delantera} 
                    />
                  )}
                  {vehiculo.fotos.lateralIzquierda && (
                    <FotoVehiculo 
                      label="Vista Lateral Izquierda" 
                      cloudStoragePath={vehiculo.fotos.lateralIzquierda} 
                    />
                  )}
                  {vehiculo.fotos.lateralDerecha && (
                    <FotoVehiculo 
                      label="Vista Lateral Derecha" 
                      cloudStoragePath={vehiculo.fotos.lateralDerecha} 
                    />
                  )}
                  {vehiculo.fotos.trasera && (
                    <FotoVehiculo 
                      label="Vista Trasera" 
                      cloudStoragePath={vehiculo.fotos.trasera} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hoja de Vida del Vehículo */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-green-600" />
                  Hoja de Vida del Vehículo
                </CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Evento</DialogTitle>
                      <DialogDescription>
                        Registre mantenimientos, reparaciones, actualizaciones documentales y más
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEvento} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipo">Tipo de Evento *</Label>
                          <Select 
                            value={formData.tipo} 
                            onValueChange={(value) => handleInputChange('tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                              <SelectItem value="reparacion">Reparación</SelectItem>
                              <SelectItem value="actualizacion_documental">Actualización Documental</SelectItem>
                              <SelectItem value="cambio_parte">Cambio de Parte</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fecha">Fecha *</Label>
                          <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => handleInputChange('fecha', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                          id="titulo"
                          placeholder="Ej: Cambio de aceite, Renovación SOAT..."
                          value={formData.titulo}
                          onChange={(e) => handleInputChange('titulo', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Textarea
                          id="descripcion"
                          placeholder="Describa los detalles del evento..."
                          value={formData.descripcion}
                          onChange={(e) => handleInputChange('descripcion', e.target.value)}
                          required
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="kilometraje">Kilometraje</Label>
                          <Input
                            id="kilometraje"
                            type="number"
                            placeholder="25000"
                            value={formData.kilometraje || ''}
                            onChange={(e) => handleInputChange('kilometraje', e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="costo">Costo (COP)</Label>
                          <Input
                            id="costo"
                            type="number"
                            placeholder="150000"
                            value={formData.costo || ''}
                            onChange={(e) => handleInputChange('costo', e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="responsable">Responsable</Label>
                          <Input
                            id="responsable"
                            placeholder="Nombre del mecánico"
                            value={formData.responsable}
                            onChange={(e) => handleInputChange('responsable', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="proveedor">Proveedor/Taller</Label>
                          <Input
                            id="proveedor"
                            placeholder="Nombre del taller"
                            value={formData.proveedor}
                            onChange={(e) => handleInputChange('proveedor', e.target.value)}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Evento
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {eventos.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No hay eventos registrados en la hoja de vida</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventos.map((evento) => (
                    <div 
                      key={evento.id} 
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTipoEventoBadge(evento.tipo)}
                            <span className="text-xs text-gray-500">
                              {new Date(evento.fecha).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{evento.titulo}</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{evento.descripcion}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setEventoToDelete(evento.id!);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                        {evento.kilometraje && (
                          <div className="flex items-center gap-2 text-xs">
                            <Gauge className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{evento.kilometraje.toLocaleString()} km</span>
                          </div>
                        )}
                        {evento.costo && (
                          <div className="flex items-center gap-2 text-xs">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">${evento.costo.toLocaleString()}</span>
                          </div>
                        )}
                        {evento.responsable && (
                          <div className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{evento.responsable}</span>
                          </div>
                        )}
                        {evento.proveedor && (
                          <div className="flex items-center gap-2 text-xs">
                            <Wrench className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{evento.proveedor}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Registrado: {new Date(evento.createdAt).toLocaleString('es-CO')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

              <Separator />

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{eventos.length}</p>
                <p className="text-sm text-gray-600">Eventos en Hoja de Vida</p>
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

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar a Hoja de Vida
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente de la hoja de vida del vehículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvento}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Componente para mostrar una foto del vehículo
function FotoVehiculo({ label, cloudStoragePath }: { label: string; cloudStoragePath: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await downloadFile(cloudStoragePath);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading image:', error);
        toast.error('Error al cargar la imagen');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [cloudStoragePath]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={label}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Camera className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}
