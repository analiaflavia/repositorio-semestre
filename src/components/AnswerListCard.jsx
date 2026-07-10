import { useState } from 'react'
import { Trash2, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { updateAnswerList, deleteAnswerList } from '../services/answerListService'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function AnswerListCard({ list, onDelete, onUpdate }) {
  const { user, profile } = useAuth()
  const isCreator = user?.id === list.created_by

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [text, setText] = useState(
    Array.isArray(list.answers)
      ? list.answers.map(a => a.text || '').join('\n')
      : ''
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) { toast.error('El título no puede estar vacío'); return }
    setSaving(true)
    try {
      const lines = text.split('\n').filter(l => l.trim())
      const answers = lines.map(l => ({ text: l }))
      const updated = await updateAnswerList(list.id, {
        title: title.trim(),
        answers,
        updatedByName: profile?.full_name || user.email,
      })
      toast.success('Lista actualizada')
      setEditing(false)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error('Error al guardar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setTitle(list.title)
    setText(Array.isArray(list.answers) ? list.answers.map(a => a.text || '').join('\n') : '')
    setEditing(false)
  }

  const lines = Array.isArray(list.answers) ? list.answers : []

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 mb-1"
                placeholder="Título de la lista" />
            ) : (
              <h3 className="font-semibold text-gray-900 text-sm">{list.title}</h3>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {list.created_by_name} · {format(new Date(list.created_at), 'd MMM yyyy', { locale: es })}
              {list.updated_by_name && ` · Editado por ${list.updated_by_name}`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{lines.length} {lines.length === 1 ? 'entrada' : 'entradas'}</p>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            {!editing && (
              <button onClick={() => { setEditing(true); setExpanded(true) }}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors"
                title="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {isCreator && !editing && (
              <button onClick={() => onDelete(list)}
                className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                title="Eliminar">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {!editing && (
              <button onClick={() => setExpanded(p => !p)}
                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors">
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1.5">Escribe cada entrada en una línea separada</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
              placeholder={"1. achondroplasia\n2. molecular mimicry\n3. diabetes insipida"}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y font-mono"
            />
            <div className="flex gap-2 mt-2">
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
        )}

        {expanded && !editing && lines.length > 0 && (
          <div className="mt-3 space-y-1">
            {lines.map((a, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{a.text}</p>
            ))}
          </div>
        )}

        {expanded && !editing && lines.length === 0 && (
          <p className="mt-3 text-xs text-gray-400 italic">Lista vacía — haz clic en editar para agregar entradas.</p>
        )}
      </div>
    </div>
  )
}