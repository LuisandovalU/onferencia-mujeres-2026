import { Resvg } from '@resvg/resvg-js';
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
  console.log(`🎟️ Iniciando generación (resvg+sharp) para: ${nombre_completo} (Folio: ${folio})`);
  
  try {
    const cwd = process.cwd();
    
    // 1. Rutas de archivos
    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(cwd, 'public', 'tickets', templateName);
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    
    console.log(`📁 Plantilla: ${templatePath}`);

    // 2. Leer fuente como buffer (para inyectar directamente en @resvg/resvg-js)
    const fontBuffer = await fs.readFile(fontPath);
    console.log(`🔤 Fuente leída: ${fontBuffer.length} bytes`);

    // 3. Obtener dimensiones de la plantilla
    const templateMeta = await sharp(templatePath).metadata();
    const W = templateMeta.width || 1080;
    const H = templateMeta.height || 1920;
    console.log(`📐 Dimensiones plantilla: ${W}x${H}`);

    // 4. Generar QR como buffer PNG
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
    const bandFill = es_brave ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';
    const nameY = Math.floor(bandY + bandH * 0.38);
    const folioY = Math.floor(bandY + bandH * 0.75);

    // 6. Crear SVG del overlay de texto (sin @font-face — la fuente se inyecta via resvg API)
    const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${bandY}" width="${W}" height="${bandH}" fill="${bandFill}"/>
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="Montserrat"
    font-size="${nameFontSize}"
    font-weight="bold"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
  >${escapeXml(nombre_completo)}</text>
  <text
    x="${W / 2}"
    y="${folioY}"
    font-family="Montserrat"
    font-size="${folioFontSize}"
    font-weight="bold"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
    opacity="0.9"
  >Folio #${folio}</text>
</svg>`;
    
    console.log(`🎨 SVG generado (${svgOverlay.length} chars)`);

    // 7. Renderizar SVG → PNG usando @resvg/resvg-js
    // Escribir fuente a /tmp para que resvg la encuentre via fontDirs
    const tmpFontsDir = '/tmp/resvg-fonts';
    await fs.mkdir(tmpFontsDir, { recursive: true });
    const tmpFontFile = path.join(tmpFontsDir, 'Montserrat-Bold.ttf');
    await fs.writeFile(tmpFontFile, fontBuffer);
    console.log(`🔤 Fuente escrita para resvg: ${tmpFontFile}`);

    const resvg = new Resvg(svgOverlay, {
      fitTo: { mode: 'original' },
      font: {
        fontDirs: [tmpFontsDir],         // ← directorio con el TTF
        defaultFontFamily: 'Montserrat',
        serifFamily: 'Montserrat',
        sansSerifFamily: 'Montserrat',
        loadSystemFonts: false,
      }
    });
    
    const rendered = resvg.render();
    const overlayPngBuffer = rendered.asPng();
    console.log(`🖼️ Overlay PNG renderizado: ${overlayPngBuffer.length} bytes`);

    // 8. Componer con sharp: plantilla + overlay de texto + QR
    const finalBuffer = await sharp(templatePath)
      .composite([
        {
          input: overlayPngBuffer,
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

    // 9. Subir a Supabase Storage
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

    console.log(`🚀 Ticket subido: tickets/${finalFileName}`);
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    console.error(`❌ Error en TicketGenerator: ${error.message}`);
    throw new Error(`Error en TicketGenerator: ${error.message}`);
  }
}
