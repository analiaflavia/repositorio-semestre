import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Upload, X, FileText } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { createResource } from '../services/resourceService'
import { uploadFile } from '../services/storageService'
import { getSubjects } from '../services/subjectService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const MAX_SIZE = 200 * 1024 * 1024

export default function JoseoForm({ defaultSemester, defaultSubjectId, defaultSubjectName }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [semester,    setSemester]    = useState(defaultSemester || '')
  const [subjects,    setSubjects]    = useState([])
  const [subjectId,   setSubjectId]   = useState(defaultSubjectId || '')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl,     setLinkUrl]     = useState('')
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
    if (f.size > MAX_SIZE) { toast.error('El archivo supera 200 MB'); return }
    setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!semester || !subjectId || !title || !description) {
      toast.error('Completa título y descripción como mínimo')
      return
    }
    setLoading(true)
    try {
      let filePath = null
      const selectedSubject = subjects.find(s => s.id === subjectId)

      if (file) {
        filePath = await uploadFile(file, user.id)
      }

      await createResource({
        title,
        description,
        semester,
        subject_id:       subjectId,
        subject_name:     selectedSubject?.name || defaultSubjectName || '',
        type:             'Joseo',
        file_path:        filePath,
        file_url:         filePath,
        link_url:         linkUrl || null,
        uploaded_by:      user.id,
        uploaded_by_name: profile?.full_name || user.email,
        resource_kind:    file ? 'file' : 'link',
      })

      toast.success('¡Joseo publicado! ⚡')
      navigate(`/semester/${semester}/subject/${subjectId}`)
    } catch (err) {
      toast.error('Error al publicar el joseo: ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Joseo banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
        <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">¿Qué es un Joseo?</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Comparte oportunidades, becas, pasantías, grupos de estudio, tutorías, contactos útiles o cualquier info valiosa para tus compañeros.
          </p>
        </div>
      </div>

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
          placeholder="Ej. Beca Fulbright 2025 — Medicina Legal" className={inputCls} />
      </Field>

      <Field label="Descripción * (cuéntanos los detalles importantes)">
        <textarea value={description} onChange={e => setDescription(e.target.value)} required
          rows={4} placeholder="Explica la oportunidad, cómo aplicar, fechas, contacto, etc."
          className={inputCls + ' resize-none'} />
      </Field>

      <Field label="Link (opcional)">
        <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
          placeholder="https://..." className={inputCls} />
      </Field>

      <Field label="Archivo adjunto (opcional)">
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
          <input type="file" className="hidden" onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm,.txt" />
          {file ? (
            <div className="flex items-center gap-3 px-4">
              <FileText className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-red-50 rounded text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Adjunta un archivo si tienes algo que compartir</p>
            </div>
          )}
        </label>
      </Field>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
        {loading
          ? <><Spinner /> Publicando joseo...</>
          : <><Zap className="w-4 h-4" /> Publicar joseo</>}
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

const inputCls  = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent'
const selectCls = inputCls + ' bg-white'
