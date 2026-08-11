import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Bell } from 'lucide-react'
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
      toast.error('No se pudo cerrar la sesión')
    }
  }

  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  return (
    <header className="fixed top-0 left-0 lg:left-60 right-0 z-30 h-16 bg-paper/85 backdrop-blur-md border-b border-paper-rule">
      <div className="flex items-center justify-between h-full px-6 gap-6">

        <div className="flex-1 max-w-lg pl-12 lg:pl-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <input
              type="text"
              placeholder="Buscar recursos, materias, usuarios…"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-paper-rule rounded-lg placeholder:text-ink-300 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-100 transition"
              onChange={e => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="relative p-2.5 rounded-lg hover:bg-white transition-colors" aria-label="Notificaciones">
            <Bell className="w-[18px] h-[18px] text-ink-400" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gold-500 rounded-full ring-2 ring-paper" />
          </button>

          <Link to="/profile" className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-white transition-colors">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center">
                <span className="font-mono text-[10px] font-medium text-gold-300">{initials}</span>
              </div>
              <span className="absolute inset-0 rounded-full ring-1 ring-gold-500/30" />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-semibold text-ink-800 max-w-[120px] truncate">
                {profile?.full_name?.split(' ')[0] || 'Usuario'}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-300">
                Estudiante
              </p>
            </div>
          </Link>

          <button onClick={handleSignOut}
            className="p-2.5 rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Cerrar sesión">
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  )
}