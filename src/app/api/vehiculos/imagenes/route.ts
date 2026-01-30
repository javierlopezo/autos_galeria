import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';

// POST - Add image to vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vehiculoId = formData.get('vehiculo_id') as string;

    if (!file || !vehiculoId) {
      return NextResponse.json(
        { error: 'Archivo y ID de vehículo son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Verify vehicle ownership
    const { data: vehiculo } = await supabase
      .from('vehiculos')
      .select('usuario_cedula')
      .eq('id', vehiculoId)
      .single();

    if (!vehiculo) {
      return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 });
    }

    if (!session.is_admin && vehiculo.usuario_cedula !== session.cedula) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehiculoId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('vehiculos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vehiculos')
      .getPublicUrl(fileName);

    // Get current max orden
    const { data: existingImages } = await supabase
      .from('vehiculo_imagenes')
      .select('orden')
      .eq('vehiculo_id', vehiculoId)
      .order('orden', { ascending: false })
      .limit(1);

    const nextOrden = existingImages && existingImages.length > 0
      ? existingImages[0].orden + 1
      : 0;

    // Save image record
    const { data: imagen, error: dbError } = await supabase
      .from('vehiculo_imagenes')
      .insert({
        vehiculo_id: vehiculoId,
        url: publicUrl,
        orden: nextOrden,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Error al guardar imagen' }, { status: 500 });
    }

    return NextResponse.json({ imagen }, { status: 201 });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Remove image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de imagen requerido' }, { status: 400 });
    }

    const supabase = await createServiceRoleClient();

    // Get image and verify ownership
    const { data: imagen } = await supabase
      .from('vehiculo_imagenes')
      .select(`
        *,
        vehiculo:vehiculos(usuario_cedula)
      `)
      .eq('id', id)
      .single();

    if (!imagen) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Extract vehiculo data properly
    const vehiculoData = imagen.vehiculo as { usuario_cedula: string } | null;

    if (!session.is_admin && vehiculoData?.usuario_cedula !== session.cedula) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Delete from storage
    const urlParts = imagen.url.split('/');
    const filePath = urlParts.slice(-2).join('/');

    await supabase.storage
      .from('vehiculos')
      .remove([filePath]);

    // Delete record
    const { error } = await supabase
      .from('vehiculo_imagenes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Error al eliminar imagen' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
