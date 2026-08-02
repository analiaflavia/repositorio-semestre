import { supabase } from '../lib/supabaseClient'

export async function getReactions(resourceId) {
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .eq('resource_id', resourceId)
  if (error) throw error
  return data
}

export async function toggleReaction(resourceId, userId, emoji) {
  // Busca si ya existe esa reaction de ese user
  const { data: existing, error: findError } = await supabase
    .from('reactions')
    .select('*')
    .eq('resource_id', resourceId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    // Ya reaccionó — la quitamos
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existing.id)
    if (error) throw error
    return null
  } else {
    // No había — la agregamos
    const { data, error } = await supabase
      .from('reactions')
      .insert([{ resource_id: resourceId, user_id: userId, emoji }])
      .select()
      .single()
    if (error) throw error
    return data
  }
}