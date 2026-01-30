'use client';

import Navbar from '@/components/Navbar';
import VehiculoForm from '@/components/VehiculoForm';

export default function NuevoVehiculoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publicar vehiculo</h1>
          <p className="text-gray-600 mt-1">
            Ingrese los datos del vehiculo para publicarlo en el marketplace
          </p>
        </div>

        <VehiculoForm />
      </main>
    </div>
  );
}
