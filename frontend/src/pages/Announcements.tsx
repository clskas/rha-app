import { useState, useEffect } from 'react'
import { Plus, X, Pin, PinOff, Pencil, Trash2, Megaphone } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

interface Announcement {
  id: number; title: string; content: string; author: number; author_name: string
  is_pinned: boolean; created_at: string; updated_at: string
}

export default function Announcements() {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false })

  const isAdminRH = user?.role === 'admin' || user?.role === 'rh'

  useEffect(() => {
    api.get('/announcements/').then(({ data }) => {
      const items = data.results || data
      setAnnouncements(items)
    }).catch(() => showError('Erreur de chargement')).finally(() => setLoading(false))
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', content: '', is_pinned: false })
    setShowForm(true)
  }

  const openEdit = (a: Announcement) => {
    setEditing(a)
    setForm({ title: a.title, content: a.content, is_pinned: a.is_pinned })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const { data } = await api.patch(`/announcements/${editing.id}/`, form)
        setAnnouncements(announcements.map(a => a.id === editing.id ? data : a))
        success('Annonce modifiée')
      } else {
        const { data } = await api.post('/announcements/', form)
        setAnnouncements([data, ...announcements])
        success('Annonce créée')
      }
      setShowForm(false)
    } catch { showError('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette annonce ?')) return
    try {
      await api.delete(`/announcements/${id}/`)
      setAnnouncements(announcements.filter(a => a.id !== id))
      success('Annonce supprimée')
    } catch { showError('Erreur lors de la suppression') }
  }

  const togglePin = async (a: Announcement) => {
    try {
      const { data } = await api.patch(`/announcements/${a.id}/`, { is_pinned: !a.is_pinned })
      setAnnouncements(announcements.map(x => x.id === a.id ? data : x))
      success(data.is_pinned ? 'Annonce épinglée' : 'Annonce désépinglée')
    } catch { showError('Erreur') }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) return <Loading />

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Annonces</h1>
        {isAdminRH && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
            <Plus size={18} /> Nouvelle annonce
          </button>
        )}
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className={`bg-white rounded-xl shadow-sm border ${a.is_pinned ? 'border-secondary/30 ring-1 ring-secondary/20' : 'border-gray-100'}`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.is_pinned && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium flex items-center gap-1"><Pin size={12} /> Épinglé</span>}
                    <h2 className="text-lg font-semibold text-gray-900 truncate">{a.title}</h2>
                  </div>
                  <p className="text-xs text-gray-400">{a.author_name} · {formatDate(a.created_at)}</p>
                </div>
                {isAdminRH && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePin(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600" title={a.is_pinned ? 'Désépingler' : 'Épingler'}>{a.is_pinned ? <PinOff size={16} /> : <Pin size={16} />}</button>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className={`text-sm text-gray-600 whitespace-pre-wrap ${expandedId === a.id ? '' : 'line-clamp-3'}`}>{a.content}</p>
                {a.content.length > 200 && (
                  <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)} className="text-xs text-primary hover:underline mt-1">
                    {expandedId === a.id ? 'Réduire' : 'Lire plus'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-16">
            <Megaphone size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">Aucune annonce</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier' : 'Nouvelle'} annonce</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_pinned} onChange={e => setForm({ ...form, is_pinned: e.target.checked })} className="rounded border-gray-300 text-secondary focus:ring-secondary" />
                <span className="text-sm text-gray-700">Épingler l'annonce</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
