'use client';

import { ImageFromStorage } from '@/components/ui/image-from-storage';

// Componente para mostrar una foto del vehículo
export function FotoVehiculo({ label, cloudStoragePath }: { label: string; cloudStoragePath: string }) {
  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <ImageFromStorage storagePath={cloudStoragePath} alt={label} fill className="object-cover" />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
        {label}
      </div>
    </div>
  );
}