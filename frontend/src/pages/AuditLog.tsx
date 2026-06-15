import { useState, useEffect } from 'react'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import Loading from '../components/Loading'

interface AuditEntry {
  id: number
  user_name: string
  action: string
  model_name: string
  object_id: number
  details: string
  created_at: string
}

const actionLabels: Record<string, string> = {
  created: 'Création', updated: 'Modification', deleted: 'Suppression',
  approved: 'Approbation', rejected: 'Refus',
}

const actionColors: Record<string, string> = {
  created: 'bg-green-50 text-green-700',
  updated: 'bg-blue-50 text-blue-700',
  deleted: 'bg-red-50 text-red-700',
  approved: 'bg-teal-50 text-teal-700',
  rejected: 'bg-amber-50 text-amber-700',
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/audit/?page=${page}${filter ? `&action=${filter}` : ''}`)
      .then((res) => { setLogs(res.data.results); setTotal(res.data.count) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filter])

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          {['', 'created', 'updated', 'deleted', 'approved', 'rejected'].map((a) => (
            <button key={a} onClick={() => { setFilter(a); setPage(1) }}
              className={`px-3 py-1.5 text-sm rounded-lg ${filter === a ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {a ? actionLabels[a] : 'Tous'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Utilisateur</th>
                <th className="text-left px-6 py-3">Action</th>
                <th className="text-left px-6 py-3">Modèle</th>
                <th className="text-left px-6 py-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString('fr')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.user_name}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${actionColors[log.action] || 'bg-gray-50 text-gray-700'}`}>{actionLabels[log.action] || log.action}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{log.model_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Shield size={40} className="mx-auto mb-2 opacity-50" /><p>Aucune entrée d'audit</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">{total} entrée(s)</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1 border rounded disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="px-3 py-1 text-sm">{page}</span>
            <button disabled={page * 50 >= total} onClick={() => setPage(page + 1)} className="p-1 border rounded disabled:opacity-30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
