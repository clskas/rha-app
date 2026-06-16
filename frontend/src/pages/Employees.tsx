import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Download, User } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'
import ConfirmDialog from '../components/ConfirmDialog'

interface Employee {
  id: number
  user: { id: number; first_name: string; last_name: string; email: string; phone: string }
  department_name: string
  position_title: string
  contract_type: string
  hire_date: string
}

export default function Employees() {
  const { user } = useAuth()
  const toast = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/employees/?search=${search}&page=${page}&page_size=20`)
      .then((res) => {
        setEmployees(res.data.results)
        setTotal(res.data.count)
      })
      .catch(() => toast.error('Erreur lors du chargement des employés'))
      .finally(() => setLoading(false))
  }, [search, page])

  const handleDelete = (id: number, name: string) => {
    setConfirmDelete({ id, title: name })
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => {
            api.get('/employees/export-csv/', { responseType: 'blob' }).then((res) => {
              const url = window.URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a'); a.href = url; a.download = 'employes.csv'; a.click()
              window.URL.revokeObjectURL(url)
            }).catch(() => toast.error('Erreur export CSV'))
          }} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Download size={18} /> Export CSV
          </button>
          {(user?.role === 'admin' || user?.role === 'rh') && (
            <Link to="/employees/new" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus size={18} /> Nouvel employé
            </Link>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Rechercher un employé..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Employé</th>
                <th className="text-left px-6 py-3">Email</th>
                <th className="text-left px-6 py-3">Département</th>
                <th className="text-left px-6 py-3">Poste</th>
                <th className="text-left px-6 py-3">Contrat</th>
                <th className="text-left px-6 py-3">Date d'embauche</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><User size={16} className="text-gray-500" /></div>
                        <Link to={`/employees/${emp.id}`} className="text-sm font-medium text-gray-900 hover:text-secondary">{emp.user.first_name} {emp.user.last_name}</Link>
                      </div>
                    </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.department_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.position_title}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{emp.contract_type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.hire_date}</td>
                  <td className="px-6 py-4 text-right">
                    {(user?.role === 'admin' || user?.role === 'rh') && (
                      <Link to={`/employees/${emp.id}/edit`} className="p-1.5 text-gray-400 hover:text-secondary inline-block"><Pencil size={16} /></Link>
                    )}
                    {(user?.role === 'admin' || user?.role === 'rh') && (
                      <button onClick={() => handleDelete(emp.id, `${emp.user.first_name} ${emp.user.last_name}`)} className="p-1.5 text-gray-400 hover:text-danger"><Trash2 size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Aucun employé trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination count={total} page={page} pageSize={20} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer l'employé"
        message={`Êtes-vous sûr de vouloir supprimer ${confirmDelete?.title} ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await api.delete(`/employees/${confirmDelete.id}/`)
            setEmployees(employees.filter((e) => e.id !== confirmDelete.id))
            toast.success('Employé supprimé avec succès')
          } catch {
            toast.error('Erreur lors de la suppression')
          }
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
