import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { Search, ChevronDown, ChevronRight, Building2 } from 'lucide-react'

interface EmpNode {
  id: number
  name: string
  position_title: string
  department_id: number | null
  department_name: string | null
  manager_id: number | null
  manager_name: string | null
  photo: string | null
  subordinates: number[]
}

interface DeptGroup {
  id: number | null
  name: string
  employees: EmpNode[]
}

interface OrgData {
  departments: DeptGroup[]
  unassigned: EmpNode[]
}

function EmployeeNode({ emp, allEmps, depth = 0 }: { emp: EmpNode; allEmps: Map<number, EmpNode>; depth?: number }) {
  const [open, setOpen] = useState(depth < 1)
  const subs = emp.subordinates.map(id => allEmps.get(id)).filter(Boolean) as EmpNode[]

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex flex-col items-center bg-white border rounded-xl shadow-sm p-4 w-48 cursor-pointer transition-all hover:shadow-md ${depth === 0 ? 'border-primary/30 ring-1 ring-primary/10' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {subs.length > 0 && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm mb-1.5">
          {emp.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-gray-900 text-center leading-tight">{emp.name}</span>
        <span className="text-xs text-gray-500 mt-0.5 text-center">{emp.position_title}</span>
        {emp.department_name && (
          <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <Building2 size={10} /> {emp.department_name}
          </span>
        )}
      </div>
      {subs.length > 0 && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className={`flex flex-wrap justify-center gap-4 ${open ? '' : 'hidden'}`}>
            {subs.map(sub => (
              <div key={sub.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300" />
                <EmployeeNode emp={sub} allEmps={allEmps} depth={depth + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChart() {
  const [data, setData] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { error } = useToast()

  useEffect(() => {
    api.get('/employees/org-chart/')
      .then(res => setData(res.data))
      .catch(() => error("Impossible de charger l'organigramme"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const empMap = new Map<number, EmpNode>()
  if (data) {
    for (const dept of data.departments) {
      for (const emp of dept.employees) {
        empMap.set(emp.id, emp)
      }
    }
    for (const emp of data.unassigned) {
      empMap.set(emp.id, emp)
    }
  }

  const filterEmps = (emps: EmpNode[]): EmpNode[] => {
    if (!search) return emps
    const term = search.toLowerCase()
    return emps.filter(e => {
      if (e.name.toLowerCase().includes(term)) return true
      if (e.position_title.toLowerCase().includes(term)) return true
      return e.subordinates.some(sid => {
        const sub = empMap.get(sid)
        return sub && sub.name.toLowerCase().includes(term)
      })
    })
  }

  const topLevelEmps = (emps: EmpNode[]) => emps.filter(e => !e.manager_id || !empMap.has(e.manager_id))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Organigramme</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Desktop tree view */}
      <div className="hidden md:block space-y-8">
        {data?.departments.map(dept => {
          const filtered = filterEmps(dept.employees)
          const topLevel = topLevelEmps(filtered)
          if (search && filtered.length === 0) return null
          return (
            <section key={dept.id ?? dept.name}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                {dept.name}
                <span className="text-sm font-normal text-gray-400">({dept.employees.length})</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {topLevel.map(emp => (
                  <EmployeeNode key={emp.id} emp={emp} allEmps={empMap} />
                ))}
                {!search && topLevel.length === 0 && (
                  <p className="text-sm text-gray-400 italic">Aucun employé dans ce département</p>
                )}
              </div>
            </section>
          )
        })}
        {data?.unassigned && data.unassigned.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sans département</h2>
            <div className="flex flex-wrap gap-4">
              {data.unassigned.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase())).map(emp => (
                <div key={emp.id} className="bg-white border rounded-xl shadow-sm p-3 w-48">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                      {emp.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.position_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-4">
        {data?.departments.map(dept => {
          const filtered = filterEmps(dept.employees)
          if (search && filtered.length === 0) return null
          return (
            <section key={dept.id ?? dept.name}>
              <h2 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-primary" />
                {dept.name}
              </h2>
              <div className="space-y-2">
                {filtered.map(emp => (
                  <div key={emp.id} className="bg-white border rounded-lg p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                      {emp.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                      <p className="text-xs text-gray-500 truncate">{emp.position_title}</p>
                      {emp.manager_name && (
                        <p className="text-[10px] text-gray-400">Sous la direction de {emp.manager_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
