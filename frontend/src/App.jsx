import { Navigate, Route, Routes } from 'react-router-dom'
import PublicDashboard from './pages/PublicDashboard.jsx'
import AuthorityDashboard from './pages/AuthorityDashboard.jsx'
import AuthorityLogin from './pages/AuthorityLogin.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import CommuterLayout from './components/CommuterLayout.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<Navigate to="/public" replace />} />
    <Route path="/public" element={<CommuterLayout><PublicDashboard /></CommuterLayout>} />
    <Route path="/authority/login" element={<CommuterLayout><AuthorityLogin /></CommuterLayout>} />
    <Route path="/authority" element={<ProtectedRoute><AuthorityDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/public" replace />} />
  </Routes>
}

export default function App() { return <AuthProvider><AppRoutes /></AuthProvider> }
