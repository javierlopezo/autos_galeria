import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, createSession, setSessionCookie } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { telefono, email, password, acepto_habeas_data, version_documento } = await request.json();

    if (!telefono || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (!acepto_habeas_data) {
      return NextResponse.json(
        { error: 'Debe aceptar la autorizacion de tratamiento de datos personales' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'El correo electronico no es valido' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    if (password === session.cedula) {
      return NextResponse.json(
        { error: 'La contrasena no puede ser su numero de cedula' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const ip_address =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const user_agent = request.headers.get('user-agent') || 'unknown';

    const supabase = await createServiceRoleClient();

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ telefono, email, password_hash, must_change_password: false })
      .eq('cedula', session.cedula);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Error al guardar los datos' },
        { status: 500 }
      );
    }

    const { error: habeasError } = await supabase
      .from('aceptaciones_habeas_data')
      .insert({
        cedula: session.cedula,
        ip_address,
        user_agent,
        version_documento: version_documento || 'v1.0',
      });

    if (habeasError) {
      console.error('Error registering habeas data acceptance:', habeasError);
    }

    const newToken = await createSession({
      cedula: session.cedula,
      nombre: session.nombre,
      is_admin: session.is_admin,
      must_change_password: false,
    });
    await setSessionCookie(newToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Completar perfil error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
