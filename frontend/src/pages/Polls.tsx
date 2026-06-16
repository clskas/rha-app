import { useState, useEffect } from 'react'
import { BarChart3, Plus, X, Clock } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

interface PollOption {
  id: number; text: string; vote_count: number; percentage: number
}

interface Poll {
  id: number; question: string; created_by: number; created_by_name: string
  is_active: boolean; created_at: string; expires_at: string | null
  options: PollOption[]; total_votes: number; has_voted: boolean; user_vote_option_id: number | null
}

export default function Polls() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', options_text: ['', ''], expires_at: '' })

  const isAdminRH = user?.role === 'admin' || user?.role === 'rh'

  useEffect(() => {
    api.get('/polls/').then(({ data }) => {
      setPolls(data.results || data)
    }).catch(() => showError('Erreur de chargement')).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        question: form.question,
        is_active: true,
        expires_at: form.expires_at || null,
        options_text: form.options_text.filter(t => t.trim()),
      }
      if (payload.options_text.length < 2) {
        showError('Ajoutez au moins 2 options')
        setSaving(false); return
      }
      const { data } = await api.post('/polls/', payload)
      setPolls([data, ...polls])
      setShowForm(false)
      success('Sondage créé avec succès')
      setForm({ question: '', options_text: ['', ''], expires_at: '' })
    } catch { showError('Erreur lors de la création') } finally { setSaving(false) }
  }

  const handleVote = async (pollId: number, optionId: number) => {
    try {
      const { data } = await api.post(`/polls/${pollId}/vote/`, { option_id: optionId })
      setPolls(polls.map(p => p.id === pollId ? data : p))
      success('Vote enregistré')
    } catch (err: any) {
      showError(err.response?.data?.detail || 'Erreur de vote')
    }
  }

  const handleToggleActive = async (poll: Poll) => {
    try {
      const { data } = await api.patch(`/polls/${poll.id}/`, { is_active: !poll.is_active })
      setPolls(polls.map(p => p.id === poll.id ? data : p))
      success(data.is_active ? 'Sondage rouvert' : 'Sondage fermé')
    } catch { showError('Erreur de mise à jour') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce sondage ?')) return
    try {
      await api.delete(`/polls/${id}/`)
      setPolls(polls.filter(p => p.id !== id))
      success('Sondage supprimé')
    } catch { showError('Erreur de suppression') }
  }

  const addOptionField = () => setForm({ ...form, options_text: [...form.options_text, ''] })

  const updateOption = (i: number, v: string) => {
    const opts = [...form.options_text]; opts[i] = v; setForm({ ...form, options_text: opts })
  }

  const removeOption = (i: number) => {
    if (form.options_text.length <= 2) return
    setForm({ ...form, options_text: form.options_text.filter((_, idx) => idx !== i) })
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sondages</h1>
        {isAdminRH && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark w-full sm:w-auto justify-center">
            <Plus size={18} /> Nouveau sondage
          </button>
        )}
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Aucun sondage pour le moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-900 leading-snug">{poll.question}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {!poll.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">Fermé</span>}
                  {poll.expires_at && new Date(poll.expires_at) < new Date() && !poll.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center gap-1"><Clock size={12} />Expiré</span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {poll.options.map((opt) => {
                  const isSelected = poll.user_vote_option_id === opt.id
                  return (
                    <button
                      key={opt.id}
                      disabled={poll.has_voted || !poll.is_active}
                      onClick={() => handleVote(poll.id, opt.id)}
                      className={`relative w-full text-left p-3 rounded-lg border transition-all ${
                        poll.has_voted
                          ? isSelected ? 'cursor-default border-secondary bg-secondary/10' : 'cursor-default border-gray-200 bg-gray-50'
                          : poll.is_active
                            ? 'cursor-pointer border-gray-200 hover:border-secondary hover:bg-secondary/5'
                            : 'cursor-not-allowed border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 relative z-10">
                        <span className="text-sm font-medium text-gray-700">{opt.text}</span>
                        <span className="text-xs text-gray-500">{opt.vote_count} voix ({opt.percentage}%)</span>
                      </div>
                      {poll.has_voted && (
                        <div
                          className="absolute inset-0 bg-secondary/10 rounded-lg transition-all"
                          style={{ width: `${Math.max(opt.percentage, 2)}%` }}
                        />
                      )}
                      <div className="relative z-10 w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        {poll.has_voted && (
                          <div className="bg-secondary h-1.5 rounded-full transition-all" style={{ width: `${Math.max(opt.percentage, 2)}%` }} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>{poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}</span>
                <span>Par {poll.created_by_name}</span>
              </div>

              {isAdminRH && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleToggleActive(poll)} className={`text-xs px-2.5 py-1 rounded font-medium ${poll.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {poll.is_active ? 'Fermer' : 'Rouvrir'}
                  </button>
                  <button onClick={() => handleDelete(poll.id)} className="text-xs px-2.5 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Supprimer</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nouveau sondage</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required maxLength={300} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" placeholder="Que souhaitez-vous demander ?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (optionnelle)</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {form.options_text.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={opt} onChange={(e) => updateOption(i, e.target.value)} required placeholder={`Option ${i + 1}`} maxLength={200} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
                      {form.options_text.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addOptionField} className="mt-2 text-sm text-secondary hover:underline">+ Ajouter une option</button>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 w-full sm:w-auto">{saving ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
