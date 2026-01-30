'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Vehiculo } from '@/types';

interface VehiculoCardProps {
  vehiculo: Vehiculo;
}

export default function VehiculoCard({ vehiculo }: VehiculoCardProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Consultar';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatKm = (km: number | null) => {
    if (!km) return 'N/A';
    return new Intl.NumberFormat('es-CO').format(km) + ' km';
  };

  const mainImage = vehiculo.imagenes && vehiculo.imagenes.length > 0
    ? vehiculo.imagenes.sort((a, b) => a.orden - b.orden)[0].url
    : null;

  return (
    <Link href={`/marketplace/${vehiculo.id}`}>
      <div className="card card-hover cursor-pointer">
        <div className="relative h-48 bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={`${vehiculo.marca} ${vehiculo.linea}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-[#A8004A] text-white text-xs font-bold px-2 py-1 rounded">
            {vehiculo.placa}
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-900">
              {vehiculo.marca} {vehiculo.linea}
            </h3>
            <span className="text-sm text-gray-500">{vehiculo.modelo}</span>
          </div>

          <p className="text-2xl font-bold text-[#A8004A] mb-3">
            {formatPrice(vehiculo.precio)}
          </p>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{vehiculo.cilindraje || 'N/A'} cc</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatKm(vehiculo.kilometraje)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>{vehiculo.color || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span>{vehiculo.combustible || 'N/A'}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {vehiculo.transmision || 'N/A'} | {vehiculo.traccion || 'N/A'}
            </span>
            <span className="text-xs text-gray-400">{vehiculo.contacto_ciudad || ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
