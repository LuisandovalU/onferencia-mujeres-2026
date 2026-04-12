import satori from 'satori';
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

let cachedFont: Buffer | null = null;

export async function generateAndUploadTicket({
  asistenteId,
  nombre_completo,
  folio,
  es_brave,
  fileName
}: TicketData) {
  console.log(`🎟️ Generando ticket con Satori para: ${nombre_completo} (Folio: ${folio})`);
  
  try {
    const cwd = process.cwd();
    
    // 1. Rutas de archivos
    const templateName = es_brave ? 'brave.jpg' : 'valiente.jpg';
    const templatePath = path.join(cwd, 'public', 'tickets', templateName);
    const fontPath = path.join(cwd, 'public', 'fonts', 'Montserrat-Bold.ttf');
    
    // 2. Cargar fuente (con caché)
    if (!cachedFont) {
        console.log(`🔤 Cargando fuente Montserrat por primera vez...`);
        cachedFont = await fs.readFile(fontPath);
    }
    const fontBuffer = cachedFont;
    console.log(`🔤 Fuente lista (${fontBuffer.length} bytes)`);

    // 3. Obtener dimensiones de la plantilla
    const templateMeta = await sharp(templatePath).metadata();
    const W = templateMeta.width || 1080;
    const H = templateMeta.height || 1920;
    console.log(`📐 Dimensiones plantilla: ${W}x${H}`);

    // 4. Configurar Colores y QR
    const textColor = '#FFFFFF';
    const bandFill = es_brave 
      ? 'rgba(0, 0, 0, 0.7)'         // Brave: Franja negra/oscura
      : 'rgba(14, 45, 25, 0.85)';    // Valiente: Franja verde oscuro (como las hojas)
    
    const qrDarkColor = '#FFFFFF';   // QR blanco para ambos
    
    const qrSize = Math.floor(W * 0.45);
    const siteURL = 'https://conferencia.icimexico.org';
    const checkinURL = `${siteURL}/admin/checkin?id=${asistenteId}`;
    
    const qrBuffer = await QRCode.toBuffer(checkinURL, {
      type: 'png',
      width: qrSize,
      margin: 1,
      color: { dark: qrDarkColor, light: '#00000000' }
    });

    // 5. Calcular posiciones
    const marginBot = Math.floor(H * 0.08);
    const qrX = Math.floor((W - qrSize) / 2);
    const qrY = H - qrSize - marginBot;
    
    const bandH = Math.floor(H * 0.14);
    const bandY = qrY - bandH - 20;

    // 6. Usar Satori para generar el SVG del texto
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: 'transparent',
            paddingTop: `${bandY}px`,
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  width: '100%',
                  height: `${bandH}px`,
                  backgroundColor: bandFill,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${Math.floor(W * 0.068)}px`,
                        fontWeight: 'bold',
                        color: textColor,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      },
                      children: nombre_completo,
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: `${Math.floor(W * 0.048)}px`,
                        fontWeight: 'bold',
                        color: textColor,
                        opacity: 0.85,
                        textAlign: 'center',
                      },
                      children: `Folio #${folio}`,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: W,
        height: H,
        fonts: [
          {
            name: 'Montserrat',
            data: fontBuffer,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );

    // 7. Renderizar SVG → PNG
    const resvg = new Resvg(svg, { fitTo: { mode: 'original' } });
    const overlayPngBuffer = resvg.render().asPng();

    // 8. Componer con sharp
    const finalBuffer = await sharp(templatePath)
      .composite([
        { input: overlayPngBuffer, top: 0, left: 0, blend: 'over' },
        { input: qrBuffer, top: qrY, left: qrX, blend: 'over' }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    // 9. Subir a Supabase
    const finalFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('tickets')
      .upload(finalFileName, finalBuffer, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw new Error(`Error Supabase: ${uploadError.message}`);

    console.log(`🚀 Ticket completado: tickets/${finalFileName}`);
    return { success: true, fileName: finalFileName };

  } catch (error: any) {
    console.error(`❌ Error en TicketGenerator: ${error.message}`);
    throw new Error(`Error en TicketGenerator: ${error.message}`);
  }
}
