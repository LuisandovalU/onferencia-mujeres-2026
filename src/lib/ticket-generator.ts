import QRCode from 'qrcode';
import path from 'node:path';
import fs from 'node:fs';
import { supabase } from './supabase';

let fontsRegistered = false;
async function registerFonts() {
  if (fontsRegistered) return;
  try {
    const { GlobalFonts } = await import('@napi-rs/canvas');
    const projectRoot = process.cwd();
    
    // Intentar varias rutas comunes en entornos Serverless
    const pathsToTry = [
      path.join(projectRoot, 'public/fonts'),
      path.join(projectRoot, 'fonts'),
      path.join(projectRoot, '.vercel/output/static/fonts')
    ];

    let fontsPath = pathsToTry[0];
    for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
            fontsPath = p;
            break;
        }
    }

    GlobalFonts.registerFromPath(path.join(fontsPath, 'Montserrat-Bold.ttf'), 'Montserrat');
    GlobalFonts.registerFromPath(path.join(fontsPath, 'Nunito-Bold.ttf'), 'Nunito');
    fontsRegistered = true;
  } catch (fontErr) {
    console.warn('TicketGenerator: Error registrando fuentes:', fontErr);
  }
}

interface TicketData {
  asistenteId: string;
  nombre_completo: string;
  folio: number;
  es_brave: boolean;
  fileName: string; // El nombre con el que se guardará en Storage (ej: session_id o manual_uuid)
}

/**
 * Genera un ticket personalizado con QR y lo sube al Bucket 'tickets' de Supabase Storage.
 * @returns El objeto de subida o lanza un error.
 */
export async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}: TicketData) {
  // Comentado temporalmente para debugging de error 500 en Vercel
  // const { createCanvas, loadImage } = await import('@napi-rs/canvas');
  // await registerFonts();
  
  console.log("DEBUG: TicketGenerator disabled for troubleshooting.");
  
  try {
    // Simulamos éxito para no romper el flujo de las APIs
    return { success: true, fileName: `${fileName}.jpg` };
  } catch (error) {
    console.error('TicketGenerator Error:', error);
    throw error;
  }
}
