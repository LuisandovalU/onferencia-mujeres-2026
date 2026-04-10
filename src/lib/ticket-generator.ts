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

let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) return;
  try {
    const montserratPath = path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf');
    const nunitoPath = path.join(process.cwd(), 'public', 'fonts', 'Nunito-Bold.ttf');
    GlobalFonts.registerFromPath(montserratPath, 'Montserrat');
    GlobalFonts.registerFromPath(nunitoPath, 'Nunito');
    fontsRegistered = true;
  } catch (fontErr) {
    console.warn('TicketGenerator: Error registrando fuentes:', fontErr);
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
    ensureFonts();
    console.log('✅ Fuentes verificadas.');

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
    // En Vercel, la carpeta public es accesible desde process.cwd()
    const templatePath = path.join(process.cwd(), 'public', 'tickets', templateName); 
    
    console.log(`📁 Buscando plantilla en: ${templatePath}`);

    let canvasWidth = 1080;
    let canvasHeight = 1920;
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dibujar fondo (plantilla) usando Buffer para mayor compatibilidad en Vercel
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
      console.warn(`⚠️ Error cargando plantilla ${templatePath}: ${e.message}. Usando fondo plano.`);
      ctx.fillStyle = es_brave ? '#1a3a1a' : '#f5e6d3'; 
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    const qrImageObj = await loadImage(qrDataURL);
    const qrSize = canvasWidth * 0.45;
    const marginBot = canvasHeight * 0.08;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = canvasHeight - qrSize - marginBot; 
    
    ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
    console.log('✅ QR dibujado sobre el boleto.');

    ctx.fillStyle = es_brave ? '#FFFFFF' : '#1A1A1A';
    const nameFontSize = Math.floor(canvasWidth * 0.078);
    const textMargin = Math.floor(canvasHeight * 0.03);
    
    ctx.font = `bold ${nameFontSize}px Montserrat`;
    ctx.textAlign = 'center';
    ctx.fillText(nombre_completo, canvasWidth / 2, qrY - (textMargin * 2));

    const folioFontSize = Math.floor(canvasWidth * 0.055);
    ctx.font = `bold ${folioFontSize}px Nunito`;
    ctx.fillStyle = es_brave ? '#EAEAEA' : '#333333';
    ctx.fillText(`Folio #${folio}`, canvasWidth / 2, qrY - textMargin);
    console.log('✍️ Textos escritos correctamente.');

    // Convertir a JPEG para subir
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
        throw uploadError;
    }

    console.log('🚀 Ticket subido con éxito!');
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    console.error('❌ Error fatal en TicketGenerator:', error.message);
    throw error;
  }
}
