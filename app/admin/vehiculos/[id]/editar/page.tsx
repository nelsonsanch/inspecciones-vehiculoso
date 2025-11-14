
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo } from '@/lib/auth-types';
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
import { ArrowLeft, Save, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

const TIPOS_VEHICULO = [
  'automovil',
  'camioneta', 
  'camion',
  'bus',
  'motocicleta',
  'furgon',
  'otro'
];

const ESTADOS = [
  'activo',
  'inactivo', 
  'mantenimiento'
];

export default function EditarVehiculoPage() {
  const params = useParams();
  const vehiculoId = params?.id as string;
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    tipoVehiculo: '',
    color: '',
    kilometraje: 0,
    estado: 'activo'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalVehiculo, setOriginalVehiculo] = useState<Vehiculo | null>(null);

  useEffect(() => {
    const fetchVehiculo = async () => {
      if (!vehiculoId) return;

      try {
        const vehiculoDoc = await getDoc(doc(db, 'vehiculos', vehiculoId));
        
        if (vehiculoDoc.exists()) {
          const vehiculoData = { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo;
          setOriginalVehiculo(vehiculoData);
          
          setFormData({
            placa: vehiculoData.placa || '',
            marca: vehiculoData.marca || '',
            modelo: vehiculoData.modelo || '',
            año: vehiculoData.año || new Date().getFullYear(),
            tipoVehiculo: vehiculoData.tipoVehiculo || '',
            color: vehiculoData.color || '',
            kilometraje: vehiculoData.kilometraje || 0,
            estado: vehiculoData.estado || 'activo'
          });
        } else {
          toast.error('Vehículo no encontrado');
          router.push('/admin/vehiculos');
        }
      } catch (error) {
        console.error('Error fetching vehiculo:', error);
        toast.error('Error al cargar la información del vehículo');
      } finally {
        setLoading(false);
      }
    };

    fetchVehiculo();
  }, [vehiculoId, router]);

  const handleInputChange = (field: string, value: string | number) => {
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
      if (!formData.placa || !formData.marca || !formData.modelo || !formData.tipoVehiculo) {
        toast.error('Por favor complete todos los campos obligatorios');
        return;
      }

      // Formatear placa en mayúsculas
      const vehiculoData = {
        ...formData,
        placa: formData.placa.toUpperCase(),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'vehiculos', vehiculoId), vehiculoData);
      
      toast.success('Vehículo actualizado correctamente');
      router.push(`/admin/vehiculos/${vehiculoId}`);
    } catch (error) {
      console.error('Error updating vehiculo:', error);
      toast.error('Error al actualizar el vehículo');
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
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!originalVehiculo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/vehiculos/${vehiculoId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Vehículo</h1>
          <p className="text-gray-600">Modificar información de {originalVehiculo.placa}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" />
            Información del Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Placa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  type="text"
                  value={formData.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value)}
                  placeholder="ABC123"
                  className="uppercase"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value) => handleInputChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map(estado => (
                      <SelectItem key={estado} value={estado}>
                        <span className="capitalize">{estado}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  placeholder="Chevrolet, Toyota, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder="Corolla, Aveo, etc."
                  required
                />
              </div>
            </div>

            {/* Año y Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  type="number"
                  value={formData.año}
                  onChange={(e) => handleInputChange('año', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <Label htmlFor="tipoVehiculo">Tipo de Vehículo *</Label>
                <Select 
                  value={formData.tipoVehiculo} 
                  onValueChange={(value) => handleInputChange('tipoVehiculo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_VEHICULO.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        <span className="capitalize">{tipo}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Color y Kilometraje */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Blanco, Rojo, etc."
                />
              </div>

              <div>
                <Label htmlFor="kilometraje">Kilometraje</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={formData.kilometraje}
                  onChange={(e) => handleInputChange('kilometraje', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href={`/admin/vehiculos/${vehiculoId}`}>Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Actualizar Vehículo
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
