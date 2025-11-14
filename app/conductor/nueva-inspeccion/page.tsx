
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vehiculo } from '@/lib/auth-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Car,
  Search,
  CheckCircle,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NuevaInspeccionPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [filteredVehiculos, setFilteredVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchVehiculos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vehiculos'));
        const vehiculosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vehiculo)).filter(vehiculo => vehiculo.estado === 'activo'); // Solo vehículos activos
        
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

    if (searchTerm) {
      filtered = filtered.filter(vehiculo =>
        vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVehiculos(filtered);
  }, [searchTerm, vehiculos]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Nueva Inspección</h1>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Inspección</h1>
        <p className="text-gray-600">Seleccione el vehículo para realizar la inspección preoperacional</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por placa, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Car className="h-4 w-4" />
        <span>
          {filteredVehiculos.length} vehículo{filteredVehiculos.length !== 1 ? 's' : ''} disponible{filteredVehiculos.length !== 1 ? 's' : ''} para inspección
        </span>
      </div>

      {/* Vehicles List */}
      {filteredVehiculos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No se encontraron vehículos con el término "{searchTerm}"
                </p>
              </>
            ) : vehiculos.length === 0 ? (
              <>
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <p className="text-gray-500 text-center">
                  No hay vehículos activos disponibles para inspección
                </p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Contacte al administrador para activar vehículos
                </p>
              </>
            ) : (
              <>
                <Car className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No hay vehículos disponibles
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehiculos.map((vehiculo) => (
            <Card key={vehiculo.id} className="hover:shadow-lg transition-all group cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Car className="h-6 w-6 text-green-600" />
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
                  <Badge className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
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

                <Button 
                  asChild
                  className="w-full bg-green-600 hover:bg-green-700 group-hover:shadow-md transition-all"
                >
                  <Link href={`/conductor/nueva-inspeccion/${vehiculo.id}`}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Iniciar Inspección
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Inspección Preoperacional</h3>
              <p className="text-blue-800 text-sm mb-3">
                La inspección preoperacional es obligatoria antes de operar cualquier vehículo. 
                Asegúrese de revisar todos los puntos de verificación.
              </p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Documentación del vehículo</li>
                <li>• Estado exterior e interior</li>
                <li>• Elementos de seguridad</li>
                <li>• Niveles de fluidos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
