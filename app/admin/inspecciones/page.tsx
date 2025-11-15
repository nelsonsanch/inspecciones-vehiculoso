
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inspeccion, Vehiculo, Conductor } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Search, 
  Trash2, 
  Eye, 
  ClipboardList,
  Loader2,
  Calendar,
  Car,
  User,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InspeccionWithDetails extends Inspeccion {
  vehiculo?: Vehiculo;
  conductor?: Conductor;
}

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [filteredInspecciones, setFilteredInspecciones] = useState<InspeccionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [inspeccionToDelete, setInspeccionToDelete] = useState<InspeccionWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchInspecciones = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'inspecciones'));
        
        const inspeccionesWithDetails = await Promise.all(
          snapshot.docs.map(async (inspeccionDoc) => {
            const inspeccionData = { id: inspeccionDoc.id, ...inspeccionDoc.data() } as Inspeccion;
            
            try {
              const [vehiculoDoc, conductorDoc] = await Promise.all([
                getDoc(doc(db, 'vehiculos', inspeccionData.vehiculoId)),
                getDoc(doc(db, 'conductores', inspeccionData.conductorId))
              ]);

              return {
                ...inspeccionData,
                vehiculo: vehiculoDoc.exists() ? { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo : undefined,
                conductor: conductorDoc.exists() ? { id: conductorDoc.id, ...conductorDoc.data() } as Conductor : undefined,
              };
            } catch (error) {
              console.error('Error fetching details for inspection:', inspeccionData.id, error);
              return inspeccionData;
            }
          })
        );
        
        setInspecciones(inspeccionesWithDetails);
        setFilteredInspecciones(inspeccionesWithDetails);
      } catch (error) {
        console.error('Error fetching inspecciones:', error);
        toast.error('Error al cargar las inspecciones');
      } finally {
        setLoading(false);
      }
    };

    fetchInspecciones();
  }, []);

  useEffect(() => {
    let filtered = inspecciones;

    // Filter by estado
    if (estadoFilter && estadoFilter !== 'todos') {
      filtered = filtered.filter(inspeccion => inspeccion.estado === estadoFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(inspeccion =>
        inspeccion.vehiculo?.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspeccion.conductor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspeccion.fecha.includes(searchTerm)
      );
    }

    setFilteredInspecciones(filtered);
  }, [searchTerm, estadoFilter, inspecciones]);

  const handleDeleteInspeccion = async (inspeccion: InspeccionWithDetails) => {
    setInspeccionToDelete(inspeccion);
  };

  const confirmDelete = async () => {
    if (!inspeccionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'inspecciones', inspeccionToDelete.id));
      setInspecciones(prev => prev.filter(i => i.id !== inspeccionToDelete.id));
      toast.success('Inspección eliminada correctamente');
    } catch (error) {
      console.error('Error deleting inspeccion:', error);
      toast.error('Error al eliminar la inspección');
    } finally {
      setIsDeleting(false);
      setInspeccionToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cargando inspecciones...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspecciones</h1>
          <p className="text-gray-600">Gestión de inspecciones preoperacionales</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por placa, conductor o fecha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="aprobado">Aprobadas</SelectItem>
                  <SelectItem value="rechazado">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inspecciones</p>
                <p className="text-2xl font-bold text-gray-900">{inspecciones.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {inspecciones.filter(i => i.estado === 'aprobado').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                <p className="text-2xl font-bold text-red-600">
                  {inspecciones.filter(i => i.estado === 'rechazado').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredInspecciones.length} {filteredInspecciones.length === 1 ? 'Inspección' : 'Inspecciones'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInspecciones.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No se encontraron inspecciones</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInspecciones.map((inspeccion) => (
                <div 
                  key={inspeccion.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-full ${
                      inspeccion.estado === 'aprobado' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {inspeccion.estado === 'aprobado' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Car className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {inspeccion.vehiculo?.placa || 'Vehículo no encontrado'} - {inspeccion.vehiculo?.marca || ''} {inspeccion.vehiculo?.modelo || ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                        <User className="h-3 w-3" />
                        <span>{inspeccion.conductor?.nombre || 'Conductor no encontrado'}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(inspeccion.fecha).toLocaleDateString('es-CO')}</span>
                        <span>{inspeccion.hora}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={inspeccion.estado === 'aprobado' ? 'default' : 'destructive'}
                      className={inspeccion.estado === 'aprobado' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {inspeccion.estado === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInspeccion(inspeccion)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!inspeccionToDelete} onOpenChange={() => setInspeccionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Inspección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la inspección de:
              <br />
              <strong>{inspeccionToDelete?.vehiculo?.placa}</strong> realizada el{' '}
              <strong>{inspeccionToDelete?.fecha ? new Date(inspeccionToDelete.fecha).toLocaleDateString('es-CO') : ''}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
