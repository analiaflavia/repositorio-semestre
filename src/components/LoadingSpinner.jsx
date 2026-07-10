export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-3 border-brand-100 border-t-brand-600 rounded-full animate-spin`}
        style={{ borderWidth: 3 }} />
      <p className="text-sm text-gray-400">Cargando...</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-16">{spinner}</div>
}
