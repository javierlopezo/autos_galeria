'use client';

import { useState, useEffect, useCallback } from 'react';

interface Anuncio {
  id: number;
  imagen: string;
  titulo: string;
  enlace: string;
}

// Para agregar o cambiar anuncios, edita este arreglo.
// enlace puede ser: URL web, "https://wa.me/57XXXXXXXXXX", o "mailto:correo@ejemplo.com"
const ANUNCIOS: Anuncio[] = [
  {
    id: 1,
    imagen: '/banner-1.png',
    titulo: 'Leader Banner',
    enlace: 'https://wa.me/573148037183',
  },
  {
    id: 2,
    imagen: '/banner-2.png',
    titulo: 'Banner',
    enlace: 'https://wa.me/573148037183',
  },
  {
    id: 3,
    imagen: '/banner-3.png',
    titulo: 'Tu Próximo Vehículo Está Aquí',
    enlace: 'https://wa.me/573148037183',
  },
];

export default function CarruselAnuncios() {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  const siguiente = useCallback(() => {
    setActual(prev => (prev + 1) % ANUNCIOS.length);
  }, []);

  const anterior = () => {
    setActual(prev => (prev - 1 + ANUNCIOS.length) % ANUNCIOS.length);
  };

  useEffect(() => {
    if (pausado) return;
    const intervalo = setInterval(siguiente, 5000);
    return () => clearInterval(intervalo);
  }, [pausado, siguiente]);

  if (ANUNCIOS.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl mb-8 shadow-sm"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${actual * 100}%)` }}
      >
        {ANUNCIOS.map(anuncio => (
          <a
            key={anuncio.id}
            href={anuncio.enlace}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-full block"
          >
            <img
              src={anuncio.imagen}
              alt={anuncio.titulo}
              className="w-full aspect-[8/3] object-cover"
            />
          </a>
        ))}
      </div>

      {/* Flechas */}
      {ANUNCIOS.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={siguiente}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Puntos indicadores */}
      {ANUNCIOS.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {ANUNCIOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActual(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === actual ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Ir al anuncio ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
