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

const ACCEPTED = [
  // Documentos
  '.pdf', '.doc', '.docx', '.txt', '.rtf', '.md',
  // Presentaciones
  '.ppt', '.pptx', '.ppsx', '.pps',
  // Hojas de cálculo
  '.xls', '.xlsx', '.csv', '.numbers',
  // Apple
  '.key', '.pages',
  // Anki
  '.apkg', '.colpkg',
  // Imágenes
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.svg',
  // Audio y video
  '.mp4', '.webm', '.mov', '.m4v', '.mp3', '.m4a', '.wav',
  // Comprimidos
  '.zip', '.rar', '.7z',
].join(',')

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
      toast.error('El archivo pesa más de 200 MB. Comprímelo o súbelo como link.')
      return
    }
    setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!semester || !subjectId || !title || !file) {
      toast.error('Faltan campos por completar')
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

      toast.success('Archivo subido')
      navigate(`/semester/${semester}/subject/${subjectId}`)
    } catch (err) {
      toast.error('No se pudo subir: ' + (err.message || 'Intenta de nuevo'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <Field label="Semestre">
        <select value={semester} onChange={handleSemesterChange} required className={selectCls}>
          <option value="">Selecciona un semestre</option>
          {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>

      <Field label="Materia">
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!semester} className={selectCls}>
          <option value="">{semester ? 'Selecciona una materia' : 'Primero elige el semestre'}</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="Título">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
          placeholder="Ej. Tumores benignos de la piel" className={inputCls} />
      </Field>

      <Field label="Tipo de material">
        <select value={type} onChange={e => setType(e.target.value)} className={selectCls}>
          {RESOURCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
      </Field>

      <Field label="Parcial">
        <select value={parcial} onChange={e => setParcial(e.target.value)} className={selectCls}>
          {PARCIALES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <Field label="Descripción" optional>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={3} placeholder="Qué contiene, de qué clase salió, qué tan completo está…"
          className={inputCls + ' resize-none'} />
      </Field>

      <Field label="Archivo">
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-paper-rule rounded-xl cursor-pointer hover:border-gold-400 hover:bg-gold-50/40 transition-colors">
          <input type="file" className="hidden" onChange={handleFileChange} accept={ACCEPTED} />
          {file ? (
            <div className="flex items-center gap-3 px-4">
              <FileText className="w-7 h-7 text-ink-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate max-w-[280px]">{file.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-300 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button type="button" onClick={e => { e.preventDefault(); setFile(null) }}
                className="p-1.5 rounded-md text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center px-6">
              <Upload className="w-5 h-5 text-ink-300 mx-auto mb-2.5" />
              <p className="text-sm text-ink-600 font-medium">Arrastra el archivo o haz clic</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-300 mt-2 leading-relaxed">
                PDF · Word · PowerPoint · Keynote · Pages<br />
                Anki · Excel · Imágenes · Audio · Video — máx. 200 MB
              </p>
            </div>
          )}
        </label>
      </Field>

      <button type="submit" disabled={loading}
        className="w-full py-3 px-4 bg-ink-800 hover:bg-ink-900 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
        {loading ? <><Spinner /> Subiendo…</> : <><Upload className="w-4 h-4" /> Subir archivo</>}
      </button>
    </form>
  )
}

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-2">
        <span className="text-sm font-semibold text-ink-800">{label}</span>
        {optional && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-300">Opcional</span>
        )}
      </label>
      {children}
    </div>
  )
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

const inputCls  = 'w-full px-3.5 py-2.5 text-sm border border-paper-rule rounded-lg focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition'
const selectCls = inputCls + ' bg-white'