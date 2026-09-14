import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'
import PendingApproval from '../pages/PendingApproval'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />

  // Cuenta creada pero todavía sin aprobar
  if (profile && profile.approved === false) return <PendingApproval />

  return children
}