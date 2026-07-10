import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6 flex-wrap">
      <Link to="/dashboard" className="flex items-center gap-1 text-gray-400 hover:text-brand-600 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            {isLast || !item.href ? (
              <span className={`font-medium ${isLast ? 'text-gray-900' : 'text-gray-400'}`}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href} className="text-gray-400 hover:text-brand-600 transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
