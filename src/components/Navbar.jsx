import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Bell, User } from 'lucide-react'
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

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <header className="fixed top-0 left-56 right-0 z-30 bg-white border-b border-gray-100 h-16">
      <div className="flex items-center justify-between h-full px-6 gap-4">

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recursos, materias, usuarios..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Link to="/profile" className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight max-w-[120px] truncate">
                {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Estudiante</p>
            </div>
          </Link>

          <button onClick={handleSignOut}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}