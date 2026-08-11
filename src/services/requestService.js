import { supabase } from '../lib/supabaseClient'

export async function getRequests(subjectId) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createRequest({ semester, subjectId, subjectName, text, userId, userName }) {
  const { data, error } = await supabase
    .from('requests')
    .insert([{
      semester,
      subject_id: subjectId,
      subject_name: subjectName,
      text,
      requested_by: userId,
      requested_by_name: userName,
      fulfilled: false,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fulfillRequest(id) {
  const { data, error } = await supabase
    .from('requests')
    .update({ fulfilled: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteRequest(id) {
  const { error } = await supabase.from('requests').delete().eq('id', id)
  if (error) throw error
}