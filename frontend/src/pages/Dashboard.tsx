import { useState, useEffect } from 'react'
import { Users, CalendarDays, Briefcase, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Loading'

interface Stats {
  employees_count: number
  pending_leaves: number
  active_offers: number
  monthly_payroll: number
  payroll_currency: string
  contract_stats: { contract_type: string; count: number }[]
  payroll_history: { month: number; year: number; total: number }[]
  leave_by_status: { status: string; count: number }[]
}

const CONTRACT_LABELS: Record<string, string> = {
  CDI: 'CDI', CDD: 'CDD', stage: 'Stage', freelance: 'Freelance', 'Prestation de services': 'Prestation',
}
const STATUS_LABELS: Record<string, string> = { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé' }
const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444']
const MONTHS = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({ employees_count: 0, pending_leaves: 0, active_offers: 0, monthly_payroll: 0, payroll_currency: 'CDF', contract_stats: [], payroll_history: [], leave_by_status: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats/').then((res) => setStats(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />

  const cards = [
    { label: 'Employés', value: stats.employees_count, icon: Users, color: 'bg-blue-500' },
    { label: 'Congés en attente', value: stats.pending_leaves, icon: CalendarDays, color: 'bg-amber-500' },
    { label: 'Offres actives', value: stats.active_offers, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Masse salariale', value: `${stats.monthly_payroll.toLocaleString()} ${stats.payroll_currency}`, icon: DollarSign, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      <p className="text-gray-500 mb-6">Bonjour, {user?.first_name} ! Voici un aperçu de votre application.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Évolution masse salariale (6 mois)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.payroll_history.map(d => ({ ...d, label: `${MONTHS[d.month]} ${d.year}` }))}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString()} ${stats.payroll_currency}`} />
              <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Répartition par contrat</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.contract_stats.map(d => ({ name: CONTRACT_LABELS[d.contract_type] || d.contract_type, value: d.count }))} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {stats.contract_stats.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques congés</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.leave_by_status.map(d => ({ name: STATUS_LABELS[d.status] || d.status, count: d.count }))}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
