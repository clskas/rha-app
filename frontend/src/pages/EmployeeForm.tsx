import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [form, setForm] = useState({
    user_id: '', department: '', position: '', manager: '', contract_type: 'cdi',
    hire_date: '', end_date: '', salary: 0, currency: 'CDF', cnss_number: '',
    address: '', emergency_contact: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dep, pos, usr] = await Promise.all([
          api.get('/employees/departments/'),
          api.get('/employees/positions/'),
          api.get('/auth/users/'),
        ])
        setDepartments(dep.data.results || dep.data)
        setPositions(pos.data.results || pos.data)
        setUsers(usr.data.results || usr.data)
        if (isEdit) {
          const res = await api.get(`/employees/${id}/`)
          const d = res.data
          setForm({
            user_id: d.user_id || d.user?.id || '',
            department: d.department || '',
            position: d.position || '',
            manager: d.manager || '',
            contract_type: d.contract_type,
            hire_date: d.hire_date,
            end_date: d.end_date || '',
            salary: d.salary,
            currency: d.currency || 'CDF',
            cnss_number: d.cnss_number || '',
            address: d.address || '',
            emergency_contact: d.emergency_contact || '',
          })
        }
      } catch {
        toast.error('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.user_id) { toast.error("Veuillez sélectionner un utilisateur"); return }
    try {
      const payload = {
        user_id: Number(form.user_id),
        department: form.department ? Number(form.department) : null,
        position: form.position ? Number(form.position) : null,
        manager: form.manager ? Number(form.manager) : null,
        contract_type: form.contract_type,
        hire_date: form.hire_date,
        end_date: form.end_date || null,
        salary: Number(form.salary),
        currency: form.currency,
        cnss_number: form.cnss_number,
        address: form.address,
        emergency_contact: form.emergency_contact,
      }
      if (isEdit) {
        await api.patch(`/employees/${id}/`, payload)
        toast.success('Employé modifié avec succès')
      } else {
        await api.post('/employees/', payload)
        toast.success('Employé créé avec succès')
      }
      navigate('/employees')
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/employees')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Modifier' : 'Nouvel'} employé</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
              <option value="">Sélectionner...</option>
              {users.filter((u: any) => u.role === 'employee').map((u: any) => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
            <select value={form.contract_type} onChange={(e) => setForm({ ...form, contract_type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
              <option value="cdi">CDI</option>
              <option value="cdd">CDD</option>
              <option value="stage">Stage</option>
              <option value="freelance">Freelance</option>
              <option value="prestation">Prestation de services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro CNSS</label>
            <input type="text" value={form.cnss_number} onChange={(e) => setForm({ ...form, cnss_number: e.target.value })}
              placeholder="Ex: 1234567890" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
              <option value="">Sélectionner...</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
            <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
              <option value="">Sélectionner...</option>
              {positions.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
              <option value="">Aucun</option>
              {users.filter((u: any) => u.role === 'manager').map((u: any) => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
            <input type="date" value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salaire</label>
            <div className="flex gap-2">
              <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary">
                <option value="CDF">CDF</option>
                <option value="XOF">XOF</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
            <input type="text" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => navigate('/employees')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
          <button type="submit" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
            <Save size={18} /> {isEdit ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  )
}
