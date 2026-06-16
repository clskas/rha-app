import { useState, useEffect } from 'react'
import { Plus, Briefcase, X } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

export default function Recruitment() {
  const { success, error: showError } = useToast()
  const [offers, setOffers] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [showCandForm, setShowCandForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [offerForm, setOfferForm] = useState({ title: '', description: '', requirements: '', location: '', salary_min: '', salary_max: '', status: 'draft' })
  const [candForm, setCandForm] = useState({ job_offer: '', first_name: '', last_name: '', email: '', phone: '', cover_letter: '' })

  const fetch = () => Promise.all([
    api.get('/recruitment/offers/'),
    api.get('/recruitment/candidates/'),
  ]).then(([off, cand]) => {
    setOffers(off.data.results || off.data)
    setCandidates(cand.data.results || cand.data)
  })

  useEffect(() => {
    setLoading(true)
    fetch().catch(() => showError('Erreur de chargement')).finally(() => setLoading(false))
  }, [])

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/recruitment/offers/', { ...offerForm })
      setOffers([data, ...offers])
      setShowOfferForm(false)
      success('Offre créée avec succès')
      setOfferForm({ title: '', description: '', requirements: '', location: '', salary_min: '', salary_max: '', status: 'draft' })
    } catch { showError('Erreur lors de la création') } finally { setSaving(false) }
  }

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.post('/recruitment/candidates/', { ...candForm, job_offer: Number(candForm.job_offer) })
      setCandidates([data, ...candidates])
      setShowCandForm(false)
      success('Candidat ajouté avec succès')
      setCandForm({ job_offer: '', first_name: '', last_name: '', email: '', phone: '', cover_letter: '' })
    } catch { showError("Erreur lors de l'ajout") } finally { setSaving(false) }
  }

  const updateCandidateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/recruitment/candidates/${id}/`, { status })
      setCandidates(candidates.map((c) => c.id === id ? { ...c, status } : c))
      success('Statut mis à jour')
    } catch { showError('Erreur de mise à jour') }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recrutement</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowOfferForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"><Plus size={18} /> Offre</button>
          <button onClick={() => setShowCandForm(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/90"><Plus size={18} /> Candidat</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold">Offres d'emploi</h2></div>
          <div className="divide-y divide-gray-100">
            {offers.map((o) => (
              <div key={o.id} className="px-6 py-4"><p className="font-medium text-gray-900">{o.title}</p><p className="text-sm text-gray-500">{o.location} • <span className={`capitalize ${o.status === 'published' ? 'text-green-600' : o.status === 'closed' ? 'text-red-500' : ''}`}>{o.status}</span></p></div>
            ))}
            {offers.length === 0 && <div className="px-6 py-8 text-center text-gray-400"><Briefcase size={32} className="mx-auto mb-2 opacity-50" /><p>Aucune offre</p></div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold">Candidats</h2></div>
          <div className="divide-y divide-gray-100">
            {candidates.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div><p className="font-medium text-gray-900">{c.first_name} {c.last_name}</p><p className="text-sm text-gray-500">{c.email} • {c.job_offer_title}</p></div>
                <select value={c.status} onChange={(e) => updateCandidateStatus(c.id, e.target.value)} className="text-xs border border-gray-300 rounded px-2 py-1 outline-none">
                  {['received', 'reviewed', 'interviewed', 'accepted', 'rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))}
            {candidates.length === 0 && <div className="px-6 py-8 text-center text-gray-400"><Briefcase size={32} className="mx-auto mb-2 opacity-50" /><p>Aucun candidat</p></div>}
          </div>
        </div>
      </div>

      {showOfferForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowOfferForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Nouvelle offre</h2><button onClick={() => setShowOfferForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button></div>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Titre</label><input value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label><input value={offerForm.location} onChange={(e) => setOfferForm({ ...offerForm, location: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Statut</label><select value={offerForm.status} onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary"><option value="draft">Brouillon</option><option value="published">Publiée</option><option value="closed">Fermée</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={offerForm.description} onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })} required rows={3} className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label><textarea value={offerForm.requirements} onChange={(e) => setOfferForm({ ...offerForm, requirements: e.target.value })} required rows={3} className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2"><button type="button" onClick={() => setShowOfferForm(false)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">Annuler</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 w-full sm:w-auto">{saving ? 'Création...' : 'Créer'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showCandForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCandForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">Nouveau candidat</h2><button onClick={() => setShowCandForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button></div>
            <form onSubmit={handleCreateCandidate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label><input value={candForm.first_name} onChange={(e) => setCandForm({ ...candForm, first_name: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label><input value={candForm.last_name} onChange={(e) => setCandForm({ ...candForm, last_name: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={candForm.email} onChange={(e) => setCandForm({ ...candForm, email: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label><input value={candForm.phone} onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Offre</label><select value={candForm.job_offer} onChange={(e) => setCandForm({ ...candForm, job_offer: e.target.value })} required className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary"><option value="">Sélectionner...</option>{offers.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Lettre de motivation</label><textarea value={candForm.cover_letter} onChange={(e) => setCandForm({ ...candForm, cover_letter: e.target.value })} rows={3} className="w-full px-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCandForm(false)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">Annuler</button><button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 w-full sm:w-auto">{saving ? 'Ajout...' : 'Ajouter'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
