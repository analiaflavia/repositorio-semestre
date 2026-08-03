import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ChevronLeft, BookOpen, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'

const BANCOS = {
  'segundo-parcial':   { title: 'Banco Segundo Parcial',     file: '/bancos/banco-segundo-parcial.html' },
  'anestesiologia':    { title: 'Banco de Anestesiología',   file: '/bancos/banco-anestesiologia.html' },
  'cirugia':           { title: 'Banco de Cirugía',          file: '/bancos/banco-cirugia-bloque-qx.html' },
  'imagenes':          { title: 'Banco de Imágenes',         file: '/bancos/banco-imagenes-bloque-qx.html' },
  'oftalmo-ortopedia': { title: 'Banco Oftalmo y Ortopedia', file: '/bancos/banco-oftalmo-ortopedia.html' },
}

export default function BancoPage() {
  const { bancoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const banco = BANCOS[bancoId]

  if (!banco) return (
    <Layout>
      <p className="text-gray-500 text-center mt-20">Banco no encontrado.</p>
    </Layout>
  )

  function handleOpen() {
    const url = user?.id ? `${banco.file}?uid=${user.id}` : banco.file
    window.open(url, '_blank')
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{banco.title}</h1>
        <p className="text-gray-400 text-sm mb-6">
          El banco se abre en una pestaña nueva. Tu progreso se guarda automáticamente.
        </p>
        <button onClick={handleOpen}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors mx-auto">
          <ExternalLink className="w-4 h-4" /> Abrir banco
        </button>
      </div>
    </Layout>
  )
}