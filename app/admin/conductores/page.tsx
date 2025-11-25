
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conductor } from '@/lib/auth-types';
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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Loader2,
  Phone,
  CreditCard,
  Mail,
  UserX,
  UserCheck,
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

export default function ConductoresPage() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [filteredConductores, setFilteredConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [conductorToToggle, setConductorToToggle] = useState<Conductor | null>(null);
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'conductores'));
        const conductoresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Conductor));
        
        setConductores(conductoresData);
        setFilteredConductores(conductoresData);
      } catch (error) {
        console.error('Error fetching conductores:', error);
        toast.error('Error al cargar los conductores');
      } finally {
        setLoading(false);
      }
    };

    fetchConductores();
  }, []);

  useEffect(() => {
    let filtered = conductores;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(conductor =>
        conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.cedula.includes(searchTerm) ||
        conductor.numeroLicencia.includes(searchTerm) ||
        conductor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter(conductor => conductor.estado === estadoFilter);
    }

    setFilteredConductores(filtered);
  }, [searchTerm, estadoFilter, conductores]);

  const handleToggleEstado = async (conductor: Conductor) => {
    setConductorToToggle(conductor);
  };

  const confirmToggleEstado = async () => {
    if (!conductorToToggle) return;

    setIsToggling(true);
    const nuevoEstado = conductorToToggle.estado === 'activo' ? 'inactivo' : 'activo';
    
    try {
      // Actualizar en Firestore (conductores)
      await updateDoc(doc(db, 'conductores', conductorToToggle.id), {
        estado: nuevoEstado,
        updatedAt: new Date().toISOString()
      });

      // Actualizar en Firestore (users) también
      try {
        await updateDoc(doc(db, 'users', conductorToToggle.id), {
          estado: nuevoEstado,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.log('No se pudo actualizar en users, puede que no exista el documento');
      }

      // Actualizar estado local
      setConductores(prev => prev.map(c => 
        c.id === conductorToToggle.id ? { ...c, estado: nuevoEstado } : c
      ));

      toast.success(
        nuevoEstado === 'inactivo' 
          ? 'Conductor desactivado. No podrá iniciar sesión hasta que sea reactivado.' 
          : 'Conductor reactivado correctamente'
      );
    } catch (error) {
      console.error('Error toggling conductor estado:', error);
      toast.error('Error al cambiar el estado del conductor');
    } finally {
      setIsToggling(false);
      setConductorToToggle(null);
    }
  };

  const handleDeleteConductor = async (conductor: Conductor) => {
    setConductorToDelete(conductor);
  };

  const confirmDelete = async () => {
    if (!conductorToDelete) return;

    setIsDeleting(true);
    
    try {
      const conductorEmail = conductorToDelete.email;

      // Llamar al API endpoint que usa Firebase Admin SDK
      // Esto eliminará COMPLETAMENTE el conductor:
      // 1. De Firebase Authentication
      // 2. De Firestore (users + conductores)
      const response = await fetch('/api/delete-conductor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: conductorToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el conductor');
      }

      // Eliminar del estado local
      setConductores(prev => prev.filter(c => c.id !== conductorToDelete.id));

      // Mostrar mensaje de éxito
      toast.success('✅ Conductor eliminado completamente', {
        description: `El conductor "${conductorEmail}" fue eliminado de Firebase Auth y Firestore. El email ahora está disponible para reutilizar.`,
        duration: 8000,
      });
      
    } catch (error: any) {
      console.error('Error deleting conductor:', error);
      toast.error('Error al eliminar el conductor', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    } finally {
      setIsDeleting(false);
      setConductorToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Conductores</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Conductores</h1>
          <p className="text-gray-600">Gestión de conductores registrados</p>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/admin/conductores/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Conductor
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar y Filtrar Conductores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar por nombre, cédula, licencia o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={estadoFilter} onValueChange={(value: 'todos' | 'activo' | 'inactivo') => setEstadoFilter(value)}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Solo Activos</SelectItem>
                  <SelectItem value="inactivo">Solo Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span>
          Mostrando {filteredConductores.length} de {conductores.length} conductores
        </span>
      </div>

      {/* Conductores Grid */}
      {filteredConductores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              {searchTerm 
                ? 'No se encontraron conductores con los criterios de búsqueda'
                : 'No hay conductores registrados'
              }
            </p>
            {!searchTerm && (
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/conductores/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar primer conductor
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConductores.map((conductor) => (
            <Card key={conductor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${conductor.estado === 'activo' ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Users className={`h-6 w-6 ${conductor.estado === 'activo' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {conductor.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {conductor.categoriaLicencia}
                      </p>
                    </div>
                  </div>
                  <Badge variant={conductor.estado === 'activo' ? 'default' : 'secondary'}>
                    {conductor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Cédula:</span>
                    <span className="font-medium">{conductor.cedula}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Licencia:</span>
                    <span className="font-medium">{conductor.numeroLicencia}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Teléfono:</span>
                    <span className="font-medium">{conductor.telefono}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-xs break-all">{conductor.email}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/conductores/${conductor.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/conductores/${conductor.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEstado(conductor)}
                    className={conductor.estado === 'activo' 
                      ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                    }
                    title={conductor.estado === 'activo' ? 'Desactivar conductor' : 'Activar conductor'}
                  >
                    {conductor.estado === 'activo' ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConductor(conductor)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Eliminar conductor permanentemente"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toggle Estado Confirmation Dialog */}
      <AlertDialog open={!!conductorToToggle} onOpenChange={() => setConductorToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {conductorToToggle?.estado === 'activo' ? '¿Desactivar conductor?' : '¿Activar conductor?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conductorToToggle?.estado === 'activo' ? (
                <>
                  Al desactivar a <strong>{conductorToToggle?.nombre}</strong>, no podrá iniciar sesión 
                  en la aplicación hasta que sea reactivado. Sus datos históricos se mantendrán intactos 
                  y podrás reactivarlo en cualquier momento.
                </>
              ) : (
                <>
                  Al activar a <strong>{conductorToToggle?.nombre}</strong>, podrá volver a iniciar sesión 
                  en la aplicación y realizar inspecciones normalmente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleEstado}
              disabled={isToggling}
              className={conductorToToggle?.estado === 'activo' 
                ? "bg-orange-600 hover:bg-orange-700" 
                : "bg-green-600 hover:bg-green-700"
              }
            >
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {conductorToToggle?.estado === 'activo' ? 'Desactivando...' : 'Activando...'}
                </>
              ) : (
                conductorToToggle?.estado === 'activo' ? 'Desactivar' : 'Activar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!conductorToDelete} onOpenChange={() => setConductorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ ¿Eliminar conductor permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-sm text-gray-700">
                Esta acción es <strong className="text-red-600">IRREVERSIBLE</strong>. Se eliminará <strong>automáticamente y completamente</strong> a{' '}
                <strong>{conductorToDelete?.nombre}</strong> ({conductorToDelete?.email}).
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-800 mb-2">🗑️ Se eliminará de:</p>
                <ul className="list-none space-y-1 text-red-700">
                  <li>✅ Firebase Authentication (email quedará disponible)</li>
                  <li>✅ Base de datos Firestore (users + conductores)</li>
                  <li>✅ Todos los datos asociados</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="text-blue-800">
                  💡 <strong>Recomendación:</strong> Si solo quieres desactivar temporalmente al conductor, 
                  usa el botón <strong>"Desactivar"</strong> en lugar de eliminar.
                </p>
              </div>
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
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sí, Eliminar Permanentemente
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
