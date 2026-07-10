import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SemesterCard from '../components/SemesterCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEMESTERS } from '../constants/semesters'
import { getSubjects } from '../services/subjectService'
import { getSemesterStats } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import { Upload, Link2, Zap, Plus, Calendar, Trash2, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { format, parseISO, isFuture, isToday, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const EVENT_TYPES = ['Examen', 'Entrega', 'Otro']
const TYPE_COLORS = {
  'Examen':  'bg-red-100 text-red-700',
  'Entrega': 'bg-blue-100 text-blue-700',
  'Otro':    'bg-gray-100 text-gray-600',
}

async function getEvents() {
  const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true })
  if (error) throw error
  return data
}
async function createEvent(payload) {
  const { data, error } = await supabase.from('events').insert([payload]).select().single()
  if (error) throw error
  return data
}
async function updateEvent(id, payload) {
  const { data, error } = await supabase.from('events').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}
async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

function Countdown({ dateStr }) {
  const date = parseISO(dateStr)
  const today = isToday(date)
  const days = differenceInDays(date, new Date())
  if (today) return <span className="text-[10px] font-bold text-red-600">¡Hoy!</span>
  if (days === 1) return <span className="text-[10px] font-semibold text-orange-500">Mañana</span>
  if (days <= 7) return <span className="text-[10px] font-semibold text-orange-400">{days}d</span>
  return <span className="text-[10px] text-gray-400">{days}d</span>
}

function EventRow({ ev, user, semesterSubjects, onDelete, onUpdate }) {
  const [editing,  setEditing]  = useState(false)
  const [title,    setTitle]    = useState(ev.title)
  const [date,     setDate]     = useState(ev.date)
  const [type,     setType]     = useState(ev.type)
  const [semester, setSemester] = useState(ev.semester || '')
  const [materia,  setMateria]  = useState(ev.materia || '')
  const [tab,      setTab]      = useState('semestre')
  const [saving,   setSaving]   = useState(false)

  const subjects = semesterSubjects[semester] || []
  const parsedDate = parseISO(ev.date)
  const today = isToday(parsedDate)

  async function handleSave() {
    if (!title.trim() || !date) { toast.error('Completa título y fecha'); return }
    setSaving(true)
    try {
      const updated = await updateEvent(ev.id, {
        title: title.trim(), date, type,
        semester: tab === 'semestre' ? semester || null : null,
        materia: tab === 'materia' ? materia || null : null,
      })
      toast.success('Evento actualizado')
      setEditing(false)
      onUpdate(updated)
    } catch (err) {
      toast.error('Error: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setTitle(ev.title); setDate(ev.date); setType(ev.type)
    setSemester(ev.semester || ''); setMateria(ev.materia || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título"
            className="col-span-2 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-1 border-b border-gray-200">
          {['semestre', 'materia'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-2.5 py-1 text-[10px] font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400'}`}>
              {t === 'semestre' ? 'Semestre' : 'Materia'}
            </button>
          ))}
        </div>
        {tab === 'semestre' ? (
          <select value={semester} onChange={e => setSemester(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Todos</option>
            {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        ) : (
          <div className="space-y-1.5">
            <select value={semester} onChange={e => { setSemester(e.target.value); setMateria('') }}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Semestre</option>
              {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select value={materia} onChange={e => setMateria(e.target.value)} disabled={!semester}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50">
              <option value="">{semester ? 'Materia' : 'Elige semestre'}</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-1.5">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-medium rounded-lg">
            <Check className="w-3 h-3" /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-medium rounded-lg">
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${today ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-50'}`}>
      <div className={`text-center flex-shrink-0 w-8 ${today ? 'text-red-600' : 'text-gray-500'}`}>
        <p className="text-[9px] font-medium uppercase leading-none">{format(parsedDate, 'MMM', { locale: es })}</p>
        <p className="text-sm font-bold leading-tight">{format(parsedDate, 'd')}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate">{ev.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`inline-flex px-1 py-0.5 rounded text-[9px] font-semibold ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
          {(ev.materia || ev.semester) && (
            <span className="text-[9px] text-gray-400 truncate">{ev.materia || `Sem. ${ev.semester}`}</span>
          )}
          <Countdown dateStr={ev.date} />
        </div>
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
        <button onClick={() => setEditing(true)}
          className="p-1 rounded bg-blue-50 text-blue-400 hover:bg-blue-100 transition-all">
          <Pencil className="w-3 h-3" />
        </button>
        {ev.created_by === user?.id && (
          <button onClick={() => onDelete(ev.id)}
            className="p-1 rounded bg-red-50 text-red-400 hover:bg-red-100 transition-all">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [semesterData,     setSemesterData]     = useState({})
  const [semesterSubjects, setSemesterSubjects] = useState({})
  const [loading,          setLoading]          = useState(true)
  const [events,           setEvents]           = useState([])
  const [showForm,         setShowForm]         = useState(false)
  const [calExpanded,      setCalExpanded]      = useState(false)
  const [newTitle,         setNewTitle]         = useState('')
  const [newDate,          setNewDate]          = useState('')
  const [newType,          setNewType]          = useState('Examen')
  const [newSemester,      setNewSemester]      = useState('')
  const [newMateria,       setNewMateria]       = useState('')
  const [newTab,           setNewTab]           = useState('semestre')
  const [creating,         setCreating]         = useState(false)

  const newSubjects = semesterSubjects[newSemester] || []

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        SEMESTERS.map(async s => {
          const [subjects, stats] = await Promise.all([getSubjects(s.id), getSemesterStats(s.id)])
          return { id: s.id, subjects, subjectCount: subjects.length, stats }
        })
      )
      const map = {}; const subMap = {}
      results.forEach(r => { map[r.id] = r; subMap[r.id] = r.subjects })
      setSemesterData(map); setSemesterSubjects(subMap); setLoading(false)
    }
    load()
    getEvents().then(setEvents).catch(() => {})
  }, [])

  async function handleCreateEvent(e) {
    e.preventDefault()
    if (!newTitle.trim() || !newDate) { toast.error('Completa el título y la fecha'); return }
    setCreating(true)
    try {
      const ev = await createEvent({
        title: newTitle.trim(), date: newDate, type: newType,
        semester: newTab === 'semestre' ? newSemester || null : null,
        materia: newTab === 'materia' ? newMateria || null : null,
        created_by: user.id, created_by_name: profile?.full_name || user.email,
      })
      setEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
      setNewTitle(''); setNewDate(''); setNewType('Examen'); setNewSemester(''); setNewMateria('')
      setShowForm(false)
      toast.success('Fecha agregada')
    } catch (err) {
      toast.error('Error: ' + (err.message || ''))
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      toast.success('Evento eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  function handleUpdateEvent(updated) {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => a.date.localeCompare(b.date)))
  }

  const upcomingEvents = events.filter(e => isFuture(parseISO(e.date)) || isToday(parseISO(e.date)))
  const visibleEvents = calExpanded ? upcomingEvents : upcomingEvents.slice(0, 4)

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hola, {profile?.full_name?.split(' ')[0] || 'estudiante'} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">Repositorio del Semestre — DERECHO MÉDICO</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/upload" className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Upload className="w-3.5 h-3.5" /> Subir archivo
          </Link>
          <Link to="/add-link" className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
            <Link2 className="w-3.5 h-3.5" /> Agregar link
          </Link>
          <Link to="/add-joseo" className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors">
            <Zap className="w-3.5 h-3.5" /> Joseo
          </Link>
        </div>
      </div>

      {/* Calendario compacto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">Fechas importantes</h2>
            {upcomingEvents.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-700 font-semibold">{upcomingEvents.length}</span>
            )}
          </div>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateEvent} className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Título" required
                className="col-span-2 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-1 border-b border-gray-200">
              {['semestre', 'materia'].map(t => (
                <button key={t} type="button" onClick={() => setNewTab(t)}
                  className={`px-2.5 py-1 text-[10px] font-medium border-b-2 -mb-px transition-colors ${newTab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-400'}`}>
                  {t === 'semestre' ? 'Semestre' : 'Materia'}
                </button>
              ))}
            </div>
            {newTab === 'semestre' ? (
              <select value={newSemester} onChange={e => setNewSemester(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="">Todos los semestres</option>
                {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            ) : (
              <div className="space-y-1.5">
                <select value={newSemester} onChange={e => { setNewSemester(e.target.value); setNewMateria('') }}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Semestre</option>
                  {SEMESTERS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select value={newMateria} onChange={e => setNewMateria(e.target.value)} disabled={!newSemester}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50">
                  <option value="">{newSemester ? 'Materia' : 'Elige semestre primero'}</option>
                  {newSubjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-1.5">
              <button type="submit" disabled={creating}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-medium rounded-lg transition-colors">
                {creating ? 'Agregando...' : 'Agregar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">No hay fechas próximas.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {visibleEvents.map(ev => (
                <EventRow key={ev.id} ev={ev} user={user}
                  semesterSubjects={semesterSubjects}
                  onDelete={handleDeleteEvent}
                  onUpdate={handleUpdateEvent} />
              ))}
            </div>
            {upcomingEvents.length > 4 && (
              <button onClick={() => setCalExpanded(p => !p)}
                className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {calExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Ver menos</> : <><ChevronDown className="w-3.5 h-3.5" /> Ver {upcomingEvents.length - 4} más</>}
              </button>
            )}
          </>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {SEMESTERS.map(s => (
            <SemesterCard key={s.id} semester={s}
              subjectCount={semesterData[s.id]?.subjectCount || 0}
              stats={semesterData[s.id]?.stats || {}} />
          ))}
        </div>
      )}
    </Layout>
  )
}