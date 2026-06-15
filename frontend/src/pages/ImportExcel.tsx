import { useState, useRef } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface PreviewRow {
  first_name: string
  last_name: string
  email: string
  phone: string
  department_name: string
  position_title: string
  contract_type: string
  hire_date: string
  salary: string
  currency: string
  cnss_number: string
  address: string
  emergency_contact: string
}

interface ImportResult {
  success_count: number
  errors: string[]
}

export default function ImportExcel() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet) as PreviewRow[]
        setPreview(json.slice(0, 20))
      } catch {
        showError('Erreur lors de la lecture du fichier')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/employees/import-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      if (data.success_count > 0) {
        success(`${data.success_count} employé(s) importé(s) avec succès`)
      }
      if (data.errors?.length > 0) {
        showError(`${data.errors.length} erreur(s) lors de l'import`)
      }
    } catch (err: any) {
      showError(err.response?.data?.error || "Erreur lors de l'import")
    } finally {
      setImporting(false)
    }
  }

  const contractLabels: Record<string, string> = {
    cdi: 'CDI', cdd: 'CDD', stage: 'Stage', freelance: 'Freelance', prestation: 'Prestation',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Import Excel</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileSpreadsheet className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            Sélectionnez un fichier Excel (.xlsx) contenant les colonnes :<br />
            first_name, last_name, email, phone, department_name, position_title, contract_type, hire_date, salary, currency, cnss_number, address, emergency_contact
          </p>
          <input ref={fileRef} type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Upload size={16} />
            {file ? file.name : 'Choisir un fichier'}
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Aperçu ({preview.length} ligne(s))</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Prénom</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Email</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Département</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Poste</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Contrat</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3">{row.first_name}</td>
                    <td className="py-2 px-3">{row.last_name}</td>
                    <td className="py-2 px-3">{row.email}</td>
                    <td className="py-2 px-3">{row.department_name}</td>
                    <td className="py-2 px-3">{row.position_title}</td>
                    <td className="py-2 px-3">{contractLabels[row.contract_type] || row.contract_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleImport} disabled={importing} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={16} />}
            {importing ? 'Importation...' : `Confirmer l'import (${preview.length} ligne(s))`}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Résultat</h2>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} />
            <span className="font-medium">{result.success_count} employé(s) importé(s)</span>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={20} />
                <span className="font-medium">{result.errors.length} erreur(s)</span>
              </div>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded">{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
