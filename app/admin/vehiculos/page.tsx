
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo } from '@/lib/auth-types';
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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Car,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vehiculos'));
        const vehiculosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vehiculo));
        
        setVehiculos(vehiculosData);
        setFilteredVehiculos(vehiculosData);
      } catch (error) {
        console.error('Error fetching vehiculos:', error);
        toast.error('Error al cargar los vehículos');
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculos();
  }, []);

  useEffect(() => {
    let filtered = vehiculos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vehiculo =>
        vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehiculo => vehiculo.estado === statusFilter);
    }

    setFilteredVehiculos(filtered);
  }, [searchTerm, statusFilter, vehiculos]);

  const handleDeleteVehiculo = async (vehiculo: Vehiculo) => {
    setVehiculoToDelete(vehiculo);
  };

  const confirmDelete = async () => {
    if (!vehiculoToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'vehiculos', vehiculoToDelete.id));
      setVehiculos(prev => prev.filter(v => v.id !== vehiculoToDelete.id));
      toast.success('Vehículo eliminado correctamente');
    } catch (error) {
      console.error('Error deleting vehiculo:', error);
      toast.error('Error al eliminar el vehículo');
    } finally {
      setIsDeleting(false);
      setVehiculoToDelete(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      activo: { label: 'Activo', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      inactivo: { label: 'Inactivo', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      mantenimiento: { label: 'Mantenimiento', variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.activo;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600">Gestión de la flota vehicular</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/admin/vehiculos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Vehículo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por placa, marca, modelo o color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Car className="h-4 w-4" />
        <span>
          Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos
        </span>
      </div>

      {/* Vehicles Grid */}
      {filteredVehiculos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron vehículos con los filtros aplicados'
                : 'No hay vehículos registrados'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/vehiculos/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar primer vehículo
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehiculos.map((vehiculo) => (
            <Card key={vehiculo.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {vehiculo.placa}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {vehiculo.marca} {vehiculo.modelo}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(vehiculo.estado)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Año:</span>
                    <span className="font-medium">{vehiculo.año}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tipo:</span>
                    <span className="font-medium capitalize">{vehiculo.tipoVehiculo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Color:</span>
                    <span className="font-medium capitalize">{vehiculo.color}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Kilometraje:</span>
                    <span className="font-medium">{vehiculo.kilometraje?.toLocaleString() || '0'} km</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/vehiculos/${vehiculo.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/vehiculos/${vehiculo.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteVehiculo(vehiculo)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!vehiculoToDelete} onOpenChange={() => setVehiculoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo{' '}
              <strong>{vehiculoToDelete?.placa}</strong> y todos sus datos asociados.
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
