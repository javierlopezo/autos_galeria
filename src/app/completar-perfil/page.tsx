'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HABEAS_DATA_VERSION = 'v1.0';

const HABEAS_DATA_TEXTO = `Con la firma de este documento manifiesto que he sido informado por AUTOS GALERIA S.A.S. identificada con NIT 902.041.528-4, que:

La compañía actuara como responsable del tratamiento de datos personales de los cuales soy titular y que, conjunta o separadamente podrán recolectar, usar y tratar mis datos personales en cumplimiento de las normas contenidas en la Ley 1581 de 2012 y su Decreto reglamentario 1377 de 2013 y conforme a las políticas de tratamiento de datos personales que Autos Galeria S.A.S. tiene a su disposición.

La respuesta a preguntas sobre datos sensibles o sobre menores de edad, es de carácter facultativa, y no está obligada a proporcionar dicha información, si no lo desea.

Mis derechos como titular de los datos son los previstos en la Constitución y la Ley, especialmente el derecho a conocer, actualizar, rectificar y suprimir mi información personal, así como el derecho a revocar el consentimiento otorgado para el tratamiento de datos personales. Los titulares de los datos podrán ejercer sus derechos a través de los canales gratuitos dispuestos por Autos Galeria S.A.S., conforme a las políticas de tratamiento de datos personales emitidas por esta.

La Compañía garantiza la confidencialidad, libertad, seguridad, veracidad, transparencia, acceso y circulación restringida de mis datos y se reservan el derecho de modificar su política de tratamiento de datos personales en cualquier momento.

Igualmente, con la firma del presente documento doy consentimiento expreso, inequívoco e irrevocable a Autos Galeria S.A.S o a quien este determine, para que en mi nombre o de la sociedad a la que represento:

a) Consultar en cualquier momento, en centrales de riesgos o bases de datos públicas o privadas, toda la información relevante sobre el desempeño como deudor, capacidad de pago y viabilidad para mantener o establecer una relación contractual.

b) Realizar consultas en listas vinculantes, restrictivas, fuentes públicas, antecedentes judiciales, investigaciones y procesos judiciales relacionados con la Gestión de Riesgo de Lavado de Activos, Financiación del Terrorismo, y otros riesgos relacionados con las relaciones comerciales y contractuales establecidas.

c) Reportar, a cualquier central de riesgos manejada por un operador de datos, información sobre el cumplimiento o incumplimiento de obligaciones crediticias, deberes patrimoniales, datos de ubicación, contacto, solicitudes de crédito, así como otra información atinente a la relación comercial, financiera y en general socioeconómica que haya generado o que consten en registros públicos, base de datos o documentos públicos.

La autorización anterior no impedirá al abajo firmante o su representada ejercer el derecho de corroborar en cualquier tiempo, en la central de información de riesgos a la cual se hayan suministrado los datos, que la información suministrada es veraz, completa, exacta y actualizada, y en caso de que no lo sea, a que se deje constancia de su desacuerdo, a exigir la rectificación y a ser informado sobre las correcciones futuras.`;

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [cedula, setCedula] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const errores = {
    telefono: touched.telefono && telefono.trim() === '',
    email: touched.email && email.trim() === '',
    confirmEmail: touched.confirmEmail && (confirmEmail.trim() === '' || email !== confirmEmail),
    password: touched.password && password.length > 0 && (password.length < 8 || password === cedula),
    confirmPassword: touched.confirmPassword && confirmPassword.trim() !== '' && password !== confirmPassword,
  };

  const formularioCompleto =
    telefono.trim() !== '' &&
    email.trim() !== '' &&
    confirmEmail.trim() !== '' &&
    email === confirmEmail &&
    password.trim() !== '' &&
    password !== cedula &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword &&
    aceptaTerminos;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (!data.session) {
          router.replace('/login');
          return;
        }
        setCedula(data.session.cedula);
        setChecking(false);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email !== confirmEmail) {
      setError('Los correos electronicos no coinciden');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/completar-perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefono,
          email,
          password,
          acepto_habeas_data: true,
          version_documento: HABEAS_DATA_VERSION,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/marketplace');
        router.refresh();
      } else {
        setError(data.error || 'Error al guardar los datos');
      }
    } catch {
      setError('Error de conexion. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f4f4] to-[#ffe6f0]">
        <div className="animate-spin h-8 w-8 border-4 border-[#A8004A] border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-gray-800 mt-4">Completa tu perfil</h1>
            <p className="text-gray-500 text-sm mt-1">Necesitamos algunos datos antes de continuar</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="telefono" className="label">
                Celular
              </label>
              <input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                onBlur={() => touch('telefono')}
                className={`input ${errores.telefono ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Ingrese su numero de celular"
                required
              />
              {errores.telefono && <p className="text-red-500 text-xs mt-1">El celular es requerido</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Correo electronico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch('email')}
                className={`input ${errores.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="ejemplo@correo.com"
                required
              />
              {errores.email && <p className="text-red-500 text-xs mt-1">El correo es requerido</p>}
            </div>

            <div>
              <label htmlFor="confirmEmail" className="label">
                Confirmar correo electronico
              </label>
              <input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                onBlur={() => touch('confirmEmail')}
                className={`input ${errores.confirmEmail ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Repita su correo electronico"
                required
              />
              {errores.confirmEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {confirmEmail.trim() === '' ? 'La confirmacion del correo es requerida' : 'Los correos no coinciden'}
                </p>
              )}
            </div>

            <hr className="border-gray-200" />

            <div>
              <label htmlFor="password" className="label">
                Nueva contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch('password')}
                className={`input ${errores.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Ingrese su nueva contrasena"
                minLength={8}
                required
              />
              {errores.password && (
                <p className="text-red-500 text-xs mt-1">
                  {password === cedula ? 'La contrasena no puede ser su numero de cedula' : 'La contrasena debe tener al menos 8 caracteres'}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirmar contrasena
              </label>
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
              {errores.confirmPassword && <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden</p>}
            </div>

            <hr className="border-gray-200" />

            {/* Habeas Data */}
            <div>
              <p className="label mb-2">Autorización de tratamiento de datos personales</p>
              <div className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 text-xs text-gray-600 leading-relaxed bg-gray-50">
                {HABEAS_DATA_TEXTO}
              </div>
              <label className="flex items-start gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#A8004A] cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto la autorización de tratamiento de datos personales de Autos Galeria S.A.S.
                </span>
              </label>
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
                'Continuar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
