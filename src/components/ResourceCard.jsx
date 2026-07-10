import { useState } from 'react'
import { Download, ExternalLink, Trash2, FileText, Link2, Zap, Calendar, User, Pencil, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getResourceType } from '../constants/resourceTypes'
import { downloadFile } from '../services/storageService'
import { updateResource } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const PARCIALES = ['Primer parcial', 'Segundo parcial', 'Final', 'General']
const RESOURCE_TYPES_LIST = ['Clase','Resumen','Banco de preguntas','Presentación','Guía','Tarea','Video','Joseo','Otro']

export default function ResourceCard({ resource, onDelete, onUpdate }) {
  const { user } = useAuth()
  const isOwner = user?.id === resource.uploaded_by
  const rType   = getResourceType(resource.type)
  const isJoseo = resource.type === 'Joseo'

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(resource.title)
  const [description, setDescription] = useState(resource.description || '')
  const [type, setType] = useState(resource.type)
  const [parcial, setParcial] = useState(resource.parcial || 'General')
  const [saving, setSaving] = useState(false)

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
      toast.error('Error al actualizar: ' + (err.message || ''))
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
    <div className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      isJoseo ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
    }`}>
      {isJoseo && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-xl" />}

      <div className="p-4 pl-5">
        {editing ? (
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Título" />
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              {RESOURCE_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={parcial} onChange={e => setParcial(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              {PARCIALES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={2} placeholder="Descripción (opcional)"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
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
          <>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${rType.color}`}>
                {isJoseo ? <Zap className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${rType.color}`}>
                    {rType.icon} {rType.label}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-gray-100 text-gray-500">
                    {resource.resource_kind === 'file' ? '📎 Archivo' : '🔗 Link'}
                  </span>
                  {resource.parcial && resource.parcial !== 'General' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-indigo-100 text-indigo-700 font-semibold">
                      {resource.parcial}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mt-1.5 line-clamp-2 leading-snug">
                  {resource.title}
                </h3>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                {isOwner && (
                  <button onClick={() => setEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                    title="Editar">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {isOwner && (
                  <button onClick={() => onDelete(resource)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
                    title="Eliminar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {resource.description && (
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{resource.description}</p>
            )}

            <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {resource.uploaded_by_name || 'Usuario'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(resource.created_at), 'd MMM yyyy', { locale: es })}
              </span>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-50">
              {resource.resource_kind === 'file' && resource.file_path && (
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-medium transition-colors">
                  <Download className="w-3.5 h-3.5" /> Descargar
                </button>
              )}
              {resource.link_url && (
                <a href={resource.link_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir link
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}