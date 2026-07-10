import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import ResourceCard from '../components/ResourceCard'
import AnswerListCard from '../components/AnswerListCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import FilterBar from '../components/FilterBar'
import SearchBar from '../components/SearchBar'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { getSubject } from '../services/subjectService'
import { getResources, deleteResource } from '../services/resourceService'
import { getAnswerLists, createAnswerList, deleteAnswerList } from '../services/answerListService'
import { deleteFile } from '../services/storageService'
import { SUBJECT_TABS } from '../constants/resourceTypes'
import { getSemester } from '../constants/semesters'
import { Upload, Link2, Zap, List, Plus, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const PARCIALES = ['Todos', 'Primer parcial', 'Segundo parcial', 'Final', 'General']
const MAIN_TABS = ['Recursos', 'Listas']

export default function SubjectPage() {
  const { semester, subjectId } = useParams()
  const { user, profile } = useAuth()
  const semInfo = getSemester(semester)

  const [subject,       setSubject]       = useState(null)
  const [resources,     setResources]     = useState([])
  const [answerLists,   setAnswerLists]   = useState([])
  const [loading,       setLoading]       = useState(true)
  const [mainTab,       setMainTab]       = useState('Recursos')
  const [activeTab,     setActiveTab]     = useState('all')
  const [activeParcial, setActiveParcial] = useState('Todos')
  const [search,        setSearch]        = useState('')
  const [filters,       setFilters]       = useState({ kind: 'all', type: '', sort: 'newest' })
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [deleteList,    setDeleteList]    = useState(null)
  const [deletingList,  setDeletingList]  = useState(false)
  const [showNewList,   setShowNewList]   = useState(false)
  const [newListTitle,  setNewListTitle]  = useState('')
  const [creatingList,  setCreatingList]  = useState(false)

  useEffect(() => { loadAll() }, [subjectId])

  async function loadAll() {
    setLoading(true)
    try {
      const [sub, res, lists] = await Promise.all([
        getSubject(subjectId),
        getResources({ subjectId }),
        getAnswerLists(subjectId),
      ])
      setSubject(sub)
      setResources(res)
      setAnswerLists(lists)
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

  async function handleDeleteList() {
    if (!deleteList) return
    setDeletingList(true)
    try {
      await deleteAnswerList(deleteList.id)
      setAnswerLists(prev => prev.filter(l => l.id !== deleteList.id))
      toast.success('Lista eliminada')
      setDeleteList(null)
    } catch (err) {
      toast.error('Error al eliminar: ' + (err.message || ''))
    } finally {
      setDeletingList(false)
    }
  }

  async function handleCreateList(e) {
    e.preventDefault()
    if (!newListTitle.trim()) return
    setCreatingList(true)
    try {
      const list = await createAnswerList({
        semester,
        subjectId,
        title: newListTitle.trim(),
        createdBy: user.id,
        createdByName: profile?.full_name || user.email,
      })
      setAnswerLists(prev => [list, ...prev])
      setNewListTitle('')
      setShowNewList(false)
      toast.success('Lista creada')
    } catch (err) {
      toast.error('Error al crear lista: ' + (err.message || ''))
    } finally {
      setCreatingList(false)
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

      {/* Main tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100">
        {MAIN_TABS.map(tab => (
          <button key={tab} onClick={() => setMainTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              mainTab === tab
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'Listas' && <List className="w-3.5 h-3.5 inline mr-1.5" />}
            {tab}
            {tab === 'Listas' && answerLists.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">{answerLists.length}</span>
            )}
          </button>
        ))}
      </div>

      {mainTab === 'Recursos' && (
        <>
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

          <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
            {PARCIALES.map(p => (
              <button key={p} onClick={() => setActiveParcial(p)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeParcial === p ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
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
            <EmptyState variant="resources" title={search ? 'Sin resultados' : 'Sin recursos todavía'}
              description={search ? `No encontramos nada para "${search}".` : 'Sé el primero en subir un archivo, agregar un link o publicar un joseo.'} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map(r => (
                <ResourceCard key={r.id} resource={r} onDelete={setDeleteTarget}
                  onUpdate={updated => setResources(prev => prev.map(r => r.id === updated.id ? updated : r))} />
              ))}
            </div>
          )}
        </>
      )}

      {mainTab === 'Listas' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{answerLists.length} lista{answerLists.length !== 1 ? 's' : ''} de respuestas</p>
            <button onClick={() => setShowNewList(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-xl transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nueva lista
            </button>
          </div>

          {showNewList && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Nueva lista de respuestas</h3>
                <button onClick={() => setShowNewList(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateList} className="flex gap-2">
                <input type="text" value={newListTitle} onChange={e => setNewListTitle(e.target.value)}
                  placeholder="Ej. Parcial 1 - Cirugía" autoFocus
                  className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="submit" disabled={creatingList || !newListTitle.trim()}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-medium rounded-xl transition-colors">
                  {creatingList ? 'Creando...' : 'Crear'}
                </button>
              </form>
            </div>
          )}

          {answerLists.length === 0 ? (
            <EmptyState variant="resources" title="No hay listas todavía"
              description="Crea la primera lista de respuestas para esta materia." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {answerLists.map(l => (
                <AnswerListCard key={l.id} list={l}
                  onDelete={setDeleteList}
                  onUpdate={updated => setAnswerLists(prev => prev.map(l => l.id === updated.id ? updated : l))} />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="¿Eliminar recurso?"
        message={`Se eliminará "${deleteTarget?.title}". Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteList}
        title="¿Eliminar lista?"
        message={`Se eliminará "${deleteList?.title}". Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteList}
        onCancel={() => setDeleteList(null)}
        loading={deletingList}
      />
    </Layout>
  )
}