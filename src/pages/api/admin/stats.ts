import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password, startDate, endDate, type } = await request.json();

    // 1. Validar Password
    const adminPass = import.meta.env.ADMIN_PASSWORD || 'Mujeres2026ICI'; // Fallback local
    if (password !== adminPass) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // 2. Construir Query de Supabase con filtros dinámicos
    let query = supabase.from('asistentes').select('id, created_at, monto_pagado, monto_total, es_brave, nombre_completo, whatsapp, status_pago, metodo_pago, es_casa, stripe_session_id');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (type && type !== 'all') {
      query = query.eq('es_brave', type === 'Brave');
    }

    const { data: asistentes, error } = await query;

    if (error || !asistentes) {
      console.error('Error fetching stats:', error);
      return new Response(JSON.stringify({ error: 'Error al obtener datos' }), { status: 500 });
    }

    // 3. Procesar KPIs Generales
    // Aseguramos que monto_pagado sea tratado como número
    const totalVentas = asistentes.reduce((sum, a) => sum + (Number(a.monto_pagado) || 0), 0);
    const totalEsperado = asistentes.reduce((sum, a) => sum + (Number(a.monto_total) || 130), 0);
    const totalPendiente = totalEsperado - totalVentas;
    
    const totalInscritas = asistentes.length;
    const meta = 500;
    const porcentajeMeta = Math.min(100, Math.round((totalInscritas / meta) * 100));

    // 4. Procesar Distribución (Brave vs Valiente)
    const braveCount = asistentes.filter(a => a.es_brave).length;
    const valienteCount = totalInscritas - braveCount;

    // 5. Procesar Métodos de Pago
    const cashCount = asistentes.filter(a => a.metodo_pago === 'efectivo').length;
    const transferCount = asistentes.filter(a => a.metodo_pago === 'transferencia').length;

    // 6. Procesar Origen (Casa vs Visita)
    const casaCount = asistentes.filter(a => a.es_casa).length;
    const visitaCount = totalInscritas - casaCount;

    // 7. Procesar Hype Chart (Registros por Día)
    const hypeDataMap: Record<string, number> = {};
    asistentes.forEach(a => {
      const date = a.created_at.split('T')[0];
      hypeDataMap[date] = (hypeDataMap[date] || 0) + 1;
    });

    const hypeChart = Object.entries(hypeDataMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // 8. Procesar Sparklines (Últimas 24 horas)
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const recentAsistentes = asistentes.filter(a => a.created_at >= last24h);
    
    const sparklineData = Array.from({ length: 24 }).map((_, i) => {
      const targetTime = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const hourStr = targetTime.toISOString().substring(0, 13);
      const count = recentAsistentes.filter(a => a.created_at.startsWith(hourStr)).length;
      return { hour: i, count };
    });

    return new Response(JSON.stringify({
      kpis: {
        totalVentas,
        totalInscritas,
        porcentajeMeta,
        meta
      },
      distribution: [
        { name: 'Brave', value: braveCount },
        { name: 'Valiente', value: valienteCount }
      ],
      paymentMethods: [
        { name: 'Efectivo', value: cashCount },
        { name: 'Transferencia', value: transferCount }
      ],
      originStats: [
        { name: 'Casa (ICI)', value: casaCount },
        { name: 'Visitas', value: visitaCount }
      ],
      hypeChart,
      sparkline: sparklineData,
      asistentes: asistentes.map(a => ({
        id: a.id,
        nombre: a.nombre_completo,
        whatsapp: a.whatsapp,
        monto_pagado: Number(a.monto_pagado) || 0,
        monto_total: Number(a.monto_total) || 130,
        status_pago: a.status_pago,
        es_brave: a.es_brave,
        metodo_pago: a.metodo_pago,
        stripe_session_id: a.stripe_session_id,
        created_at: a.created_at
      }))
    }), { status: 200 });

  } catch (err: any) {
    console.error('API Stats Error:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
