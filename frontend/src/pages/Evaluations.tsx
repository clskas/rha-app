import { useState, useEffect } from 'react'
import { Star, Plus, X } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

interface Evaluation {
  id: number; employee_name: string; evaluator_name: string
  campaign_title: string; rating: number; is_submitted: boolean
  employee: number; evaluator: number; campaign: number
  comments: string; achievements: string; areas_for_improvement: string
}

export default function Evaluations() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ campaign: '', employee: '', rating: 3, comments: '', achievements: '', areas_for_improvement: '', objectives: '' })

  useEffect(() => {
    Promise.all([
      api.get('/evaluations/'),
      api.get('/evaluations/campaigns/'),
      api.get('/employees/?page=1&page_size=100'),
    ]).then(([ev, camp, emp]) => {
      setEvaluations(ev.data.results || ev.data)
      setCampaigns(camp.data)
      setEmployees(emp.data.results || [])
    }).catch(() => showError('Erreur de chargement')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/evaluations/', { ...form, campaign: Number(form.campaign), employee: Number(form.employee), evaluator: user?.id, rating: Number(form.rating) })
      setEvaluations([data, ...evaluations])
      setShowForm(false)
      success('Évaluation créée avec succès')
      setForm({ campaign: '', employee: '', rating: 3, comments: '', achievements: '', areas_for_improvement: '', objectives: '' })
    } catch { showError('Erreur lors de la création') } finally { setSaving(false) }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Évaluations</h1>
        {(user?.role === 'admin' || user?.role === 'rh') && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark w-full sm:w-auto justify-center">
            <Plus size={18} /> Nouvelle évaluation
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase">
                <th className="text-left px-6 py-3">Employé</th>
                <th className="text-left px-6 py-3">Évaluateur</th>
                <th className="text-left px-6 py-3">Campagne</th>
                <th className="text-left px-6 py-3">Note</th>
                <th className="text-left px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ev.employee_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ev.evaluator_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ev.campaign_title}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={14} className={star <= ev.rating ? 'text-warning fill-warning' : 'text-gray-300'} />))}</div>
                  </td>
                  <td className="px-6 py-4">{ev.is_submitted ? <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">Soumise</span> : <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">En cours</span>}</td>
                </tr>
              ))}
              {evaluations.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Star size={40} className="mx-auto mb-2 opacity-50" /><p>Aucune évaluation</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouvelle évaluation</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
                  <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                    <option value="">Sélectionner...</option>
                    {employees.map((e: any) => <option key={e.user.id} value={e.user.id}>{e.user.first_name} {e.user.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campagne</label>
                  <select value={form.campaign} onChange={(e) => setForm({ ...form, campaign: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                    <option value="">Sélectionner...</option>
                    {campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <div className="flex gap-2">{[1, 2, 3, 4, 5].map((star) => (<button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}><Star size={24} className={star <= form.rating ? 'text-warning fill-warning' : 'text-gray-300'} /></button>))}</div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Commentaires</label><textarea value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Réalisations</label><textarea value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Axes d'amélioration</label><textarea value={form.areas_for_improvement} onChange={(e) => setForm({ ...form, areas_for_improvement: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Objectifs</label><textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2"><button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">Annuler</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 w-full sm:w-auto">{saving ? 'Création...' : 'Créer'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
