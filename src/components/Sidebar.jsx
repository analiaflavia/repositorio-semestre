import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, User, ChevronRight, BookOpen, X, Upload } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { clsx } from '../utils/clsx'

const semesterColors = {
  '12': 'bg-blue-500',
  '13': 'bg-indigo-500',
  '14': 'bg-violet-500',
  '15': 'bg-sky-500',
  '16': 'bg-cyan-500',
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 z-40 w-56 flex flex-col transition-transform duration-200',
        'bg-[#0f1729] text-white',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">DM</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">DERECHO MÉDICO</p>
            <p className="text-[10px] text-white/40 leading-tight">Repositorio del Semestre</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <SideLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />

          <div className="pt-4 pb-1.5 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Semestres</p>
          </div>

          {SEMESTERS.map(s => (
            <NavLink
              key={s.id}
              to={`/semester/${s.id}`}
              onClick={onClose}
              className={({ isActive }) => clsx(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', semesterColors[s.id])} />
              <span className="flex-1">{s.label}</span>
              <ChevronRight className="w-3 h-3 opacity-30" />
            </NavLink>
          ))}

          <div className="pt-4 pb-1.5 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">General</p>
          </div>
          <SideLink to="/recents" icon={<Clock className="w-4 h-4" />} label="Recientes" />
          <SideLink to="/profile" icon={<User className="w-4 h-4" />} label="Mi Perfil" />
        </nav>

        {/* Upload button */}
        <div className="p-4 border-t border-white/10">
          <NavLink to="/upload"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors">
            <Upload className="w-4 h-4" /> Subir archivo
          </NavLink>
          <p className="text-[10px] text-white/20 text-center mt-3">Derecho Médico © 2025</p>
        </div>
      </aside>
    </>
  )
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => clsx(
      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
      isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
    )}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}