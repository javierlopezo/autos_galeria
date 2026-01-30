'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VehiculoForm from '@/components/VehiculoForm';
import { Vehiculo } from '@/types';

export default function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const isNewVehicle = searchParams.get('nuevo') === 'true';
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(isNewVehicle);

  useEffect(() => {
    fetchVehiculo();
  }, [id]);

  const fetchVehiculo = async () => {
    try {
      const res = await fetch(`/api/vehiculos?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setVehiculo(data.vehiculo);
      } else {
        setError('Vehiculo no encontrado');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-[#A8004A]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !vehiculo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Vehiculo no encontrado'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showNewMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Vehiculo creado exitosamente</p>
              <p className="text-sm mt-1">Ahora puedes agregar imagenes del vehiculo en la seccion de abajo.</p>
            </div>
            <button
              onClick={() => setShowNewMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewVehicle ? 'Completar publicacion' : 'Editar vehiculo'}
          </h1>
          <p className="text-gray-600 mt-1">
            {vehiculo.marca} {vehiculo.linea} - {vehiculo.placa}
          </p>
        </div>

        <VehiculoForm vehiculo={vehiculo} isEditing />
      </main>
    </div>
  );
}
