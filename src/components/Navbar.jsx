import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, User, Bell } from 'lucide-react'
import { signOut } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Navbar({ onSearch }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-16">
      <div className="flex items-center justify-between h-full px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">DM</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-700 text-gray-900 leading-tight font-semibold">DERECHO MÉDICO</p>
            <p className="text-xs text-gray-400 leading-tight">Repositorio del Semestre</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recursos, materias, usuarios..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-600" />
            </div>
            <span className="hidden sm:block text-sm text-gray-700 font-medium max-w-[120px] truncate">
              {profile?.full_name || user?.email}
            </span>
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
