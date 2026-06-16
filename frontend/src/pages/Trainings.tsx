import { useState, useEffect } from 'react'
import { GraduationCap, Plus, X, CheckCircle, Ban } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

interface Training {
  id: number; title: string; description: string; trainer: string
  start_date: string; end_date: string; max_participants: number
  status: string; status_display: string; cost: string
  registrations_count: number
}

interface Registration {
  id: number; training: number; training_title: string
  employee: number; employee_name: string
  status: string; status_display: string
  completed_at: string | null; created_at: string
}

const statusColors: Record<string, string> = {
  planned: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
}

const regStatusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-green-50 text-green-700',
}

export default function Trainings() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showRegModal, setShowRegModal] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', trainer: '', start_date: '', end_date: '', max_participants: '', cost: '', status: 'planned' })

  const isAdminRH = user?.role === 'admin' || user?.role === 'rh'

  useEffect(() => {
    Promise.all([
      api.get('/trainings/'),
      api.get('/trainings/my_registrations/'),
    ]).then(([tr, reg]) => {
      setTrainings(tr.data)
      setRegistrations(reg.data)
    }).catch(() => showError('Erreur de chargement')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/trainings/', {
        ...form,
        max_participants: Number(form.max_participants),
        cost: Number(form.cost),
      })
      setTrainings([data, ...trainings])
      setShowForm(false)
      success('Formation créée avec succès')
      setForm({ title: '', description: '', trainer: '', start_date: '', end_date: '', max_participants: '', cost: '', status: 'planned' })
    } catch { showError('Erreur lors de la création') } finally { setSaving(false) }
  }

  const handleRegister = async (trainingId: number) => {
    try {
      const { data } = await api.post(`/trainings/${trainingId}/register/`)
      setRegistrations([data, ...registrations])
      success('Inscription réussie')
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Erreur d\'inscription')
    }
  }

  const loadRegistrations = async (trainingId: number) => {
    setShowRegModal(trainingId)
  }

  const updateRegStatus = async (regId: number, action: string) => {
    try {
      const { data } = await api.patch(`/trainings/registrations/${regId}/${action}/`)
      setRegistrations(registrations.map(r => r.id === regId ? data : r))
      success('Statut mis à jour')
    } catch { showError('Erreur de mise à jour') }
  }

  const isRegistered = (trainingId: number) => registrations.some(r => r.training === trainingId)

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
        {isAdminRH && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark w-full sm:w-auto justify-center">
            <Plus size={18} /> Nouvelle formation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{trainings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Mes inscriptions</p>
          <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Titre</th>
                <th className="text-left px-6 py-3">Formateur</th>
                <th className="text-left px-6 py-3">Dates</th>
                <th className="text-left px-6 py-3">Statut</th>
                <th className="text-left px-6 py-3">Participants</th>
                <th className="text-left px-6 py-3">Coût</th>
                <th className="text-left px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.trainer}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.start_date} → {t.end_date}</td>
                  <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status] || 'bg-gray-50 text-gray-700'}`}>{t.status_display}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.registrations_count}/{t.max_participants}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{Number(t.cost).toLocaleString('fr')} CFA</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {isAdminRH && (
                        <button onClick={() => { loadRegistrations(t.id); setShowRegModal(t.id) }} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">Inscriptions</button>
                      )}
                      {!isAdminRH && !isRegistered(t.id) && t.status === 'planned' && (
                        <button onClick={() => handleRegister(t.id)} className="text-xs px-2 py-1 rounded bg-primary text-white hover:bg-primary-dark">S'inscrire</button>
                      )}
                      {!isAdminRH && isRegistered(t.id) && (
                        <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">Inscrit</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {trainings.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400"><GraduationCap size={40} className="mx-auto mb-2 opacity-50" /><p>Aucune formation</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouvelle formation</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label><input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Début</label><input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fin</label><input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Places max</label><input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Coût (CFA)</label><input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required min={0} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">Annuler</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 w-full sm:w-auto">{saving ? 'Création...' : 'Créer'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showRegModal !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRegModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Inscriptions - {trainings.find(t => t.id === showRegModal)?.title}</h2>
              <button onClick={() => setShowRegModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <RegistrationsList trainingId={showRegModal} updateRegStatus={updateRegStatus} isAdminRH={isAdminRH} />
          </div>
        </div>
      )}
    </div>
  )
}

function RegistrationsList({ trainingId, updateRegStatus, isAdminRH }: {
  trainingId: number
  updateRegStatus: (regId: number, action: string) => void
  isAdminRH: boolean
}) {
  const [list, setList] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/trainings/registrations/?training=${trainingId}`).then(({ data }) => {
      const items = data.results || data
      setList(items)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [trainingId])

  if (loading) return <Loading />

  if (list.length === 0) return <p className="text-center py-6 text-gray-400">Aucune inscription</p>

  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {list.map((r) => (
        <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-900">{r.employee_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regStatusColors[r.status] || 'bg-gray-50 text-gray-700'}`}>{r.status_display}</span>
          </div>
          {isAdminRH && r.status === 'pending' && (
            <div className="flex gap-1">
              <button onClick={() => updateRegStatus(r.id, 'approve')} className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100"><CheckCircle size={16} /></button>
              <button onClick={() => updateRegStatus(r.id, 'reject')} className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"><Ban size={16} /></button>
            </div>
          )}
          {isAdminRH && r.status === 'approved' && (
            <button onClick={() => updateRegStatus(r.id, 'complete')} className="text-xs px-2 py-1 rounded bg-primary text-white hover:bg-primary-dark">Terminer</button>
          )}
        </div>
      ))}
    </div>
  )
}
