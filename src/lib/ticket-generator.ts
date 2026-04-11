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
    
    // Dibujar una banda semi-transparente detrás del texto para legibilidad
    const bandHeight = canvasHeight * 0.12;
    const bandY = qrY - bandHeight - 10;
    ctx.fillStyle = es_brave ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(0, bandY, canvasWidth, bandHeight);
    
    // Nombre
    ctx.fillStyle = es_brave ? '#FFFFFF' : '#1A1A1A';
    const nameFontSize = Math.floor(canvasWidth * 0.065);
    const textCenterY = bandY + (bandHeight * 0.42);
    
    // Listar fuentes disponibles para debug
    const registeredFonts = GlobalFonts.families.map((f: any) => f.family).join(', ');
    console.log(`🔤 Fuentes registradas: ${registeredFonts}`);
    
    ctx.font = `bold ${nameFontSize}px Montserrat, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(nombre_completo, canvasWidth / 2, textCenterY);
    console.log(`✍️ Nombre "${nombre_completo}" dibujado en Y=${textCenterY}`);

    // Folio
    const folioFontSize = Math.floor(canvasWidth * 0.045);
    const folioY = bandY + (bandHeight * 0.78);
    ctx.font = `bold ${folioFontSize}px Nunito, Arial, sans-serif`;
    ctx.fillStyle = es_brave ? '#E0E0E0' : '#333333';
    ctx.fillText(`Folio #${folio}`, canvasWidth / 2, folioY);
    console.log(`✍️ Folio "#${folio}" dibujado en Y=${folioY}`);

    // Dibujar QR DESPUÉS del texto para que quede encima si se sobrepone
    ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
    console.log('✅ QR dibujado sobre el boleto.');

    // Convertir a JPEG para subir
    console.log(`📦 Intentando crear buffer JPEG...`);
    const buffer = canvas.toBuffer('image/jpeg');
    console.log(`📦 Buffer JPEG creado (${buffer.length} bytes).`);
    
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    
    console.log(`☁️ Intentando subir a Supabase Storage: tickets/${finalFileName}...`);
    try {
        const { error: uploadError } = await supabase.storage
          .from('tickets')
          .upload(finalFileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
    
        if (uploadError) {
            console.error('❌ Error de subida de Supabase:', uploadError);
            throw new Error(`Error de subida a Supabase: ${uploadError.message}`);
        }
    } catch (storageErr: any) {
        throw new Error(`Error crítico en Supabase Storage: ${storageErr.message}`);
    }

    console.log('🚀 Ticket subido con éxito!');
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    const errorMsg = `❌ Error fatal en TicketGenerator: ${error.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}
