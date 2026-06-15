import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogIn, Shield } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) navigate('/', { replace: true })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch {
      setError('Identifiants incorrects')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">RHA</h1>
          <p className="text-blue-200 mt-2">Ressource Humaine App</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-900 text-center">Connexion</h2>
          {error && <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
            <LogIn size={18} /> Se connecter
          </button>
          <p className="text-xs text-gray-400 text-center leading-loose">
  admin / admin123 &nbsp;|&nbsp; rh1 / rh123 &nbsp;|&nbsp; manager1 / rh123 &nbsp;|&nbsp; employe1 / rh123
</p>
        </form>
      </div>
    </div>
  )
}
