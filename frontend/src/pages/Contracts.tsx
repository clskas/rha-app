import { useState, useEffect } from 'react'
import { Plus, Pencil, FileText, AlertTriangle, X } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'

const CONTRACT_TYPES = ['cdi', 'cdd', 'stage', 'freelance', 'prestation']
const CURRENCIES = ['CDF', 'XOF', 'USD']
const STATUSES = ['active', 'expired', 'terminated']

const typeLabels: Record<string, string> = {
  cdi: 'CDI', cdd: 'CDD', stage: 'Stage', freelance: 'Freelance', prestation: 'Prestation',
}

const currencyLabels: Record<string, string> = {
  CDF: 'CDF (Franc Congolais)', XOF: 'XOF (Franc CFA)', USD: 'USD (Dollar Américain)',
}

const statusLabels: Record<string, string> = {
  active: 'Actif', expired: 'Expiré', terminated: 'Résilié',
}

interface Contract {
  id: number
  employee: number
  employee_name: string
  contract_type: string
  contract_type_display: string
  start_date: string
  end_date: string | null
  salary: string
  currency: string
  currency_display: string
  status: string
  status_display: string
  signed_copy: string | null
  created_at: string
}

interface Employee {
  id: number
  user: { first_name: string; last_name: string }
}

export default function Contracts() {
  const { success, error: showError } = useToast()
  const { user } = useAuth()
  const isAdminOrRH = user?.role === 'admin' || user?.role === 'rh'
  const [contracts, setContracts] = useState<Contract[]>([])
  const [alerts, setAlerts] = useState<Contract[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)
  const [form, setForm] = useState({
    employee: '',
    contract_type: 'cdi',
    start_date: '',
    end_date: '',
    salary: '',
    currency: 'CDF',
    status: 'active',
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/employees/contracts/'),
      api.get('/employees/contracts/renewal-alerts/'),
      api.get('/employees/'),
    ]).then(([c, a, e]) => {
      setContracts(c.data)
      setAlerts(a.data)
      setEmployees(e.data)
    }).catch(() => showError('Erreur de chargement'))
    .finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ employee: '', contract_type: 'cdi', start_date: '', end_date: '', salary: '', currency: 'CDF', status: 'active' })
    setModalOpen(true)
  }

  const openEdit = (c: Contract) => {
    setEditing(c.id)
    setForm({
      employee: c.employee.toString(),
      contract_type: c.contract_type,
      start_date: c.start_date,
      end_date: c.end_date || '',
      salary: c.salary,
      currency: c.currency,
      status: c.status,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employee || !form.start_date) return
    setSaving(true)
    const payload: Record<string, any> = {
      employee: Number(form.employee),
      contract_type: form.contract_type,
      start_date: form.start_date,
      salary: form.salary,
      currency: form.currency,
      status: form.status,
    }
    if (form.end_date) payload.end_date = form.end_date

    try {
      if (editing) {
        const { data } = await api.patch(`/employees/contracts/${editing}/`, payload)
        setContracts(contracts.map((c) => c.id === editing ? data : c))
        success('Contrat modifié avec succès')
      } else {
        const { data } = await api.post('/employees/contracts/', payload)
        setContracts([...contracts, data])
        success('Contrat créé avec succès')
      }
      setModalOpen(false)
    } catch { showError('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  const handleDelete = (id: number, name: string) => {
    setConfirmDelete({ id, title: name })
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-gray-100 text-gray-600'
      case 'terminated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contrats</h1>
        {isAdminOrRH && (
          <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16} /> Nouveau contrat
          </button>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Renouvellements imminents</p>
            <p className="text-orange-700 text-sm mt-1">
              {alerts.length} contrat{alerts.length > 1 ? 's' : ''} se termine{alerts.length > 1 ? 'nt' : ''} dans les 30 prochains jours.
            </p>
            <ul className="mt-2 space-y-1">
              {alerts.map((a) => (
                <li key={a.id} className="text-sm text-orange-700">
                  {a.employee_name} - {a.contract_type_display} (fin: {new Date(a.end_date!).toLocaleDateString('fr')})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Employé</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Période</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Salaire</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Contrat signé</th>
                  {isAdminOrRH && <th className="text-left px-6 py-3 font-semibold text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.employee_name}</td>
                    <td className="px-6 py-4 text-gray-600">{c.contract_type_display}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(c.start_date).toLocaleDateString('fr')}
                      {c.end_date && ` - ${new Date(c.end_date).toLocaleDateString('fr')}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{new Intl.NumberFormat('fr').format(Number(c.salary))} {c.currency}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColor(c.status)}`}>
                        {c.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.signed_copy ? (
                        <a href={c.signed_copy} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          <FileText size={14} /> Voir
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    {isAdminOrRH && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-secondary"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(c.id, c.employee_name)} className="p-1.5 text-gray-400 hover:text-danger"><X size={16} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {contracts.length === 0 && (
                  <tr><td colSpan={isAdminOrRH ? 7 : 6} className="text-center py-12 text-gray-400">Aucun contrat</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? 'Modifier' : 'Nouveau'} contrat</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  <option value="">Sélectionner...</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.user?.first_name} {e.user?.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{typeLabels[t]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin (optionnel pour CDI)</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire</label>
                <input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{currencyLabels[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer le contrat"
        message={`Êtes-vous sûr de vouloir supprimer le contrat de ${confirmDelete?.title} ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await api.delete(`/employees/contracts/${confirmDelete.id}/`)
            setContracts(contracts.filter((c) => c.id !== confirmDelete.id))
            success('Contrat supprimé avec succès')
          } catch { showError('Erreur lors de la suppression') }
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
