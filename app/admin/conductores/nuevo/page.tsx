
'use client';

import { useState, useRef } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Users, Loader2, Key, Copy, Upload, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/s3';
import Image from 'next/image';

const CATEGORIAS_LICENCIA = [
  'A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'
];

export default function NuevoConductorPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    numeroLicencia: '',
    categoriaLicencia: '',
    telefono: '',
    email: '',
    licenciaVencimiento: ''
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor seleccione una imagen válida');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB');
        return;
      }

      setFoto(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.cedula || !formData.numeroLicencia || !formData.categoriaLicencia) {
        toast.error('Por favor complete todos los campos obligatorios');
        setLoading(false);
        return;
      }

      if (!formData.email) {
        toast.error('El email es obligatorio para generar las credenciales de acceso');
        setLoading(false);
        return;
      }

      // Subir foto si existe
      let fotoUrl = '';
      if (foto) {
        setUploadingFoto(true);
        try {
          const buffer = Buffer.from(await foto.arrayBuffer());
          const fileName = `conductores/${Date.now()}-${foto.name}`;
          fotoUrl = await uploadFile(buffer, fileName);
          console.log('Foto subida:', fotoUrl);
        } catch (error) {
          console.error('Error al subir la foto:', error);
          toast.error('Error al subir la foto del conductor');
          setLoading(false);
          setUploadingFoto(false);
          return;
        } finally {
          setUploadingFoto(false);
        }
      }

      // Generar contraseña automática
      const generatedPassword = generatePassword();

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, generatedPassword);
      const firebaseUser = userCredential.user;

      // Crear documento del usuario en Firestore con el UID como ID del documento
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        id: firebaseUser.uid,
        email: formData.email,
        name: formData.nombre,
        role: 'conductor',
        estado: 'activo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Crear documento del conductor
      const conductorData = {
        ...formData,
        userId: firebaseUser.uid,
        estado: 'activo',
        ...(fotoUrl && { fotoUrl }), // Agregar fotoUrl solo si existe
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Usar setDoc en lugar de addDoc para usar el mismo UID como ID
      await setDoc(doc(db, 'conductores', firebaseUser.uid), conductorData);

      // Mostrar credenciales generadas
      setGeneratedCredentials({
        email: formData.email,
        password: generatedPassword
      });

      toast.success('Conductor agregado correctamente');
    } catch (error: any) {
      console.error('Error adding conductor:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Ya existe un usuario con este email');
      } else if (error.code === 'auth/weak-password') {
        toast.error('La contraseña es muy débil');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Email inválido');
      } else {
        toast.error('Error al agregar el conductor');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  // Si se generaron las credenciales, mostrar la pantalla de éxito
  if (generatedCredentials) {
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
            <h1 className="text-2xl font-bold text-gray-900">Conductor Creado</h1>
            <p className="text-gray-600">Credenciales de acceso generadas</p>
          </div>
        </div>

        {/* Credentials Display */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Key className="h-5 w-5" />
              Credenciales de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>¡Importante!</strong> Guarde estas credenciales de forma segura. 
                No podrá recuperar la contraseña después de cerrar esta ventana.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">Email de acceso:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-base font-mono bg-white p-2 rounded border">
                    {generatedCredentials.email}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCredentials.email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">Contraseña:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-base font-mono bg-white p-2 rounded border">
                    {generatedCredentials.password}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCredentials.password)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instrucciones para el conductor:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Ingrese al sistema usando el email y contraseña proporcionados</li>
                  <li>Podrá realizar inspecciones preoperacionales de vehículos</li>
                  <li>Consultar su historial de inspecciones realizadas</li>
                  <li>Se recomienda cambiar la contraseña en el primer acceso (próximamente)</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-6 border-t">
              <Button asChild variant="outline">
                <Link href="/admin/conductores/nuevo">
                  Agregar Otro Conductor
                </Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/admin/conductores">
                  <Users className="mr-2 h-4 w-4" />
                  Ver Todos los Conductores
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Agregar Conductor</h1>
          <p className="text-gray-600">Complete la información del nuevo conductor</p>
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

              {/* Foto del Conductor */}
              <div>
                <Label>Foto del Conductor (Opcional)</Label>
                <div className="mt-2">
                  {!fotoPreview ? (
                    <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                        id="foto-conductor"
                      />
                      <label
                        htmlFor="foto-conductor"
                        className="flex flex-col items-center justify-center cursor-pointer w-full h-full"
                      >
                        <Camera className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Haga clic para subir una foto</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG (máx. 5MB)</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <Image
                        src={fotoPreview}
                        alt="Vista previa de foto del conductor"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemoveFoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se usará para generar las credenciales de acceso al sistema
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

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Al crear el conductor, se generarán automáticamente las credenciales de acceso al sistema 
                (email y contraseña). Asegúrese de proporcionar un email válido.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" asChild>
                <Link href="/admin/conductores">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando Conductor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Conductor
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
