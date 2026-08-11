import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, User, X, Upload } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { clsx } from '../utils/clsx'

const semesterAccent = {
  '12': 'bg-gold-500',
  '13': 'bg-[#6E7E9B]',
  '14': 'bg-[#8A7CA8]',
  '15': 'bg-[#5F8A8B]',
  '16': 'bg-[#9B7B6B]',
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 z-40 w-60 flex flex-col transition-transform duration-200',
        'bg-ink-900 text-white',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Sello */}
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="relative flex-shrink-0">
            <img src="/logo.png" alt="" className="w-12 h-12 rounded-full object-cover" />
            <span className="absolute inset-0 rounded-full ring-1 ring-gold-500/40" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold leading-tight tracking-tight text-white">
              Derecho Médico
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-gold-400/70 leading-tight mt-0.5">
              Repositorio
            </p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-5 h-px bg-gradient-to-r from-gold-500/50 to-transparent" />

        <nav className="flex-1 overflow-y-auto scrollbar-hide py-5 px-3 space-y-0.5">
          <SideLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 px-3 pt-6 pb-2">
            Semestres
          </p>

          {SEMESTERS.map(s => (
            <NavLink
              key={s.id}
              to={`/semester/${s.id}`}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'group relative flex items-center gap-3 pl-3 pr-2.5 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-white/[0.07] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-gold-500" />
                  )}
                  <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', semesterAccent[s.id])} />
                  <span className="flex-1 font-medium">{s.label}</span>
                  <span className="font-mono text-[10px] text-white/25 group-hover:text-white/40">
                    {s.id}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 px-3 pt-6 pb-2">
            General
          </p>
          <SideLink to="/recents" icon={<Clock className="w-4 h-4" />} label="Recientes" />
          <SideLink to="/profile" icon={<User className="w-4 h-4" />} label="Mi perfil" />
        </nav>

        <div className="p-4">
          <NavLink to="/upload"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-ink-900 text-sm font-semibold transition-colors">
            <Upload className="w-4 h-4" /> Subir archivo
          </NavLink>
          <p className="font-mono text-[9px] text-white/20 text-center mt-4 tracking-wider">
            DERECHO LINGUAL · MMXXV
          </p>
        </div>
      </aside>
    </>
  )
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => clsx(
      'relative flex items-center gap-3 pl-3 pr-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive ? 'bg-white/[0.07] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white/90'
    )}>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-gold-500" />}
          {icon}
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}