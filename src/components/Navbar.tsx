'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

export default function Navbar() {
  const { session, loading } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/marketplace" className="flex items-center gap-2">
              <span className="text-2xl font-light text-[#A8004A] tracking-tight">
                <span className="font-normal">p</span>resente
              </span>
              <span className="text-sm text-[#A8004A] font-light">Marketplace</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 font-medium">
              Marketplace
            </Link>
            <Link href="/mis-vehiculos" className="btn btn-primary">
              Mis Vehiculos
            </Link>

            {!loading && session && (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">
                    {session.nombre || session.cedula}
                  </p>
                  {session.is_admin && (
                    <span className="text-xs text-amber-600 font-medium">Admin</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                  title="Cerrar sesion"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
