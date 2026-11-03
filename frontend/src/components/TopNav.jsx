import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function TopNav({ authority = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, isAuthenticated } = useAuth()
  const commuter = location.pathname === '/public'
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6"><div><p className="text-lg font-bold tracking-tight text-slate-900">NavaCity</p><p className="text-xs text-slate-600">Transit intelligence</p></div><nav aria-label="Dashboard view" className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${commuter ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'}`} onClick={() => { if (!commuter && isAuthenticated) signOut(); navigate('/public') }}>Commuter View</button><button className={`rounded-lg px-4 py-2 text-sm font-semibold ${!commuter ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'}`} onClick={() => navigate(authority && isAuthenticated ? '/authority' : '/authority/login')}>Authority View</button></nav></div></header>
}
