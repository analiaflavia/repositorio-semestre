import { Link } from 'react-router-dom'
import { BookOpen, FileText, Link2, Zap, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const gradients = {
  '12': 'from-blue-500   to-blue-600',
  '13': 'from-indigo-500 to-indigo-600',
  '14': 'from-violet-500 to-violet-600',
  '15': 'from-sky-500    to-sky-600',
  '16': 'from-cyan-500   to-cyan-600',
}

export default function SemesterCard({ semester, subjectCount = 0, stats = {} }) {
  const gradient = gradients[semester.id] || gradients['12']
  const lastUpdate = stats.lastUpdate
    ? format(new Date(stats.lastUpdate), "d MMM yyyy", { locale: es })
    : '—'

  return (
    <Link
      to={`/semester/${semester.id}`}
      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:-translate-y-0.5"
    >
      {/* Header gradient */}
      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Semestre</p>
            <h3 className="text-3xl font-bold">{semester.id}</h3>
            <p className="text-white/80 text-sm mt-0.5">{semester.label}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatItem icon={<BookOpen className="w-3.5 h-3.5" />} value={subjectCount} label="Materias" />
          <StatItem icon={<FileText className="w-3.5 h-3.5" />} value={stats.files || 0}  label="Archivos" />
          <StatItem icon={<Zap className="w-3.5 h-3.5" />}      value={stats.joseos || 0} label="Joseos"   color="text-amber-600" />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">Actualizado: {lastUpdate}</p>
          <span className="flex items-center gap-1 text-xs font-medium text-brand-600 group-hover:gap-2 transition-all">
            Ver materias <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function StatItem({ icon, value, label, color = 'text-gray-600' }) {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${color}`}>
        {icon}
        <span>{value}</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
