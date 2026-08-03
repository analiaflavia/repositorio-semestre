import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { ChevronLeft } from 'lucide-react'
import Layout from '../components/Layout'

const BANCOS = {
  'segundo-parcial':    { title: 'Banco Segundo Parcial',       file: '/bancos/banco-segundo-parcial.html' },
  'anestesiologia':     { title: 'Banco de Anestesiología',     file: '/bancos/banco-anestesiologia.html' },
  'cirugia':            { title: 'Banco de Cirugía',            file: '/bancos/banco-cirugia-bloque-qx.html' },
  'imagenes':           { title: 'Banco de Imágenes',           file: '/bancos/banco-imagenes-bloque-qx.html' },
  'oftalmo-ortopedia':  { title: 'Banco Oftalmo y Ortopedia',   file: '/bancos/banco-oftalmo-ortopedia.html' },
}

export default function BancoPage() {
  const { bancoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const banco = BANCOS[bancoId]

  useEffect(() => {
    if (!banco || !user) return

    // Guardar que entró al banco (upsert de progreso)
    supabase.from('quiz_progress').upsert({
      user_id: bancoId,
      banco_id: bancoId,
      question_index: 0,
      answer: null,
      is_correct: null,
    }, { onConflict: 'user_id,banco_id' })
  }, [bancoId, user])

  if (!banco) return (
    <Layout>
      <p className="text-gray-500 text-center mt-20">Banco no encontrado.</p>
    </Layout>
  )

  return (
    <Layout>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-lg font-bold text-gray-900">{banco.title}</h1>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height: 'calc(100vh - 160px)' }}>
        <iframe
          src={banco.file}
          title={banco.title}
          className="w-full h-full border-0"
          allow="fullscreen"
        />
      </div>
    </Layout>
  )
}