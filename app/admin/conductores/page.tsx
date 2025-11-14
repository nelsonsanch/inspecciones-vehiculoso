
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conductor } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ConductoresPage() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [filteredConductores, setFilteredConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [conductorToDelete, setConductorToDelete] = useState<Conductor | null>(null);
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

    setFilteredConductores(filtered);
  }, [searchTerm, conductores]);

  const handleDeleteConductor = async (conductor: Conductor) => {
    setConductorToDelete(conductor);
  };

  const confirmDelete = async () => {
    if (!conductorToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'conductores', conductorToDelete.id));
      setConductores(prev => prev.filter(c => c.id !== conductorToDelete.id));
      toast.success('Conductor eliminado correctamente');
    } catch (error) {
      console.error('Error deleting conductor:', error);
      toast.error('Error al eliminar el conductor');
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

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Conductores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, cédula, licencia o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
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
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
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
                    onClick={() => handleDeleteConductor(conductor)}
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
      <AlertDialog open={!!conductorToDelete} onOpenChange={() => setConductorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conductor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el conductor{' '}
              <strong>{conductorToDelete?.nombre}</strong> y todos sus datos asociados.
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
