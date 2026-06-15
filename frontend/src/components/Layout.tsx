import { Outlet, NavLink, Link } from 'react-router-dom'
import { Users, CalendarDays, DollarSign, Briefcase, Star, Building2, LayoutDashboard, LogOut, Bell, Menu, X, BadgePlus, Shield, Upload, CalendarRange, FileSignature, GraduationCap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['admin', 'rh', 'manager', 'employee'] },
  { to: '/employees', icon: Users, label: 'Employés', roles: ['admin', 'rh', 'manager'] },
  { to: '/import-excel', icon: Upload, label: 'Import Excel', roles: ['admin', 'rh'] },
  { to: '/postes', icon: BadgePlus, label: 'Postes', roles: ['admin', 'rh'] },
  { to: '/contracts', icon: FileSignature, label: 'Contrats', roles: ['admin', 'rh'] },
  { to: '/departements', icon: Building2, label: 'Départements', roles: ['admin', 'rh'] },
  { to: '/leaves', icon: CalendarDays, label: 'Congés', roles: ['admin', 'rh', 'manager', 'employee'] },
  { to: '/leave-calendar', icon: CalendarRange, label: 'Calendrier congés', roles: ['admin', 'rh', 'manager', 'employee'] },
  { to: '/payroll', icon: DollarSign, label: 'Paie', roles: ['admin', 'rh', 'employee'] },
  { to: '/recruitment', icon: Briefcase, label: 'Recrutement', roles: ['admin', 'rh'] },
  { to: '/evaluations', icon: Star, label: 'Évaluations', roles: ['admin', 'rh', 'manager', 'employee'] },
  { to: '/trainings', icon: GraduationCap, label: 'Formations', roles: ['admin', 'rh', 'manager', 'employee'] },
  { to: '/audit', icon: Shield, label: 'Audit', roles: ['admin', 'rh'] },
]

interface NotificationItem {
  id: number
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifs, setNotifs] = useState<NotificationItem[]>([])
  const [renewalCount, setRenewalCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  const filteredNav = navItems.filter((item) => item.roles.includes(user?.role || ''))

  useEffect(() => {
    if (!user) return
    const fetchNotifs = () => api.get('/notifications/unread_count/').then(r => setNotifCount(r.data.count)).catch(() => {})
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user || !['admin', 'rh'].includes(user.role)) return
    api.get('/employees/contracts/renewal-alerts/').then(r => setRenewalCount(r.data.length)).catch(() => {})
  }, [user])

  useEffect(() => {
    if (notifOpen && user) {
      api.get('/notifications/').then(r => setNotifs(r.data.results || r.data)).catch(() => {})
    }
  }, [notifOpen, user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await api.post('/notifications/mark_all_read/')
    setNotifs(notifs.map(n => ({ ...n, is_read: true })))
    setNotifCount(0)
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-primary text-white flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">RHA</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          <p className="text-sm text-blue-200 mt-1">Ressource Humaine App</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={18} />
              {item.label}
              {item.to === '/contracts' && renewalCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-orange-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {renewalCount > 9 ? '9+' : renewalCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link to="/profile" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 mb-3 hover:bg-white/10 rounded-lg px-2 py-2 transition-colors">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-semibold">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-blue-200 capitalize">{user?.role}</p>
            </div>
          </Link>
          <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:justify-end sticky top-0 z-10">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <div className="flex items-center gap-4" ref={notifRef}>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                <Bell size={20} />
                {notifCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifCount > 9 ? '9+' : notifCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {notifCount > 0 && <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tout marquer lu</button>}
                  </div>
                  {notifs.length === 0 ? (
                    <p className="text-center py-8 text-gray-400 text-sm">Aucune notification</p>
                  ) : (
                    notifs.slice(0, 10).map((n) => (
                      <Link key={n.id} to={n.link || '#'} onClick={() => setNotifOpen(false)} className={`block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/50' : ''}`}>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr')}</p>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
