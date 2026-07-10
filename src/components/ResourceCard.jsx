import { Download, ExternalLink, Trash2, FileText, Link2, Zap, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getResourceType } from '../constants/resourceTypes'
import { downloadFile } from '../services/storageService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ResourceCard({ resource, onDelete }) {
  const { user } = useAuth()
  const isOwner = user?.id === resource.uploaded_by
  const rType   = getResourceType(resource.type)
  const isJoseo = resource.type === 'Joseo'

  async function handleDownload() {
    try {
      await downloadFile(resource.file_path, resource.title)
    } catch {
      toast.error('No se pudo descargar el archivo')
    }
  }

  return (
    <div
      className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
        isJoseo ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
      }`}
    >
      {/* Joseo accent bar */}
      {isJoseo && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-l-xl" />}

      <div className="p-4 pl-5">
        {/* Header */}
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
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mt-1.5 line-clamp-2 leading-snug">
              {resource.title}
            </h3>
          </div>

          {/* Delete */}
          {isOwner && (
            <button
              onClick={() => onDelete(resource)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all"
              title="Eliminar recurso"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Meta */}
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

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-50">
          {resource.resource_kind === 'file' && resource.file_path && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar
            </button>
          )}
          {resource.link_url && (
            <a
              href={resource.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir link
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
