import { useState } from 'react'
import { Menu } from 'lucide-react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function Layout({ children, onSearch }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Navbar onSearch={onSearch} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow border border-gray-200"
      >
        <Menu className="w-4 h-4 text-gray-600" />
      </button>

      <main className="lg:ml-56 pt-16 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
