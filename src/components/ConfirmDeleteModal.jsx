import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 text-gray-400">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title || '¿Eliminar?'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Esta acción no se puede deshacer</p>
          </div>
        </div>

        {message && <p className="text-sm text-gray-600 mb-5 bg-gray-50 rounded-lg p-3">{message}</p>}

        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2 px-4 border border-gray-200 text-sm text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-60">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Eliminando...</>
              : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
