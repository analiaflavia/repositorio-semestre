import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SemesterCard from '../components/SemesterCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEMESTERS } from '../constants/semesters'
import { getSubjects } from '../services/subjectService'
import { getSemesterStats } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import { Upload, Link2, Zap, Plus, Calendar, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { format, parseISO, isFuture, isToday, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const EVENT_TYPES = ['Examen', 'Entrega', 'Otro']
const TYPE_COLORS = {
  'Examen':  { dot: 'bg-red-500',   badge: 'bg-red-100 text-red-700',   label: 'text-red-600' },
  'Entrega': { dot: 'bg-blue-500',  badge: 'bg-blue-100 text-blue-700',  label: 'text-blue-600' },
  'Otro':    { dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-600',  label: 'text-gray-500' },
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

function MiniCalendar({ events, user, semesterSubjects, onDelete, onUpdate, onAdd }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay,  setSelectedDay]  = useState(null)
  const [editingId,    setEditingId]    = useState(null)

  const monthStart  = startOfMonth(currentMonth)
  const monthEnd    = endOfMonth(currentMonth)
  const days        = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad    = monthStart.getDay()

  const upcomingEvents = events.filter(e => isFuture(parseISO(e.date)) || isToday(parseISO(e.date)))

  function eventsForDay(day) {
    return events.filter(e => isSameDay(parseISO(e.date), day))
  }

  function getDotsForDay(day) {
    const dayEvents = eventsForDay(day)
    const types = [...new Set(dayEvents.map(e => e.type))]
    return types
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['D','L','M','M','J','V','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dots = getDotsForDay(day)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          const todayDay = isToday(day)
          const hasEvents = dots.length > 0
          return (
            <button key={day.toISOString()} onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative flex flex-col items-center py-1 rounded-lg transition-colors ${
                isSelected ? 'bg-brand-600' : todayDay ? 'bg-brand-50' : hasEvents ? 'hover:bg-gray-100' : 'hover:bg-gray-50'
              }`}>
              <span className={`text-xs font-medium ${
                isSelected ? 'text-white' : todayDay ? 'text-brand-700 font-bold' : 'text-gray-700'
              }`}>{format(day, 'd')}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.slice(0, 3).map((type, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : TYPE_COLORS[type]?.dot || 'bg-gray-400'}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-600 mb-2 capitalize">
            {format(selectedDay, "d 'de' MMMM", { locale: es })}
          </p>
          {selectedEvents.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Sin eventos</p>
              <button onClick={() => onAdd(selectedDay)}
                className="flex items-center gap-1 px-2 py-1 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-medium rounded-lg">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {selectedEvents.map(ev => (
                <EventItem key={ev.id} ev={ev} user={user}
                  semesterSubjects={semesterSubjects}
                  onDelete={onDelete} onUpdate={onUpdate} />
              ))}
              <button onClick={() => onAdd(selectedDay)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                <Plus className="w-3 h-3" /> Agregar otro
              </button>
            </div>
          )}
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
        {EVENT_TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[t].dot}`} />
            <span className="text-[10px] text-gray-500">{t}</span>
          </div>
        ))}
      </div>

      {/* Próximos eventos resumen */}
      {upcomingEvents.length > 0 && !selectedDay && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Próximos</p>
          <div className="space-y-1">
            {upcomingEvents.slice(0, 3).map(ev => {
              const days = differenceInDays(parseISO(ev.date), new Date())
              return (
                <div key={ev.id} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_COLORS[ev.type]?.dot}`} />
                  <span className="text-xs text-gray-700 truncate flex-1">{ev.title}</span>
                  <span className={`text-[10px] flex-shrink-0 ${days <= 7 ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                    {isToday(parseISO(ev.date)) ? '¡Hoy!' : days === 1 ? 'Mañana' : `${days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EventItem({ ev, user, semesterSubjects, onDelete, onUpdate }) {
  const [editing,  setEditing]  = useState(false)
  const [title,    setTitle]    = useState(ev.title)
  const [date,     setDate]     = useState(ev.date)
  const [type,     setType]     = useState(ev.type)
  const [semester, setSemester] = useState(ev.semester || '')
  const [materia,  setMateria]  = useState(ev.materia || '')
  const [tab,      setTab]      = useState('semestre')
  const [saving,   setSaving]   = useState(false)

  const subjects = semesterSubjects[semester] || []

  async function handleSave() {
    if (!title.trim() || !date) { toast.error('Completa título y fecha'); return }
    setSaving(true)
    try {
      const updated = await updateEvent(ev.id, {
        title: title.trim(), date, type,
        semester: tab === 'semestre' ? semester || null : null,
        materia: tab === 'materia' ? materia || null : null,
      })
      toast.success('Actualizado')
      setEditing(false)
      onUpdate(updated)
    } catch (err) {
      toast.error('Error: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-lg p-2 space-y-1.5">
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
        <div className="grid grid-cols-2 gap-1">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 px-2 py-1 bg-brand-600 text-white text-[10px] rounded">
            <Check className="w-3 h-3" /> {saving ? '...' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-[10px] rounded">
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[ev.type]?.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{ev.title}</p>
        {(ev.materia || ev.semester) && (
          <p className="text-[10px] text-gray-400">{ev.materia || `Sem. ${ev.semester}`}</p>
        )}
      </div>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
        <button onClick={() => setEditing(true)}
          className="p-1 rounded bg-blue-50 text-blue-400 hover:bg-blue-100">
          <Pencil className="w-3 h-3" />
        </button>
        {ev.created_by === user?.id && (
          <button onClick={() => onDelete(ev.id)}
            className="p-1 rounded bg-red-50 text-red-400 hover:bg-red-100">
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
  const [prefillDate,      setPrefillDate]      = useState('')
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

  function handleAddFromDay(day) {
    setNewDate(format(day, 'yyyy-MM-dd'))
    setShowForm(true)
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Calendario */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-semibold text-gray-900">Fechas importantes</h2>
            </div>
            <button onClick={() => { setNewDate(''); setShowForm(p => !p) }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateEvent} className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Título" required
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="grid grid-cols-2 gap-2">
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
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-xs font-medium rounded-lg">
                  {creating ? 'Agregando...' : 'Agregar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <MiniCalendar
            events={events}
            user={user}
            semesterSubjects={semesterSubjects}
            onDelete={handleDeleteEvent}
            onUpdate={handleUpdateEvent}
            onAdd={handleAddFromDay}
          />
        </div>

        {/* Semester cards — 2 cols on large */}
        <div className="lg:col-span-2">
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SEMESTERS.map(s => (
                <SemesterCard key={s.id} semester={s}
                  subjectCount={semesterData[s.id]?.subjectCount || 0}
                  stats={semesterData[s.id]?.stats || {}} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}