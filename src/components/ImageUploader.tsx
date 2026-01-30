'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { VehiculoImagen } from '@/types';

interface ImageUploaderProps {
  vehiculoId: string;
  imagenes: VehiculoImagen[];
  onImageAdded: (imagen: VehiculoImagen) => void;
  onImageRemoved: (imagenId: string) => void;
}

export default function ImageUploader({
  vehiculoId,
  imagenes,
  onImageAdded,
  onImageRemoved,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede superar 5MB');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('vehiculo_id', vehiculoId);

        const res = await fetch('/api/vehiculos/imagenes', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const { imagen } = await res.json();
          onImageAdded(imagen);
        } else {
          const data = await res.json();
          setError(data.error || 'Error al subir imagen');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('Error al subir imagen');
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (imagenId: string) => {
    if (!confirm('Desea eliminar esta imagen?')) return;
    // Solo quitar del estado local, se eliminará del servidor al guardar el vehículo
    onImageRemoved(imagenId);
  };

  const sortedImages = [...imagenes].sort((a, b) => a.orden - b.orden);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`btn btn-outline cursor-pointer ${uploading ? 'opacity-50' : ''}`}
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Subiendo...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar imagenes
            </>
          )}
        </label>
        <span className="text-sm text-gray-500">
          {imagenes.length} imagen(es) | Max 5MB por imagen
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {sortedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedImages.map((imagen, index) => (
            <div key={imagen.id} className="relative group">
              <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={imagen.url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-[#A8004A] text-white text-xs px-2 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(imagen.id)}
                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar imagen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
