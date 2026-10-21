import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'

function RequireRole({ allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="auth-loading" aria-busy="true" />
  if (!user) return <Navigate to="/staff/login" replace />
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />
  }

  return <Outlet />
}

export default RequireRole