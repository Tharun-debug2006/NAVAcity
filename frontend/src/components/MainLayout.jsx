export default function MainLayout({ children, className = '' }) {
  return <div className={`min-h-screen w-full bg-slate-50 text-slate-900 ${className}`}><div className="mx-auto grid min-h-screen w-full max-w-[1600px] grid-rows-[auto_1fr]">{children}</div></div>
}
