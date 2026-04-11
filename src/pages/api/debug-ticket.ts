export const prerender = false;

import type { APIRoute } from 'astro';
import { generateAndUploadTicket } from '../../lib/ticket-generator';

export const GET: APIRoute = async () => {
  try {
    const result = await generateAndUploadTicket({
      asistenteId: 'TEST-DEBUG-ID',
      nombre_completo: 'USUARIA DE PRUEBA DEBUG',
      folio: 9999,
      es_brave: true,
      fileName: 'debug-test-ticket'
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: '¡Generación de prueba exitosa!',
      result 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      stack: err.stack,
      info: 'Si ves este error, revisa las rutas de archivos en ticket-generator.ts'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
