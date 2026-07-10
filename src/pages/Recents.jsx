import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { getRecentResources, deleteResource } from '../services/resourceService'
import { deleteFile } from '../services/storageService'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Recents() {
  const [resources,    setResources]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    getRecentResources(50)
      .then(setResources)
      .catch(() => toast.error('Error al cargar recientes'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.resource_kind === 'file' && deleteTarget.file_path) {
        await deleteFile(deleteTarget.file_path)
      }
      await deleteResource(deleteTarget.id)
      setResources(prev => prev.filter(r => r.id !== deleteTarget.id))
      toast.success('Recurso eliminado')
      setDeleteTarget(null)
    } catch (err) {
      toast.error('Error: ' + (err.message || ''))
    } finally {
      setDeleting(false)
    }
  }

  // Group by date
  const groups = {}
  resources.forEach(r => {
    const key = format(new Date(r.created_at), 'eeee d MMMM yyyy', { locale: es })
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Recientes' }]} />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Recientes</h1>
          <p className="text-sm text-gray-400">Últimos recursos subidos en todos los semestres</p>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : resources.length === 0 ? (
        <EmptyState
          variant="resources"
          title="Sin recursos todavía"
          description="Cuando subas archivos, links o joseos aparecerán aquí."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 capitalize">{date}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map(r => (
                  <ResourceCard key={r.id} resource={r} onDelete={setDeleteTarget} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="¿Eliminar recurso?"
        message={`Se eliminará "${deleteTarget?.title}".`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  )
}
