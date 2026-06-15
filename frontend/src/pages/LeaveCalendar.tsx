import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'

interface CalendarLeave {
  id: number
  employee_name: string
  leave_type_name: string
  start_date: string
  end_date: string
  color: string
}

export default function LeaveCalendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [leaves, setLeaves] = useState<CalendarLeave[]>([])

  useEffect(() => {
    api.get(`/leaves/calendar/?month=${currentMonth + 1}&year=${currentYear}`)
      .then(res => setLeaves(res.data))
      .catch(() => {})
  }, [currentMonth, currentYear])

  const firstDay = new Date(currentYear, currentMonth, 1)
  const startPadding = firstDay.getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const dayHeaders = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const getLeavesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves.filter(l => dateStr >= l.start_date && dateStr <= l.end_date)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const cells: (number | null)[] = []
  for (let i = 0; i < startPadding; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calendrier des congés</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
          <h2 className="text-lg font-semibold text-gray-900">{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7">
          {dayHeaders.map(d => (
            <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">{d}</div>
          ))}
          {cells.map((day, idx) => {
            const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
            const dayLeaves = day ? getLeavesForDay(day) : []
            const isToday = dateStr === todayStr
            return (
              <div key={idx} className={`min-h-24 p-1.5 border-b border-r border-gray-100 ${!day ? 'bg-gray-50' : ''}`}>
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>{day}</div>
                    <div className="space-y-0.5">
                      {dayLeaves.slice(0, 3).map(l => (
                        <div key={l.id} className="text-xs px-1 py-0.5 rounded truncate text-white font-medium" style={{ backgroundColor: l.color }}>
                          {l.employee_name}
                        </div>
                      ))}
                      {dayLeaves.length > 3 && <div className="text-xs text-gray-400 px-1">+{dayLeaves.length - 3} autres</div>}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
