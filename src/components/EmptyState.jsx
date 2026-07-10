import { FolderOpen, FileX, Link2, Search } from 'lucide-react'

const icons = {
  resources: FolderOpen,
  subjects:  FolderOpen,
  search:    Search,
  links:     Link2,
  default:   FileX,
}

export default function EmptyState({ title, description, action, variant = 'default' }) {
  const Icon = icons[variant] || icons.default
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-5">{description}</p>}
      {action && action}
    </div>
  )
}
