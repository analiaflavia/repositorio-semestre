import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const accent = {
  '12': '#B89653',
  '13': '#6E7E9B',
  '14': '#8A7CA8',
  '15': '#5F8A8B',
  '16': '#9B7B6B',
}

function ProgressRing({ pct, color }) {
  const size = 40
  const stroke = 3
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E6E3DC" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-medium text-ink-500">
        {pct}
      </span>
    </div>
  )
}

export default function SemesterCard({ semester, subjectCount = 0, stats = {}, coverage = 0 }) {
  const color = accent[semester.id] || accent['12']
  const lastUpdate = stats.lastUpdate
    ? format(new Date(stats.lastUpdate), "d MMM yyyy", { locale: es })
    : null

  return (
    <Link
      to={`/semester/${semester.id}`}
      className="group block bg-white rounded-xl border border-paper-rule shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <span className="block h-[3px]" style={{ backgroundColor: color }} />

      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-300">
            Semestre
          </p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="font-display text-[44px] leading-none font-semibold tracking-tight" style={{ color }}>
              {semester.id}
            </span>
            <span className="text-sm text-ink-400 font-medium">{semester.label}</span>
          </div>
        </div>

        {subjectCount > 0 && <ProgressRing pct={coverage} color={color} />}
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 border-t border-paper-rule pt-3.5">
          <Stat value={subjectCount} label="Materias" />
          <Stat value={stats.files || 0} label="Archivos" />
          <Stat value={stats.joseos || 0} label="Joseos" accent={color} />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="font-mono text-[10px] text-ink-300">
            {lastUpdate ? `Act. ${lastUpdate}` : 'Sin actividad'}
          </p>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 group-hover:gap-2.5 transition-all">
            Ver materias <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function Stat({ value, label, accent }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold leading-none"
         style={accent ? { color: accent } : { color: '#16294A' }}>
        {value}
      </p>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-300 mt-1.5">
        {label}
      </p>
    </div>
  )
}