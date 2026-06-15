import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

export default function LeaveForm() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [types, setTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ leave_type: '', start_date: '', end_date: '', reason: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/leaves/types/').then((res) => setTypes(res.data)).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.leave_type || !form.start_date || !form.end_date || !form.reason) {
      setError('Tous les champs sont obligatoires')
      return
    }
    if (form.start_date > form.end_date) {
      setError('La date de début doit être antérieure à la date de fin')
      return
    }
    setSaving(true)
    try {
      await api.post('/leaves/', { ...form, leave_type: Number(form.leave_type) })
      success('Demande de congé envoyée avec succès')
      navigate('/leaves')
    } catch {
      setError('Erreur lors de la création de la demande')
      showError('Erreur lors de la création de la demande')
    } finally { setSaving(false) }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/leaves')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande de congé</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg space-y-5">
        {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de congé</label>
          <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
            <option value="">Sélectionner...</option>
            {types.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.default_days} jours)</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/leaves')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
            <Send size={18} /> {saving ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </div>
  )
}
