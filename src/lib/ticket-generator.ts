import sharp from 'sharp';
import QRCode from 'qrcode';
import path from 'node:path';
import fs from 'node:fs/promises';
import { supabase } from './supabase';

interface TicketData {
  asistenteId: string;
  nombre_completo: string;
  folio: number;
  es_brave: boolean;
  fileName: string; 
}

// Escapa caracteres especiales en XML/SVG
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}: TicketData) {
  console.log(`🎟️ Iniciando generación (sharp+SVG) para: ${nombre_completo} (Folio: ${folio})`);
  
  try {
    const cwd = process.cwd();
    
    // 1. Rutas de archivos
    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(cwd, 'public', 'tickets', templateName);
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    
    console.log(`📁 Plantilla: ${templatePath}`);

    // 2. Escribir fuente a /tmp para que librsvg/Pango la encuentre por file://
    const tmpFontPath = '/tmp/TicketFont-Montserrat.ttf';
    const fontBuffer = await fs.readFile(fontPath);
    await fs.writeFile(tmpFontPath, fontBuffer);
    console.log(`🔤 Fuente escrita en ${tmpFontPath} (${fontBuffer.length} bytes)`);

    // 3. Obtener dimensiones de la plantilla
    const templateMeta = await sharp(templatePath).metadata();
    const W = templateMeta.width || 1080;
    const H = templateMeta.height || 1920;
    console.log(`📐 Dimensiones plantilla: ${W}x${H}`);

    // 4. Generar QR como buffer PNG (fondo transparente)
    const siteURL = 'https://conferencia.icimexico.org';
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    const qrBuffer = await QRCode.toBuffer(checkinURL, {
      type: 'png',
      width: Math.floor(W * 0.45),
      margin: 1,
      color: { dark: es_brave ? '#FFFFFF' : '#000000', light: '#00000000' }
    });
    console.log(`✅ QR generado: ${qrBuffer.length} bytes`);

    // 5. Calcular posiciones
    const qrSize = Math.floor(W * 0.45);
    const marginBot = Math.floor(H * 0.08);
    const qrX = Math.floor((W - qrSize) / 2);
    const qrY = H - qrSize - marginBot;
    
    const bandH = Math.floor(H * 0.14);
    const bandY = qrY - bandH - 20;
    const nameFontSize = Math.floor(W * 0.068);
    const folioFontSize = Math.floor(W * 0.048);
    
    const textColor = es_brave ? 'white' : '#111111';
    const bandFill = es_brave ? 'rgba(0,0,0,0.60)' : 'rgba(255,255,255,0.70)';
    const nameY = Math.floor(bandY + bandH * 0.38);
    const folioY = Math.floor(bandY + bandH * 0.75);

    // 6. Crear SVG con fuente referenciada por file://
    const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'TicketFont';
        src: url('file://${tmpFontPath}') format('truetype');
        font-weight: bold;
      }
    </style>
  </defs>
  <rect x="0" y="${bandY}" width="${W}" height="${bandH}" fill="${bandFill}" rx="0"/>
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="TicketFont, DejaVu Sans, Liberation Sans, sans-serif"
    font-size="${nameFontSize}"
    font-weight="bold"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
  >${escapeXml(nombre_completo)}</text>
  <text
    x="${W / 2}"
    y="${folioY}"
    font-family="TicketFont, DejaVu Sans, Liberation Sans, sans-serif"
    font-size="${folioFontSize}"
    font-weight="bold"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
    opacity="0.85"
  >Folio #${folio}</text>
</svg>`;
    
    console.log(`🎨 SVG generado (${svgOverlay.length} chars)`);

    // 7. Componer con sharp: plantilla + SVG texto + QR
    const finalBuffer = await sharp(templatePath)
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0,
          blend: 'over'
        },
        {
          input: qrBuffer,
          top: qrY,
          left: qrX,
          blend: 'over'
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`📦 Buffer final JPEG: ${finalBuffer.length} bytes`);

    // 8. Subir a Supabase Storage
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(finalFileName, finalBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error Supabase Storage: ${uploadError.message}`);
    }

    console.log(`🚀 Ticket subido exitosamente: tickets/${finalFileName}`);
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    console.error(`❌ Error en TicketGenerator: ${error.message}`);
    throw new Error(`Error en TicketGenerator: ${error.message}`);
  }
}
