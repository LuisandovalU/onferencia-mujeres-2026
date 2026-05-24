export const prerender = false;

import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

const handleRequest = async (request: Request) => {
  try {
    let password = null;
    
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        password = body.password || body.key;
      } catch (e) {
        // Ignorar error si el body no es JSON o está vacío
      }
    }
    
    if (!password) {
      const url = new URL(request.url);
      password = url.searchParams.get('password') || url.searchParams.get('key');
    }

    const adminPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
    
    // 1. Validar Password
    if (!password || password !== adminPass) {
      return new Response(JSON.stringify({ error: 'Contraseña de administrador incorrecta o no proporcionada' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Consulta a Supabase pidiendo SOLO los campos requeridos
    const { data, error } = await supabase
      .from('asistentes')
      .select('id, nombre_completo, folio, whatsapp, stripe_session_id, asistio, status_pago, monto_total, monto_pagado, es_brave')
      .order('folio', { ascending: true });

    if (error) {
      console.error('Get all attendees API Error:', error);
      return new Response(JSON.stringify({ error: 'Error al consultar la base de datos', details: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Devolver el arreglo como JSON para que pese muy poco
    return new Response(JSON.stringify(data), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        // Esto fuerza a que se descargue el archivo si se abre en el navegador
        'Content-Disposition': 'attachment; filename="attendees_offline_sync.json"'
      }
    });

  } catch (error: any) {
    console.error('Get all attendees Catch:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  return handleRequest(request);
};

export const POST: APIRoute = async ({ request }) => {
  return handleRequest(request);
};
