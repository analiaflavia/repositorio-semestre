import { supabase } from '../lib/supabaseClient'

// Registra que alguien abrió un recurso
export async function logView({ resourceId, userId, userName }) {
  if (!resourceId || !userId) return
  const { error } = await supabase
    .from('resource_views')
    .insert([{ resource_id: resourceId, user_id: userId, user_name: userName }])
  if (error) throw error
}

// Trae las vistas de los últimos 7 días para una lista de recursos
export async function getRecentViews(resourceIds = []) {
  if (!resourceIds.length) return {}

  const since = new Date()
  since.setDate(since.getDate() - 7)

  const { data, error } = await supabase
    .from('resource_views')
    .select('resource_id, user_id, user_name, created_at')
    .in('resource_id', resourceIds)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error

  // Agrupa por recurso, contando personas distintas
  const map = {}
  data.forEach(v => {
    if (!map[v.resource_id]) map[v.resource_id] = { users: new Map() }
    if (!map[v.resource_id].users.has(v.user_id)) {
      map[v.resource_id].users.set(v.user_id, v.user_name)
    }
  })

  const result = {}
  Object.entries(map).forEach(([id, { users }]) => {
    result[id] = {
      count: users.size,
      names: [...users.values()].filter(Boolean),
    }
  })
  return result
}