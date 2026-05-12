export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import Stripe from 'stripe';

const rawStripeKey = import.meta.env.STRIPE_SECRET_KEY || (typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : '');
const stripeKey = String(rawStripeKey || '').trim();

const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia' as any,
});

/**
 * POST /api/admin/fix-montos
 * 
 * Sincroniza monto_total desde Stripe para todos los registros que tengan stripe_session_id.
 * Para registros manuales sin stripe_session_id, asigna $130 si fueron creados antes del 26 de abril,
 * o $150 si fueron creados después.
 * 
 * Esto corrige el problema donde todos aparecen con $130 en el dashboard.
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const { password, dryRun } = await request.json();

    // 1. Validar Password
    const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Mujeres2026ICI';
    if (!password || password !== adminPass) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    // 2. Obtener todos los asistentes
    const { data: asistentes, error } = await supabase
      .from('asistentes')
      .select('id, nombre_completo, stripe_session_id, monto_total, monto_pagado, created_at, status_pago');

    if (error || !asistentes) {
      return new Response(JSON.stringify({ error: 'Error al obtener asistentes' }), { status: 500 });
    }

    // Fecha del cambio de precio: 26 de abril 2026 (el commit fue el 25 por la noche)
    const FECHA_CAMBIO = '2026-04-26T00:00:00';

    const resultados: any[] = [];
    let actualizados = 0;
    let errores = 0;
    let sinCambio = 0;

    for (const asistente of asistentes) {
      const montoActual = Number(asistente.monto_total) || 0;
      let montoReal: number | null = null;
      let fuente = '';

      // ── A. Si tiene stripe_session_id, consultar Stripe ──
      if (asistente.stripe_session_id) {
        try {
          const session = await stripe.checkout.sessions.retrieve(asistente.stripe_session_id);
          if (session.amount_total) {
            montoReal = session.amount_total / 100;
            fuente = 'stripe';
          }
        } catch (e: any) {
          // Sesión expirada o eliminada en Stripe
          fuente = 'stripe-error';
          // Fallback: usar monto_pagado si existe, o inferir por fecha
          if (Number(asistente.monto_pagado) > 0) {
            montoReal = Number(asistente.monto_pagado);
            fuente = 'monto_pagado';
          } else {
            montoReal = asistente.created_at >= FECHA_CAMBIO ? 150 : 130;
            fuente = 'fecha';
          }
        }
      } else {
        // ── B. Registro manual (sin Stripe) ──
        if (montoActual > 0) {
          // Ya tiene un monto guardado, no cambiar
          sinCambio++;
          continue;
        }
        // Inferir por fecha de creación
        montoReal = asistente.created_at >= FECHA_CAMBIO ? 150 : 130;
        fuente = 'fecha';
      }

      if (montoReal === null) {
        sinCambio++;
        continue;
      }

      // ¿Necesita actualización?
      if (montoActual === montoReal) {
        sinCambio++;
        resultados.push({
          id: asistente.id,
          nombre: asistente.nombre_completo,
          antes: montoActual,
          despues: montoReal,
          fuente,
          accion: 'sin_cambio'
        });
        continue;
      }

      // Actualizar en BD (si no es dry run)
      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('asistentes')
          .update({ monto_total: montoReal })
          .eq('id', asistente.id);

        if (updateError) {
          errores++;
          resultados.push({
            id: asistente.id,
            nombre: asistente.nombre_completo,
            antes: montoActual,
            despues: montoReal,
            fuente,
            accion: 'error',
            error: updateError.message
          });
          continue;
        }
      }

      actualizados++;
      resultados.push({
        id: asistente.id,
        nombre: asistente.nombre_completo,
        antes: montoActual,
        despues: montoReal,
        fuente,
        accion: dryRun ? 'pendiente' : 'actualizado'
      });
    }

    // Resumen
    const cambios = resultados.filter(r => r.accion !== 'sin_cambio');
    const de130a150 = cambios.filter(r => r.antes <= 130 && r.despues === 150).length;
    const de0a130 = cambios.filter(r => r.antes === 0 && r.despues === 130).length;
    const de0a150 = cambios.filter(r => r.antes === 0 && r.despues === 150).length;

    return new Response(JSON.stringify({
      dryRun: !!dryRun,
      resumen: {
        total: asistentes.length,
        actualizados,
        sinCambio,
        errores,
        de130a150,
        de0a130,
        de0a150,
      },
      cambios, // Solo los que cambiaron (o cambiarían)
    }), { status: 200 });

  } catch (err: any) {
    console.error('Fix Montos Error:', err);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
