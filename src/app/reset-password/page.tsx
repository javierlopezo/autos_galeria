'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCedula(payload.cedula || '');
    } catch {
      // token inválido, se maneja en submit
    }
  }, [token]);

  const errores = {
    password: touched.password && password.length > 0 && (password.length < 8 || password === cedula),
    confirmPassword: touched.confirmPassword && confirmPassword !== '' && password !== confirmPassword,
  };

  const formularioCompleto =
    password.trim() !== '' &&
    password.length >= 8 &&
    password !== cedula &&
    confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login?reset=ok');
      } else {
        setError(data.error || 'Error al restablecer la contrasena');
      }
    } catch {
      setError('Error de conexion. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 text-sm">Enlace invalido o expirado.</p>
        <Link href="/recuperar-contrasena" className="text-sm text-[#A8004A] hover:underline">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="label">Nueva contrasena</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch('password')}
            className={`input ${errores.password ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Minimo 8 caracteres"
            minLength={8}
            required
          />
          {errores.password && (
            <p className="text-red-500 text-xs mt-1">
              {password === cedula ? 'La contrasena no puede ser su numero de cedula' : 'Minimo 8 caracteres'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirmar contrasena</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => touch('confirmPassword')}
            className={`input ${errores.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Repita su nueva contrasena"
            minLength={8}
            required
          />
          {errores.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !formularioCompleto}
          className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </>
          ) : (
            'Restablecer contrasena'
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
            <h1 className="text-xl font-semibold text-gray-800 mt-4">Nueva contrasena</h1>
            <p className="text-gray-500 text-sm mt-1">Elige una contrasena segura para tu cuenta</p>
          </div>
          <Suspense fallback={<div className="flex justify-center"><div className="animate-spin h-6 w-6 border-4 border-[#A8004A] border-t-transparent rounded-full" /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
