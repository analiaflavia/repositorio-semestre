import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import FilterBar from '../components/FilterBar'
import SearchBar from '../components/SearchBar'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { getSubject } from '../services/subjectService'
import { getResources, deleteResource } from '../services/resourceService'
import { deleteFile } from '../services/storageService'
import { SUBJECT_TABS } from '../constants/resourceTypes'
import { getSemester } from '../constants/semesters'
import { Upload, Link2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const PARCIALES = ['Todos', 'Primer parcial', 'Segundo parcial', 'Final', 'General']

export default function SubjectPage() {
  const { semester, subjectId } = useParams()
  const semInfo = getSemester(semester)

  const [subject,      setSubject]      = useState(null)
  const [resources,    setResources]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState('all')
  const [activeParcial, setActiveParcial] = useState('Todos')
  const [search,       setSearch]       = useState('')
  const [filters,      setFilters]      = useState({ kind: 'all', type: '', sort: 'newest' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => { loadAll() }, [subjectId])

  async function loadAll() {
    setLoading(true)
    try {
      const [sub, res] = await Promise.all([
        getSubject(subjectId),
        getResources({ subjectId }),
      ])
      setSubject(sub)
      setResources(res)
    } catch {
      toast.error('Error al cargar los recursos')
    } finally {
      setLoading(false)
    }
  }

  const displayed = useMemo(() => {
    let list = [...resources]
    if (activeTab !== 'all') list = list.filter(r => r.type === activeTab)
    if (activeParcial !== 'Todos') list = list.filter(r => (r.parcial || 'General') === activeParcial)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.uploaded_by_name?.toLowerCase().includes(q)
      )
    }
    if (filters.kind !== 'all') list = list.filter(r => r.resource_kind === filters.kind)
    if (filters.type) list = list.filter(r => r.type === filters.type)
    if (filters.sort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    else if (filters.sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title))
    else list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return list
  }, [resources, activeTab, activeParcial, search, filters])

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
      toast.error('Error al eliminar: ' + (err.message || ''))
    } finally {
      setDeleting(false)
    }
  }

  function tabCount(tabVal) {
    if (tabVal === 'all') return resources.length
    return resources.filter(r => r.type === tabVal).length
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: `Semestre ${semester}`, href: `/semester/${semester}` },
        { label: subject?.name || '...' },
      ]} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{subject?.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{semInfo?.label} · {resources.length} recurso{resources.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/upload?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-xl transition-colors">
            <Upload className="w-3.5 h-3.5" /> Subir archivo
          </Link>
          <Link to={`/add-link?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-xl transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Agregar link
          </Link>
          <Link to={`/add-joseo?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-xl transition-colors">
            <Zap className="w-3.5 h-3.5" /> Joseo
          </Link>
        </div>
      </div>

      {/* Tabs por tipo */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {SUBJECT_TABS.map(tab => {
          const count = tabCount(tab.value)
          return (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? tab.value === 'Joseo' ? 'bg-amber-100 text-amber-700' : 'bg-brand-50 text-brand-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === tab.value ? 'bg-white text-gray-700' : 'bg-gray-100 text-gray-500'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filtro por parcial */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {PARCIALES.map(p => (
          <button key={p} onClick={() => setActiveParcial(p)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeParcial === p
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}>
            {p}
          </button>
        ))}
      </div>

      {activeTab === 'Joseo' && (
        <div className="p-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Sección de Joseos ⚡</p>
            <p className="text-xs text-amber-700 mt-0.5">Oportunidades, becas, contactos, pasantías, tutorías y todo lo útil que quieras compartir.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar en esta materia..." />
        </div>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          variant="resources"
          title={search ? 'Sin resultados' : 'Sin recursos todavía'}
          description={
            search
              ? `No encontramos nada para "${search}". Intenta con otro término.`
              : 'Sé el primero en subir un archivo, agregar un link o publicar un joseo para esta materia.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(r => (
            <ResourceCard key={r.id} resource={r} onDelete={setDeleteTarget} onUpdate={updated => setResources(prev => prev.map(r => r.id === updated.id ? updated : r))} />
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="¿Eliminar recurso?"
        message={`Se eliminará "${deleteTarget?.title}". Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  )
}