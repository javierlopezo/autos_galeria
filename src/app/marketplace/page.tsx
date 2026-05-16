'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import VehiculoCard from '@/components/VehiculoCard';
import CarruselAnuncios from '@/components/CarruselAnuncios';
import { Vehiculo } from '@/types';

// Mapeo de departamentos y ciudades de Colombia
const DEPARTAMENTOS_CIUDADES: Record<string, string[]> = {
  'Amazonas': ['Leticia'],
  'Antioquia': ['Medellin', 'Bello', 'Itagui', 'Envigado', 'Rionegro', 'Apartado', 'Turbo'],
  'Arauca': ['Arauca', 'Saravena'],
  'Atlantico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
  'Bolivar': ['Cartagena', 'Magangue', 'Turbaco'],
  'Boyaca': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquira'],
  'Caldas': ['Manizales', 'La Dorada', 'Chinchina'],
  'Caqueta': ['Florencia'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva'],
  'Cauca': ['Popayan', 'Santander de Quilichao'],
  'Cesar': ['Valledupar', 'Aguachica'],
  'Choco': ['Quibdo'],
  'Cordoba': ['Monteria', 'Cerete', 'Lorica'],
  'Cundinamarca': ['Bogota', 'Soacha', 'Zipaquira', 'Facatativa', 'Chia', 'Fusagasuga', 'Girardot', 'Madrid', 'Mosquera'],
  'Guainia': ['Inirida'],
  'Guaviare': ['San Jose del Guaviare'],
  'Huila': ['Neiva', 'Pitalito', 'Garzon'],
  'La Guajira': ['Riohacha', 'Maicao'],
  'Magdalena': ['Santa Marta', 'Cienaga'],
  'Meta': ['Villavicencio', 'Acacias', 'Granada'],
  'Narino': ['Pasto', 'Tumaco', 'Ipiales'],
  'Norte de Santander': ['Cucuta', 'Ocana', 'Pamplona'],
  'Putumayo': ['Mocoa', 'Puerto Asis'],
  'Quindio': ['Armenia', 'Calarca'],
  'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
  'San Andres y Providencia': ['San Andres'],
  'Santander': ['Bucaramanga', 'Floridablanca', 'Giron', 'Piedecuesta', 'Barrancabermeja'],
  'Sucre': ['Sincelejo', 'Corozal'],
  'Tolima': ['Ibague', 'Espinal', 'Melgar'],
  'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tulua', 'Buga', 'Cartago', 'Jamundi'],
  'Vaupes': ['Mitu'],
  'Vichada': ['Puerto Carreno'],
};

export default function MarketplacePage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroPrecioMin, setFiltroPrecioMin] = useState('');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const res = await fetch('/api/vehiculos');
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

  // Obtener marcas unicas para el filtro
  const marcas = [...new Set(vehiculos.map(v => v.marca).filter(Boolean))].sort();

  // Obtener ciudades unicas de los vehiculos
  const ciudadesConVehiculos = useMemo(() => {
    return [...new Set(vehiculos.map(v => v.contacto_ciudad).filter(Boolean))] as string[];
  }, [vehiculos]);

  // Mapeo inverso: ciudad -> departamento
  const ciudadToDepartamento = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(DEPARTAMENTOS_CIUDADES).forEach(([depto, ciudades]) => {
      ciudades.forEach(ciudad => {
        map[ciudad.toLowerCase()] = depto;
      });
    });
    return map;
  }, []);

  // Obtener departamentos que tienen vehiculos
  const departamentosConVehiculos = useMemo(() => {
    const deptos = new Set<string>();
    ciudadesConVehiculos.forEach(ciudad => {
      const depto = ciudadToDepartamento[ciudad.toLowerCase()];
      if (depto) {
        deptos.add(depto);
      }
    });
    return [...deptos].sort();
  }, [ciudadesConVehiculos, ciudadToDepartamento]);

  // Ciudades disponibles segun departamento seleccionado
  const ciudadesDisponibles = useMemo(() => {
    if (!filtroDepartamento) {
      return ciudadesConVehiculos.sort();
    }
    const ciudadesDelDepto = DEPARTAMENTOS_CIUDADES[filtroDepartamento] || [];
    return ciudadesConVehiculos
      .filter(ciudad => ciudadesDelDepto.some(c => c.toLowerCase() === ciudad.toLowerCase()))
      .sort();
  }, [filtroDepartamento, ciudadesConVehiculos]);

  // Resetear ciudad cuando cambia departamento
  useEffect(() => {
    if (filtroDepartamento && filtroCiudad) {
      const ciudadesDelDepto = DEPARTAMENTOS_CIUDADES[filtroDepartamento] || [];
      const ciudadValida = ciudadesDelDepto.some(c => c.toLowerCase() === filtroCiudad.toLowerCase());
      if (!ciudadValida) {
        setFiltroCiudad('');
      }
    }
  }, [filtroDepartamento, filtroCiudad]);

  // Filtrar vehiculos
  const vehiculosFiltrados = vehiculos.filter(v => {
    // Busqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchMarca = v.marca?.toLowerCase().includes(search);
      const matchLinea = v.linea?.toLowerCase().includes(search);
      const matchPlaca = v.placa?.toLowerCase().includes(search);
      if (!matchMarca && !matchLinea && !matchPlaca) return false;
    }

    // Filtro por marca
    if (filtroMarca && v.marca !== filtroMarca) return false;

    // Filtro por precio
    if (filtroPrecioMin && v.precio && v.precio < parseInt(filtroPrecioMin)) return false;
    if (filtroPrecioMax && v.precio && v.precio > parseInt(filtroPrecioMax)) return false;

    // Filtro por departamento
    if (filtroDepartamento && v.contacto_ciudad) {
      const deptoVehiculo = ciudadToDepartamento[v.contacto_ciudad.toLowerCase()];
      if (deptoVehiculo !== filtroDepartamento) return false;
    } else if (filtroDepartamento && !v.contacto_ciudad) {
      return false;
    }

    // Filtro por ciudad
    if (filtroCiudad && v.contacto_ciudad?.toLowerCase() !== filtroCiudad.toLowerCase()) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Encuentra tu proximo vehiculo
          </p>
        </div>

        {/* Carrusel de anuncios */}
        <CarruselAnuncios />

        {/* Filtros */}
        <div className="card p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="label">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Marca, linea o placa..."
                className="input"
              />
            </div>
            <div>
              <label className="label">Marca</label>
              <select
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
                className="input"
              >
                <option value="">Todas las marcas</option>
                {marcas.map(marca => (
                  <option key={marca} value={marca!}>{marca}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Departamento</label>
              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="input"
              >
                <option value="">Todos los departamentos</option>
                {departamentosConVehiculos.map(depto => (
                  <option key={depto} value={depto}>{depto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ciudad</label>
              <select
                value={filtroCiudad}
                onChange={(e) => setFiltroCiudad(e.target.value)}
                className="input"
              >
                <option value="">Todas las ciudades</option>
                {ciudadesDisponibles.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Precio minimo</label>
              <input
                type="text"
                inputMode="numeric"
                value={filtroPrecioMin ? parseInt(filtroPrecioMin).toLocaleString('es-CO') : ''}
                onChange={(e) => setFiltroPrecioMin(e.target.value.replace(/\D/g, ''))}
                placeholder="$ Minimo"
                className="input"
              />
            </div>
            <div>
              <label className="label">Precio maximo</label>
              <input
                type="text"
                inputMode="numeric"
                value={filtroPrecioMax ? parseInt(filtroPrecioMax).toLocaleString('es-CO') : ''}
                onChange={(e) => setFiltroPrecioMax(e.target.value.replace(/\D/g, ''))}
                placeholder="$ Maximo"
                className="input"
              />
            </div>
          </div>
          {(searchTerm || filtroMarca || filtroPrecioMin || filtroPrecioMax || filtroDepartamento || filtroCiudad) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {vehiculosFiltrados.length} vehiculo(s) encontrado(s)
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltroMarca('');
                  setFiltroPrecioMin('');
                  setFiltroPrecioMax('');
                  setFiltroDepartamento('');
                  setFiltroCiudad('');
                }}
                className="text-sm text-[#A8004A] hover:text-[#8a003d]"
              >
                Limpiar filtros
              </button>
            </div>
          )}
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
        {!loading && !error && vehiculosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vehiculos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filtroMarca || filtroDepartamento || filtroCiudad ? 'No se encontraron vehiculos con los filtros seleccionados' : 'Aun no hay vehiculos publicados'}
            </p>
          </div>
        )}

        {/* Vehicle grid */}
        {!loading && !error && vehiculosFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculosFiltrados.map(vehiculo => (
              <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
