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
  total: number
  cfdi_uuid: string | null
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
  facturapi_mode: 'test' | 'live'
  has_facturapi_key: boolean
  has_cer: boolean
  has_key: boolean
  has_password: boolean
  updated_at: string | null
}

export const REGIMENES_FISCALES = [
  { value: '601', label: '601 — General de Ley Personas Morales' },
  { value: '603', label: '603 — Personas Morales sin fines lucrativos' },
  { value: '606', label: '606 — Arrendamiento' },
  { value: '608', label: '608 — Demás ingresos' },
  { value: '612', label: '612 — Personas Físicas con Act. Empresariales y Profesionales' },
  { value: '616', label: '616 — Sin obligaciones fiscales' },
  { value: '621', label: '621 — Incorporación Fiscal' },
  { value: '625', label: '625 — Plataformas Tecnológicas' },
  { value: '626', label: '626 — RESICO — Régimen Simplificado de Confianza' },
] as const

export const USOS_CFDI = [
  { value: 'G01', label: 'G01 — Adquisición de mercancias' },
  { value: 'G03', label: 'G03 — Gastos en general' },
  { value: 'I04', label: 'I04 — Equipo de cómputo y accesorios' },
  { value: 'P01', label: 'P01 — Por definir' },
  { value: 'S01', label: 'S01 — Sin efectos fiscales' },
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
