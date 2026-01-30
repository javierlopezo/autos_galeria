import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { placa, cedula } = await request.json();

    if (!placa || !cedula) {
      return NextResponse.json(
        { error: 'Placa y cédula son requeridos' },
        { status: 400 }
      );
    }

    // Intentar consultar el RUNT
    // El portal público del RUNT requiere un captcha y tiene protecciones anti-scraping
    // Por lo que implementamos un intento de consulta con fallback

    try {
      // Primero intentamos obtener los datos del RUNT
      // NOTA: El portal público del RUNT (portalpublico.runt.gov.co) tiene restricciones
      // que pueden impedir la consulta programática directa.
      // Este es un intento de consulta que probablemente fallará debido a:
      // 1. CORS
      // 2. Captcha
      // 3. Rate limiting

      const runtUrl = 'https://portalpublico.runt.gov.co/consultaCiudadana/api/consultaVehiculo';

      const response = await fetch(runtUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          placa: placa.toUpperCase(),
          tipoDocumento: 'CC',
          numeroDocumento: cedula,
        }),
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();

        // Mapear la respuesta del RUNT a nuestro formato
        return NextResponse.json({
          success: true,
          data: {
            placa: data.placa || placa.toUpperCase(),
            clase: data.claseVehiculo || '',
            modelo: data.modelo || '',
            cilindraje: data.cilindraje || '',
            marca: data.marca || '',
            linea: data.linea || '',
            color: data.color || '',
            combustible: data.combustible || '',
            servicio: data.servicio || '',
            transito: data.organismoTransito || '',
            puertas: data.numeroPuertas || 0,
            prenda: data.tienePrenda || false,
          },
        });
      }

      // Si la respuesta no es OK, retornamos que debemos usar el formulario manual
      return NextResponse.json({
        success: false,
        error: 'No se pudo consultar el RUNT. Por favor ingrese los datos manualmente.',
        useManualForm: true,
      });

    } catch (fetchError) {
      // Error de red, timeout, CORS, etc.
      console.error('RUNT fetch error:', fetchError);

      return NextResponse.json({
        success: false,
        error: 'No se pudo conectar con el RUNT. Por favor ingrese los datos manualmente.',
        useManualForm: true,
      });
    }

  } catch (error) {
    console.error('RUNT consultation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al consultar el RUNT. Por favor ingrese los datos manualmente.',
        useManualForm: true,
      },
      { status: 500 }
    );
  }
}
