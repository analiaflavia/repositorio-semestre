import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import SubjectCard from '../components/SubjectCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { getSubjects, createSubject, deleteSubject, getSubjectResourceCount } from '../services/subjectService'
import { SEMESTERS, getSemester } from '../constants/semesters'
import { useAuth } from '../hooks/useAuth'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const ACCENT = {
  '12': '#B89653',
  '13': '#6E7E9B',
  '14': '#8A7CA8',
  '15': '#5F8A8B',
  '16': '#9B7B6B',
}

export default function SemesterPage() {
  const { semester } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const semInfo = getSemester(semester)
  const accent = ACCENT[semester] || ACCENT['12']

  const [subjects,     setSubjects]     = useState([])
  const [counts,       setCounts]       = useState({})
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [newName,      setNewName]      = useState('')
  const [creating,     setCreating]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  useEffect(() => {
    if (!SEMESTERS.find(s => s.id === semester)) {
      navigate('/not-found'); return
    }
    loadSubjects()
  }, [semester])

  async function loadSubjects() {
    setLoading(true)
    try {
      const subs = await getSubjects(semester)
      setSubjects(subs)
      const countMap = {}
      await Promise.all(subs.map(async s => {
        countMap[s.id] = await getSubjectResourceCount(s.id)
      }))
      setCounts(countMap)
    } catch {
      toast.error('No se pudieron cargar las materias')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const sub = await createSubject({ semester, name: newName.trim(), createdBy: user.id })
      setSubjects(prev => [...prev, sub])
      setCounts(prev => ({ ...prev, [sub.id]: 0 }))
      setNewName('')
      setShowForm(false)
      toast.success('Materia creada')
    } catch (err) {
      toast.error('No se pudo crear la materia: ' + (err.message || ''))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteSubject(deleteTarget.id)
      setSubjects(prev => prev.filter(s => s.id !== deleteTarget.id))
      toast.success('Materia eliminada')
      setDeleteTarget(null)
    } catch (err) {
      toast.error('No se pudo eliminar: ' + (err.message || ''))
    } finally {
      setDeleting(false)
    }
  }

  if (!semInfo) return null

  const totalRecursos = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <Layout>
      <Breadcrumbs items={[{ label: semInfo.label }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mt-4 mb-8 pb-6 border-b border-paper-rule">
        <div className="flex items-center gap-5">
          <span className="w-[3px] h-14 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          <div>
            <p className="eyebrow mb-1.5">Semestre</p>
            <h1 className="font-display text-[40px] leading-none font-semibold tracking-tight" style={{ color: accent }}>
              {semester}
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300 mt-3">
              {subjects.length} materia{subjects.length !== 1 ? 's' : ''}
              {totalRecursos > 0 && ` · ${totalRecursos} recurso${totalRecursos !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-800 hover:bg-ink-900 text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Nueva materia
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl border border-paper-rule shadow-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-ink-900">
              Nueva materia · Semestre {semester}
            </p>
            <button onClick={() => setShowForm(false)} aria-label="Cerrar"
              className="p-1 hover:bg-paper rounded-md text-ink-300 hover:text-ink-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ej. Anatomía patológica"
              autoFocus
              className="flex-1 px-3.5 py-2.5 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100"
            />
            <button type="submit" disabled={creating || !newName.trim()}
              className="px-4 py-2.5 bg-ink-800 hover:bg-ink-900 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors">
              {creating ? 'Creando…' : 'Crear'}
            </button>
          </form>
        </div>
      )}

      {/* Materias */}
      {loading ? <LoadingSpinner /> : subjects.length === 0 ? (
        <EmptyState
          variant="subjects"
          title="Sin materias todavía"
          description="Agrega la primera materia de este semestre para empezar a organizar los recursos."
          action={
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-ink-800 hover:bg-ink-900 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Crear primera materia
            </button>
          }
        />
      ) : (
        <>
          <p className="eyebrow mb-4">Materias</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map(s => (
              <SubjectCard
                key={s.id}
                subject={s}
                resourceCount={counts[s.id] || 0}
                accent={accent}
                onDelete={setDeleteTarget}
                onUpdate={updated => setSubjects(prev => prev.map(x => x.id === updated.id ? updated : x))}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="¿Eliminar materia?"
        message={`Se eliminará "${deleteTarget?.name}" y todos sus recursos. Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  )
}