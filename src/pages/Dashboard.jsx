import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SemesterCard from '../components/SemesterCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEMESTERS } from '../constants/semesters'
import { getSubjects } from '../services/subjectService'
import { getSemesterStats } from '../services/resourceService'
import { useAuth } from '../hooks/useAuth'
import { Upload, Link2, Zap, Plus, Calendar, Trash2, Pencil, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { format, parseISO, isFuture, isToday } from 'date-fns'
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

function EventRow({ ev, user, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [title,   setTitle]   = useState(ev.title)
  const [date,    setDate]    = useState(ev.date)
  const [type,    setType]    = useState(ev.type)
  const [materia, setMateria] = useState(ev.semester || '')
  const [saving,  setSaving]  = useState(false)

  const parsedDate = parseISO(ev.date)
  const today = isToday(parsedDate)

  async function handleSave() {
    if (!title.trim() || !date) { toast.error('Completa título y fecha'); return }
    setSaving(true)
    try {
      const updated = await updateEvent(ev.id, { title: title.trim(), date, type, semester: materia || null })
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
    setTitle(ev.title); setDate(ev.date); setType(ev.type); setMateria(ev.semester || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={materia} onChange={e => setMateria(e.target.value)} placeholder="Materia (opcional)"
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
            <Check className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors">
            <X className="w-3.5 h-3.5" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`group flex items-center gap-3 p-3 rounded-xl transition-colors ${today ? 'bg-red-50 border border-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
      <div className={`text-center flex-shrink-0 w-10 ${today ? 'text-red-600' : 'text-gray-600'}`}>
        <p className="text-[10px] font-medium uppercase">{format(parsedDate, 'MMM', { locale: es })}</p>
        <p className="text-lg font-bold leading-none">{format(parsedDate, 'd')}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
          {ev.semester && <span className="text-[10px] text-gray-500">{ev.semester}</span>}
          {today && <span className="text-[10px] font-semibold text-red-600">¡Hoy!</span>}
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
        <button onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-all">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {ev.created_by === user?.id && (
          <button onClick={() => onDelete(ev.id)}
            className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [semesterData, setSemesterData] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [events,     setEvents]     = useState([])
  const [showForm,   setShowForm]   = useState(false)
  const [newTitle,   setNewTitle]   = useState('')
  const [newDate,    setNewDate]    = useState('')
  const [newType,    setNewType]    = useState('Examen')
  const [newMateria, setNewMateria] = useState('')
  const [creating,   setCreating]   = useState(false)

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        SEMESTERS.map(async s => {
          const [subjects, stats] = await Promise.all([getSubjects(s.id), getSemesterStats(s.id)])
          return { id: s.id, subjectCount: subjects.length, stats }
        })
      )
      const map = {}
      results.forEach(r => { map[r.id] = r })
      setSemesterData(map)
      setLoading(false)
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
        semester: newMateria.trim() || null,
        created_by: user.id, created_by_name: profile?.full_name || user.email,
      })
      setEvents(prev => [...prev, ev].sort((a, b) => a.date.localeCompare(b.date)))
      setNewTitle(''); setNewDate(''); setNewType('Examen'); setNewMateria('')
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

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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

      {/* Calendario */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-gray-900">Fechas importantes</h2>
            {upcomingEvents.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-100 text-brand-700 font-semibold">{upcomingEvents.length} próximas</span>
            )}
          </div>
          <button onClick={() => setShowForm(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar fecha
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateEvent} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                placeholder="Título (ej. Parcial 1 Cirugía)" required
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select value={newType} onChange={e => setNewType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" value={newMateria} onChange={e => setNewMateria(e.target.value)}
                placeholder="Materia (ej. Cirugía, Anatomía...)"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-medium rounded-lg transition-colors">
                {creating ? 'Agregando...' : 'Agregar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No hay fechas próximas. ¡Agrega la primera!</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map(ev => (
              <EventRow key={ev.id} ev={ev} user={user}
                onDelete={handleDeleteEvent}
                onUpdate={handleUpdateEvent} />
            ))}
          </div>
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