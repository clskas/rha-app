import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Check, X, Download } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'

interface Leave {
  id: number
  employee_name: string
  leave_type_name: string
  start_date: string
  end_date: string
  status: string
  reason: string
  comment: string
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Refusé',
}

export default function Leaves() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/leaves/${filter ? `?status=${filter}` : ''}${(filter ? '&' : '?')}page=${page}&page_size=20`)
      .then((res) => { setLeaves(res.data.results || res.data); setTotal(res.data.count || (res.data.results || res.data).length) })
      .catch(() => showError('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [filter, page])

  const handleAction = async (id: number, action: 'approve' | 'reject', comment: string = '') => {
    try {
      await api.post(`/leaves/${id}/${action}/`, { comment })
      const label = action === 'approve' ? 'approuvé' : 'refusé'
      success(`Congé ${label} avec succès`)
      setLeaves(leaves.map((l) => l.id === id ? { ...l, status: action === 'approve' ? 'approved' : 'rejected', comment } : l))
    } catch {
      showError("Erreur lors de l'action")
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Congés</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            api.get('/leaves/export-csv/', { responseType: 'blob' }).then((res) => {
              const url = window.URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a'); a.href = url; a.download = 'conges.csv'; a.click()
              window.URL.revokeObjectURL(url)
            }).catch(() => showError('Erreur export CSV'))
          }} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={18} /> Export CSV
          </button>
          <Link to="/leaves/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
            <Plus size={18} /> Nouvelle demande
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(1) }} className={`px-3 py-1.5 text-sm rounded-lg ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s ? statusLabels[s] : 'Tous'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Employé</th>
                <th className="text-left px-6 py-3">Type</th>
                <th className="text-left px-6 py-3">Du</th>
                <th className="text-left px-6 py-3">Au</th>
                <th className="text-left px-6 py-3">Statut</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{leave.employee_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.leave_type_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.start_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{leave.end_date}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[leave.status]}`}>{statusLabels[leave.status]}</span></td>
                  <td className="px-6 py-4 text-right">
                    {leave.status === 'pending' && (user?.role === 'admin' || user?.role === 'rh' || user?.role === 'manager') && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleAction(leave.id, 'approve')} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                        <button onClick={() => setConfirmDelete({id: leave.id, title: leave.employee_name})} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><X size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun congé trouvé</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination count={total} page={page} pageSize={20} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Refuser le congé"
        message={`Êtes-vous sûr de vouloir refuser le congé de ${confirmDelete?.title} ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          await handleAction(confirmDelete.id, 'reject')
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
