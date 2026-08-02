import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { FileText, Link2, Zap, Clock } from 'lucide-react'

const TYPE_ICONS = {
  'Joseo': <Zap className="w-3 h-3 text-amber-500" />,
  'link':  <Link2 className="w-3 h-3 text-green-500" />,
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, type, resource_kind, subject_name, semester, uploaded_by_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
      if (!error) setActivities(data)
      setLoading(false)
    }
    load()

    // Realtime
    const channel = supabase
      .channel('resources-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'resources' }, payload => {
        setActivities(prev => [payload.new, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-2 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )

  if (activities.length === 0) return (
    <p className="text-xs text-gray-400 text-center py-4">No hay actividad reciente.</p>
  )

  return (
    <div className="space-y-1">
      {activities.map(a => (
        <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-brand-700 font-bold text-[10px]">
              {(a.uploaded_by_name || 'U').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 leading-snug">
              <span className="font-semibold">{a.uploaded_by_name?.split(' ')[0] || 'Alguien'}</span>
              {' subió '}
              <span className="font-medium text-gray-900 truncate">"{a.title}"</span>
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-400">{a.subject_name || `Sem. ${a.semester}`}</span>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {formatDistanceToNow(parseISO(a.created_at), { locale: es, addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}