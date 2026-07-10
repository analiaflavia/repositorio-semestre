import { useState } from 'react'
import { Trash2, Pencil, Check, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { updateAnswerList, deleteAnswerList } from '../services/answerListService'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const OPTIONS = ['A', 'B', 'C', 'D', 'E', 'V', 'F']

export default function AnswerListCard({ list, onDelete, onUpdate }) {
  const { user, profile } = useAuth()
  const isCreator = user?.id === list.created_by

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const [answers, setAnswers] = useState(list.answers || [])
  const [saving, setSaving] = useState(false)

  function handleAnswerChange(index, value) {
    const updated = [...answers]
    updated[index] = { ...updated[index], answer: value }
    setAnswers(updated)
  }

  function addAnswer() {
    setAnswers(prev => [...prev, { question: prev.length + 1, answer: 'A' }])
  }

  function removeAnswer(index) {
    const updated = answers.filter((_, i) => i !== index)
      .map((a, i) => ({ ...a, question: i + 1 }))
    setAnswers(updated)
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('El título no puede estar vacío'); return }
    setSaving(true)
    try {
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
    setAnswers(list.answers || [])
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Título de la lista" />
            ) : (
              <h3 className="font-semibold text-gray-900 text-sm">{list.title}</h3>
            )}
            <p className="text-xs text-gray-400 mt-0.5">
              {list.created_by_name} · {format(new Date(list.created_at), 'd MMM yyyy', { locale: es })}
              {list.updated_by_name && ` · Editado por ${list.updated_by_name}`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{list.answers?.length || 0} respuestas</p>
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

        {(expanded || editing) && (
          <div className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {answers.map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
                  <span className="text-xs font-medium text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                  {editing ? (
                    <>
                      <select value={a.answer} onChange={e => handleAnswerChange(i, e.target.value)}
                        className="flex-1 text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                        {OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <button onClick={() => removeAnswer(i)}
                        className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-brand-700">{a.answer}</span>
                  )}
                </div>
              ))}
            </div>

            {editing && (
              <button onClick={addAnswer}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors mb-3">
                <Plus className="w-3.5 h-3.5" /> Agregar pregunta
              </button>
            )}

            {editing && (
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}