import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { createServiceRoleClient } from '@/lib/supabase/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contrasena debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    let cedula: string;
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (payload.type !== 'password_reset') {
        return NextResponse.json({ error: 'Enlace invalido' }, { status: 400 });
      }

      cedula = payload.cedula as string;
    } catch {
      return NextResponse.json(
        { error: 'El enlace ha expirado o es invalido. Solicita uno nuevo.' },
        { status: 400 }
      );
    }

    if (password === cedula) {
      return NextResponse.json(
        { error: 'La contrasena no puede ser su numero de cedula' },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);
    const supabase = await createServiceRoleClient();

    const { error } = await supabase
      .from('usuarios')
      .update({ password_hash })
      .eq('cedula', cedula);

    if (error) {
      console.error('Error updating password:', error);
      return NextResponse.json({ error: 'Error al actualizar la contrasena' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
