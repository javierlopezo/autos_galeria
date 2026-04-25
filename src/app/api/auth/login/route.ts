import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { cedula, password } = await request.json();

    if (!cedula || !password) {
      return NextResponse.json(
        { error: 'Cédula y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Find user by cedula
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cedula', cedula)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Cédula o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession({
      cedula: user.cedula,
      nombre: user.nombre,
      is_admin: user.is_admin,
      must_change_password: user.must_change_password,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      primer_ingreso: user.must_change_password,
      user: {
        cedula: user.cedula,
        nombre: user.nombre,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
