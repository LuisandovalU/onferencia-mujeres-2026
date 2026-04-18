// Shared types for ManualRegistration module

export interface Stats {
  total: number;
  pagado: number;
  pendiente: number;
  brave: number;
  valiente: number;
  casa: number;
  visita: number;
}

export interface FormData {
  nombre: string;
  whatsapp: string;
  email: string;
  es_brave: boolean;
  es_casa: boolean;
  referido_por: string;
  monto_pagado: string;
  metodo_pago: string;
}

export interface ResultMessage {
  success?: boolean;
  error?: string;
  ticketUrl?: string;
  mensaje?: string;
}

export interface Asistente {
  id: string;
  nombre_completo: string;
  whatsapp: string;
  es_casa: boolean;
  es_brave: boolean;
  status_pago: string;
  monto_total: number;
  monto_pagado: number;
  folio?: number;
}
