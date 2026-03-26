import { Link, usePage, router } from '@inertiajs/react'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  BarChart3,
  LogOut
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/services', label: 'Services', icon: Sparkles },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

const Sidebar = () => {

  const { url } = usePage()

  const logout = () => {
    router.post('/logout')
  }

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-emerald-900 to-emerald-800 shadow-2xl border-r border-emerald-200/20 flex flex-col z-50">

      {/* Logo */}
      <div className="p-6 border-b border-emerald-200/20">
        <div className="text-2xl font-bold text-white flex items-center gap-2">
          FreshNest
          <span className="text-emerald-300 text-sm font-normal">Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = url.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white text-emerald-900 shadow-lg font-semibold'
                  : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-200/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>

        <div className="text-emerald-300 text-xs text-center mt-4">
          FreshNest v1.0.0
        </div>
      </div>
    </aside>
  )
}

export default Sidebar