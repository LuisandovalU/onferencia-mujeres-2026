import * as opentype from 'opentype.js';
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

/**
 * Convierte texto a SVG path usando opentype.js.
 * Esto NO necesita ningún sistema de fuentes — lee el TTF y genera paths vectoriales.
 */
function textToSvgPath(
  font: opentype.Font,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  centerX?: number
): string {
  // Calcular ancho total para centrar
  let totalWidth = 0;
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    totalWidth += (glyph.advanceWidth || 0) * (fontSize / font.unitsPerEm);
  }
  
  const startX = centerX !== undefined ? centerX - totalWidth / 2 : x;
  
  // Generar path del texto
  const fontPath = font.getPath(text, startX, y, fontSize);
  const svgPathData = fontPath.toSVG(2);
  
  // Extraer el atributo 'd' del path
  const dMatch = svgPathData.match(/d="([^"]+)"/);
  if (!dMatch) return '';
  
  return `<path d="${dMatch[1]}" fill="${color}"/>`;
}

export async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}: TicketData) {
  console.log(`🎟️ Generando ticket (opentype paths) para: ${nombre_completo} (Folio: ${folio})`);
  
  try {
    const cwd = process.cwd();
    
    // 1. Rutas de archivos
    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(cwd, 'public', 'tickets', templateName);
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    
    // 2. Cargar fuente con opentype.js (lee el TTF directamente)
    const fontBuffer = await fs.readFile(fontPath);
    // opentype.js requiere un ArrayBuffer
    const arrayBuffer = fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    ) as ArrayBuffer;
    const font = opentype.parse(arrayBuffer);
    console.log(`🔤 Fuente cargada: ${font.names.fullName?.en || 'Montserrat'}, unitsPerEm=${font.unitsPerEm}`);

    // 3. Obtener dimensiones de la plantilla
    const templateMeta = await sharp(templatePath).metadata();
    const W = templateMeta.width || 600;
    const H = templateMeta.height || 900;
    console.log(`📐 Dimensiones plantilla: ${W}x${H}`);

    // 4. Generar QR como buffer PNG
    const siteURL = 'https://conferencia.icimexico.org';
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    const qrSize = Math.floor(W * 0.45);
    const qrBuffer = await QRCode.toBuffer(checkinURL, {
      type: 'png',
      width: qrSize,
      margin: 1,
      color: { dark: es_brave ? '#FFFFFF' : '#000000', light: '#00000000' }
    });

    // 5. Calcular posiciones
    const marginBot = Math.floor(H * 0.08);
    const qrX = Math.floor((W - qrSize) / 2);
    const qrY = H - qrSize - marginBot;
    
    const bandH = Math.floor(H * 0.14);
    const bandY = qrY - bandH - 20;
    const centerX = W / 2;
    
    // Font sizes
    const nameFontSize = Math.floor(W * 0.068);
    const folioFontSize = Math.floor(W * 0.048);
    
    // Colores
    const textColor = es_brave ? '#FFFFFF' : '#111111';
    const bandFill = es_brave ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';

    // 6. Convertir texto a SVG paths vectoriales (no necesita fonts del sistema)
    // La baseline de opentype está en la parte inferior del texto
    // Así que y = bandY + bandH*0.38 + nameFontSize*0.7 (ascender típico)
    const nameY = Math.floor(bandY + bandH * 0.42 + nameFontSize * 0.35);
    const folioY = Math.floor(bandY + bandH * 0.78 + folioFontSize * 0.35);
    
    const namePath = textToSvgPath(font, nombre_completo, 0, nameY, nameFontSize, textColor, centerX);
    const folioPath = textToSvgPath(font, `Folio #${folio}`, 0, folioY, folioFontSize, es_brave ? '#E0E0E0' : '#333333', centerX);
    
    console.log(`✍️ Paths generados: nombre=${namePath.length}chars, folio=${folioPath.length}chars`);

    // 7. Crear SVG overlay con banda + paths vectoriales
    const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${bandY}" width="${W}" height="${bandH}" fill="${bandFill}"/>
  ${namePath}
  ${folioPath}
</svg>`;
    
    console.log(`🎨 SVG overlay: ${svgOverlay.length} chars`);

    // 8. Renderizar con @resvg/resvg-js (solo paths/rects, sin texto = sin fonts)
    const { Resvg } = await import('@resvg/resvg-js');
    const resvg = new Resvg(svgOverlay, { fitTo: { mode: 'original' } });
    const rendered = resvg.render();
    const overlayPngBuffer = rendered.asPng();
    console.log(`🖼️ Overlay PNG: ${overlayPngBuffer.length} bytes`);

    // 9. Componer: plantilla + overlay texto + QR
    const finalBuffer = await sharp(templatePath)
      .composite([
        { input: overlayPngBuffer, top: 0, left: 0, blend: 'over' },
        { input: qrBuffer, top: qrY, left: qrX, blend: 'over' }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`📦 Buffer JPEG final: ${finalBuffer.length} bytes`);

    // 10. Subir a Supabase
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(finalFileName, finalBuffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw new Error(`Error Supabase: ${uploadError.message}`);

    console.log(`🚀 Ticket subido: tickets/${finalFileName}`);
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    console.error(`❌ Error en TicketGenerator: ${error.message}`);
    throw new Error(`Error en TicketGenerator: ${error.message}`);
  }
}
