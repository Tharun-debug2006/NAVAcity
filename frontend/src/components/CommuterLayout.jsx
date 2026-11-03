import MainLayout from './MainLayout.jsx'
import TopNav from './TopNav.jsx'
export default function CommuterLayout({ children }) { return <MainLayout><TopNav /><main className="mx-auto w-full max-w-[1500px] min-w-0 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">{children}</main></MainLayout> }
