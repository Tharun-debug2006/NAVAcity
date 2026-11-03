import { Navigate } from 'react-router-dom'
import { hasAuthToken } from '../api/client.js'

/**
 * A route that requires a signed-in transport authority.
 *
 * The check is a convenience for the user interface; the real protection is
 * enforced by the backend, which answers `401` for every authority request
 * that does not carry a valid session token.
 */
export default function ProtectedRoute({ children }) {
  if (!hasAuthToken()) return <Navigate to="/authority/login" replace />

  return children
}
