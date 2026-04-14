import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();
    
    // Recuperar la llave desde env o usar la predeterminada por código
    const masterPass = import.meta.env.MASTER_ADMIN_PASSWORD || (typeof process !== 'undefined' ? process.env.MASTER_ADMIN_PASSWORD : '') || 'MasterMujeres2026';
    
    const isValid = password === String(masterPass).trim();
    
    return new Response(JSON.stringify({ isValid }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ isValid: false, error: 'Internal Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
