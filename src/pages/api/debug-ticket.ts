export const prerender = false;

import type { APIRoute } from 'astro';
import path from 'node:path';
import fs from 'node:fs/promises';
import { supabase } from '../../lib/supabase';
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';

export const GET: APIRoute = async () => {
  const diagnostics: string[] = [];
  
  try {
    const cwd = process.cwd();
    diagnostics.push(`📂 CWD: ${cwd}`);
    
    const bravePath = path.join(cwd, 'public', 'tickets', 'brave.jpg');
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    
    try {
      const stat = await fs.stat(bravePath);
      diagnostics.push(`✅ brave.jpg encontrado: ${stat.size} bytes`);
    } catch (e: any) {
      diagnostics.push(`❌ brave.jpg NO encontrado: ${e.message}`);
    }

    try {
      const stat = await fs.stat(fontPath);
      diagnostics.push(`✅ Montserrat-Bold.ttf encontrada: ${stat.size} bytes`);
    } catch (e: any) {
      diagnostics.push(`❌ Fuente NO encontrada: ${e.message}`);
    }

    // Supabase buckets
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      diagnostics.push(error
        ? `❌ Error buckets: ${error.message}`
        : `🪣 Buckets: [${buckets?.map(b => b.name).join(', ')}]`);
    } catch (e: any) {
      diagnostics.push(`❌ Error Supabase: ${e.message}`);
    }

    // Env vars
    diagnostics.push(`🔑 STRIPE_SECRET_KEY: ${!!(import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY) ? 'SÍ' : '❌ NO'}`);
    diagnostics.push(`🔑 PUBLIC_SUPABASE_URL: ${!!(import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL) ? 'SÍ' : '❌ NO'}`);
    diagnostics.push(`🔑 SUPABASE_SERVICE_ROLE_KEY: ${!!(import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? 'SÍ' : '❌ NO'}`);

    // ===== FONT + TEXT RENDERING TEST =====
    diagnostics.push(`--- INICIO TEST DE FUENTES ---`);
    
    // Registrar fuente
    try {
      const montserratBuffer = await fs.readFile(fontPath);
      GlobalFonts.register(montserratBuffer, 'Montserrat');
      const families = GlobalFonts.families.map((f: any) => f.family).join(', ');
      diagnostics.push(`🔤 Families tras registro: [${families}]`);
    } catch (e: any) {
      diagnostics.push(`❌ Error registrando fuente: ${e.message}`);
    }
    
    // Test de texto con cada fuente
    const fontsToTest = ['Montserrat', 'serif', 'sans-serif'];
    for (const fontName of fontsToTest) {
      try {
        // Canvas de fondo negro puro
        const blackCanvas = createCanvas(300, 80);
        const blackBuf = blackCanvas.toBuffer('image/jpeg');
        
        const testCanvas = createCanvas(300, 80);
        const testCtx = testCanvas.getContext('2d');
        testCtx.fillStyle = '#000000';
        testCtx.fillRect(0, 0, 300, 80);
        testCtx.font = `bold 40px "${fontName}"`;
        testCtx.fillStyle = '#FFFFFF';
        testCtx.textAlign = 'center';
        testCtx.textBaseline = 'middle';
        testCtx.fillText('HOLA', 150, 40);
        const textBuf = testCanvas.toBuffer('image/jpeg');
        
        const diff = Math.abs(textBuf.length - blackBuf.length);
        const hasText = diff > 50; // Si el buffer cambió >50 bytes, hay texto
        diagnostics.push(`🖊️ "${fontName}": diff=${diff}bytes, hasText=${hasText} (black=${blackBuf.length}, text=${textBuf.length})`);
        
        // Subir la imagen visual para inspeccionarla
        await supabase.storage.from('tickets').upload(
          `debug-text-${fontName.replace(/[^a-z]/gi, '_')}.jpg`, 
          textBuf, 
          { contentType: 'image/jpeg', upsert: true }
        );
        diagnostics.push(`☁️ Subida: https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/debug-text-${fontName.replace(/[^a-z]/gi, '_')}.jpg`);
      } catch (e: any) {
        diagnostics.push(`❌ Error test "${fontName}": ${e.message}`);
      }
    }

    // Generar ticket de prueba
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

    return new Response(JSON.stringify({ diagnostics }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err: any) {
    diagnostics.push(`💀 ERROR FATAL: ${err.message}`);
    return new Response(JSON.stringify({ diagnostics, fatalError: err.message }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
