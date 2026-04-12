export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const password = url.searchParams.get('key');
  
  // Protección básica para que nadie más pueda disparar esto
  const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  if (!password || password !== adminPass) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const results: any[] = [];

  try {
    // 1. Buscar todos los asistentes CON pago completado
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('*')
      .eq('status_pago', 'completado');

    if (error) throw new Error(`Error Supabase: ${error.message}`);
    if (!asistentes || asistentes.length === 0) {
      return new Response(JSON.stringify({ message: 'No hay asistentes pagados para regenerar', count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    results.push(`📋 Encontrados ${asistentes.length} asistentes pagados`);

    // 2. Importar el generador
    const { generateAndUploadTicket } = await import('../../lib/ticket-generator');

    // 3. Generar ticket para cada uno
    for (const asistente of asistentes) {
      try {
        // Usar stripe_session_id como nombre de archivo (es lo que busca el frontend)
        const fileName = asistente.stripe_session_id || asistente.id;
        
        await generateAndUploadTicket({
          asistenteId: asistente.id,
          nombre_completo: asistente.nombre_completo,
          folio: asistente.folio,
          es_brave: asistente.es_brave,
          fileName: fileName
        });

        results.push(`✅ ${asistente.nombre_completo} (Folio #${asistente.folio}) → ${fileName}.jpg`);
      } catch (err: any) {
        results.push(`❌ ${asistente.nombre_completo}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      total: asistentes.length, 
      results 
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, results }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
