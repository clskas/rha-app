import { useState } from 'react'
import { User, Save, Lock } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Profile() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm_password: '' })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.new_password !== passForm.confirm_password) {
      error('Les mots de passe ne correspondent pas')
      return
    }
    try {
      await api.post('/auth/change-password/', {
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      })
      success('Mot de passe modifié avec succès')
      setPassForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch {
      error('Échec du changement de mot de passe')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-3 rounded-full"><User size={32} className="text-primary" /></div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Identifiant :</span> <span className="font-medium">{user?.username}</span></div>
          <div><span className="text-gray-500">Rôle :</span> <span className="font-medium capitalize">{user?.role === 'rh' ? 'RH' : user?.role}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4"><Lock size={18} className="text-gray-500" /><h2 className="text-lg font-semibold">Changer le mot de passe</h2></div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label><input type="password" value={passForm.old_password} onChange={(e) => setPassForm({ ...passForm, old_password: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label><input type="password" value={passForm.new_password} onChange={(e) => setPassForm({ ...passForm, new_password: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label><input type="password" value={passForm.confirm_password} onChange={(e) => setPassForm({ ...passForm, confirm_password: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" /></div>
          <button type="submit" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark"><Save size={16} /> Modifier le mot de passe</button>
        </form>
      </div>
    </div>
  )
}
