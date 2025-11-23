
'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { CameraCapture } from '@/components/ui/camera-capture';
import { ArrowLeft, Save, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function NuevoVehiculoPage() {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    tipoVehiculo: '',
    color: '',
    kilometraje: 0,
    estado: 'activo',
    soatVencimiento: '',
    tecnomecanicaVencimiento: ''
  });
  const [fotos, setFotos] = useState<{
    delantera?: File;
    lateralIzquierda?: File;
    lateralDerecha?: File;
    trasera?: File;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFotoCapture = (posicion: 'delantera' | 'lateralIzquierda' | 'lateralDerecha' | 'trasera', file: File) => {
    setFotos(prev => ({
      ...prev,
      [posicion]: file
    }));
  };

  const handleFotoRemove = (posicion: 'delantera' | 'lateralIzquierda' | 'lateralDerecha' | 'trasera') => {
    setFotos(prev => {
      const newFotos = { ...prev };
      delete newFotos[posicion];
      return newFotos;
    });
  };

  const uploadFoto = async (file: File): Promise<string> => {
    // Subir directamente desde el cliente a Firebase Storage
    const { getStorage, ref, uploadBytes } = await import('firebase/storage');
    const storage = getStorage();
    const timestamp = Date.now();
    const storagePath = `uploads/${timestamp}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    // Subir el archivo
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    // Retornar el path (no la URL completa)
    return storagePath;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.placa || !formData.marca || !formData.modelo || !formData.tipoVehiculo) {
        toast.error('Por favor complete todos los campos obligatorios');
        setLoading(false);
        return;
      }

      // Subir fotos a Firebase Storage
      const fotosUrls: {
        delantera?: string;
        lateralIzquierda?: string;
        lateralDerecha?: string;
        trasera?: string;
      } = {};

      // Usar un solo toast con ID para actualizarlo
      let uploadToastId: string | number | undefined;

      if (fotos.delantera) {
        uploadToastId = toast.loading('Subiendo foto delantera...');
        fotosUrls.delantera = await uploadFoto(fotos.delantera);
        toast.dismiss(uploadToastId);
      }
      if (fotos.lateralIzquierda) {
        uploadToastId = toast.loading('Subiendo foto lateral izquierda...');
        fotosUrls.lateralIzquierda = await uploadFoto(fotos.lateralIzquierda);
        toast.dismiss(uploadToastId);
      }
      if (fotos.lateralDerecha) {
        uploadToastId = toast.loading('Subiendo foto lateral derecha...');
        fotosUrls.lateralDerecha = await uploadFoto(fotos.lateralDerecha);
        toast.dismiss(uploadToastId);
      }
      if (fotos.trasera) {
        uploadToastId = toast.loading('Subiendo foto trasera...');
        fotosUrls.trasera = await uploadFoto(fotos.trasera);
        toast.dismiss(uploadToastId);
      }

      // Guardar en Firestore
      uploadToastId = toast.loading('Guardando vehículo...');
      
      // Formatear placa en mayúsculas
      const vehiculoData = {
        ...formData,
        placa: formData.placa.toUpperCase(),
        fotos: fotosUrls,
        kilometrajeInicial: formData.kilometraje,
        kilometrajeActual: formData.kilometraje,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'vehiculos'), vehiculoData);
      
      toast.dismiss(uploadToastId);
      toast.success('Vehículo agregado correctamente');
      router.push('/admin/vehiculos');
    } catch (error) {
      console.error('Error adding vehiculo:', error);
      toast.error('Error al agregar el vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/vehiculos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agregar Vehículo</h1>
          <p className="text-gray-600">Complete la información del nuevo vehículo</p>
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

            {/* Fechas de Vencimiento de Documentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Documentos del Vehículo</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="soatVencimiento">Fecha de Vencimiento SOAT</Label>
                  <Input
                    id="soatVencimiento"
                    type="date"
                    value={formData.soatVencimiento}
                    onChange={(e) => handleInputChange('soatVencimiento', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tecnomecanicaVencimiento">Fecha de Vencimiento Tecnomecánica</Label>
                  <Input
                    id="tecnomecanicaVencimiento"
                    type="date"
                    value={formData.tecnomecanicaVencimiento}
                    onChange={(e) => handleInputChange('tecnomecanicaVencimiento', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Fotos del Vehículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Fotos del Vehículo</h3>
              <p className="text-sm text-gray-600">Capture las fotos del vehículo desde diferentes ángulos</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CameraCapture
                  label="Foto Delantera"
                  onCapture={(file) => handleFotoCapture('delantera', file)}
                  onRemove={() => handleFotoRemove('delantera')}
                />
                
                <CameraCapture
                  label="Foto Lateral Izquierda"
                  onCapture={(file) => handleFotoCapture('lateralIzquierda', file)}
                  onRemove={() => handleFotoRemove('lateralIzquierda')}
                />
                
                <CameraCapture
                  label="Foto Lateral Derecha"
                  onCapture={(file) => handleFotoCapture('lateralDerecha', file)}
                  onRemove={() => handleFotoRemove('lateralDerecha')}
                />
                
                <CameraCapture
                  label="Foto Trasera"
                  onCapture={(file) => handleFotoCapture('trasera', file)}
                  onRemove={() => handleFotoRemove('trasera')}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/admin/vehiculos">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Vehículo
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
