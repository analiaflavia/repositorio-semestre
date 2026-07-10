import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { RESOURCE_TYPES } from '../constants/resourceTypes'
import { createResource } from '../services/resourceService'
import { getSubjects } from '../services/subjectService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function LinkForm({ defaultSemester, defaultSubjectId, defaultSubjectName }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [semester,    setSemester]    = useState(defaultSemester || '')
  const [subjects,    setSubjects]    = useState([])
  const [subjectId,   setSubjectId]   = useState(defaultSubjectId || '')
  const [title,       setTitle]       = useState('')
  const [url,         setUrl]         = useState('')
  const [description, setDescription] = useState('')
  const [type,        setType]        = useState('Clase')
  const [loading,     setLoading]     = useState(false)

  async function handleSemesterChange(e) {
    const val = e.target.value
    setSemester(val)
    setSubjectId('')
    if (val) {
      const subs = await getSubjects(val)
      setSubjects(subs)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!semester || !subjectId || !title || !url) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    // Validate URL
    try { new URL(url) } catch {
      toast.error('El URL no es válido. Asegúrate de incluir https://')
      return
    }
    setLoading(true)
    try {
      const selectedSubject = subjects.find(s => s.id === subjectId)
      await createResource({
        title,
        description,
        semester,
        subject_id:       subjectId,
        subject_name:     selectedSubject?.name || defaultSubjectName || '',
        type,
        link_url:         url,
        uploaded_by:      user.id,
        uploaded_by_name: profile?.full_name || user.email,
        resource_kind:    'link',
      })
      toast.success('¡Link guardado exitosamente!')
      navigate(`/semester/${semester}/subject/${subjectId}`)
    } catch (err) {
      toast.error('Error al guardar el link: ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <Field label="Semestre *">
        <select value={semester} onChange={handleSemesterChange} required className={selectCls}>
          <option value="">Selecciona semestre</option>
          {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>

      <Field label="Materia *">
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!semester} className={selectCls}>
          <option value="">{semester ? 'Selecciona materia' : 'Primero elige semestre'}</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="Título *">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
          placeholder="Ej. Video explicativo de Farmacología" className={inputCls} />
      </Field>

      <Field label="URL *">
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} required
          placeholder="https://..." className={inputCls} />
      </Field>

      <Field label="Tipo de recurso *">
        <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
          {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </Field>

      <Field label="Descripción (opcional)">
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={3} placeholder="¿De qué trata este link?"
          className={inputCls + ' resize-none'} />
      </Field>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
        {loading
          ? <><Spinner /> Guardando...</>
          : <><Link2 className="w-4 h-4" /> Guardar link</>}
      </button>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

const inputCls  = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
const selectCls = inputCls + ' bg-white'
