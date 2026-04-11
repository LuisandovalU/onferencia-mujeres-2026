export const prerender = false;

import type { APIRoute } from 'astro';
import path from 'node:path';
import fs from 'node:fs/promises';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const diagnostics: string[] = [];
  
  try {
    // PASO 1: Verificar el directorio de trabajo
    const cwd = process.cwd();
    diagnostics.push(`📂 CWD: ${cwd}`);
    
    // PASO 2: Listar archivos del directorio raíz
    try {
      const rootFiles = await fs.readdir(cwd);
      diagnostics.push(`📂 Archivos en raíz: ${rootFiles.join(', ')}`);
    } catch (e: any) {
      diagnostics.push(`❌ No se pudo listar raíz: ${e.message}`);
    }

    // PASO 3: Verificar si existe la carpeta public
    const publicPath = path.join(cwd, 'public');
    try {
      const publicFiles = await fs.readdir(publicPath);
      diagnostics.push(`📂 Archivos en public/: ${publicFiles.join(', ')}`);
    } catch (e: any) {
      diagnostics.push(`❌ No existe 'public/': ${e.message}`);
    }

    // PASO 4: Buscar tickets folder
    const ticketsPath = path.join(cwd, 'public', 'tickets');
    try {
      const ticketFiles = await fs.readdir(ticketsPath);
      diagnostics.push(`📂 Archivos en public/tickets/: ${ticketFiles.join(', ')}`);
    } catch (e: any) {
      diagnostics.push(`❌ No existe 'public/tickets/': ${e.message}`);
    }

    // PASO 5: Verificar la plantilla brave.jpg
    const bravePath = path.join(cwd, 'public', 'tickets', 'brave.jpg');
    try {
      const stat = await fs.stat(bravePath);
      diagnostics.push(`✅ brave.jpg encontrado: ${stat.size} bytes`);
    } catch (e: any) {
      diagnostics.push(`❌ brave.jpg NO encontrado en ${bravePath}: ${e.message}`);
    }

    // PASO 6: Buscar en rutas alternativas
    const altPaths = [
      path.join(cwd, 'src', 'assets', 'brave.jpg'),
      path.join(cwd, 'dist', 'client', 'tickets', 'brave.jpg'),
      path.join(cwd, '_render.func', 'public', 'tickets', 'brave.jpg'),
    ];
    for (const altPath of altPaths) {
      try {
        const stat = await fs.stat(altPath);
        diagnostics.push(`🔍 ALTERNATIVA encontrada: ${altPath} (${stat.size} bytes)`);
      } catch {
        diagnostics.push(`🔍 No encontrado: ${altPath}`);
      }
    }

    // PASO 7: Verificar fuentes
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    try {
      const stat = await fs.stat(fontPath);
      diagnostics.push(`✅ Montserrat-Bold.ttf encontrada: ${stat.size} bytes`);
    } catch (e: any) {
      diagnostics.push(`❌ Fuente NO encontrada: ${e.message}`);
    }

    // PASO 8: Verificar Supabase Storage - Listar Buckets
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        diagnostics.push(`❌ Error listando buckets: ${bucketsError.message}`);
      } else {
        const bucketNames = buckets?.map(b => b.name).join(', ') || 'NINGUNO';
        diagnostics.push(`🪣 Buckets en Supabase: [${bucketNames}]`);
      }
    } catch (e: any) {
      diagnostics.push(`❌ Error conectando a Supabase Storage: ${e.message}`);
    }

    // PASO 9: Verificar variables de entorno
    const hasStripeKey = !!(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);
    const hasSupabaseUrl = !!(import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL);
    const hasServiceKey = !!(import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
    diagnostics.push(`🔑 STRIPE_SECRET_KEY: ${hasStripeKey ? 'SÍ' : '❌ NO'}`);
    diagnostics.push(`🔑 PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? 'SÍ' : '❌ NO'}`);
    diagnostics.push(`🔑 SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? 'SÍ' : '❌ NO'}`);

    // PASO 10: Intentar generar ticket de prueba
    try {
      const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
      
      const result = await generateAndUploadTicket({
        asistenteId: 'TEST-DEBUG-ID',
        nombre_completo: 'PRUEBA DEBUG',
        folio: 9999,
        es_brave: true,
        fileName: 'debug-test-ticket'
      });
      
      diagnostics.push(`🚀 GENERACIÓN EXITOSA: ${JSON.stringify(result)}`);
    } catch (genErr: any) {
      diagnostics.push(`❌ ERROR EN GENERACIÓN: ${genErr.message}`);
    }

    return new Response(JSON.stringify({ 
      diagnostics 
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err: any) {
    diagnostics.push(`💀 ERROR FATAL: ${err.message}`);
    return new Response(JSON.stringify({ 
      diagnostics,
      fatalError: err.message 
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
