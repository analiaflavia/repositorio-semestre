import { supabase } from '../lib/supabaseClient'

export async function getComments(resourceId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addComment({ resourceId, userId, userName, text }) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{
      resource_id: resourceId,
      user_id: userId,
      user_name: userName,
      text,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteComment(id) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
