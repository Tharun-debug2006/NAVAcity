import MainLayout from './MainLayout.jsx'
import TopNav from './TopNav.jsx'
import Sidebar from './Sidebar.jsx'
export default function AuthorityLayout({ children, items, active, onChange }) { return <MainLayout><TopNav authority /><div className="grid min-h-0 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]"><Sidebar items={items} active={active} onChange={onChange} /><main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">{children}</main></div></MainLayout> }
