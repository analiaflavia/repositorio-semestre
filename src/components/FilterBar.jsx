import { RESOURCE_TYPES } from '../constants/resourceTypes'

export default function FilterBar({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Kind filter */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {[
          { value: 'all',  label: 'Todos' },
          { value: 'file', label: '📎 Archivos' },
          { value: 'link', label: '🔗 Links' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => set('kind', opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              filters.kind === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <select
        value={filters.type || ''}
        onChange={e => set('type', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <option value="">Tipo: todos</option>
        {RESOURCE_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.sort || 'newest'}
        onChange={e => set('sort', e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <option value="newest">Más recientes</option>
        <option value="oldest">Más antiguos</option>
        <option value="az">A → Z</option>
      </select>

      {/* Clear */}
      {(filters.kind !== 'all' || filters.type || filters.sort !== 'newest') && (
        <button
          onClick={() => onChange({ kind: 'all', type: '', sort: 'newest' })}
          className="text-xs text-brand-600 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
