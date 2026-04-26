'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarContrasenaPage() {
  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/auth/recuperar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula }),
      });
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f4f4] to-[#ffe6f0] p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <img
              src="/logo-conmovilidad.jpeg"
              alt="ConMovilidad"
              className="mx-auto h-20 w-auto mb-2"
            />
            <h1 className="text-xl font-semibold text-gray-800 mt-4">Recuperar contrasena</h1>
          </div>

          {enviado ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                Si tu cedula esta registrada y ya activaste tu cuenta, recibiras un correo con las instrucciones para restablecer tu contrasena.
              </div>
              <Link href="/login" className="block text-sm text-[#A8004A] hover:underline">
                Volver al inicio de sesion
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Ingresa tu cedula y te enviaremos un enlace para restablecer tu contrasena.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="cedula" className="label">Cedula</label>
                  <input
                    id="cedula"
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="input"
                    placeholder="Ingrese su cedula"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || cedula.trim() === ''}
                  className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/login" className="text-sm text-[#A8004A] hover:underline">
                  Volver al inicio de sesion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
