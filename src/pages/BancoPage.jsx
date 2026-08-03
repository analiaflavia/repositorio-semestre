import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ChevronLeft } from 'lucide-react'
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
  const iframeRef = useRef(null)
  const banco = BANCOS[bancoId]

  // Listen for GET_USER_ID requests from the iframe
  useEffect(() => {
    function handleMessage(e) {
      if (e.data && e.data.type === 'GET_USER_ID' && user?.id) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'SET_USER_ID', userId: user.id },
          '*'
        )
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [user])

  // Also send user_id when iframe loads
  function handleIframeLoad() {
    if (user?.id) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'SET_USER_ID', userId: user.id },
        '*'
      )
    }
  }

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

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        style={{ height: 'calc(100vh - 160px)' }}>
        <iframe
          ref={iframeRef}
          src={banco.file}
          title={banco.title}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          allow="fullscreen"
        />
      </div>
    </Layout>
  )
}
