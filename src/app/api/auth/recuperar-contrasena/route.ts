import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { Resend } from 'resend';
import { createServiceRoleClient } from '@/lib/supabase/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { cedula } = await request.json();

  // Siempre responder ok para no revelar si la cedula existe
  const ok = NextResponse.json({ success: true });

  if (!cedula) return ok;

  try {
    const supabase = await createServiceRoleClient();

    const { data: user } = await supabase
      .from('usuarios')
      .select('cedula, email, nombre, must_change_password')
      .eq('cedula', cedula)
      .single();

    // Solo permitir si el usuario existe, tiene email y ya activó su cuenta
    if (!user || !user.email || user.must_change_password) return ok;

    const token = await new SignJWT({ cedula: user.cedula, type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: user.email,
      subject: 'Restablecer contrasena - Autos Galeria',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #A8004A;">Restablecer contrasena</h2>
          <p>Hola${user.nombre ? ` ${user.nombre}` : ''},</p>
          <p>Recibimos una solicitud para restablecer la contrasena de tu cuenta en Autos Galeria.</p>
          <p>Haz clic en el siguiente enlace. Este enlace es valido por <strong>15 minutos</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#A8004A;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Restablecer contrasena
          </a>
          <p style="color:#666;font-size:13px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error en recuperar-contrasena:', err);
  }

  return ok;
}
