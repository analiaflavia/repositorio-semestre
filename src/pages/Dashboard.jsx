import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SemesterCard from '../components/SemesterCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ActivityFeed from '../components/ActivityFeed'
import { SEMESTERS } from '../constants/semesters'
import { getSubjects } from '../services/subjectService'
import { getSemesterStats, getRecentResources } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import { Upload, Link2, Zap, Plus, Calendar, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, FileText, BookOpen, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { format, parseISO, isFuture, isToday, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const EVENT_TYPES = ['Examen', 'Entrega', 'Otro']
const TYPE_COLORS = {
  'Examen':  { dot: 'bg-[#B4472F]' },
  'Entrega': { dot: 'bg-[#6E7E9B]' },
  'Otro':    { dot: 'bg-gold-500' },
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

function MiniCalendar({ events, user, onDelete, onUpdate, onAdd }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = monthStart.getDay()
  const upcomingEvents = events.filter(e => isFuture(parseISO(e.date)) || isToday(parseISO(e.date)))

  function eventsForDay(day) { return events.filter(e => isSameDay(parseISO(e.date), day)) }
  function getDotsForDay(day) { return [...new Set(eventsForDay(day).map(e => e.type))] }
  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          className="p-1 hover:bg-paper rounded-md transition-colors" aria-label="Mes anterior">
          <ChevronLeft className="w-4 h-4 text-ink-400" />
        </button>
        <span className="font-display text-[15px] font-semibold text-ink-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          className="p-1 hover:bg-paper rounded-md transition-colors" aria-label="Mes siguiente">
          <ChevronRight className="w-4 h-4 text-ink-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {['D','L','M','M','J','V','S'].map((d, i) => (
          <div key={i} className="text-center font-mono text-[9px] uppercase tracking-wider text-ink-300 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dots = getDotsForDay(day)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          const todayDay = isToday(day)
          return (
            <button key={day.toISOString()} onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative flex flex-col items-center py-1.5 rounded-md transition-colors ${
                isSelected ? 'bg-ink-900' : todayDay ? 'bg-gold-50' : 'hover:bg-paper'
              }`}>
              <span className={`font-mono text-[11px] ${
                isSelected ? 'text-white font-medium' : todayDay ? 'text-gold-700 font-semibold' : 'text-ink-600'
              }`}>
                {format(day, 'd')}
              </span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dots.slice(0, 3).map((type, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : TYPE_COLORS[type]?.dot || 'bg-ink-300'}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 border-t border-paper-rule pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400 mb-2.5">
            {format(selectedDay, "d 'de' MMMM", { locale: es })}
          </p>
          {selectedEvents.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-300">Sin eventos</p>
              <button onClick={() => onAdd(selectedDay)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-ink-800 hover:bg-ink-900 text-white text-[11px] font-semibold rounded-md transition-colors">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {selectedEvents.map(ev => (
                <EventItem key={ev.id} ev={ev} user={user} onDelete={onDelete} onUpdate={onUpdate} />
              ))}
              <button onClick={() => onAdd(selectedDay)}
                className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-ink-400 hover:text-ink-700 transition-colors">
                <Plus className="w-3 h-3" /> Agregar otro
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-paper-rule flex items-center gap-4 flex-wrap">
        {EVENT_TYPES.map(t => (
          <div key={t} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[t].dot}`} />
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-300">{t}</span>
          </div>
        ))}
      </div>

      {upcomingEvents.length > 0 && !selectedDay && (
        <div className="mt-4 pt-4 border-t border-paper-rule">
          <p className="eyebrow mb-3">Próximos</p>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 3).map(ev => {
              const days = differenceInDays(parseISO(ev.date), new Date())
              const urgent = days <= 7
              return (
                <div key={ev.id} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_COLORS[ev.type]?.dot}`} />
                  <span className="text-[13px] text-ink-700 truncate flex-1">{ev.title}</span>
                  <span className={`font-mono text-[10px] flex-shrink-0 ${urgent ? 'text-gold-700 font-medium' : 'text-ink-300'}`}>
                    {isToday(parseISO(ev.date)) ? 'HOY' : days === 1 ? 'MAÑANA' : `${days}D`}
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

function EventItem({ ev, user, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(ev.title)
  const [date, setDate] = useState(ev.date)
  const [type, setType] = useState(ev.type)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim() || !date) { toast.error('Completa título y fecha'); return }
    setSaving(true)
    try {
      const updated = await updateEvent(ev.id, { title: title.trim(), date, type })
      toast.success('Evento actualizado')
      setEditing(false)
      onUpdate(updated)
    } catch (err) {
      toast.error('No se pudo actualizar: ' + (err.message || ''))
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="bg-paper rounded-lg p-2.5 space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-paper-rule rounded-md focus:outline-none focus:border-gold-400" />
        <div className="grid grid-cols-2 gap-1.5">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-2 py-1.5 text-xs border border-paper-rule rounded-md focus:outline-none focus:border-gold-400" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-2 py-1.5 text-xs border border-paper-rule rounded-md bg-white focus:outline-none focus:border-gold-400">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-ink-800 text-white text-[11px] font-semibold rounded-md">
            <Check className="w-3 h-3" /> {saving ? '…' : 'Guardar'}
          </button>
          <button onClick={() => setEditing(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-ink-500 hover:bg-white text-[11px] font-semibold rounded-md">
            <X className="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-md hover:bg-paper transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${TYPE_COLORS[ev.type]?.dot}`} />
      <p className="text-[13px] text-ink-700 truncate flex-1">{ev.title}</p>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} aria-label="Editar"
          className="p-1 rounded text-ink-300 hover:text-ink-700">
          <Pencil className="w-3 h-3" />
        </button>
        {ev.created_by === user?.id && (
          <button onClick={() => onDelete(ev.id)} aria-label="Eliminar"
            className="p-1 rounded text-ink-300 hover:text-red-600">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-paper-rule shadow-card p-5">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-paper flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className={`font-display text-[28px] leading-none font-semibold mt-4 ${accent || 'text-ink-900'}`}>
        {value}
      </p>
      <p className="text-[13px] font-medium text-ink-600 mt-2">{label}</p>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-300 mt-1">{sub}</p>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [semesterData, setSemesterData] = useState({})
  const [semesterSubjects, setSemesterSubjects] = useState({})
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [recentResources, setRecentResources] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newType, setNewType] = useState('Examen')
  const [creating, setCreating] = useState(false)

  const totalArchivos = Object.values(semesterData).reduce((acc, s) => acc + (s.stats?.total || 0), 0)
  const totalMaterias = Object.values(semesterData).reduce((acc, s) => acc + (s.subjectCount || 0), 0)

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        SEMESTERS.map(async s => {
          const [subjects, stats] = await Promise.all([getSubjects(s.id), getSemesterStats(s.id)])
          const withMaterial = await Promise.all(
            subjects.map(async sub => {
              const { count } = await supabase
                .from('resources')
                .select('id', { count: 'exact', head: true })
                .eq('subject_id', sub.id)
              return (count || 0) > 0
            })
          )
          const filled = withMaterial.filter(Boolean).length
          const coverage = subjects.length ? Math.round((filled / subjects.length) * 100) : 0
          return { id: s.id, subjects, subjectCount: subjects.length, stats, coverage }
        })
      )
      const map = {}; const subMap = {}
      results.forEach(r => { map[r.id] = r; subMap[r.id] = r.subjects })
      setSemesterData(map); setSemesterSubjects(subMap); setLoading(false)
    }
    load()
    getEvents().then(setEvents).catch(() => {})
    getRecentResources(5).then(setRecentResources).catch(() => {})
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
        created_by: user.id, created_by_name: profile?.full_name || user.email,
      })
      setEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
      setNewTitle(''); setNewDate(''); setNewType('Examen')
      setShowForm(false)
      toast.success('Fecha agregada')
    } catch (err) {
      toast.error('No se pudo agregar: ' + (err.message || ''))
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      toast.success('Evento eliminado')
    } catch { toast.error('No se pudo eliminar') }
  }

  function handleUpdateEvent(updated) {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e).sort((a, b) => a.date.localeCompare(b.date)))
  }

  const remainder = SEMESTERS.length % 3
  const lastRowStart = SEMESTERS.length - remainder

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-end justify-between gap-6 mb-8 pb-6 border-b border-paper-rule">
        <div>
          <p className="eyebrow mb-2">Repositorio del semestre</p>
          <h1 className="font-display text-[32px] leading-none font-semibold tracking-tight text-ink-900">
            Hola, {profile?.full_name?.split(' ')[0] || 'estudiante'}
          </h1>
          <p className="text-sm text-ink-400 mt-2.5">
            Todo tu material de Derecho Médico, en un solo lugar.
          </p>
        </div>
        <p className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.16em] text-ink-300 pb-1.5">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<FileText className="w-[18px] h-[18px] text-ink-500" />}
          value={totalArchivos} label="Archivos" sub="En tu repositorio" />
        <StatCard
          icon={<BookOpen className="w-[18px] h-[18px] text-ink-500" />}
          value={totalMaterias} label="Materias" sub="Activas" />
        <StatCard
          icon={<Zap className="w-[18px] h-[18px] text-gold-600" />}
          value={SEMESTERS.length} label="Semestres" sub="En tu repositorio" accent="text-gold-600" />
        <StatCard
          icon={<Clock className="w-[18px] h-[18px] text-ink-500" />}
          value="Hoy" label="Última subida" sub={format(new Date(), 'hh:mm a')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Izquierda */}
        <div className="lg:col-span-2 space-y-10">

          <section>
            <p className="eyebrow mb-4">Selecciona un semestre</p>
            {loading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                {SEMESTERS.map((s, i) => {
                  const isLastRow = i >= lastRowStart
                  let colClass = 'sm:col-span-2'
                  if (isLastRow && remainder === 2) {
                    colClass = i === lastRowStart ? 'sm:col-span-2 sm:col-start-2' : 'sm:col-span-2'
                  } else if (isLastRow && remainder === 1) {
                    colClass = 'sm:col-span-2 sm:col-start-3'
                  }
                  return (
                    <div key={s.id} className={colClass}>
                      <SemesterCard semester={s}
                        subjectCount={semesterData[s.id]?.subjectCount || 0}
                        stats={semesterData[s.id]?.stats || {}}
                        coverage={semesterData[s.id]?.coverage || 0} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Archivos recientes */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow">Archivos recientes</p>
                <Link to="/recents" className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-gold-700 transition-colors">
                  Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-paper-rule shadow-card divide-y divide-paper-rule overflow-hidden">
                {recentResources.length === 0 ? (
                  <p className="text-[13px] text-ink-300 text-center py-8">
                    Todavía no hay archivos. Sube el primero.
                  </p>
                ) : (
                  recentResources.map(r => (
                    <Link
                      key={r.id}
                      to={`/semester/${r.semester}/subject/${r.subject_id}`}
                      className="flex items-center gap-3.5 px-4 py-3 hover:bg-paper-soft transition-colors group"
                    >
                      <FileText className="w-4 h-4 text-ink-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-ink-800 truncate group-hover:text-gold-700 transition-colors">
                          {r.title}
                        </p>
                        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-300 mt-0.5">
                          {r.subject_name || `Sem. ${r.semester}`} · {r.uploaded_by_name?.split(' ')[0]}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-ink-300 flex-shrink-0">
                        {format(new Date(r.created_at), 'd MMM', { locale: es })}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </section>

            {/* Acciones rápidas */}
            <section>
              <p className="eyebrow mb-4">Acciones rápidas</p>
              <div className="bg-white rounded-xl border border-paper-rule shadow-card divide-y divide-paper-rule overflow-hidden">
                <QuickAction to="/upload" icon={<Upload className="w-4 h-4 text-ink-500" />}
                  title="Subir archivo" sub="Agregar un recurso" />
                <QuickAction to="/add-link" icon={<Link2 className="w-4 h-4 text-ink-500" />}
                  title="Agregar link" sub="Guardar un enlace" />
                <QuickAction to="/add-joseo" icon={<Zap className="w-4 h-4 text-gold-600" />}
                  title="Crear joseo" sub="Compartir una oportunidad" />
              </div>
            </section>
          </div>
        </div>

        {/* Derecha */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-paper-rule shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow">Calendario</p>
              <button onClick={() => { setNewDate(''); setShowForm(p => !p) }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-ink-800 hover:bg-ink-900 text-white text-[11px] font-semibold rounded-md transition-colors">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleCreateEvent} className="bg-paper rounded-lg p-3 mb-4 space-y-2">
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="Título del evento" required
                  className="w-full px-2.5 py-2 text-xs border border-paper-rule rounded-md bg-white focus:outline-none focus:border-gold-400" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
                    className="px-2.5 py-2 text-xs border border-paper-rule rounded-md bg-white focus:outline-none focus:border-gold-400" />
                  <select value={newType} onChange={e => setNewType(e.target.value)}
                    className="px-2.5 py-2 text-xs border border-paper-rule rounded-md bg-white focus:outline-none focus:border-gold-400">
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <button type="submit" disabled={creating}
                    className="px-3 py-1.5 bg-ink-800 hover:bg-ink-900 disabled:opacity-50 text-white text-[11px] font-semibold rounded-md transition-colors">
                    {creating ? 'Agregando…' : 'Agregar'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-3 py-1.5 text-ink-500 hover:bg-white text-[11px] font-semibold rounded-md transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <MiniCalendar
              events={events} user={user}
              onDelete={handleDeleteEvent}
              onUpdate={handleUpdateEvent}
              onAdd={handleAddFromDay}
            />
          </div>

          <div className="bg-white rounded-xl border border-paper-rule shadow-card p-5">
            <p className="eyebrow mb-4">Actividad reciente</p>
            <ActivityFeed />
          </div>
        </div>

      </div>
    </Layout>
  )
}

function QuickAction({ to, icon, title, sub }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-paper-soft transition-colors group">
      <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-800 group-hover:text-gold-700 transition-colors">{title}</p>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-300 mt-0.5">{sub}</p>
      </div>
    </Link>
  )
}