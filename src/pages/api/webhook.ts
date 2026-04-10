import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';
import { registerFont, createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import path from 'node:path';

// Usamos la variable de entorno para inicializar Stripe
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    if (!sig || !endpointSecret) throw new Error('Missing stripe signature or secret');
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const evtType = event.type;
  
  if (evtType === 'checkout.session.completed' || evtType === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // 1. BUSCAMOS SI YA LA TENÍAMOS REGISTRADA (OXXO pagado tardío)
    const { data: existingData } = await supabase
      .from('asistentes')
      .select('*')
      .eq('stripe_session_id', session.id)
      .single();

    let objAsistente = existingData;
    let asistenteId = existingData?.id;

    // 2. INSERCIÓN DE NUEVO USUARIO
    if (!existingData) {
      if (!session.metadata?.nombre) {
        console.warn('Session sin metadata de nombre:', session.id);
        return new Response('No metadata found', { status: 400 });
      }

      const { data: dbData, error: insertError } = await supabase
        .from('asistentes')
        .insert([{
          nombre_completo: session.metadata.nombre,
          whatsapp: session.metadata.whatsapp,
          es_brave: session.metadata.es_brave === 'true',
          es_casa: session.metadata.es_casa === 'true',
          referido_por: session.metadata.quien_invito || 'N/A',
          monto_total: 130,
          status_pago: session.payment_status === 'paid' ? 'completado' : 'pendiente',
          monto_pagado: session.payment_status === 'paid' ? (session.amount_total || 0) / 100 : 0,
          stripe_session_id: session.id
        }])
        .select()
        .single();
        
      if (insertError || !dbData) {
        console.error('Error insertando nuevo usuario en supabase:', insertError);
        return new Response('Database Error', { status: 500 });
      }
      objAsistente = dbData;
      asistenteId = dbData.id;
      console.log('Nuevo asistente registrado desde Webhook, estado:', objAsistente.status_pago);
    } else {
      // 3. ACTUALIZACIÓN (Si era OXXO Pendiente y ahora lo pagó - async_payment)
      if (session.payment_status === 'paid' && existingData.status_pago !== 'completado') {
        const { data: updated } = await supabase
          .from('asistentes')
          .update({ 
            status_pago: 'completado', 
            monto_pagado: (session.amount_total || 0) / 100 
          })
          .eq('id', asistenteId)
          .select()
          .single();
        objAsistente = updated;
        console.log('Asistente existente OXXO actualizado a PAGADO!');
      }
    }

    // Si aún no está cobrado (OXXO ficha sin pagar), truncamos y ahorramos el CPU del Ticket
    if (session.payment_status !== 'paid') {
      return new Response('Registrado como pendiente OXXO. Recibo esperado más tarde.', { status: 200 });
    }

    // 4. Generación del Ticket con Código QR (SOLO SI YA ESTÁ PAGADO)
    try {
      const baseURL = new URL(request.url).origin;
      const checkinURL = `${baseURL}/admin/checkin?id=${asistenteId}`;
      
      const qrDataURL = await QRCode.toDataURL(checkinURL, {
        width: 300,
        margin: 1,
        color: { 
          dark: objAsistente.es_brave ? '#FFFFFFFF' : '#000000FF', 
          light: '#00000000' // Fondo transparente para que luzca tu diseño botánico
        }
      });

      const templateName = objAsistente.es_brave ? 'brave.jpg' : 'valiente.jpg';
      const templatePath = path.join(process.cwd(), 'src/assets', templateName); 
      
      let canvasWidth = 1080;
      let canvasHeight = 1920;
      
      try {
        registerFont(path.join(process.cwd(), 'public', 'fonts', 'Montserrat-Bold.ttf'), { family: 'Montserrat' });
        registerFont(path.join(process.cwd(), 'public', 'fonts', 'Nunito-Bold.ttf'), { family: 'Nunito' });
      } catch (fontErr) {
        console.warn('No pudimos precargar fuentes personalizadas', fontErr);
      }

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      let templateObj;
      try {
        templateObj = await loadImage(templatePath);
        canvasWidth = templateObj.width;
        canvasHeight = templateObj.height;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx.drawImage(templateObj, 0, 0, canvasWidth, canvasHeight);
      } catch (e) {
        console.warn(`No se encontró plantilla en ${templatePath}. Creando fondo de respaldo.`);
        ctx.fillStyle = objAsistente.es_brave ? '#EFEFEF' : '#FFF5EE';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Mates Dinámicas Relativas para respetar cualquier resolución de tu imagen
      const qrImageObj = await loadImage(qrDataURL);
      const qrSize = canvasWidth * 0.45; // Lo crecimos del 35% al 45% del ancho
      const marginBot = canvasHeight * 0.08; // 8% de colchón abajo para despegarlo más
      const qrX = (canvasWidth - qrSize) / 2;
      const qrY = canvasHeight - qrSize - marginBot; 
      
      ctx.drawImage(qrImageObj, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = objAsistente.es_brave ? '#FFFFFF' : '#1A1A1A';
      
      // Fuente más grande y vistosa para el Nombre
      const nameFontSize = Math.floor(canvasWidth * 0.078);
      const textMargin = Math.floor(canvasHeight * 0.03);
      
      ctx.font = `bold ${nameFontSize}px "Montserrat", sans-serif`;
      ctx.textAlign = 'center';
      // Nombre arriba del QR
      ctx.fillText(objAsistente.nombre_completo, canvasWidth / 2, qrY - (textMargin * 2));

      // Folio también más grande y legible
      const folioFontSize = Math.floor(canvasWidth * 0.055);
      ctx.font = `bold ${folioFontSize}px "Nunito", sans-serif`;
      ctx.fillStyle = objAsistente.es_brave ? '#EAEAEA' : '#333333';
      ctx.fillText(`Folio #${objAsistente.folio}`, canvasWidth / 2, qrY - textMargin);

      const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

      // 5. Subir Ticket usando el ID Único de Sesión para descarga frontal mágica
      const fileName = `${session.id}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tickets')
        .upload(fileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading to Storage:', uploadError);
      } else {
        console.log(`Ticket generado exitosamente: ${fileName} en Storage.`);
      }

    } catch (qrErr) {
      console.error('Error generando el QR/Ticket:', qrErr);
    }
  }

  return new Response('Webhook recibido', { status: 200 });
};
