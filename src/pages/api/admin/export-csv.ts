export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('key');

    // 1. Validar Clave
    const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
    if (!password || password !== adminPass) {
      return new Response('No autorizado', { status: 401 });
    }

    // 2. Obtener datos de Supabase
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('*')
      .order('folio', { ascending: true });

    if (error || !asistentes) {
      return new Response('Error al obtener datos', { status: 500 });
    }

    // 3. Generar CSV
    // Encabezados
    const headers = [
      'Folio',
      'Nombre',
      'WhatsApp',
      'Email',
      'Categoria',
      'Procedencia',
      'Referido',
      'Status Pago',
      'Monto Pagado',
      'Check-in',
      'Fecha Check-in',
      'Fecha Registro'
    ];

    const rows = asistentes.map(a => [
      a.folio,
      `"${a.nombre_completo}"`,
      a.whatsapp,
      a.email || '',
      a.es_brave ? 'Brave' : 'Valiente',
      a.es_casa ? 'Casa' : 'Visita',
      `"${a.referido_por}"`,
      a.status_pago,
      a.monto_pagado,
      a.asistio ? 'SI' : 'NO',
      a.fecha_checkin || '',
      a.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // 4. Retornar archivo
    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=asistentes_mujeres_2026.csv'
      }
    });

  } catch (err: any) {
    return new Response('Error interno: ' + err.message, { status: 500 });
  }
};
