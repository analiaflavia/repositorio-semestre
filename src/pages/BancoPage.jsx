import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ChevronLeft, BookOpen, ExternalLink } from 'lucide-react'
import Layout from '../components/Layout'

const BANCOS = {
  'segundo-parcial':   { title: 'Banco Segundo Parcial',        file: 'banco-segundo-parcial.html' },
  'anestesiologia':    { title: 'Banco de Anestesiología',      file: 'banco-anestesiologia.html' },
  'cirugia':           { title: 'Banco de Cirugía',             file: 'banco-cirugia-bloque-qx.html' },
  'imagenes':          { title: 'Banco de Imágenes',            file: 'banco-imagenes-bloque-qx.html' },
  'oftalmo-ortopedia': { title: 'Banco Oftalmo y Ortopedia',    file: 'banco-oftalmo-ortopedia.html' },
  'pediatria-p1':      { title: 'Banco de Pediatría · Parte 1', file: 'banco-pediatria-p1.html' },
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
    window.open(`/bancos/${banco.file}`, '_blank')
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-800 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-900 flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-7 h-7 text-gold-400" />
        </div>
        <h1 className="font-display text-[26px] leading-tight font-semibold text-ink-900 mb-3">
          {banco.title}
        </h1>
        <p className="text-sm text-ink-400 mb-7 leading-relaxed">
          El banco se abre en una pestaña nueva.<br />
          Tu progreso se guarda en este dispositivo.
        </p>
        <button onClick={handleOpen}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink-800 hover:bg-ink-900 text-white font-semibold rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4" /> Abrir banco
        </button>
      </div>
    </Layout>
  )
}