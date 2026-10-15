export type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  notes: string | null
  protonpass_ref: string | null
  rfc: string | null
  nombre_fiscal: string | null
  regimen_fiscal: string | null
  codigo_postal: string | null
  domicilio: string | null
  created_at: string
}

export type ProjectStage =
  | 'cotizacion'
  | 'discovery'
  | 'diseno'
  | 'desarrollo'
  | 'revision'
  | 'entrega'
  | 'cobranza'
  | 'mantenimiento'

export type Project = {
  id: string
  client_id: string | null
  name: string
  stage: ProjectStage
  start_date: string | null
  deadline: string | null
  quoted_price: number | null
  paid_amount: number
  project_url: string | null
  notes: string | null
  protonpass_ref: string | null
  created_at: string
  updated_at: string
  clients?: Client | null
}

export type TaskPriority = 'alta' | 'media' | 'baja'
export type TaskStatus = 'pendiente' | 'en_progreso' | 'listo'
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
  projects?: Pick<Project, 'id' | 'name'> | null
}

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

export type Factura = {
  id: string
  tipo: 'pdf' | 'cfdi'
  status: 'activa' | 'cancelada'
  project_id: string | null
  cotizacion_id: string | null
  client_id: string | null
  receptor_rfc: string
  receptor_nombre: string
  receptor_regimen: string
  receptor_cp: string
  uso_cfdi: string
  forma_pago: string
  descripcion: string
  subtotal: number
  iva: number
  iva_retenido: number
  isr_retenido: number
  total: number
  clave_prod_serv: string
  clave_unidad: string
  facturapi_error: string | null
  cfdi_uuid: string | null
  cfdi_sello: string | null
  cfdi_sello_sat: string | null
  cfdi_fecha_timbrado: string | null
  cfdi_num_cert_sat: string | null
  facturapi_id: string | null
  fecha: string
  created_at: string
  clients?: Pick<Client, 'id' | 'name' | 'company'> | null
}

export type ConfiguracionFiscal = {
  rfc_emisor: string | null
  nombre_emisor: string | null
  nombre_comercial: string | null
  regimen_fiscal: string | null
  codigo_postal: string | null
  domicilio_fiscal: string | null
  facturapi_mode: 'test' | 'live'
  has_facturapi_key: boolean
  has_cer: boolean
  has_key: boolean
  has_password: boolean
  updated_at: string | null
  usos_cfdi_visibles: string[] | null
}

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

// Regímenes que corresponden exclusivamente a Personas Morales
export const PM_REGIMENES = new Set(['601', '603', '620', '622', '623', '624'])

// Usos CFDI visibles por defecto cuando no hay configuración guardada
export const USOS_CFDI_DEFAULT = ['G01', 'G03', 'I04', 'S01', 'CP01']

// Catálogo de servicios digitales con sus claves SAT
export const CATALOGO_SERVICIOS = [
  { id: 'landing',        label: 'Landing Page / Sitio informativo',  clave_prod_serv: '81112103', clave_unidad: 'E48' },
  { id: 'sitio_web',      label: 'Sitio Web (desarrollo)',             clave_prod_serv: '81111509', clave_unidad: 'E48' },
  { id: 'app_web',        label: 'Aplicación Web / Sistema',           clave_prod_serv: '81111509', clave_unidad: 'E48' },
  { id: 'app_movil',      label: 'App Móvil',                          clave_prod_serv: '81111504', clave_unidad: 'E48' },
  { id: 'diseno_grafico', label: 'Diseño Gráfico',                     clave_prod_serv: '82141504', clave_unidad: 'E48' },
  { id: 'automatizacion', label: 'Automatización / Integración',       clave_prod_serv: '81111504', clave_unidad: 'E48' },
  { id: 'mantenimiento',  label: 'Mantenimiento / Soporte web',        clave_prod_serv: '81111509', clave_unidad: 'E48' },
] as const

export const FORMAS_PAGO = [
  { value: '01', label: '01 — Efectivo' },
  { value: '02', label: '02 — Cheque nominativo' },
  { value: '03', label: '03 — Transferencia electrónica de fondos' },
  { value: '04', label: '04 — Tarjeta de crédito' },
  { value: '28', label: '28 — Tarjeta de débito' },
  { value: '99', label: '99 — Por definir' },
] as const

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  alta:  'oklch(0.65 0.18 25)',
  media: 'oklch(0.65 0.15 60)',
  baja:  'oklch(0.65 0.08 280)',
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pendiente:   'Pendiente',
  en_progreso: 'En progreso',
  listo:       'Listo',
}
