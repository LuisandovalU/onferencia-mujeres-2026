import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('ID de boleto no provisto', { status: 400 });
    }

    // 1. Intentar descargar directamente con el ID provisto (UUID o SessionID)
    const directFileName = id.endsWith('.jpg') ? id : `${id}.jpg`;
    let { data, error } = await supabase.storage
      .from('tickets')
      .download(directFileName);

    // 2. Si falló, intentar buscar si el ID es un UUID que tiene un stripe_session_id asociado (Legacy Support)
    if (error || !data) {
      console.log(`🔍 No se encontró boleto para ${id}, buscando alternativas...`);
      
      const { data: asistente } = await supabase
        .from('asistentes')
        .select('id, nombre_completo, folio, es_brave, stripe_session_id')
        .eq('id', id)
        .single();

      if (asistente?.stripe_session_id) {
        console.log(`📦 Intentando con Session ID: ${asistente.stripe_session_id}`);
        const legacyFileName = `${asistente.stripe_session_id}.jpg`;
        const { data: legacyData, error: legacyError } = await supabase.storage
          .from('tickets')
          .download(legacyFileName);
        
        if (!legacyError && legacyData) {
          data = legacyData;
          error = null;
        }
      }

      // 3. Si aún no hay imagen, regenerar el ticket automáticamente
      if ((error || !data) && asistente) {
        console.log(`🔄 Regenerando ticket al vuelo para: ${asistente.nombre_completo} (ID: ${id})...`);
        try {
          const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
          await generateAndUploadTicket({
            asistenteId: asistente.id,
            nombre_completo: asistente.nombre_completo,
            folio: asistente.folio,
            es_brave: asistente.es_brave,
            fileName: asistente.id,
          });
          console.log(`✅ Ticket regenerado. Descargando...`);

          // Intentar descargar el recién generado
          const { data: freshData, error: freshError } = await supabase.storage
            .from('tickets')
            .download(directFileName);

          if (!freshError && freshData) {
            data = freshData;
            error = null;
          }
        } catch (genErr: any) {
          console.error(`❌ Error regenerando ticket: ${genErr.message}`);
        }
      }
    }

    if (error || !data) {
      console.error('Download Error:', error);
      return new Response('El boleto no existe o aún se está procesando. Intenta de nuevo en unos segundos.', { status: 404 });
    }

    // 3. Retornar la imagen con los headers correctos
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
