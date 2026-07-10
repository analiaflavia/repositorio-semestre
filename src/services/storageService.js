import { supabase } from '../lib/supabaseClient'

// ── Subir archivo al bucket semester-files
export async function uploadFile(file, userId) {
  const ext      = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path     = `${userId}/${filename}`

  const { error } = await supabase.storage
    .from('semester-files')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error
  return path
}

// ── Obtener URL pública (firmada) para descarga
export async function getFileUrl(path) {
  const { data, error } = await supabase.storage
    .from('semester-files')
    .createSignedUrl(path, 60 * 60) // 1 hora
  if (error) throw error
  return data.signedUrl
}

// ── Descargar archivo directamente
export async function downloadFile(path, filename) {
  const { data, error } = await supabase.storage
    .from('semester-files')
    .download(path)
  if (error) throw error

  const url  = URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href  = url
  link.download = filename || 'archivo'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Eliminar archivo del bucket
export async function deleteFile(path) {
  const { error } = await supabase.storage
    .from('semester-files')
    .remove([path])
  if (error) throw error
}
