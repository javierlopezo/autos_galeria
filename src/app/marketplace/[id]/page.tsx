'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { Vehiculo } from '@/types';

export default function VehiculoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

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

  const contactWhatsApp = (phone: string, isAdmin = false) => {
    const mensaje = isAdmin
      ? `Hola Presente Marketplace, necesito asistencia con el vehiculo ${vehiculo?.marca} ${vehiculo?.linea} placa ${vehiculo?.placa}`
      : `Hola, me interesa el vehiculo ${vehiculo?.marca} ${vehiculo?.linea} placa ${vehiculo?.placa} publicado en Presente Marketplace`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const sortedImages = vehiculo?.imagenes?.sort((a, b) => a.orden - b.orden) || [];

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
          <Link href="/marketplace" className="btn btn-primary">
            Volver al marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link href="/marketplace" className="inline-flex items-center text-[#A8004A] hover:text-[#8a003d] mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div>
            <div className="card overflow-hidden mb-4">
              <div className="relative h-80 md:h-96 bg-gray-100">
                {sortedImages.length > 0 ? (
                  <Image
                    src={sortedImages[selectedImage].url}
                    alt={`${vehiculo.marca} ${vehiculo.linea}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {sortedImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      index === selectedImage ? 'ring-2 ring-[#A8004A]' : ''
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle info */}
          <div>
            <div className="card p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-pink-100 text-[#A8004A] text-sm font-medium px-3 py-1 rounded-full mb-2">
                    {vehiculo.placa}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vehiculo.marca} {vehiculo.linea}
                  </h1>
                  <p className="text-gray-600">{vehiculo.modelo} | {vehiculo.clase}</p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#A8004A] mb-6">
                {formatPrice(vehiculo.precio)}
              </p>

              {/* Contact buttons */}
              <div className="space-y-3">
                {vehiculo.contacto_telefono && (
                  <button
                    onClick={() => contactWhatsApp(vehiculo.contacto_telefono!)}
                    className="btn btn-success w-full py-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactar vendedor por WhatsApp
                  </button>
                )}
                <button
                  onClick={() => contactWhatsApp(process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '573001234567', true)}
                  className="btn btn-outline w-full py-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Solicitar asistencia de Presente Marketplace
                </button>
              </div>
            </div>

            {/* Seller info */}
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Vendedor</h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Nombre:</span> {vehiculo.contacto_nombre}</p>
                <p><span className="text-gray-500">Ciudad:</span> {vehiculo.contacto_ciudad}</p>
                {vehiculo.contacto_email && (
                  <p><span className="text-gray-500">Email:</span> {vehiculo.contacto_email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Technical specs */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Especificaciones tecnicas</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Kilometraje</dt>
                <dd className="font-medium">{formatKm(vehiculo.kilometraje)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Cilindraje</dt>
                <dd className="font-medium">{vehiculo.cilindraje || 'N/A'} cc</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Combustible</dt>
                <dd className="font-medium">{vehiculo.combustible || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Transmision</dt>
                <dd className="font-medium">{vehiculo.transmision || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Traccion</dt>
                <dd className="font-medium">{vehiculo.traccion || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Puertas/capacidad</dt>
                <dd className="font-medium">{vehiculo.puertas || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Color</dt>
                <dd className="font-medium">{vehiculo.color || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          {/* Additional specs */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Caracteristicas</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Cojineria</dt>
                <dd className="font-medium">{vehiculo.cojineria || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Rines</dt>
                <dd className="font-medium">{vehiculo.rines || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Vidrios</dt>
                <dd className="font-medium">{vehiculo.vidrios || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Direccion</dt>
                <dd className="font-medium">{vehiculo.direccion_tipo || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Servicio</dt>
                <dd className="font-medium">{vehiculo.servicio || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Transito</dt>
                <dd className="font-medium">{vehiculo.transito || 'N/A'}</dd>
              </div>
              {vehiculo.blindaje && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Blindaje</dt>
                  <dd className="font-medium">Nivel {vehiculo.nivel_blindaje || 'N/A'}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Equipment */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Equipamiento</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { key: 'sunroof', label: 'Sunroof' },
                { key: 'radio', label: 'Radio' },
                { key: 'velocidad_crucero', label: 'Velocidad crucero' },
                { key: 'aviso_luces', label: 'Aviso de luces' },
                { key: 'computador', label: 'Computador' },
                { key: 'frenos_abs', label: 'Frenos ABS' },
                { key: 'sensor_parqueo', label: 'Sensor parqueo' },
                { key: 'camara_reversa', label: 'Camara reversa' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  {vehiculo[item.key as keyof Vehiculo] ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={vehiculo[item.key as keyof Vehiculo] ? 'text-gray-900' : 'text-gray-400'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Documentacion</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${vehiculo.soat_vigente && new Date(vehiculo.soat_vigente) > new Date() ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>
                SOAT: {vehiculo.soat_vigente ? new Date(vehiculo.soat_vigente).toLocaleDateString('es-CO') : 'Sin informacion'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${vehiculo.rtm_vigente && new Date(vehiculo.rtm_vigente) > new Date() ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>
                RTM: {vehiculo.rtm_vigente ? new Date(vehiculo.rtm_vigente).toLocaleDateString('es-CO') : 'Sin informacion'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${vehiculo.prenda ? 'bg-red-500' : 'bg-green-500'}`} />
              <span>Prenda: {vehiculo.prenda ? 'Si' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {vehiculo.descripcion && (
          <div className="card p-6 mt-6">
            <h2 className="font-semibold text-gray-900 mb-4">Descripcion</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{vehiculo.descripcion}</p>
          </div>
        )}
      </main>
    </div>
  );
}
