import { supabase } from '../lib/supabaseClient'

// ── Obtener todos los recursos (con filtros opcionales)
export async function getResources({ semester, subjectId, type, search, limit = 50 } = {}) {
  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (semester)   query = query.eq('semester', semester)
  if (subjectId)  query = query.eq('subject_id', subjectId)
  if (type && type !== 'all') query = query.eq('type', type)
  if (search)     query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data
}

// ── Recursos recientes
export async function getRecentResources(limit = 30) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ── Recursos del usuario actual
export async function getMyResources(userId) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Crear recurso (archivo o link)
export async function createResource(payload) {
  const { data, error } = await supabase
    .from('resources')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Eliminar recurso
export async function deleteResource(id) {
  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Estadísticas por semestre
export async function getSemesterStats(semester) {
  const { data, error } = await supabase
    .from('resources')
    .select('type, subject_id, created_at')
    .eq('semester', semester)
  if (error) throw error

  const files  = data.filter(r => r.type !== 'Joseo').length
  const joseos = data.filter(r => r.type === 'Joseo').length
  const last   = data.length > 0 ? data[0].created_at : null

  return { total: data.length, files, joseos, lastUpdate: last }
}

// ── Buscar en todos los semestres
export async function searchResources(query) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,subject_name.ilike.%${query}%,uploaded_by_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}
// ── Actualizar recurso
export async function updateResource(id, payload) {
  const { data, error } = await supabase
    .from('resources')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}