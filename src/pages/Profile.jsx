import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ResourceCard from '../components/ResourceCard'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { useAuth } from '../hooks/useAuth'
import { getMyResources, deleteResource } from '../services/resourceService'
import { deleteFile } from '../services/storageService'
import { updateProfile } from '../services/authService'
import { User, Mail, Calendar, FileText, Edit2, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, setProfile } = useAuth()
  const [resources,    setResources]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [editing,      setEditing]      = useState(false)
  const [newName,      setNewName]      = useState('')
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    if (!user) return
    getMyResources(user.id)
      .then(setResources)
      .catch(() => toast.error('Error al cargar tus recursos'))
      .finally(() => setLoading(false))
  }, [user])

  async function handleSaveName() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, { full_name: newName.trim() })
      setProfile(updated)
      setEditing(false)
      toast.success('Nombre actualizado')
    } catch {
      toast.error('Error al actualizar el nombre')
    } finally {
      setSaving(false)
    }
  }

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

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <Layout>
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-7 max-w-2xl">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-700 font-bold text-xl">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Name */}
            <div className="flex items-center gap-2 mb-1">
              {editing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditing(false) }}
                  />
                  <button onClick={handleSaveName} disabled={saving}
                    className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || '—'}</h2>
                  <button
                    onClick={() => { setNewName(profile?.full_name || ''); setEditing(true) }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Meta */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Miembro desde {profile?.created_at
                  ? format(new Date(profile.created_at), "MMMM yyyy", { locale: es })
                  : '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText className="w-3.5 h-3.5" />
                <span>{resources.length} recurso{resources.length !== 1 ? 's' : ''} subido{resources.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My resources */}
      <h3 className="text-base font-semibold text-gray-900 mb-4">Mis recursos subidos</h3>

      {loading ? <LoadingSpinner /> : resources.length === 0 ? (
        <EmptyState
          variant="resources"
          title="Todavía no has subido nada"
          description="Cuando subas archivos, links o joseos aparecerán aquí."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map(r => (
            <ResourceCard key={r.id} resource={r} onDelete={setDeleteTarget} />
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
