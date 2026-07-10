import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import SubjectCard from '../components/SubjectCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { getSubjects, createSubject, deleteSubject, getSubjectResourceCount } from '../services/subjectService'
import { SEMESTERS, getSemester } from '../constants/semesters'
import { useAuth } from '../hooks/useAuth'
import { Plus, BookOpen, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SemesterPage() {
  const { semester } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const semInfo = getSemester(semester)

  const [subjects,       setSubjects]       = useState([])
  const [counts,         setCounts]         = useState({})
  const [loading,        setLoading]        = useState(true)
  const [showForm,       setShowForm]       = useState(false)
  const [newName,        setNewName]        = useState('')
  const [creating,       setCreating]       = useState(false)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [deleting,       setDeleting]       = useState(false)

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
      // Load resource counts in parallel
      const countMap = {}
      await Promise.all(subs.map(async s => {
        countMap[s.id] = await getSubjectResourceCount(s.id)
      }))
      setCounts(countMap)
    } catch {
      toast.error('Error al cargar materias')
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
      toast.error('Error al crear materia: ' + (err.message || ''))
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
      toast.error('Error al eliminar: ' + (err.message || ''))
    } finally {
      setDeleting(false)
    }
  }

  if (!semInfo) return null

  const gradients = {
    '12': 'from-blue-500 to-blue-600',
    '13': 'from-indigo-500 to-indigo-600',
    '14': 'from-violet-500 to-violet-600',
    '15': 'from-sky-500 to-sky-600',
    '16': 'from-cyan-500 to-cyan-600',
  }

  return (
    <Layout>
      <Breadcrumbs items={[{ label: semInfo.label }]} />

      {/* Header */}
      <div className={`rounded-2xl bg-gradient-to-br ${gradients[semester]} text-white p-6 mb-6`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Semestre</p>
            <h1 className="text-3xl font-bold mt-0.5">{semester}</h1>
            <p className="text-white/80 text-sm mt-1">{subjects.length} materia{subjects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva materia
          </button>
        </div>
      </div>

      {/* New subject form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Nueva materia — Semestre {semester}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ej. Anatomía Patológica"
              autoFocus
              className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-medium rounded-xl transition-colors">
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </form>
        </div>
      )}

      {/* Subjects grid */}
      {loading ? <LoadingSpinner /> : subjects.length === 0 ? (
        <EmptyState
          variant="subjects"
          title="No hay materias todavía"
          description="Agrega la primera materia de este semestre para comenzar a organizar los recursos."
          action={
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors">
              <Plus className="w-4 h-4" /> Crear primera materia
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subjects.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              resourceCount={counts[s.id] || 0}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="¿Eliminar materia?"
        message={`Se eliminará "${deleteTarget?.name}" y todos sus recursos asociados. Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Layout>
  )
}
