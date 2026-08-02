import { useEffect, useState } from 'react'
import { getComments, addComment, deleteComment } from '../services/commentService'
import { getReactions, toggleReaction } from '../services/reactionService'
import { useAuth } from '../hooks/useAuth'
import { Trash2, Send } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const EMOJIS = ['👍', '❤️', '🔥', '😂', '🙌']

export default function ResourceComments({ resourceId }) {
  const { user, profile } = useAuth()
  const [comments,   setComments]   = useState([])
  const [reactions,  setReactions]  = useState([])
  const [text,       setText]       = useState('')
  const [loading,    setLoading]    = useState(true)
  const [sending,    setSending]    = useState(false)

  useEffect(() => {
    async function load() {
      const [c, r] = await Promise.all([getComments(resourceId), getReactions(resourceId)])
      setComments(c)
      setReactions(r)
      setLoading(false)
    }
    load()
  }, [resourceId])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const comment = await addComment({
        resourceId,
        userId: user.id,
        userName: profile?.full_name || user.email,
        text: text.trim(),
      })
      setComments(prev => [...prev, comment])
      setText('')
    } catch (err) {
      toast.error('Error al comentar')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteComment(id)
      setComments(prev => prev.filter(c => c.id !== id))
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function handleReaction(emoji) {
    try {
      const added = await toggleReaction(resourceId, user.id, emoji)
      const [c, r] = await Promise.all([getComments(resourceId), getReactions(resourceId)])
      setReactions(r)
    } catch {
      toast.error('Error')
    }
  }

  // Group reactions by emoji
  const reactionGroups = EMOJIS.map(emoji => ({
    emoji,
    count: reactions.filter(r => r.emoji === emoji).length,
    hasReacted: reactions.some(r => r.emoji === emoji && r.user_id === user?.id),
  })).filter(r => r.count > 0 || true)

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {/* Reactions */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {reactionGroups.map(({ emoji, count, hasReacted }) => (
          <button key={emoji} onClick={() => handleReaction(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
              hasReacted ? 'bg-brand-100 text-brand-700 border border-brand-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}>
            {emoji} {count > 0 && <span className="font-medium">{count}</span>}
          </button>
        ))}
      </div>

      {/* Comments */}
      {loading ? (
        <p className="text-xs text-gray-400">Cargando...</p>
      ) : (
        <div className="space-y-2 mb-2">
          {comments.map(c => (
            <div key={c.id} className="group flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-700 font-bold text-[8px]">
                  {(c.user_name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                  <p className="text-[10px] font-semibold text-gray-700">{c.user_name?.split(' ')[0]}</p>
                  <p className="text-xs text-gray-600">{c.text}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 ml-1">
                  {formatDistanceToNow(parseISO(c.created_at), { locale: es, addSuffix: true })}
                </p>
              </div>
              {c.user_id === user?.id && (
                <button onClick={() => handleDelete(c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all mt-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-gray-400">Sin comentarios aún.</p>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500" />
        <button type="submit" disabled={sending || !text.trim()}
          className="p-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white rounded-full transition-colors">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  )
}