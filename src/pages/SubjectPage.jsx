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
import { Upload, Link2, Zap, List, Plus, X, BookOpen, ArrowUpRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const PARCIALES = ['Todos', 'Primer parcial', 'Segundo parcial', 'Final', 'General']
const MAIN_TABS = ['Recursos', 'Listas']

const BANCOS_POR_MATERIA = {
  'EMERGENCIAS': [
    { id: 'segundo-parcial',   title: 'Banco Segundo Parcial',     file: 'banco-segundo-parcial.html' },
    { id: 'oftalmo-ortopedia', title: 'Banco Oftalmo y Ortopedia', file: 'banco-oftalmo-ortopedia.html' },
  ],
  'CIRUGIA': [
    { id: 'anestesiologia', title: 'Banco de Anestesiología', file: 'banco-anestesiologia.html' },
    { id: 'cirugia',        title: 'Banco de Cirugía',        file: 'banco-cirugia-bloque-qx.html' },
    { id: 'imagenes',       title: 'Banco de Imágenes',       file: 'banco-imagenes-bloque-qx.html' },
  ],
}

function getBancosForSubject(name) {
  if (!name) return []
  const upper = name.toUpperCase()
  for (const [key, bancos] of Object.entries(BANCOS_POR_MATERIA)) {
    if (upper.includes(key)) return bancos
  }
  return []
}

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
      toast.error('No se pudieron cargar los recursos')
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
      toast.error('No se pudo eliminar: ' + (err.message || ''))
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
      toast.error('No se pudo eliminar: ' + (err.message || ''))
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
      toast.error('No se pudo crear la lista: ' + (err.message || ''))
    } finally {
      setCreatingList(false)
    }
  }

  function tabCount(tabVal) {
    if (tabVal === 'all') return resources.length
    return resources.filter(r => r.type === tabVal).length
  }

  if (loading) return <Layout><LoadingSpinner /></Layout>

  const bancos = getBancosForSubject(subject?.name)

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: `Semestre ${semester}`, href: `/semester/${semester}` },
        { label: subject?.name || '…' },
      ]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mt-4 mb-8 pb-6 border-b border-paper-rule">
        <div>
          <p className="eyebrow mb-2">{semInfo?.label}</p>
          <h1 className="font-display text-[32px] leading-none font-semibold tracking-tight text-ink-900">
            {subject?.name}
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300 mt-3">
            {resources.length} recurso{resources.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/upload?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold rounded-lg transition-colors">
            <Upload className="w-3.5 h-3.5" /> Subir archivo
          </Link>
          <Link to={`/add-link?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-paper-rule hover:border-ink-300 hover:bg-white text-ink-700 text-xs font-semibold rounded-lg transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Agregar link
          </Link>
          <Link to={`/add-joseo?semester=${semester}&subject=${subjectId}&subjectName=${encodeURIComponent(subject?.name || '')}`}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gold-500 hover:bg-gold-400 text-ink-900 text-xs font-semibold rounded-lg transition-colors">
            <Zap className="w-3.5 h-3.5" /> Joseo
          </Link>
        </div>
      </div>

      {/* Bancos de preguntas */}
      {bancos.length > 0 && (
        <section className="mb-8">
          <p className="eyebrow mb-4">Bancos de preguntas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {bancos.map(b => (
              <a key={b.id} href={`/bancos/${b.id}`} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-3.5 p-4 bg-ink-900 rounded-xl hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-[18px] h-[18px] text-gold-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-white truncate">{b.title}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35 mt-0.5">
                    Banco interactivo
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/25 group-hover:text-gold-400 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tabs principales */}
      <div className="flex gap-6 mb-6 border-b border-paper-rule">
        {MAIN_TABS.map(tab => (
          <button key={tab} onClick={() => setMainTab(tab)}
            className={`relative pb-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              mainTab === tab ? 'text-ink-900' : 'text-ink-300 hover:text-ink-500'
            }`}>
            {tab}
            {tab === 'Listas' && answerLists.length > 0 && (
              <span className="ml-1.5 text-ink-300">({answerLists.length})</span>
            )}
            {mainTab === tab && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-gold-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {mainTab === 'Recursos' && (
        <>
          <div className="flex gap-1 overflow-x-auto pb-1 mb-3 scrollbar-hide">
            {SUBJECT_TABS.map(tab => {
              const count = tabCount(tab.value)
              const active = activeTab === tab.value
              return (
                <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    active ? 'bg-ink-900 text-white' : 'text-ink-400 hover:bg-white hover:text-ink-700'
                  }`}>
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 font-mono text-[10px] ${active ? 'text-white/50' : 'text-ink-300'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 mb-5 scrollbar-hide">
            {PARCIALES.map(p => (
              <button key={p} onClick={() => setActiveParcial(p)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-md font-mono text-[10px] uppercase tracking-[0.12em] transition-colors whitespace-nowrap ${
                  activeParcial === p
                    ? 'bg-gold-100 text-gold-700'
                    : 'text-ink-300 hover:bg-white hover:text-ink-500'
                }`}>
                {p}
              </button>
            ))}
          </div>

          {activeTab === 'Joseo' && (
            <div className="flex items-start gap-3.5 p-4 mb-5 rounded-xl bg-gold-50 border border-gold-100">
              <Zap className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-gold-700">Joseos</p>
                <p className="text-xs text-gold-700/70 mt-1 leading-relaxed">
                  Oportunidades, becas, contactos, pasantías y tutorías que valga la pena compartir.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar en esta materia…" />
            </div>
            <FilterBar filters={filters} onChange={setFilters} />
          </div>

          {displayed.length === 0 ? (
            <EmptyState variant="resources"
              title={search ? 'Sin resultados' : 'Sin recursos todavía'}
              description={search
                ? `Nada coincide con "${search}". Prueba con otra palabra.`
                : 'Sube el primer archivo, agrega un link o publica un joseo.'} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayed.map(r => (
                <ResourceCard key={r.id} resource={r} onDelete={setDeleteTarget}
                  onUpdate={updated => setResources(prev => prev.map(x => x.id === updated.id ? updated : x))} />
              ))}
            </div>
          )}
        </>
      )}

      {mainTab === 'Listas' && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-300">
              {answerLists.length} lista{answerLists.length !== 1 ? 's' : ''} de respuestas
            </p>
            <button onClick={() => setShowNewList(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nueva lista
            </button>
          </div>

          {showNewList && (
            <div className="bg-white rounded-xl border border-paper-rule shadow-card p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-ink-900">Nueva lista de respuestas</p>
                <button onClick={() => setShowNewList(false)} aria-label="Cerrar"
                  className="p-1 hover:bg-paper rounded-md text-ink-300 hover:text-ink-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateList} className="flex gap-2">
                <input type="text" value={newListTitle} onChange={e => setNewListTitle(e.target.value)}
                  placeholder="Ej. Parcial 1 · Cirugía" autoFocus
                  className="flex-1 px-3.5 py-2.5 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100" />
                <button type="submit" disabled={creatingList || !newListTitle.trim()}
                  className="px-4 py-2.5 bg-ink-800 hover:bg-ink-900 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
                  {creatingList ? 'Creando…' : 'Crear'}
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
                  onUpdate={updated => setAnswerLists(prev => prev.map(x => x.id === updated.id ? updated : x))} />
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