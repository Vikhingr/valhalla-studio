/**
 * lib/types.ts — Tipos TypeScript centrales y catálogos SAT del sistema.
 *
 * Todos los tipos espejo de las tablas de Supabase están aquí.
 * Los catálogos SAT (regímenes fiscales, usos CFDI, formas de pago) son de solo
 * lectura (`as const`) para que TypeScript infiera los valores literales exactos.
 *
 * Tablas de Supabase:
 *   clients      → Client
 *   projects     → Project
 *   tasks        → Task
 *   cotizaciones → Cotizacion
 *   facturas     → Factura
 *   configuracion → ConfiguracionFiscal (fila única con id='global')
 */

// ─── Entidades principales ────────────────────────────────────────────────────

/** Cliente / contacto. protonpass_ref guarda el ID de la entrada en ProtonPass. */
export type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  notes: string | null
  protonpass_ref: string | null   // referencia al vault de ProtonPass (credenciales del cliente)
  rfc: string | null
  nombre_fiscal: string | null
  regimen_fiscal: string | null
  codigo_postal: string | null
  domicilio: string | null
  created_at: string
}

/** Etapas del pipeline de un proyecto, en orden cronológico típico */
export type ProjectStage =
  | 'cotizacion'
  | 'discovery'
  | 'diseno'
  | 'desarrollo'
  | 'revision'
  | 'entrega'
  | 'cobranza'
  | 'mantenimiento'

/** Proyecto. paid_amount acumula los pagos recibidos (puede ser parcial). */
export type Project = {
  id: string
  client_id: string | null
  name: string
  stage: ProjectStage
  start_date: string | null
  deadline: string | null
  quoted_price: number | null   // precio cotizado inicial
  paid_amount: number           // total recibido hasta ahora
  project_url: string | null
  notes: string | null
  protonpass_ref: string | null // credenciales del proyecto en ProtonPass
  created_at: string
  updated_at: string
  clients?: Client | null       // join de Supabase (solo en algunas queries)
}

export type TaskPriority  = 'alta' | 'media' | 'baja'
export type TaskStatus    = 'pendiente' | 'en_progreso' | 'listo'
/** depends_on indica si el siguiente paso depende de Gabriel o del cliente */
export type TaskDependsOn = 'me' | 'client'

export type Task = {
  id: string
  project_id: string | null
  title: string
  depends_on: TaskDependsOn
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  created_at: string
  projects?: Pick<Project, 'id' | 'name'> | null  // join parcial para la vista de pendientes
}

/** Cotización generada por el cotizador interactivo del panel */
export type Cotizacion = {
  id: string
  name: string
  project_type: string
  selected_features: { id: string; label: string; price: number }[]
  subtotal: number
  iva: number
  total: number
  with_iva: boolean
  anticipo: number
  anticipo_pagado: boolean
  pagado_completo: boolean
  created_at: string
}

/**
 * Factura emitida.
 *
 * tipo: 'pdf'  → solo guardada en Supabase, sin timbrado SAT (FacturAPI no configurado
 *                o error al timbrar). Archivo PDF generado localmente.
 *       'cfdi' → timbrada ante el SAT vía FacturAPI. cfdi_uuid es el UUID oficial.
 *
 * status: 'activa'    → vigente
 *         'cancelada' → cancelada ante el SAT (CFDI) o marcada manual (PDF)
 *
 * iva_retenido: solo aplica cuando el receptor es Persona Moral (RFC 12 chars);
 *               2/3 del IVA trasladado, obligatorio por Art. 1-A LIVA.
 */
export type Factura = {
  id: string
  tipo: 'pdf' | 'cfdi'
  status: 'activa' | 'cancelada'
  project_id: string | null
  cotizacion_id: string | null
  client_id: string | null
  receptor_rfc: string
  receptor_nombre: string
  receptor_regimen: string        // clave SAT del régimen fiscal del receptor
  receptor_cp: string             // código postal fiscal del receptor (obligatorio CFDI 4.0)
  uso_cfdi: string                // clave SAT del uso del CFDI (G03, S01, etc.)
  forma_pago: string              // clave SAT de la forma de pago (03 = transferencia, etc.)
  descripcion: string
  subtotal: number
  iva: number
  iva_retenido: number            // 0 para persona física; >0 para persona moral
  isr_retenido: number            // siempre 0 en este sistema (sin retención ISR)
  total: number                   // subtotal + iva - iva_retenido
  clave_prod_serv: string         // clave SAT del producto/servicio (catálogo SAT)
  clave_unidad: string            // clave SAT de la unidad (E48 = Servicio)
  facturapi_error: string | null  // mensaje de error si el timbrado falló
  cfdi_uuid: string | null        // UUID del CFDI timbrado (folio fiscal)
  cfdi_sello: string | null       // sello digital del emisor
  cfdi_sello_sat: string | null   // sello digital del SAT
  cfdi_fecha_timbrado: string | null
  cfdi_num_cert_sat: string | null
  facturapi_id: string | null     // ID interno de FacturAPI para consultas y cancelaciones
  fecha: string                   // fecha de emisión (YYYY-MM-DD)
  created_at: string
  clients?: Pick<Client, 'id' | 'name' | 'company'> | null  // join parcial
}

/**
 * Configuración fiscal del emisor.
 * Fila única en la tabla `configuracion` con id='global'.
 * Los campos has_* indican presencia sin exponer el valor (seguridad).
 */
export type ConfiguracionFiscal = {
  rfc_emisor: string | null
  nombre_emisor: string | null
  nombre_comercial: string | null
  regimen_fiscal: string | null
  codigo_postal: string | null
  domicilio_fiscal: string | null
  facturapi_mode: 'test' | 'live'
  has_facturapi_key: boolean     // true si la clave de FacturAPI está guardada (cifrada)
  has_cer: boolean               // true si el certificado CSD está guardado (cifrado)
  has_key: boolean               // true si la llave privada CSD está guardada (cifrada)
  has_password: boolean          // true si la contraseña CSD está guardada (cifrada)
  updated_at: string | null
  usos_cfdi_visibles: string[] | null  // subset de USOS_CFDI que aparece en el formulario
}

// ─── Catálogos SAT (CFDI 4.0) ────────────────────────────────────────────────

/** Catálogo c_RegimenFiscal del SAT — solo los activos/vigentes */
export const REGIMENES_FISCALES = [
  { value: '601', label: '601 — General de Ley Personas Morales' },
  { value: '603', label: '603 — Personas Morales sin fines lucrativos' },
  { value: '605', label: '605 — Sueldos y Salarios e Ingresos Asimilados' },
  { value: '606', label: '606 — Arrendamiento' },
  { value: '607', label: '607 — Enajenación o Adquisición de Bienes' },
  { value: '608', label: '608 — Demás ingresos' },
  { value: '610', label: '610 — Residentes en el Extranjero sin Establecimiento Permanente' },
  { value: '611', label: '611 — Ingresos por Dividendos' },
  { value: '612', label: '612 — Personas Físicas con Act. Empresariales y Profesionales' },
  { value: '614', label: '614 — Ingresos por intereses' },
  { value: '615', label: '615 — Ingresos por obtención de premios' },
  { value: '616', label: '616 — Sin obligaciones fiscales' },
  { value: '620', label: '620 — Sociedades Cooperativas de Producción' },
  { value: '621', label: '621 — Incorporación Fiscal' },
  { value: '622', label: '622 — Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { value: '623', label: '623 — Opcional para Grupos de Sociedades' },
  { value: '624', label: '624 — Coordinados' },
  { value: '625', label: '625 — Plataformas Tecnológicas' },
  { value: '626', label: '626 — RESICO — Régimen Simplificado de Confianza' },
] as const

/** Catálogo c_UsoCFDI del SAT */
export const USOS_CFDI = [
  { value: 'G01', label: 'G01 — Adquisición de mercancías' },
  { value: 'G02', label: 'G02 — Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 — Gastos en general' },
  { value: 'I01', label: 'I01 — Construcciones' },
  { value: 'I02', label: 'I02 — Mobiliario y equipo de oficina' },
  { value: 'I03', label: 'I03 — Equipo de transporte' },
  { value: 'I04', label: 'I04 — Equipo de cómputo y accesorios' },
  { value: 'I05', label: 'I05 — Dados, troqueles, moldes y herramental' },
  { value: 'I06', label: 'I06 — Comunicaciones telefónicas' },
  { value: 'I07', label: 'I07 — Comunicaciones satelitales' },
  { value: 'I08', label: 'I08 — Otra maquinaria y equipo' },
  { value: 'D01', label: 'D01 — Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D02', label: 'D02 — Gastos médicos por incapacidad o discapacidad' },
  { value: 'D03', label: 'D03 — Gastos funerales' },
  { value: 'D04', label: 'D04 — Donativos' },
  { value: 'D05', label: 'D05 — Intereses reales por créditos hipotecarios' },
  { value: 'D06', label: 'D06 — Aportaciones voluntarias al SAR' },
  { value: 'D07', label: 'D07 — Primas por seguros de gastos médicos' },
  { value: 'D08', label: 'D08 — Gastos de transportación escolar obligatoria' },
  { value: 'D09', label: 'D09 — Depósitos para el ahorro y planes de pensiones' },
  { value: 'D10', label: 'D10 — Pagos por servicios educativos (colegiaturas)' },
  { value: 'S01', label: 'S01 — Sin efectos fiscales' },
  { value: 'CP01', label: 'CP01 — Pagos' },
  { value: 'CN01', label: 'CN01 — Nómina' },
] as const

/** Regímenes exclusivos de Personas Morales — ayudan al formulario a preseleccionar retención */
export const PM_REGIMENES = new Set(['601', '603', '620', '622', '623', '624'])

/** Usos CFDI mostrados en el formulario de factura cuando no hay configuración guardada */
export const USOS_CFDI_DEFAULT = ['G01', 'G03', 'I04', 'S01', 'CP01']

/** Catálogo de servicios de Valhalla Studio con sus claves SAT correspondientes */
export const CATALOGO_SERVICIOS = [
  { id: 'landing',        label: 'Landing Page / Sitio informativo',  clave_prod_serv: '81112103', clave_unidad: 'E48' },
  { id: 'sitio_web',      label: 'Sitio Web (desarrollo)',             clave_prod_serv: '81111509', clave_unidad: 'E48' },
  { id: 'app_web',        label: 'Aplicación Web / Sistema',           clave_prod_serv: '81111509', clave_unidad: 'E48' },
  { id: 'app_movil',      label: 'App Móvil',                          clave_prod_serv: '81111504', clave_unidad: 'E48' },
  { id: 'diseno_grafico', label: 'Diseño Gráfico',                     clave_prod_serv: '82141504', clave_unidad: 'E48' },
  { id: 'automatizacion', label: 'Automatización / Integración',       clave_prod_serv: '81111504', clave_unidad: 'E48' },
  { id: 'mantenimiento',  label: 'Mantenimiento / Soporte web',        clave_prod_serv: '81111509', clave_unidad: 'E48' },
] as const

/** Catálogo c_FormaPago del SAT — solo las más usadas */
export const FORMAS_PAGO = [
  { value: '01', label: '01 — Efectivo' },
  { value: '02', label: '02 — Cheque nominativo' },
  { value: '03', label: '03 — Transferencia electrónica de fondos' },
  { value: '04', label: '04 — Tarjeta de crédito' },
  { value: '28', label: '28 — Tarjeta de débito' },
  { value: '99', label: '99 — Por definir' },
] as const

// ─── Constantes UI ────────────────────────────────────────────────────────────

/** Color oklch para cada etapa del pipeline — usado en badges y timeline */
export const STAGES: { id: ProjectStage; label: string; color: string }[] = [
  { id: 'cotizacion',    label: 'Cotización',    color: 'oklch(0.65 0.10 60)' },
  { id: 'discovery',    label: 'Discovery',     color: 'oklch(0.65 0.15 200)' },
  { id: 'diseno',       label: 'Diseño',        color: 'oklch(0.68 0.18 293)' },
  { id: 'desarrollo',   label: 'Desarrollo',    color: 'oklch(0.65 0.20 250)' },
  { id: 'revision',     label: 'Revisión',      color: 'oklch(0.65 0.15 170)' },
  { id: 'entrega',      label: 'Entrega',       color: 'oklch(0.70 0.18 160)' },
  { id: 'cobranza',     label: 'Cobranza',      color: 'oklch(0.65 0.12 40)' },
  { id: 'mantenimiento',label: 'Mantenimiento', color: 'oklch(0.65 0.08 280)' },
]

/** Color oklch para cada nivel de prioridad de tareas */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta:  'oklch(0.65 0.18 25)',
  media: 'oklch(0.65 0.15 60)',
  baja:  'oklch(0.65 0.08 280)',
}

/** Etiquetas en español para los estados de una tarea */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente:   'Pendiente',
  en_progreso: 'En progreso',
  listo:       'Listo',
}
