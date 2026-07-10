import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/authService'
import toast from 'react-hot-toast'
import { Toaster } from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName || !email || !password) { toast.error('Completa todos los campos'); return }
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return }

    setLoading(true)
    try {
      await signUp({ email, password, fullName })
      toast.success('¡Cuenta creada! Inicia sesión para continuar.')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg">DM</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">DERECHO MÉDICO</h1>
          <p className="text-sm text-gray-500 mt-1">Crea tu cuenta del repositorio</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Crear cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                required placeholder="María García López" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="tu@correo.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="Mínimo 6 caracteres" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                required placeholder="Repite la contraseña" className={inputCls} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? <><Spinner /> Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
