import { useState } from 'react'
import { Menu } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function Layout({ children, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-paper">
      <Toaster position="top-right" toastOptions={{
        duration: 3500,
        style: { background: '#0A1628', color: '#fff', fontSize: '13px', borderRadius: '10px' },
      }} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onSearch={onSearch} />

      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3.5 left-4 z-50 lg:hidden p-2.5 rounded-lg bg-ink-900 text-white shadow-card"
        aria-label="Abrir menú"
      >
        <Menu className="w-4 h-4" />
      </button>

      <main className="lg:ml-60 pt-16 min-h-screen">
        <div className="px-6 py-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}