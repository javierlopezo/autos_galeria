'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useSession } from '@/hooks/useSession';
import { Vehiculo } from '@/types';

export default function MisVehiculosPage() {
  const { session } = useSession();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const res = await fetch('/api/vehiculos?mis_vehiculos=true');
      if (res.ok) {
        const data = await res.json();
        setVehiculos(data.vehiculos);
      } else {
        setError('Error al cargar vehiculos');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Esta seguro de eliminar este vehiculo? Esta accion no se puede deshacer.')) {
      return;
    }

    setDeleting(id);

    try {
      const res = await fetch(`/api/vehiculos?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setVehiculos(prev => prev.filter(v => v.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar vehiculo');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error al eliminar vehiculo');
    } finally {
      setDeleting(null);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Sin precio';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {session?.is_admin ? 'Todos los vehiculos' : 'Mis vehiculos'}
            </h1>
            <p className="text-gray-600 mt-1">
              {session?.is_admin
                ? 'Gestiona todos los vehiculos del marketplace'
                : 'Gestiona tus publicaciones'}
            </p>
          </div>
          <Link href="/mis-vehiculos/nuevo" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Publicar vehiculo
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-[#A8004A]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && vehiculos.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes vehiculos publicados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza publicando tu primer vehiculo
            </p>
            <div className="mt-6">
              <Link href="/mis-vehiculos/nuevo" className="btn btn-primary">
                Publicar vehiculo
              </Link>
            </div>
          </div>
        )}

        {/* Vehicle list */}
        {!loading && !error && vehiculos.length > 0 && (
          <div className="space-y-4">
            {vehiculos.map(vehiculo => {
              const mainImage = vehiculo.imagenes && vehiculo.imagenes.length > 0
                ? vehiculo.imagenes.sort((a, b) => a.orden - b.orden)[0].url
                : null;

              return (
                <div key={vehiculo.id} className="card">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 md:h-32 bg-gray-100 flex-shrink-0">
                      {mainImage ? (
                        <Image
                          src={mainImage}
                          alt={`${vehiculo.marca} ${vehiculo.linea}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 192px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-pink-100 text-[#A8004A] text-xs font-medium px-2 py-0.5 rounded">
                            {vehiculo.placa}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            vehiculo.estado === 'activo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vehiculo.estado}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">
                          {vehiculo.marca} {vehiculo.linea}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {vehiculo.modelo} | {vehiculo.kilometraje?.toLocaleString('es-CO')} km
                        </p>
                        <p className="text-lg font-bold text-[#A8004A] mt-1">
                          {formatPrice(vehiculo.precio)}
                        </p>
                        {session?.is_admin && vehiculo.usuario_cedula !== session.cedula && (
                          <p className="text-xs text-gray-500 mt-1">
                            Propietario: {vehiculo.usuario_cedula}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/marketplace/${vehiculo.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/mis-vehiculos/${vehiculo.id}/editar`}
                          className="btn btn-primary text-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(vehiculo.id)}
                          disabled={deleting === vehiculo.id}
                          className="btn btn-danger text-sm"
                        >
                          {deleting === vehiculo.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
