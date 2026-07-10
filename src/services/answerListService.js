import { supabase } from '../lib/supabaseClient'

export async function getAnswerLists(subjectId) {
  const { data, error } = await supabase
    .from('answer_lists')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createAnswerList({ semester, subjectId, title, createdBy, createdByName }) {
  const { data, error } = await supabase
    .from('answer_lists')
    .insert([{
      semester,
      subject_id: subjectId,
      title,
      answers: [],
      created_by: createdBy,
      created_by_name: createdByName,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAnswerList(id, { answers, updatedByName, title }) {
  const { data, error } = await supabase
    .from('answer_lists')
    .update({ answers, title, updated_by_name: updatedByName, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAnswerList(id) {
  const { error } = await supabase
    .from('answer_lists')
    .delete()
    .eq('id', id)
  if (error) throw error
}