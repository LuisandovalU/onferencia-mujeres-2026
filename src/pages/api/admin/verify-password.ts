import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();
    const isValid = password === import.meta.env.ADMIN_PASSWORD;
    
    return new Response(JSON.stringify({ isValid }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ isValid: false }), { status: 500 });
  }
};
