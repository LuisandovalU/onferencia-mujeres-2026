import { registerFont, createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import path from 'node:path';
import { supabase } from './supabase';

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
  try {
    // 1. Configuración de la URL del QR
    // Usamos PUBLIC_SITE_URL si existe, de lo contrario fallback a localhost
    const siteURL = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    
    // 2. Generar el QR
    const qrDataURL = await QRCode.toDataURL(checkinURL, {
      width: 400,
      margin: 1,
      color: { 
        dark: es_brave ? '#FFFFFFFF' : '#000000FF', 
        light: '#00000000' 
      }
    });

    // 3. Cargar Plantilla
    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(process.cwd(), 'src/assets', templateName); 
    
    let canvasWidth = 1080;
    let canvasHeight = 1920;
    
    // Registrar fuentes oficiales
    try {
      registerFont(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf'), { family: 'Montserrat' });
      registerFont(path.join(process.cwd(), 'public', 'fonts', 'Nunito-Bold.ttf'), { family: 'Nunito' });
    } catch (fontErr) {
      console.warn('TicketGenerator: Error cargando fuentes:', fontErr);
    }

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dibujar fondo (plantilla)
    try {
      const templateObj = await loadImage(templatePath);
      canvasWidth = templateObj.width;
      canvasHeight = templateObj.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(templateObj, 0, 0, canvasWidth, canvasHeight);
    } catch (e) {
      console.warn(`TicketGenerator: No se encontró plantilla en ${templatePath}. Usando fondo plano.`);
      ctx.fillStyle = es_brave ? '#1a3a1a' : '#f5e6d3'; // Verdesito o Beige
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 4. Dibujar QR y Textos (Lógica Relativa)
    const qrImageObj = await loadImage(qrDataURL);
    const qrSize = canvasWidth * 0.45;
    const marginBot = canvasHeight * 0.08;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = canvasHeight - qrSize - marginBot; 
    
    ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);

    // Estilo de Texto
    ctx.fillStyle = es_brave ? '#FFFFFF' : '#1A1A1A';
    const nameFontSize = Math.floor(canvasWidth * 0.078);
    const textMargin = Math.floor(canvasHeight * 0.03);
    
    // Nombre
    ctx.font = `bold ${nameFontSize}px "Montserrat", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(nombre_completo, canvasWidth / 2, qrY - (textMargin * 2));

    // Folio
    const folioFontSize = Math.floor(canvasWidth * 0.055);
    ctx.font = `bold ${folioFontSize}px "Nunito", sans-serif`;
    ctx.fillStyle = es_brave ? '#EAEAEA' : '#333333';
    ctx.fillText(`Folio #${folio}`, canvasWidth / 2, qrY - textMargin);

    // 5. Convertir a Buffer y Subir
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.90 });
    
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(finalFileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) throw uploadError;

    return { success: true, fileName: finalFileName };

  } catch (error) {
    console.error('TicketGenerator Error:', error);
    throw error;
  }
}
