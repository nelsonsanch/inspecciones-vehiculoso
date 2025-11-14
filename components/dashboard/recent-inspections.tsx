
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Inspeccion, Vehiculo, Conductor } from '@/lib/auth-types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Calendar, User, Car } from 'lucide-react';

interface RecentInspectionsProps {
  inspections: Inspeccion[];
}

interface InspeccionWithDetails extends Inspeccion {
  vehiculo?: Vehiculo;
  conductor?: Conductor;
}

export default function RecentInspections({ inspections }: RecentInspectionsProps) {
  const [inspectionsWithDetails, setInspectionsWithDetails] = useState<InspeccionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const inspectionsWithDetails = await Promise.all(
        inspections.map(async (inspeccion) => {
          try {
            const [vehiculoDoc, conductorDoc] = await Promise.all([
              getDoc(doc(db, 'vehiculos', inspeccion.vehiculoId)),
              getDoc(doc(db, 'conductores', inspeccion.conductorId))
            ]);

            return {
              ...inspeccion,
              vehiculo: vehiculoDoc.exists() ? { id: vehiculoDoc.id, ...vehiculoDoc.data() } as Vehiculo : undefined,
              conductor: conductorDoc.exists() ? { id: conductorDoc.id, ...conductorDoc.data() } as Conductor : undefined,
            };
          } catch (error) {
            console.error('Error fetching details for inspection:', inspeccion.id, error);
            return inspeccion;
          }
        })
      );

      setInspectionsWithDetails(inspectionsWithDetails);
      setLoading(false);
    };

    if (inspections.length > 0) {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [inspections]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="w-20 h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (inspectionsWithDetails.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No hay inspecciones recientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inspectionsWithDetails.map((inspeccion) => (
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
              <div className="flex items-center gap-2 text-xs text-gray-500">
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
          </div>
        </div>
      ))}
    </div>
  );
}
