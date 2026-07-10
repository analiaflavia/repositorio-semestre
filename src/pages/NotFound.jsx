import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <Search className="w-9 h-9 text-gray-300" />
        </div>
        <h1 className="text-5xl font-bold text-gray-200 mb-3">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Página no encontrada</h2>
        <p className="text-sm text-gray-400 mb-7">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition-colors">
          <Home className="w-4 h-4" /> Ir al Dashboard
        </Link>
      </div>
    </div>
  )
}
