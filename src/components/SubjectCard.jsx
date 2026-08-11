import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trash2, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { updateSubject } from '../services/subjectService'
import toast from 'react-hot-toast'

export default function SubjectCard({ subject, resourceCount = 0, accent = '#B89653', onDelete, onUpdate }) {
  const { user } = useAuth()
  const isCreator = user?.id === subject.created_by

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(subject.name)
  const [saving, setSaving] = useState(false)

  const letters = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const empty = resourceCount === 0

  async function handleSave() {
    if (!name.trim()) { toast.error('El nombre no puede estar vacío'); return }
    setSaving(true)
    try {
      const updated = await updateSubject(subject.id, name.trim())
      toast.success('Materia actualizada')
      setEditing(false)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error('No se pudo actualizar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setName(subject.name)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-paper-rule shadow-card p-5">
        <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center mb-4">
          <span className="font-mono text-[11px] font-medium text-ink-500">{letters}</span>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus
          className="w-full px-3 py-2 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
          placeholder="Nombre de la materia" />
        <div className="flex gap-2 mt-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold rounded-lg transition-colors">
            <Check className="w-3.5 h-3.5" /> {saving ? 'Guardando…' : 'Guardar'}
          </button>
          <button onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-ink-500 hover:bg-paper text-xs font-semibold rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white rounded-xl border border-paper-rule shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
      {isCreator && (
        <div className="absolute top-3 right-3 flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
          <button onClick={e => { e.preventDefault(); setEditing(true) }} title="Editar"
            className="p-1.5 rounded-md text-ink-300 hover:text-ink-700 hover:bg-paper transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.preventDefault(); onDelete(subject) }} title="Eliminar"
            className="p-1.5 rounded-md text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Link to={`/semester/${subject.semester}/subject/${subject.id}`} className="block p-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
             style={{ backgroundColor: `${accent}18` }}>
          <span className="font-mono text-[11px] font-medium" style={{ color: accent }}>
            {letters}
          </span>
        </div>

        <h3 className="font-display text-[17px] font-semibold leading-tight text-ink-900 pr-8 line-clamp-2">
          {name}
        </h3>

        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-paper-rule">
          <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
            empty ? 'text-ink-300' : 'text-ink-500'
          }`}>
            {empty ? 'Vacía' : `${resourceCount} recurso${resourceCount !== 1 ? 's' : ''}`}
          </span>
          <ArrowRight className="w-4 h-4 text-ink-200 group-hover:text-ink-700 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </div>
  )
}