import { useEffect, useState } from 'react'
import { HandHelping, Plus, Check, Trash2, X } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { getRequests, createRequest, fulfillRequest, deleteRequest } from '../services/requestService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function RequestBoard({ semester, subjectId, subjectName }) {
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    getRequests(subjectId).then(setRequests).catch(() => {})
  }, [subjectId])

  const open = requests.filter(r => !r.fulfilled)
  const done = requests.filter(r => r.fulfilled)
  const visible = showDone ? done : open

  async function handleCreate(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSaving(true)
    try {
      const req = await createRequest({
        semester,
        subjectId,
        subjectName,
        text: text.trim(),
        userId: user.id,
        userName: profile?.full_name || user.email,
      })
      setRequests(prev => [req, ...prev])
      setText('')
      setShowForm(false)
      toast.success('Pedido publicado')
    } catch (err) {
      toast.error('No se pudo publicar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  async function handleFulfill(id) {
    try {
      const updated = await fulfillRequest(id)
      setRequests(prev => prev.map(r => r.id === id ? updated : r))
      toast.success('Marcado como resuelto')
    } catch {
      toast.error('No se pudo marcar')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
      toast.success('Pedido eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    }
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="eyebrow">Pedidos</p>
          {open.length > 0 && (
            <span className="font-mono text-[10px] text-gold-700 bg-gold-100 px-1.5 py-0.5 rounded">
              {open.length} sin resolver
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {done.length > 0 && (
            <button onClick={() => setShowDone(v => !v)}
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-300 hover:text-ink-600 px-2 py-1.5 transition-colors">
              {showDone ? 'Ver pendientes' : `Resueltos (${done.length})`}
            </button>
          )}
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-white rounded-lg border border-paper-rule hover:border-ink-300 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Pedir material
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-paper-rule shadow-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-900">¿Qué te hace falta?</p>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Cerrar"
              className="p-1 hover:bg-paper rounded-md text-ink-300 hover:text-ink-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={text} onChange={e => setText(e.target.value)} autoFocus
              placeholder="Ej. las transcripciones de ORL clase 8"
              className="flex-1 px-3.5 py-2.5 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
            />
            <button type="submit" disabled={saving || !text.trim()}
              className="px-4 py-2.5 bg-ink-800 hover:bg-ink-900 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
              {saving ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </form>
      )}

      {visible.length === 0 ? (
        !showForm && (
          <div className="flex items-center gap-3.5 px-4 py-5 bg-white rounded-xl border border-dashed border-paper-rule">
            <HandHelping className="w-4 h-4 text-ink-300 flex-shrink-0" />
            <p className="text-[13px] text-ink-400">
              {showDone
                ? 'Todavía no hay pedidos resueltos.'
                : 'Nadie ha pedido nada en esta materia. Si te falta algo, pídelo.'}
            </p>
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl border border-paper-rule shadow-card divide-y divide-paper-rule overflow-hidden">
          {visible.map(r => (
            <div key={r.id} className="group flex items-start gap-3.5 px-4 py-3.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${
                r.fulfilled ? 'bg-ink-200' : 'bg-gold-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] leading-snug ${
                  r.fulfilled ? 'text-ink-300 line-through' : 'text-ink-800'
                }`}>
                  {r.text}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-300 mt-1.5">
                  {r.requested_by_name?.split(' ')[0]} · {formatDistanceToNow(parseISO(r.created_at), { locale: es, addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                {!r.fulfilled && (
                  <button onClick={() => handleFulfill(r.id)} title="Ya está subido"
                    className="p-1.5 rounded-md text-ink-300 hover:text-green-700 hover:bg-green-50 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {r.requested_by === user?.id && (
                  <button onClick={() => handleDelete(r.id)} title="Eliminar"
                    className="p-1.5 rounded-md text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}