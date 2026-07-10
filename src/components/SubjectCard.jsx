import { Link } from 'react-router-dom'
import { FileText, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function SubjectCard({ subject, resourceCount = 0, onDelete }) {
  const { user } = useAuth()
  const isCreator = user?.id === subject.created_by

  const letters = subject.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Delete button */}
      {isCreator && (
        <button
          onClick={e => { e.preventDefault(); onDelete(subject) }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all z-10"
          title="Eliminar materia"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      <Link to={`/semester/${subject.semester}/subject/${subject.id}`} className="block p-5">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
          <span className="text-brand-700 font-bold text-sm">{letters}</span>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 pr-6 line-clamp-2">
          {subject.name}
        </h3>
        <p className="text-xs text-gray-400 mb-3">Semestre {subject.semester}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-gray-500">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-xs">{resourceCount} recurso{resourceCount !== 1 ? 's' : ''}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
        </div>
      </Link>
    </div>
  )
}
