export const prerender = false;

import type { APIRoute } from 'astro';
import path from 'node:path';
import fs from 'node:fs/promises';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async () => {
  const diagnostics: string[] = [];
  
  try {
    const cwd = process.cwd();
    diagnostics.push(`📂 CWD: ${cwd}`);
    
    // 1. Verificar archivos esenciales
    const filesToCheck = [
      { name: 'brave.jpg', path: path.join(cwd, 'public', 'tickets', 'brave.jpg') },
      { name: 'valiente.jpg', path: path.join(cwd, 'public', 'tickets', 'valiente.jpg') },
      { name: 'font', path: path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf') }
    ];

    for (const f of filesToCheck) {
      try {
        const stat = await fs.stat(f.path);
        diagnostics.push(`✅ ${f.name} encontrado: ${stat.size} bytes`);
      } catch {
        diagnostics.push(`❌ ${f.name} NO encontrado en ${f.path}`);
      }
    }

    // 2. Generar tickets de prueba (Brave y Valiente)
    const { generateAndUploadTicket } = await import('../../lib/ticket-generator');
    
    // BRAVE
    try {
      const braveResult = await generateAndUploadTicket({
        asistenteId: 'DEBUG-BRAVE',
        nombre_completo: 'ASISTENTE BRAVE',
        folio: 1111,
        es_brave: true,
        fileName: 'debug-test-brave'
      });
      diagnostics.push(`🚀 BRAVE OK: ${JSON.stringify(braveResult)}`);
    } catch (e: any) {
      diagnostics.push(`❌ ERROR BRAVE: ${e.message}`);
    }

    // VALIENTE
    try {
      const valienteResult = await generateAndUploadTicket({
        asistenteId: 'DEBUG-VALIENTE',
        nombre_completo: 'ASISTENTE VALIENTE',
        folio: 2222,
        es_brave: false,
        fileName: 'debug-test-valiente'
      });
      diagnostics.push(`🚀 VALIENTE OK: ${JSON.stringify(valienteResult)}`);
    } catch (e: any) {
      diagnostics.push(`❌ ERROR VALIENTE: ${e.message}`);
    }

    return new Response(JSON.stringify({ 
      diagnostics,
      links: {
        brave: "https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/debug-test-brave.jpg",
        valiente: "https://fkifwxauqdjmfjbceypa.supabase.co/storage/v1/object/public/tickets/debug-test-valiente.jpg"
      }
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err: any) {
    return new Response(JSON.stringify({ fatalError: err.message, diagnostics }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
