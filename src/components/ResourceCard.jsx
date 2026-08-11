import { useState } from 'react'
import { Download, ExternalLink, Trash2, Zap, Calendar, User, Pencil, X, Check, MessageCircle, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getResourceType } from '../constants/resourceTypes'
import { downloadFile } from '../services/storageService'
import { updateResource } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import ResourceComments from './ResourceComments'

const PARCIALES = ['Primer parcial', 'Segundo parcial', 'Final', 'General']
const RESOURCE_TYPES_LIST = ['Clase','Resumen','Banco de preguntas','Presentación','Guía','Tarea','Video','Joseo','Otro']

const TYPE_DOT = {
  'Clase':              '#6E7E9B',
  'Resumen':            '#5F8A8B',
  'Banco de preguntas': '#8A7CA8',
  'Presentación':       '#9B7B6B',
  'Guía':               '#16294A',
  'Tarea':              '#A8843F',
  'Video':              '#6E7E9B',
  'Joseo':              '#B89653',
  'Otro':               '#8B97AE',
}

export default function ResourceCard({ resource, onDelete, onUpdate }) {
  const { user } = useAuth()
  const isOwner = user?.id === resource.uploaded_by
  const rType   = getResourceType(resource.type)
  const isJoseo = resource.type === 'Joseo'
  const dot     = TYPE_DOT[resource.type] || TYPE_DOT['Otro']

  const [editing,     setEditing]     = useState(false)
  const [showThread,  setShowThread]  = useState(false)
  const [title,       setTitle]       = useState(resource.title)
  const [description, setDescription] = useState(resource.description || '')
  const [type,        setType]        = useState(resource.type)
  const [parcial,     setParcial]     = useState(resource.parcial || 'General')
  const [saving,      setSaving]      = useState(false)

  async function handleDownload() {
    try {
      await downloadFile(resource.file_path, resource.title)
    } catch {
      toast.error('No se pudo descargar el archivo')
    }
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('El título no puede estar vacío'); return }
    setSaving(true)
    try {
      const updated = await updateResource(resource.id, { title, description, type, parcial })
      toast.success('Recurso actualizado')
      setEditing(false)
      if (onUpdate) onUpdate(updated)
    } catch (err) {
      toast.error('No se pudo actualizar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setTitle(resource.title)
    setDescription(resource.description || '')
    setType(resource.type)
    setParcial(resource.parcial || 'General')
    setEditing(false)
  }

  return (
    <div className={`group relative flex flex-col bg-white rounded-xl border shadow-card hover:shadow-lift transition-all duration-200 overflow-hidden ${
      isJoseo ? 'border-gold-300' : 'border-paper-rule'
    }`}>
      {isJoseo && <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-500" />}

      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
              placeholder="Título" />
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-paper-rule rounded-lg bg-white focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100">
              {RESOURCE_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={parcial} onChange={e => setParcial(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-paper-rule rounded-lg bg-white focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100">
              {PARCIALES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Descripción (opcional)"
              className="w-full px-3 py-2 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 resize-none" />
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold rounded-lg transition-colors">
                <Check className="w-3.5 h-3.5" /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 px-3.5 py-2 text-ink-500 hover:bg-paper text-xs font-semibold rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Metadatos superiores */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
                    {rType.label}
                  </span>
                </span>
                <span className="w-px h-3 bg-paper-rule" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-300">
                  {resource.resource_kind === 'file' ? 'Archivo' : 'Link'}
                </span>
                {resource.parcial && resource.parcial !== 'General' && (
                  <>
                    <span className="w-px h-3 bg-paper-rule" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-700">
                      {resource.parcial}
                    </span>
                  </>
                )}
              </div>

              <div className="flex gap-0.5 flex-shrink-0">
                {isOwner && (
                  <>
                    <button onClick={() => setEditing(true)} title="Editar"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md text-ink-300 hover:text-ink-700 hover:bg-paper transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(resource)} title="Eliminar"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-md text-ink-300 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Título */}
            <h3 className="font-semibold text-ink-900 text-[15px] leading-snug line-clamp-2">
              {isJoseo && <Zap className="inline w-3.5 h-3.5 text-gold-500 mr-1 -mt-0.5" />}
              {resource.title}
            </h3>

            {resource.description && (
              <p className="text-[13px] text-ink-400 mt-2 line-clamp-2 leading-relaxed">
                {resource.description}
              </p>
            )}

            {/* Firma */}
            <div className="flex items-center gap-3 font-mono text-[10px] text-ink-300 mt-3">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {resource.uploaded_by_name?.split(' ')[0] || 'Usuario'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(resource.created_at), 'd MMM yyyy', { locale: es })}
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 mt-4">
              {resource.resource_kind === 'file' && resource.file_path && (
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold transition-colors">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
              )}
              {resource.link_url && (
                <a href={resource.link_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-paper-rule hover:border-ink-300 hover:bg-paper text-ink-700 text-xs font-semibold transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir link
                </a>
              )}

              <button
                onClick={() => setShowThread(v => !v)}
                aria-expanded={showThread}
                className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-paper text-xs font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Comentarios</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showThread ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hilo de comentarios y reacciones */}
      {!editing && showThread && (
        <div className="border-t border-paper-rule bg-paper-soft px-5 py-4">
          <ResourceComments resourceId={resource.id} />
        </div>
      )}
    </div>
  )
}