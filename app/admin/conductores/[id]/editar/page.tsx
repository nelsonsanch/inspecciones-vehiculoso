
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conductor } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const CATEGORIAS_LICENCIA = [
  'A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'
];

export default function EditarConductorPage() {
  const params = useParams();
  const conductorId = params?.id as string;
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    numeroLicencia: '',
    categoriaLicencia: '',
    telefono: '',
    email: '',
    licenciaVencimiento: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalConductor, setOriginalConductor] = useState<Conductor | null>(null);

  useEffect(() => {
    const fetchConductor = async () => {
      if (!conductorId) return;

      try {
        const conductorDoc = await getDoc(doc(db, 'conductores', conductorId));
        
        if (conductorDoc.exists()) {
          const conductorData = { id: conductorDoc.id, ...conductorDoc.data() } as Conductor;
          setOriginalConductor(conductorData);
          
          setFormData({
            nombre: conductorData.nombre || '',
            cedula: conductorData.cedula || '',
            numeroLicencia: conductorData.numeroLicencia || '',
            categoriaLicencia: conductorData.categoriaLicencia || '',
            telefono: conductorData.telefono || '',
            email: conductorData.email || '',
            licenciaVencimiento: conductorData.licenciaVencimiento || ''
          });
        } else {
          toast.error('Conductor no encontrado');
          router.push('/admin/conductores');
        }
      } catch (error) {
        console.error('Error fetching conductor:', error);
        toast.error('Error al cargar la información del conductor');
      } finally {
        setLoading(false);
      }
    };

    fetchConductor();
  }, [conductorId, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.cedula || !formData.numeroLicencia || !formData.categoriaLicencia) {
        toast.error('Por favor complete todos los campos obligatorios');
        setSaving(false);
        return;
      }

      if (!formData.email) {
        toast.error('El email es obligatorio');
        setSaving(false);
        return;
      }

      const conductorData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'conductores', conductorId), conductorData);
      
      toast.success('Conductor actualizado correctamente');
      router.push('/admin/conductores');
    } catch (error) {
      console.error('Error updating conductor:', error);
      toast.error('Error al actualizar el conductor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!originalConductor) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/conductores">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Conductor</h1>
          <p className="text-gray-600">Modificar información de {originalConductor.nombre}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Información del Conductor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Información Personal</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Juan Pérez García"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cedula">Cédula *</Label>
                  <Input
                    id="cedula"
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => handleInputChange('cedula', e.target.value)}
                    placeholder="12345678"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="3001234567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="conductor@empresa.com"
                  required
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El email no se puede modificar ya que es usado para el inicio de sesión
                </p>
              </div>
            </div>

            {/* Información de Licencia */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Licencia de Conducción</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroLicencia">Número de Licencia *</Label>
                  <Input
                    id="numeroLicencia"
                    type="text"
                    value={formData.numeroLicencia}
                    onChange={(e) => handleInputChange('numeroLicencia', e.target.value)}
                    placeholder="12345678"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoriaLicencia">Categoría de Licencia *</Label>
                  <Select 
                    value={formData.categoriaLicencia} 
                    onValueChange={(value) => handleInputChange('categoriaLicencia', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione la categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_LICENCIA.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="licenciaVencimiento">Fecha de Vencimiento de Licencia</Label>
                <Input
                  id="licenciaVencimiento"
                  type="date"
                  value={formData.licenciaVencimiento}
                  onChange={(e) => handleInputChange('licenciaVencimiento', e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/admin/conductores">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Actualizar Conductor
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
