import { GlobalFonts, createCanvas, loadImage } from '@napi-rs/canvas';
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

async function ensureFonts(): Promise<{ main: string; sub: string }> {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');
  const montserratPath = path.join(fontsDir, 'Montserrat-Bold.ttf');
  const nunitoPath = path.join(fontsDir, 'Nunito-Bold.ttf');
  
  try {
    const montserratBuffer = await fs.readFile(montserratPath);
    const nunitoBuffer = await fs.readFile(nunitoPath);
    
    console.log(`📂 Fuentes leídas: Montserrat=${montserratBuffer.length}b, Nunito=${nunitoBuffer.length}b`);
    
    // Registrar con su nombre nativo del TTF (no alias)
    GlobalFonts.register(montserratBuffer, 'Montserrat');
    GlobalFonts.register(nunitoBuffer, 'Nunito');
    
    const families = GlobalFonts.families.map((f: any) => f.family).join(', ');
    console.log(`🔤 Fuentes registradas: [${families}]`);
    
    return { 
      main: families.includes('Montserrat') ? 'Montserrat' : 'serif', 
      sub: families.includes('Nunito') ? 'Nunito' : 'serif' 
    };
  } catch (err: any) {
    console.warn(`⚠️ Error registrando fuentes: ${err.message}`);
    return { main: 'serif', sub: 'serif' };
  }
}

// Helper para probar si el canvas puede dibujar texto visible
async function testTextRendering(fontName: string, fontSize: number): Promise<boolean> {
  try {
    const testCanvas = createCanvas(200, 60);
    const testCtx = testCanvas.getContext('2d');
    testCtx.fillStyle = '#000000';
    testCtx.fillRect(0, 0, 200, 60);
    testCtx.font = `bold ${fontSize}px "${fontName}"`;
    testCtx.fillStyle = '#FFFFFF';
    testCtx.textAlign = 'center';
    testCtx.textBaseline = 'middle';
    testCtx.fillText('TEST', 100, 30);
    const buf = testCanvas.toBuffer('image/png');
    // Si el buffer tiene más de 300 bytes de PNG, hay pixels blancos = texto visible
    const hasWhitePixels = buf.length > 300;
    console.log(`🧪 Test font="${fontName}" ${fontSize}px: buffer=${buf.length}b, hasText=${hasWhitePixels}`);
    return hasWhitePixels;
  } catch (e: any) {
    console.warn(`🧪 Test font falló: ${e.message}`);
    return false;
  }
}


export async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}: TicketData) {
  console.log(`🎟️ Iniciando generación de ticket para: ${nombre_completo} (Folio: ${folio})`);
  
  try {
    const { main: mainFont, sub: subFont } = await ensureFonts();
    
    // Test real si el canvas puede renderizar texto con esa fuente
    await testTextRendering(mainFont, 60);
    await testTextRendering('serif', 60);

    const siteURL = 'https://conferencia.icimexico.org';
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    
    console.log('🔗 URL de Check-in:', checkinURL);

    const qrDataURL = await QRCode.toDataURL(checkinURL, {
      width: 400,
      margin: 1,
      color: { 
        dark: es_brave ? '#FFFFFFFF' : '#000000FF', 
        light: '#00000000' 
      }
    });
    console.log('✅ QR generado como DataURL.');

    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(process.cwd(), 'public', 'tickets', templateName); 
    
    console.log(`📁 Buscando plantilla en: ${templatePath}`);

    let canvasWidth = 1080;
    let canvasHeight = 1920;
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dibujar plantilla
    try {
      const templateBuffer = await fs.readFile(templatePath);
      console.log(`📖 Plantilla leída (${templateBuffer.length} bytes).`);
      const templateObj = await loadImage(templateBuffer);
      canvasWidth = templateObj.width;
      canvasHeight = templateObj.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(templateObj, 0, 0, canvasWidth, canvasHeight);
      console.log('🎨 Fondo dibujado en canvas.');
    } catch (e: any) {
      console.warn(`⚠️ Error cargando plantilla: ${e.message}. Usando fondo plano.`);
      ctx.fillStyle = es_brave ? '#1a3a1a' : '#f5e6d3'; 
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Calcular posiciones
    const qrSize = canvasWidth * 0.45;
    const marginBot = canvasHeight * 0.08;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = canvasHeight - qrSize - marginBot; 

    // Banda semi-transparente para texto
    const bandHeight = canvasHeight * 0.14;
    const bandY = qrY - bandHeight - 20;
    ctx.fillStyle = es_brave ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(0, bandY, canvasWidth, bandHeight);
    
    // === NOMBRE ===
    const nameFontSize = Math.floor(canvasWidth * 0.068);
    ctx.font = `bold ${nameFontSize}px "${mainFont}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = es_brave ? '#FFFFFF' : '#111111';
    
    // Sombra para legibilidad extra
    ctx.shadowColor = es_brave ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    const nameY = bandY + bandHeight * 0.38;
    ctx.fillText(nombre_completo, canvasWidth / 2, nameY);
    console.log(`✍️ Nombre "${nombre_completo}" dibujado en Y=${nameY} con fuente "${mainFont}" ${nameFontSize}px`);

    // === FOLIO ===
    const folioFontSize = Math.floor(canvasWidth * 0.048);
    ctx.font = `bold ${folioFontSize}px "${subFont}"`;
    ctx.fillStyle = es_brave ? '#E8E8E8' : '#222222';
    ctx.shadowBlur = 4;
    
    const folioY = bandY + bandHeight * 0.75;
    ctx.fillText(`Folio #${folio}`, canvasWidth / 2, folioY);
    console.log(`✍️ Folio "#${folio}" dibujado en Y=${folioY}`);

    // Limpiar sombra antes del QR
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Dibujar QR encima
    const qrImageObj = await loadImage(qrDataURL);
    ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
    console.log('✅ QR dibujado sobre el boleto.');

    // Convertir a JPEG
    console.log(`📦 Creando buffer JPEG...`);
    const buffer = canvas.toBuffer('image/jpeg');
    console.log(`📦 Buffer JPEG creado (${buffer.length} bytes).`);
    
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    
    console.log(`☁️ Subiendo a Supabase Storage: tickets/${finalFileName}...`);
    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(finalFileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
  
    if (uploadError) {
      console.error('❌ Error de subida a Supabase:', uploadError);
      throw new Error(`Error crítico en Supabase Storage: ${uploadError.message}`);
    }

    console.log('🚀 Ticket subido con éxito!');
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    const errorMsg = `❌ Error fatal en TicketGenerator: ${error.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
