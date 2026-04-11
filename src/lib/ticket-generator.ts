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

    // 2. Configurar fontconfig para que Pango/librsvg encuentre nuestra fuente
    const tmpFontsDir = '/tmp/ticketfonts';
    const tmpFontcacheDir = '/tmp/ticketfontcache';
    await fs.mkdir(tmpFontsDir, { recursive: true });
    await fs.mkdir(tmpFontcacheDir, { recursive: true });
    
    // Copiar fuentes al directorio temporal
    const fontBuffer = await fs.readFile(fontPath);
    const tmpMontserratPath = path.join(tmpFontsDir, 'Montserrat-Bold.ttf');
    await fs.writeFile(tmpMontserratPath, fontBuffer);
    
    // Nunito también si existe
    const nunitoPath = path.join(cwd, 'public', 'fonts', 'Nunito-Bold.ttf');
    try {
      const nunitoBuffer = await fs.readFile(nunitoPath);
      await fs.writeFile(path.join(tmpFontsDir, 'Nunito-Bold.ttf'), nunitoBuffer);
    } catch { /* opcional */ }
    
    // Crear archivo de configuración fontconfig mínimo
    const fontconfigContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${tmpFontsDir}</dir>
  <cachedir>${tmpFontcacheDir}</cachedir>
  <match target="pattern">
    <test qual="any" name="family"><string>sans-serif</string></test>
    <edit name="family" mode="assign" binding="same"><string>Montserrat</string></edit>
  </match>
</fontconfig>`;
    const tmpFontconfigPath = '/tmp/ticket-fontconfig.conf';
    await fs.writeFile(tmpFontconfigPath, fontconfigContent);
    
    // Apuntar Pango/librsvg a nuestra config de fontconfig
    process.env.FONTCONFIG_FILE = tmpFontconfigPath;
    console.log(`🔤 fontconfig configurado: ${tmpFontconfigPath}, fuente en ${tmpMontserratPath} (${fontBuffer.length} bytes)`);

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

    // 6. Crear SVG — fontconfig ya apunta a Montserrat, se usa por nombre nativo
    const svgOverlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="${bandY}" width="${W}" height="${bandH}" fill="${bandFill}" rx="0"/>
  <text
    x="${W / 2}"
    y="${nameY}"
    font-family="Montserrat, sans-serif"
    font-size="${nameFontSize}"
    font-weight="bold"
    fill="${textColor}"
    text-anchor="middle"
    dominant-baseline="middle"
  >${escapeXml(nombre_completo)}</text>
  <text
    x="${W / 2}"
    y="${folioY}"
    font-family="Montserrat, sans-serif"
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
