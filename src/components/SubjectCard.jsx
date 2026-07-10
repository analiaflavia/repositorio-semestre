import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { updateSubject } from '../services/subjectService'
import toast from 'react-hot-toast'

export default function SubjectCard({ subject, resourceCount = 0, onDelete, onUpdate }) {
  const { user } = useAuth()
  const isCreator = user?.id === subject.created_by

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subject.name)
  const [saving, setSaving] = useState(false)

  const letters = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  async function handleSave() {
    if (!name.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setSaving(true)
    try {
      const updated = await updateSubject(subject.id, name.trim())
      toast.success('Materia actualizada')
      setEditing(false)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error('Error al actualizar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(subject.name)
    setEditing(false)
  }

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">

      {/* Botones acción */}
      {isCreator && !editing && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 z-10">
          <button onClick={e => { e.preventDefault(); setEditing(true) }}
            className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
            title="Editar materia">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.preventDefault(); onDelete(subject) }}
            className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
            title="Eliminar materia">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {editing ? (
        <div className="p-5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <span className="text-brand-700 font-bold text-sm">{letters}</span>
          </div>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Nombre de la materia" />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Check className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <Link to={`/semester/${subject.semester}/subject/${subject.id}`} className="block p-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <span className="text-brand-700 font-bold text-sm">{letters}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 pr-6 line-clamp-2">{name}</h3>
          <p className="text-xs text-gray-400 mb-3">Semestre {subject.semester}</p>
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-500">
              <FileText className="w-3.5 h-3.5" />
              <span className="text-xs">{resourceCount} recurso{resourceCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
          </div>
        </Link>
      )}
    </div>
  )
}