'use client';

import { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '@/lib/s3';

interface ImageFromStorageProps extends Omit<ImageProps, 'src'> {
  storagePath: string;
  alt: string;
}

export function ImageFromStorage({ storagePath, alt, ...props }: ImageFromStorageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storagePath) {
      setLoading(false);
      return;
    }

    const loadImage = async () => {
      setLoading(true);
      try {
        const url = await downloadFile(storagePath);
        setImageUrl(url);
      } catch (error) {
        console.error(`Error loading image from ${storagePath}:`, error);
        toast.error('Error al cargar una imagen.');
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [storagePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 text-gray-400">
        <ImageIcon className="w-8 h-8" />
        <span className="text-xs mt-1 text-center px-2">{alt}</span>
      </div>
    );
  }

  return <Image src={imageUrl} alt={alt} {...props} />;
}