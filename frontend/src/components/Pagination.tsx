import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  count: number
  page: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ count, page, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  const pages: number[] = []
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">{count} résultat{(count > 1 ? 's' : '')}</p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
        {pages.map((p) => (
          <button key={p} onClick={() => onChange(p)} className={`px-3 py-1 rounded text-sm font-medium ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>
    </div>
  )
}
