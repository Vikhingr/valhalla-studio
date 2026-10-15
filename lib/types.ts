export type Client = {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  notes: string | null
  protonpass_ref: string | null
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
