import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'

import ConfirmDialog from '../components/ConfirmDialog'

export default function Departements() {
  const { success, error: showError } = useToast()
  const [departments, setDepartments] = useState<any[]>([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)

  useEffect(() => {
    api.get('/employees/departments/').then((res) => setDepartments(res.data)).catch(() => showError('Erreur de chargement'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/employees/departments/${editing}/`, { name })
        setDepartments(departments.map((d) => d.id === editing ? { ...d, name } : d))
        success('Département modifié avec succès')
        setEditing(null)
      } else {
        const { data } = await api.post('/employees/departments/', { name })
        setDepartments([...departments, data])
        success('Département créé avec succès')
      }
      setName('')
    } catch { showError('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  const handleDelete = (id: number, name: string) => {
    setConfirmDelete({ id, title: name })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Départements</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Modifier' : 'Ajouter'} un département</h2>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du département"
              className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50"><Plus size={18} /></button>
          </form>
        </div>
        <div className="space-y-3">
          {departments.map((d) => (
            <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="text-gray-400" size={20} />
                <span className="font-medium text-gray-900">{d.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(d.id); setName(d.name) }} className="p-1.5 text-gray-400 hover:text-secondary"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(d.id, d.name)} className="p-1.5 text-gray-400 hover:text-danger"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {departments.length === 0 && <p className="text-center text-gray-400 py-8">Aucun département</p>}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer le département"
        message={`Êtes-vous sûr de vouloir supprimer le département "${confirmDelete?.title}" ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await api.delete(`/employees/departments/${confirmDelete.id}/`)
            setDepartments(departments.filter((d) => d.id !== confirmDelete.id))
            success('Département supprimé avec succès')
          } catch { showError('Erreur lors de la suppression') }
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
