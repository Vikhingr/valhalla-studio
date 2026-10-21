/**
 * lib/decoraciones.ts — Decoraciones de temporada del portafolio (página principal).
 *
 * Cada decoración tiene un rango de fechas "MM-DD" (hora de CDMX) y un interruptor.
 * Las fiestas que la ley mueve a lunes (Constitución, Benito Juárez, Revolución) tienen
 * además una regla `lunes` (ej. tercer lunes de marzo) que se calcula sola cada año,
 * y un `modo` para mostrar el lunes de descanso, el día histórico o ambos.
 *
 * El panel (/admin/decoraciones) guarda los cambios en configuracion.decoraciones (jsonb).
 * La página pública consulta /api/decoraciones y dibuja la que toque ese día.
 * IMPORTANTE: public/index.html tiene la misma lista como respaldo (CONFIG.decoraciones).
 */

export type DecoracionId =
  | 'anonuevo' | 'reyes' | 'constitucion' | 'amor' | 'juarez' | 'trabajo'
  | 'patrias' | 'halloween' | 'muertos' | 'revolucion' | 'guadalupe' | 'navidad'

export type ModoLunes = 'ambos' | 'lunes' | 'historico'

export type Decoracion = {
  id: DecoracionId
  nombre: string
  desde: string   // "MM-DD" (en fiestas con regla de lunes: el día histórico)
  hasta: string   // "MM-DD"
  activa: boolean
  lunes?: { mes: number; n: number }   // n-ésimo lunes del mes (día de descanso oficial)
  modo?: ModoLunes
}

export const DECORACIONES_DEFAULT: Decoracion[] = [
  { id: 'anonuevo',     nombre: 'Año Nuevo',                 desde: '12-31', hasta: '01-01', activa: true },
  { id: 'reyes',        nombre: 'Día de Reyes',              desde: '01-06', hasta: '01-06', activa: true },
  { id: 'constitucion', nombre: 'Día de la Constitución',    desde: '02-05', hasta: '02-05', activa: true, lunes: { mes: 2, n: 1 },  modo: 'ambos' },
  { id: 'amor',         nombre: 'Día del Amor y la Amistad', desde: '02-14', hasta: '02-14', activa: true },
  { id: 'juarez',       nombre: 'Natalicio de Benito Juárez', desde: '03-21', hasta: '03-21', activa: true, lunes: { mes: 3, n: 3 }, modo: 'ambos' },
  { id: 'trabajo',      nombre: 'Día del Trabajo',           desde: '05-01', hasta: '05-01', activa: true },
  { id: 'patrias',      nombre: 'Fiestas Patrias',           desde: '09-15', hasta: '09-16', activa: true },
  { id: 'halloween',    nombre: 'Halloween',                 desde: '10-31', hasta: '10-31', activa: true },
  { id: 'muertos',      nombre: 'Día de Muertos',            desde: '11-01', hasta: '11-02', activa: true },
  { id: 'revolucion',   nombre: 'Día de la Revolución',      desde: '11-20', hasta: '11-20', activa: true, lunes: { mes: 11, n: 3 }, modo: 'ambos' },
  { id: 'guadalupe',    nombre: 'Día de la Virgen de Guadalupe', desde: '12-12', hasta: '12-12', activa: true },
  { id: 'navidad',      nombre: 'Navidad',                   desde: '12-24', hasta: '12-25', activa: true },
]

/** Qué incluye cada decoración (se muestra en el panel). */
export const DECORACIONES_DETALLE: Record<DecoracionId, string> = {
  anonuevo:     'Banderines dorados con "FELIZ" y el año, globos, confeti y un cartel "¡Feliz Año Nuevo!".',
  reyes:        'Guirnalda de estrellas, rosca de reyes, regalos y un cartel "Feliz Día de Reyes".',
  constitucion: 'Banderines tricolor, pergaminos y libros, y un cartel "Constitución de 1917".',
  amor:         'Guirnalda de corazones, globos de corazón, corazones flotando y un cartel de felicitación.',
  juarez:       'Banderines tricolor, flores de jacaranda, libros y la frase "El respeto al derecho ajeno es la paz".',
  trabajo:      'Banderines azul y dorado, cascos de obra y cajas de herramientas.',
  patrias:      'Papel picado verde, blanco y rojo, globos tricolor, confeti y un cartel "¡Viva México!".',
  halloween:    'Murciélagos, calabazas, velas, telarañas y un cartel "¡Feliz Halloween!".',
  muertos:      'Papel picado, cempasúchil, velas, camino de pétalos y un cartel "Día de Muertos".',
  revolucion:   'Papel picado tricolor, sombreros de palma y un cartel "Revolución de 1910".',
  guadalupe:    'Mural de la Virgen de Guadalupe en la pared, papel picado rosa y turquesa, rosas y veladoras.',
  navidad:      'Serie de foquitos, pinos, regalos, nieve cayendo y un cartel "¡Feliz Navidad!".',
}

export const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const MODOS: ModoLunes[] = ['ambos', 'lunes', 'historico']

/** Combina lo guardado con los valores de fábrica (ignora ids desconocidos o datos inválidos). */
export function mezclarDecoraciones(guardadas: unknown): Decoracion[] {
  const lista = Array.isArray(guardadas) ? guardadas : []
  return DECORACIONES_DEFAULT.map((d) => {
    const g = lista.find((x: { id?: unknown }) => x && x.id === d.id) as Partial<Decoracion> | undefined
    if (!g) return d
    return {
      ...d,
      desde: typeof g.desde === 'string' && MMDD.test(g.desde) ? g.desde : d.desde,
      hasta: typeof g.hasta === 'string' && MMDD.test(g.hasta) ? g.hasta : d.hasta,
      activa: typeof g.activa === 'boolean' ? g.activa : d.activa,
      ...(d.lunes ? { modo: MODOS.includes(g.modo as ModoLunes) ? (g.modo as ModoLunes) : d.modo } : {}),
    }
  })
}

/** Hoy en CDMX: { v: MMDD como número (ej. 1031), y: año }. */
export function hoyCDMX(fecha = new Date()): { v: number; y: number } {
  const n = new Date(fecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }))
  return { v: (n.getMonth() + 1) * 100 + n.getDate(), y: n.getFullYear() }
}

/** Día del mes del n-ésimo lunes (ej. tercer lunes de marzo de 2027 → 15). */
export function nLunes(anio: number, mes: number, n: number): number {
  const dow = new Date(Date.UTC(anio, mes - 1, 1)).getUTCDay()
  return 1 + ((1 - dow + 7) % 7) + (n - 1) * 7
}

const num = (mmdd: string) => Number(mmdd.slice(0, 2)) * 100 + Number(mmdd.slice(3, 5))

export function enRango(d: Pick<Decoracion, 'desde' | 'hasta' | 'lunes' | 'modo'>, hoy = hoyCDMX()): boolean {
  const a = num(d.desde), b = num(d.hasta)
  const historico = a <= b ? hoy.v >= a && hoy.v <= b : hoy.v >= a || hoy.v <= b
  if (!d.lunes) return historico
  const esLunes = hoy.v === d.lunes.mes * 100 + nLunes(hoy.y, d.lunes.mes, d.lunes.n)
  if (d.modo === 'lunes') return esLunes
  if (d.modo === 'historico') return historico
  return esLunes || historico
}

/** La decoración que se ve hoy (la primera activa cuyo rango incluye hoy), o null. */
export function decoracionDeHoy(lista: Decoracion[], hoy = hoyCDMX()): Decoracion | null {
  return lista.find((d) => d.activa && enRango(d, hoy)) ?? null
}
