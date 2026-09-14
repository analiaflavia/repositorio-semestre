import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { getPendingUsers, getApprovedUsers, approveUser, rejectUser, revokeUser } from '../services/authService'
import { Check, X, ShieldCheck, UserMinus } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function Admin() {
  const { profile, loading: authLoading } = useAuth()
  const [pending, setPending]   = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('Pendientes')
  const [busy, setBusy]         = useState(null)

  useEffect(() => {
    if (profile?.is_admin) load()
  }, [profile])

  async function load() {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([getPendingUsers(), getApprovedUsers()])
      setPending(p)
      setApproved(a)
    } catch {
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(u) {
    setBusy(u.id)
    try {
      await approveUser(u.id)
      setPending(prev => prev.filter(x => x.id !== u.id))
      setApproved(prev => [...prev, { ...u, approved: true }].sort((a, b) =>
        (a.full_name || '').localeCompare(b.full_name || '')))
      toast.success(`${u.full_name?.split(' ')[0] || 'Usuario'} aprobado`)
    } catch (err) {
      toast.error('No se pudo aprobar: ' + (err.message || ''))
    } finally {
      setBusy(null)
    }
  }

  async function handleReject(u) {
    setBusy(u.id)
    try {
      await rejectUser(u.id)
      setPending(prev => prev.filter(x => x.id !== u.id))
      toast.success('Solicitud rechazada')
    } catch (err) {
      toast.error('No se pudo rechazar: ' + (err.message || ''))
    } finally {
      setBusy(null)
    }
  }

  async function handleRevoke(u) {
    setBusy(u.id)
    try {
      await revokeUser(u.id)
      setApproved(prev => prev.filter(x => x.id !== u.id))
      setPending(prev => [{ ...u, approved: false }, ...prev])
      toast.success('Acceso retirado')
    } catch (err) {
      toast.error('No se pudo retirar: ' + (err.message || ''))
    } finally {
      setBusy(null)
    }
  }

  if (authLoading) return <Layout><LoadingSpinner /></Layout>
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />

  const list = tab === 'Pendientes' ? pending : approved

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-8 pb-6 border-b border-paper-rule">
          <p className="eyebrow mb-2">Administración</p>
          <h1 className="font-display text-[32px] leading-none font-semibold tracking-tight text-ink-900">
            Cuentas
          </h1>
          <p className="text-sm text-ink-400 mt-2.5">
            Aprueba quién puede entrar al repositorio.
          </p>
        </div>

        <div className="flex gap-6 mb-6 border-b border-paper-rule">
          {['Pendientes', 'Aprobadas'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative pb-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                tab === t ? 'text-ink-900' : 'text-ink-300 hover:text-ink-500'
              }`}>
              {t}
              <span className="ml-1.5 text-ink-300">
                ({t === 'Pendientes' ? pending.length : approved.length})
              </span>
              {tab === t && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-gold-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : list.length === 0 ? (
          <div className="flex items-center gap-3.5 px-4 py-6 bg-white rounded-xl border border-dashed border-paper-rule">
            <ShieldCheck className="w-4 h-4 text-ink-300 flex-shrink-0" />
            <p className="text-[13px] text-ink-400">
              {tab === 'Pendientes'
                ? 'No hay solicitudes esperando.'
                : 'Todavía no hay cuentas aprobadas.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-paper-rule shadow-card divide-y divide-paper-rule overflow-hidden">
            {list.map(u => {
              const initials = (u.full_name || u.email || 'U')
                .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
              const isBusy = busy === u.id
              const isMe = u.id === profile.id

              return (
                <div key={u.id} className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[10px] font-medium text-gold-300">{initials}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-800 truncate">
                      {u.full_name || 'Sin nombre'}
                      {u.is_admin && (
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.14em] text-gold-700">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-[10px] text-ink-300 truncate mt-0.5">
                      {u.email}
                      {u.created_at && ` · ${formatDistanceToNow(parseISO(u.created_at), { locale: es, addSuffix: true })}`}
                    </p>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {tab === 'Pendientes' ? (
                      <>
                        <button onClick={() => handleApprove(u)} disabled={isBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-900 disabled:opacity-40 text-white text-xs font-semibold transition-colors">
                          <Check className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button onClick={() => handleReject(u)} disabled={isBusy} title="Rechazar"
                          className="p-2 rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      !isMe && (
                        <button onClick={() => handleRevoke(u)} disabled={isBusy} title="Retirar acceso"
                          className="p-2 rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition-colors">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}