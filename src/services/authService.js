import { supabase } from '../lib/supabaseClient'

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Aprobación de cuentas ──────────────────────────────

export async function getPendingUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getApprovedUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('approved', true)
    .order('full_name', { ascending: true })
  if (error) throw error
  return data
}

export async function approveUser(id) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ approved: true, approved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function revokeUser(id) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ approved: false, approved_at: null })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function rejectUser(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}