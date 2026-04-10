import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('ID de boleto no provisto', { status: 400 });
    }

    // El nombre del archivo en Storage es el ID + .jpg (o el id tal cual si ya lo trae)
    const fileName = id.endsWith('.jpg') ? id : `${id}.jpg`;

    // 1. Obtener la URL firmada o descargar el archivo directamente
    // Usamos download() para actuar como proxy y que no haya problemas de CORS
    const { data, error } = await supabase.storage
      .from('tickets')
      .download(fileName);

    if (error || !data) {
      console.error('Download Error:', error);
      return new Response('El boleto no existe o aún se está procesando. Intenta de nuevo en unos segundos.', { status: 404 });
    }

    // 2. Retornar la imagen con los headers correctos
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="Boleto-Mujeres-2026-${id}.jpg"`,
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('API Download Ticket Catch:', error);
    return new Response('Error interno al descargar el boleto', { status: 500 });
  }
};
