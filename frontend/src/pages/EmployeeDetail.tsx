import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Upload, FileText, Trash2, User, Mail, Phone, Building2, Briefcase, CalendarDays, DollarSign } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Loading from '../components/Loading'
import ConfirmDialog from '../components/ConfirmDialog'

interface Employee {
  id: number
  user: { id: number; first_name: string; last_name: string; email: string; phone: string }
  department: number | null
  department_name: string
  position: number | null
  position_title: string
  manager: number | null
  manager_name: string
  contract_type: string
  hire_date: string
  end_date: string | null
  salary: string
  currency: string
  cnss_number: string
  address: string
  emergency_contact: string
  documents: { id: number; title: string; file: string; uploaded_at: string }[]
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [emp, setEmp] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{id: number, title: string} | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/employees/${id}/`)
      .then((res) => setEmp(res.data))
      .catch(() => toast.error('Erreur lors du chargement de l\'employé'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadTitle) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', uploadTitle)
      const fileInput = document.getElementById('doc-file') as HTMLInputElement
      if (fileInput?.files?.[0]) formData.append('file', fileInput.files[0])
      await api.post(`/employees/${id}/upload_document/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const res = await api.get(`/employees/${id}/`)
      setEmp(res.data)
      setUploadTitle('')
      toast.success('Document ajouté avec succès')
    } catch {
      toast.error('Erreur lors de l\'upload du document')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = (docId: number, title: string) => {
    setConfirmDelete({ id: docId, title })
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/employees')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-gray-900">{emp!.user.first_name} {emp!.user.last_name}</h1>
        </div>
        {(user?.role === 'admin' || user?.role === 'rh') && (
          <Link to={`/employees/${emp!.id}/edit`} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark">
            <Pencil size={18} /> Modifier
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail size={16} className="text-gray-400" /> <span>{emp!.user.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone size={16} className="text-gray-400" /> <span>{emp!.user.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 size={16} className="text-gray-400" /> <span>{emp!.department_name || '-'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Briefcase size={16} className="text-gray-400" /> <span>{emp!.position_title || '-'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDays size={16} className="text-gray-400" /> <span>Embauché le {emp!.hire_date}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign size={16} className="text-gray-400" /> <span>{Number(emp!.salary).toLocaleString()} {emp!.currency || 'CDF'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-400 font-semibold">CNSS</span> <span>{emp!.cnss_number || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User size={16} className="text-gray-400" /> <span>Manager : {emp!.manager_name || 'Aucun'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{emp!.contract_type.toUpperCase()}</span>
                {emp!.end_date && <span className="text-gray-500">Fin: {emp!.end_date}</span>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Adresse</h2>
            <p className="text-sm text-gray-600">{emp!.address || 'Non renseignée'}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Contact d'urgence</h2>
            <p className="text-sm text-gray-600">{emp!.emergency_contact || 'Non renseigné'}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
            {(user?.role === 'admin' || user?.role === 'rh') && (
            <form onSubmit={handleUpload} className="space-y-3 mb-4">
              <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="Titre du document"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary" />
              <input id="doc-file" type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary-dark" />
              <button type="submit" disabled={uploading} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                <Upload size={16} /> {uploading ? 'Upload...' : 'Ajouter'}
              </button>
            </form>
            )}
            <div className="space-y-2">
              {emp!.documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{doc.title}</span>
                  </div>
                  <div className="flex gap-1">
                    <a href={doc.file} target="_blank" className="p-1 text-secondary hover:bg-blue-50 rounded"><Upload size={14} /></a>
                    {(user?.role === 'admin' || user?.role === 'rh') && (
                    <button onClick={() => handleDeleteDoc(doc.id, doc.title)} className="p-1 text-danger hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              ))}
              {(!emp!.documents || emp!.documents.length === 0) && <p className="text-sm text-gray-400 text-center py-4">Aucun document</p>}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer le document"
        message={`Êtes-vous sûr de vouloir supprimer le document "${confirmDelete?.title}" ?`}
        onConfirm={async () => {
          if (!confirmDelete) return
          try {
            await api.delete(`/employees/documents/${confirmDelete.id}/`)
            const res = await api.get(`/employees/${id}/`)
            setEmp(res.data)
            toast.success('Document supprimé avec succès')
          } catch {
            toast.error('Erreur lors de la suppression du document')
          }
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
