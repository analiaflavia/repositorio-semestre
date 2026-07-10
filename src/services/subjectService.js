import { supabase } from '../lib/supabaseClient'

// ── Obtener materias de un semestre
export async function getSubjects(semester) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('semester', semester)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

// ── Obtener una materia por id
export async function getSubject(id) {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ── Crear materia
export async function createSubject({ semester, name, createdBy }) {
  const { data, error } = await supabase
    .from('subjects')
    .insert([{ semester, name, created_by: createdBy }])
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Eliminar materia
export async function deleteSubject(id) {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Contar recursos por materia
export async function getSubjectResourceCount(subjectId) {
  const { count, error } = await supabase
    .from('resources')
    .select('*', { count: 'exact', head: true })
    .eq('subject_id', subjectId)
  if (error) throw error
  return count || 0
}
