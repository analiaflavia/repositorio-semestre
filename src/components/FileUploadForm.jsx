import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, FileText } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { RESOURCE_TYPES } from '../constants/resourceTypes'
import { uploadFile } from '../services/storageService'
import { createResource } from '../services/resourceService'
import { getSubjects } from '../services/subjectService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const MAX_SIZE = 200 * 1024 * 1024

const PARCIALES = ['Primer parcial', 'Segundo parcial', 'Final', 'General']

export default function FileUploadForm({ defaultSemester, defaultSubjectId, defaultSubjectName }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [semester,    setSemester]    = useState(defaultSemester || '')
  const [subjects,    setSubjects]    = useState([])
  const [subjectId,   setSubjectId]   = useState(defaultSubjectId || '')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [type,        setType]        = useState('Clase')
  const [parcial,     setParcial]     = useState('General')
  const [file,        setFile]        = useState(null)
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

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error('El archivo supera el límite de 200 MB')
      return
    }
    setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!semester || !subjectId || !title || !file) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    setLoading(true)
    try {
      const path = await uploadFile(file, user.id)
      const selectedSubject = subjects.find(s => s.id === subjectId) || { name: defaultSubjectName }

      await createResource({
        title,
        description,
        semester,
        subject_id:       subjectId,
        subject_name:     selectedSubject?.name || '',
        type,
        parcial,
        file_path:        path,
        file_url:         path,
        uploaded_by:      user.id,
        uploaded_by_name: profile?.full_name || user.email,
        resource_kind:    'file',
      })

      toast.success('¡Archivo subido exitosamente!')
      navigate(`/semester/${semester}/subject/${subjectId}`)
    } catch (err) {
      toast.error('Error al subir el archivo: ' + (err.message || 'Intenta de nuevo'))
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
          placeholder="Ej. Parcial 1 - Anatomía" className={inputCls} />
      </Field>

      <Field label="Tipo de material *">
        <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
          {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </Field>

      <Field label="Clasificación *">
        <select value={parcial} onChange={e => setParcial(e.target.value)} className={selectCls}>
          {PARCIALES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="Descripción (opcional)">
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={3} placeholder="Información adicional sobre este recurso..."
          className={inputCls + ' resize-none'} />
      </Field>

      <Field label="Archivo *">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
          <input type="file" className="hidden" onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.txt,.zip" />
          {file ? (
            <div className="flex items-center gap-3 px-4">
              <FileText className="w-8 h-8 text-brand-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={() => setFile(null)}
                className="p-1 hover:bg-red-50 rounded text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Arrastra o haz clic para subir</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, PPT, Excel, imágenes, videos — máx. 200 MB</p>
            </div>
          )}
        </label>
      </Field>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
        {loading ? <><Spinner /> Subiendo archivo...</> : <><Upload className="w-4 h-4" /> Subir archivo</>}
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

const inputCls  = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
const selectCls = inputCls + ' bg-white'