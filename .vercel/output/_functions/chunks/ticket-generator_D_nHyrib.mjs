import { GlobalFonts, createCanvas, loadImage } from '@napi-rs/canvas';
import QRCode from 'qrcode';
import path from 'node:path';
import fs from 'node:fs/promises';
import { s as supabase } from './supabase_jFlVW5lz.mjs';

try {
  const montserratPath = path.join(process.cwd(), "public", "fonts", "Montserrat-Bold.ttf");
  const nunitoPath = path.join(process.cwd(), "public", "fonts", "Nunito-Bold.ttf");
  GlobalFonts.registerFromPath(montserratPath, "Montserrat");
  GlobalFonts.registerFromPath(nunitoPath, "Nunito");
} catch (fontErr) {
  console.warn("TicketGenerator: Error registrando fuentes:", fontErr);
}
async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}) {
  try {
    const siteURL = "https://conferencia.icimexico.org";
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    const qrDataURL = await QRCode.toDataURL(checkinURL, {
      width: 400,
      margin: 1,
      color: {
        dark: es_brave ? "#FFFFFFFF" : "#000000FF",
        light: "#00000000"
      }
    });
    const templateName = es_brave ? "brave.jpg" : "valiente.jpg";
    const templatePath = path.join(process.cwd(), "src/assets", templateName);
    let canvasWidth = 1080;
    let canvasHeight = 1920;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    try {
      const templateBuffer = await fs.readFile(templatePath);
      const templateObj = await loadImage(templateBuffer);
      canvasWidth = templateObj.width;
      canvasHeight = templateObj.height;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.drawImage(templateObj, 0, 0, canvasWidth, canvasHeight);
    } catch (e) {
      console.warn(`TicketGenerator: Error cargando plantilla ${templatePath}. Usando fondo plano.`);
      ctx.fillStyle = es_brave ? "#1a3a1a" : "#f5e6d3";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    const qrImageObj = await loadImage(qrDataURL);
    const qrSize = canvasWidth * 0.45;
    const marginBot = canvasHeight * 0.08;
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = canvasHeight - qrSize - marginBot;
    ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);
    ctx.fillStyle = es_brave ? "#FFFFFF" : "#1A1A1A";
    const nameFontSize = Math.floor(canvasWidth * 0.078);
    const textMargin = Math.floor(canvasHeight * 0.03);
    ctx.font = `bold ${nameFontSize}px Montserrat`;
    ctx.textAlign = "center";
    ctx.fillText(nombre_completo, canvasWidth / 2, qrY - textMargin * 2);
    const folioFontSize = Math.floor(canvasWidth * 0.055);
    ctx.font = `bold ${folioFontSize}px Nunito`;
    ctx.fillStyle = es_brave ? "#EAEAEA" : "#333333";
    ctx.fillText(`Folio #${folio}`, canvasWidth / 2, qrY - textMargin);
    const buffer = canvas.toBuffer("image/jpeg");
    const finalFileName = fileName.endsWith(".jpg") ? fileName : `${fileName}.jpg`;
    const { error: uploadError } = await supabase.storage.from("tickets").upload(finalFileName, buffer, {
      contentType: "image/jpeg",
      upsert: true
    });
    if (uploadError) throw uploadError;
    return { success: true, fileName: finalFileName };
  } catch (error) {
    console.error("TicketGenerator Error:", error);
    throw error;
  }
}

export { generateAndUploadTicket };
