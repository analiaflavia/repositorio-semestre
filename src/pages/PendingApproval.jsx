import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../services/authService'
import { Clock, LogOut } from 'lucide-react'

export default function PendingApproval() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-block mb-8">
          <img src="/logo.png" alt="" className="w-20 h-20 rounded-full object-cover mx-auto" />
          <span className="absolute inset-0 rounded-full ring-1 ring-gold-500/40" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] mb-6">
          <Clock className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-400">
            Cuenta pendiente
          </span>
        </div>

        <h1 className="font-display text-[28px] leading-tight font-semibold text-white mb-4">
          Tu cuenta está en revisión
        </h1>

        <p className="text-sm text-white/50 leading-relaxed mb-2">
          El repositorio es privado para el cohorte de Derecho Médico.
          Una vez aprobada tu cuenta vas a poder entrar con este mismo correo.
        </p>

        <p className="font-mono text-[10px] text-white/30 mt-6 mb-10">
          {profile?.email || user?.email}
        </p>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>

        <p className="font-mono text-[9px] text-white/20 tracking-wider mt-16">
          DERECHO LINGUAL · MMXXV
        </p>
      </div>
    </div>
  )
}