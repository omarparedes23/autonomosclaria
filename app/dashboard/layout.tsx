import Link from 'next/link'
import { logoutUser } from '@/lib/actions/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-8 border-b border-gray-100">
          <Link href="/dashboard" className="text-3xl font-extrabold tracking-tight hover:opacity-80 transition-opacity">Claria.</Link>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          <Link href="/dashboard" className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">Dashboard</Link>
          <Link href="/dashboard/clients" className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">Clientes</Link>
          <Link href="/dashboard/services" className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">Servicios</Link>
          <Link href="/dashboard/profile" className="px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">Mi Perfil</Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <form action={logoutUser}>
            <button type="submit" className="w-full px-4 py-3 text-left text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">Cerrar Sesión</button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-10 mt-0">
        <div className="max-w-5xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  )
}
