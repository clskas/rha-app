import { useState, useEffect } from 'react'
import { DollarSign, Download, Plus, X, FileSpreadsheet, FileText, Layers } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'
import Pagination from '../components/Pagination'

interface PaySlip {
  id: number; employee_name: string; employee: number
  month: number; year: number; gross_salary: string; net_salary: string; currency: string; is_paid: boolean; pdf_file: string | null
}

interface PendingMonth {
  month: number; year: number; employee_count: number
}

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function Payroll() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [payslips, setPayslips] = useState<PaySlip[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [form, setForm] = useState({ employee: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), gross_salary: '', net_salary: '', currency: 'CDF', bonuses: '0', deductions: '0' })
  const [showBulk, setShowBulk] = useState(false)
  const [bulkForm, setBulkForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), currency: 'CDF' })
  const [pendingMonths, setPendingMonths] = useState<PendingMonth[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get(`/payroll/payslips/?page=${page}&page_size=20`),
      user?.role === 'admin' || user?.role === 'rh' ? api.get('/employees/?page=1&page_size=100') : Promise.resolve({ data: { results: [] } }),
    ]).then(([ps, emp]) => {
      setPayslips(ps.data.results || ps.data)
      setTotal(ps.data.count || (ps.data.results || ps.data).length)
      setEmployees(emp.data.results || [])
    }).catch(() => showError('Erreur lors du chargement')).finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'rh') {
      api.get('/payroll/payslips/pending-months/').then(({ data }) => setPendingMonths(data)).catch(() => {})
    }
  }, [])

  const pendingCount = (m: number, y: number) => pendingMonths.find(pm => pm.month === m && pm.year === y)?.employee_count || 0

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkSaving(true)
    try {
      const { data } = await api.post('/payroll/payslips/bulk-generate/', bulkForm)
      if (data.errors?.length) {
        showError(`${data.created} créé(s), ${data.errors.length} erreur(s)`)
      } else {
        success(`${data.created} bulletin(s) généré(s) avec succès`)
      }
      setShowBulk(false)
      setLoading(true)
      api.get(`/payroll/payslips/?page=${page}&page_size=20`).then(({ data: ps }) => {
        setPayslips(ps.data.results || ps.data)
        setTotal(ps.data.count || (ps.data.results || ps.data).length)
      }).catch(() => showError('Erreur lors du rechargement')).finally(() => setLoading(false))
      api.get('/payroll/payslips/pending-months/').then(({ data }) => setPendingMonths(data)).catch(() => {})
    } catch {
      showError('Erreur lors de la génération')
    } finally { setBulkSaving(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employee) { showError('Veuillez sélectionner un employé'); return }
    setSaving(true)
    try {
      const { data } = await api.post('/payroll/payslips/', { ...form, employee: Number(form.employee), gross_salary: Number(form.gross_salary), net_salary: Number(form.net_salary), currency: form.currency, bonuses: Number(form.bonuses), deductions: Number(form.deductions) })
      setPayslips([data, ...payslips])
      setShowForm(false)
      success('Bulletin de paie créé avec succès')
      setForm({ employee: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), gross_salary: '', net_salary: '', currency: 'CDF', bonuses: '0', deductions: '0' })
    } catch { showError('Erreur lors de la création') } finally { setSaving(false) }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paie</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => {
            api.get('/payroll/payslips/export-csv/', { responseType: 'blob' }).then((res) => {
              const url = window.URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a'); a.href = url; a.download = 'paie.csv'; a.click()
              window.URL.revokeObjectURL(url)
            }).catch(() => showError('Erreur export CSV'))
          }} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            <FileSpreadsheet size={18} /> Export CSV
          </button>
          {(user?.role === 'admin' || user?.role === 'rh') && (
            <>
              <button onClick={() => setShowBulk(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-dark">
                <Layers size={18} /> Générer la paie
              </button>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
                <Plus size={18} /> Nouveau bulletin
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Employé</th>
                <th className="text-left px-6 py-3">Période</th>
                <th className="text-left px-6 py-3">Salaire brut</th>
                <th className="text-left px-6 py-3">Salaire net</th>
                <th className="text-left px-6 py-3">Statut</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((ps) => (
                <tr key={ps.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ps.employee_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{months[ps.month - 1]} {ps.year}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{Number(ps.gross_salary).toLocaleString()} {ps.currency || 'CDF'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{Number(ps.net_salary).toLocaleString()} {ps.currency || 'CDF'}</td>
                  <td className="px-6 py-4">{ps.is_paid ? <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">Payé</span> : <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">En attente</span>}</td>
                  <td className="px-6 py-4 text-right">
                    {ps.pdf_file ? (
                      <a href={ps.pdf_file} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-secondary inline-block"><Download size={16} /></a>
                    ) : (user?.role === 'admin' || user?.role === 'rh') && (
                      <button onClick={async () => {
                        try {
                          await api.post(`/payroll/payslips/${ps.id}/generate-pdf/`)
                          setPayslips(payslips.map(p => p.id === ps.id ? { ...p, pdf_file: `/media/payslips/payslip_${ps.id}_${ps.month}_${ps.year}.pdf` } : p))
                          success('PDF généré avec succès')
                        } catch { showError('Erreur génération PDF') }
                      }} className="p-1.5 text-gray-400 hover:text-secondary inline-block" title="Générer PDF"><FileText size={16} /></button>
                    )}
                  </td>
                </tr>
              ))}
              {payslips.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-gray-400"><DollarSign size={40} className="mx-auto mb-2 opacity-50" /><p>Aucun bulletin de paie</p></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination count={total} page={page} pageSize={20} onChange={setPage} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouveau bulletin de paie</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                <select value={form.employee} onChange={(e) => {
                  const emp = employees.find((x: any) => (x.user?.id || x.id) === Number(e.target.value))
                  setForm({ ...form, employee: e.target.value, currency: emp?.currency || 'CDF' })
                }} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  <option value="">Sélectionner...</option>
                  {employees.map((e: any) => <option key={e.id} value={e.user?.id || e.id}>{e.user?.first_name} {e.user?.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                  <select value={form.month} onChange={(e) => setForm({ ...form, month: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Salaire brut</label>
                  <input type="number" value={form.gross_salary} onChange={(e) => setForm({ ...form, gross_salary: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Salaire net</label>
                  <input type="number" value={form.net_salary} onChange={(e) => setForm({ ...form, net_salary: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Primes</label>
                  <input type="number" value={form.bonuses} onChange={(e) => setForm({ ...form, bonuses: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Déductions</label>
                  <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showBulk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBulk(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Génération en masse</h2>
              <button onClick={() => setShowBulk(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleBulkGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
                  <select value={bulkForm.month} onChange={(e) => setBulkForm({ ...bulkForm, month: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                  <select value={bulkForm.year} onChange={(e) => setBulkForm({ ...bulkForm, year: Number(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                    {Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                <select value={bulkForm.currency} onChange={(e) => setBulkForm({ ...bulkForm, currency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                  <option value="CDF">CDF (Franc Congolais)</option>
                  <option value="USD">USD (Dollar Américain)</option>
                  <option value="XOF">XOF (Franc CFA)</option>
                </select>
              </div>
              {pendingCount(bulkForm.month, bulkForm.year) > 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  {pendingCount(bulkForm.month, bulkForm.year)} employé(s) sans bulletin pour cette période
                </p>
              ) : (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  Tous les employés ont déjà un bulletin pour cette période
                </p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowBulk(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={bulkSaving} className="px-4 py-2 bg-secondary text-white rounded-lg text-sm disabled:opacity-50">{bulkSaving ? 'Génération...' : 'Générer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
