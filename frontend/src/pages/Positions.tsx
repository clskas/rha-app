import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Positions() {
  const { success, error: showError } = useToast()
  const [positions, setPositions] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [description, setDescription] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/employees/positions/'),
      api.get('/employees/departments/'),
    ]).then(([pos, dep]) => {
      setPositions(pos.data)
      setDepartments(dep.data)
    }).catch(() => showError('Erreur de chargement'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !department) return
    setSaving(true)
    const payload = { title, department: Number(department), description }
    try {
      if (editing) {
        const { data } = await api.patch(`/employees/positions/${editing}/`, payload)
        setPositions(positions.map((p) => p.id === editing ? { ...p, ...data, department_name: departments.find((d: any) => d.id === Number(department))?.name } : p))
        success('Poste modifié avec succès')
        setEditing(null)
      } else {
        const { data } = await api.post('/employees/positions/', payload)
        const dep = departments.find((d: any) => d.id === Number(department))
        setPositions([...positions, { ...data, department_name: dep?.name }])
        success('Poste créé avec succès')
      }
      setTitle(''); setDepartment(''); setDescription('')
    } catch { showError('Erreur lors de la sauvegarde') } finally { setSaving(false) }
  }

  const handleEdit = (p: any) => {
    setEditing(p.id); setTitle(p.title); setDepartment(p.department?.toString() || ''); setDescription(p.description || '')
  }

  const handleDelete = (id: number, title: string) => {
    setConfirmDelete({ id, title })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Postes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">{editing ? 'Modifier' : 'Ajouter'} un poste</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du poste"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                <option value="">Sélectionner...</option>
                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
            </div>
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"><Plus size={16} /> {editing ? 'Modifier' : 'Ajouter'}</button>
          </form>
        </div>
        <div className="space-y-3">
          {positions.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="text-gray-400" size={20} />
                <div>
                  <span className="font-medium text-gray-900">{p.title}</span>
                  <p className="text-xs text-gray-500">{p.department_name}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-secondary"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(p.id, p.title)} className="p-1.5 text-gray-400 hover:text-danger"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {positions.length === 0 && <p className="text-center text-gray-400 py-8">Aucun poste</p>}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer le poste"
        message={`Êtes-vous sûr de vouloir supprimer le poste "${confirmDelete?.title}" ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await api.delete(`/employees/positions/${confirmDelete.id}/`)
            setPositions(positions.filter((p) => p.id !== confirmDelete.id))
            success('Poste supprimé avec succès')
          } catch { showError('Erreur lors de la suppression') }
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
