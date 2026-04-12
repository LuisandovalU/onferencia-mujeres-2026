/**
 * Genera un timestamp en formato ISO pero ajustado a la zona horaria de México (CST -06:00).
 * Esto asegura que al ver los datos en paneles que no manejan zonas horarias, 
 * la hora coincida con el reloj local de México.
 */
export function getMXTimestamp() {
  const now = new Date();
  // Mexico City está en UTC-6 (y ya no usa horario de verano en la mayor parte del país)
  const offset = -6;
  const mxDate = new Date(now.getTime() + (offset * 60 * 60 * 1000));
  
  // Retornamos una cadena ISO pero reemplazamos la Z por el ajuste -06:00
  return mxDate.toISOString().replace('Z', '-06:00');
}

/**
 * Retorna la fecha y hora legible para logs o mensajes.
 */
export function getMXReadable() {
  return new Date().toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    dateStyle: 'short',
    timeStyle: 'medium'
  });
}
