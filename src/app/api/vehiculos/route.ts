import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';

// GET - List vehicles (all for marketplace, filtered for my vehicles)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const myVehicles = searchParams.get('mis_vehiculos') === 'true';
    const vehiculoId = searchParams.get('id');

    const supabase = await createServiceRoleClient();

    // Single vehicle query
    if (vehiculoId) {
      const { data, error } = await supabase
        .from('vehiculos')
        .select(`
          *,
          imagenes:vehiculo_imagenes(*)
        `)
        .eq('id', vehiculoId)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
      }

      return NextResponse.json({ vehiculo: data });
    }

    // List query
    let query = supabase
      .from('vehiculos')
      .select(`
        *,
        imagenes:vehiculo_imagenes(*)
      `)
      .eq('estado', 'activo')
      .order('created_at', { ascending: false });

    // Filter by user's vehicles if requested (unless admin)
    if (myVehicles && !session.is_admin) {
      query = query.eq('usuario_cedula', session.cedula);
    } else if (myVehicles && session.is_admin) {
      // Admin sees all vehicles in "my vehicles" section
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
      return NextResponse.json({ error: 'Error al obtener vehículos' }, { status: 500 });
    }

    return NextResponse.json({ vehiculos: data || [] });
  } catch (error) {
    console.error('Vehicles GET error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServiceRoleClient();

    // Check if placa already exists
    const { data: existing } = await supabase
      .from('vehiculos')
      .select('id')
      .eq('placa', body.placa.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo registrado con esta placa' },
        { status: 400 }
      );
    }

    // Create vehicle
    const { data: vehiculo, error } = await supabase
      .from('vehiculos')
      .insert({
        ...body,
        placa: body.placa.toUpperCase(),
        usuario_cedula: session.cedula,
        estado: 'activo',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      return NextResponse.json({ error: 'Error al crear vehículo' }, { status: 500 });
    }

    return NextResponse.json({ vehiculo }, { status: 201 });
  } catch (error) {
    console.error('Vehicle POST error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Update vehicle
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de vehículo requerido' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    // Check ownership (unless admin)
    const { data: existing } = await supabase
      .from('vehiculos')
      .select('usuario_cedula')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
    }

    if (!session.is_admin && existing.usuario_cedula !== session.cedula) {
      return NextResponse.json({ error: 'No autorizado para editar este vehículo' }, { status: 403 });
    }

    // Update vehicle
    const { data: vehiculo, error } = await supabase
      .from('vehiculos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      return NextResponse.json({ error: 'Error al actualizar vehículo' }, { status: 500 });
    }

    return NextResponse.json({ vehiculo });
  } catch (error) {
    console.error('Vehicle PUT error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Delete vehicle
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de vehículo requerido' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    // Check ownership (unless admin)
    const { data: existing } = await supabase
      .from('vehiculos')
      .select('usuario_cedula')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
    }

    if (!session.is_admin && existing.usuario_cedula !== session.cedula) {
      return NextResponse.json({ error: 'No autorizado para eliminar este vehículo' }, { status: 403 });
    }

    // Delete images first
    await supabase
      .from('vehiculo_imagenes')
      .delete()
      .eq('vehiculo_id', id);

    // Delete vehicle
    const { error } = await supabase
      .from('vehiculos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return NextResponse.json({ error: 'Error al eliminar vehículo' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vehicle DELETE error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
