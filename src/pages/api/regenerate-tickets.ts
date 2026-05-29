export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const password = url.searchParams.get('key');
  const forceAll = url.searchParams.get('force') === 'true'; // ?force=true regenera aunque ya exista
  const soloId  = url.searchParams.get('id');                // ?id=UUID regenera solo uno

  // Protección básica
  const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
  if (!password || password !== adminPass) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const logs: string[] = [];
  let generados = 0, omitidos = 0, errores = 0;

  try {
    // 1. Obtener asistentes con pago completado
    let query = supabase
      .from('asistentes')
      .select('id, nombre_completo, folio, es_brave')
      .eq('status_pago', 'completado');

    if (soloId) query = query.eq('id', soloId) as any;

    const { data: asistentes, error: dbError } = await query;

    if (dbError) throw new Error(`Error Supabase: ${dbError.message}`);
    if (!asistentes || asistentes.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No hay asistentes pagados', generados: 0, omitidos: 0, errores: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logs.push(`📋 ${asistentes.length} asistente(s) encontrado(s) | force=${forceAll}`);

    // 2. Obtener lista de archivos existentes en el bucket (una sola llamada)
    const { data: existingFiles } = await supabase.storage.from('tickets').list('', { limit: 1000 });
    const existingSet = new Set((existingFiles || []).map(f => f.name));
    logs.push(`🗂️ ${existingSet.size} archivos en storage`);

    // 3. Importar generador
    const { generateAndUploadTicket } = await import('../../lib/ticket-generator');

    // 4. Procesar en lotes de 5 para no saturar
    const BATCH = 5;
    for (let i = 0; i < asistentes.length; i += BATCH) {
      const lote = asistentes.slice(i, i + BATCH);
      await Promise.allSettled(
        lote.map(async (a) => {
          const fileName = `${a.id}.jpg`;
          const yaExiste = existingSet.has(fileName);

          if (yaExiste && !forceAll) {
            omitidos++;
            logs.push(`⏭️  ${a.nombre_completo} (Folio #${a.folio}) — ya existe, omitido`);
            return;
          }

          try {
            await generateAndUploadTicket({
              asistenteId: a.id,
              nombre_completo: a.nombre_completo,
              folio: a.folio,
              es_brave: a.es_brave,
              fileName: a.id,
            });
            generados++;
            logs.push(`✅ ${a.nombre_completo} (Folio #${a.folio}) → ${fileName}${yaExiste ? ' [regenerado]' : ' [nuevo]'}`);
          } catch (err: any) {
            errores++;
            logs.push(`❌ ${a.nombre_completo} (Folio #${a.folio}): ${err.message}`);
          }
        })
      );
    }

    return new Response(
      JSON.stringify({ success: true, total: asistentes.length, generados, omitidos, errores, logs }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message, generados, omitidos, errores, logs }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

