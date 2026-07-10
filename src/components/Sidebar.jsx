import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, User, ChevronRight, BookOpen, X } from 'lucide-react'
import { SEMESTERS } from '../constants/semesters'
import { clsx } from '../utils/clsx'

const semesterColors = {
  '12': 'text-blue-600   bg-blue-50   hover:bg-blue-100',
  '13': 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
  '14': 'text-violet-600 bg-violet-50 hover:bg-violet-100',
  '15': 'text-sky-600    bg-sky-50    hover:bg-sky-100',
  '16': 'text-cyan-600   bg-cyan-50   hover:bg-cyan-100',
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-16 left-0 bottom-0 z-30 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close btn mobile */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Dashboard */}
          <SideLink to="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />

          {/* Semestres */}
          <div className="pt-3 pb-1 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Semestres</p>
          </div>
          {SEMESTERS.map(s => (
            <NavLink
              key={s.id}
              to={`/semester/${s.id}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? semesterColors[s.id]
                    : 'text-gray-600 hover:bg-gray-50'
                )
              }
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{s.label}</span>
              <ChevronRight className="w-3 h-3 opacity-40" />
            </NavLink>
          ))}

          {/* Extra */}
          <div className="pt-3 pb-1 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">General</p>
          </div>
          <SideLink to="/recents"  icon={<Clock className="w-4 h-4" />}  label="Recientes" />
          <SideLink to="/profile"  icon={<User className="w-4 h-4" />}   label="Mi Perfil" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">Derecho Médico © 2025</p>
        </div>
      </aside>
    </>
  )
}

function SideLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-600 hover:bg-gray-50'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}
