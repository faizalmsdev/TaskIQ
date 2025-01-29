import React, { useState } from 'react'
import { WeeklySummary, Task, DateRange } from '../types'
import { ChevronLeft, ChevronRight, Calendar, Settings } from 'lucide-react'

interface WorkSettings {
  hoursPerDay: number
  workOnSaturday: boolean
  workOnSunday: boolean
}

interface SummaryProps {
  weeklySummary: WeeklySummary
  onDateRangeChange: (range: DateRange) => void
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function Summary({ weeklySummary, onDateRangeChange, selectedDate, onSelectDate }: SummaryProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    hoursPerDay: 8,
    workOnSaturday: true,
    workOnSunday: false,
  })

  const formatHours = (hours: number) => {
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: viewMode === 'year' ? 'numeric' : undefined,
      day: viewMode === 'day' || viewMode === 'week' ? 'numeric' : undefined,
    }).format(date)
  }

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1)
        break
    }
    setCurrentDate(newDate)
    onDateRangeChange(calculateDateRange(newDate))
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1)
        break
    }
    setCurrentDate(newDate)
    onDateRangeChange(calculateDateRange(newDate))
  }

  const calculateDateRange = (date: Date): DateRange => {
    const start = new Date(date)
    const end = new Date(date)

    switch (viewMode) {
      case 'day':
        // For day view, start and end are the same day
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'week':
        start.setDate(start.getDate() - start.getDay())
        end.setDate(end.getDate() + (6 - end.getDay()))
        break
      case 'month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      case 'year':
        start.setMonth(0, 1)
        end.setMonth(11, 31)
        break
    }

    return { start, end }
  }

  const calculateTargetHours = (range: DateRange): number => {
    const start = new Date(range.start)
    const end = new Date(range.end)
    let totalHours = 0
    
    // Loop through each day in the range
    for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay()
      
      // Skip Sundays if not working
      if (dayOfWeek === 0 && !workSettings.workOnSunday) continue
      
      // Skip Saturdays if not working
      if (dayOfWeek === 6 && !workSettings.workOnSaturday) continue
      
      totalHours += workSettings.hoursPerDay
    }

    return totalHours
  }

  const isTaskInRange = (taskDate: Date, range: DateRange) => {
    return taskDate >= range.start && taskDate <= range.end
  }

  const currentRange = calculateDateRange(currentDate)
  const targetHours = calculateTargetHours(currentRange)

  const filteredTasks = Object.entries(weeklySummary.dailyTasks).reduce((acc, [date, tasks]) => {
    const tasksInRange = tasks.filter(task => 
      task.startTime && isTaskInRange(new Date(task.startTime), currentRange)
    )
    
    if (tasksInRange.length > 0) {
      acc[date] = tasksInRange
    }
    return acc
  }, {} as Record<string, Task[]>)

  const totalHoursInRange = Object.values(filteredTasks)
    .flat()
    .reduce((total, task) => total + task.duration / 3600, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-semibold">{formatDate(currentDate)}</h2>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {(['day', 'week', 'month', 'year'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === mode ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-6 rounded-lg backdrop-blur-md bg-white/10 space-y-4">
          <h3 className="text-lg font-medium mb-4">Work Settings</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span>Hours per day:</span>
              <input
                type="number"
                min="1"
                max="24"
                value={workSettings.hoursPerDay}
                onChange={(e) => setWorkSettings(prev => ({
                  ...prev,
                  hoursPerDay: Number(e.target.value)
                }))}
                className="w-16 px-2 py-1 rounded bg-white/10"
              />
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={workSettings.workOnSaturday}
                onChange={(e) => setWorkSettings(prev => ({
                  ...prev,
                  workOnSaturday: e.target.checked
                }))}
              />
              <span>Work on Saturday</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={workSettings.workOnSunday}
                onChange={(e) => setWorkSettings(prev => ({
                  ...prev,
                  workOnSunday: e.target.checked
                }))}
              />
              <span>Work on Sunday</span>
            </label>
          </div>
        </div>
      )}

      <div className="p-6 rounded-lg backdrop-blur-md bg-white/10">
        <div className="text-4xl font-light">
          {formatHours(totalHoursInRange)} / {formatHours(targetHours)}
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-4">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${(totalHoursInRange / targetHours) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(filteredTasks).length === 0 ? (
          <div className="text-center p-8 rounded-lg backdrop-blur-md bg-white/10">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-300">No tasks found for this period</p>
            <p className="text-sm text-gray-400 mt-2">Add some tasks to see them here</p>
          </div>
        ) : (
          Object.entries(filteredTasks).map(([date, tasks]) => (
            <button
              key={date}
              onClick={() => {
                const taskDate = tasks[0]?.startTime || new Date()
                onSelectDate(taskDate)
              }}
              className="w-full p-4 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors text-left"
            >
              <h3 className="text-lg font-medium mb-3">{date}</h3>
              <div className="space-y-2">
                {tasks.map((task: Task) => (
                  <div key={task.id} className="flex justify-between items-center">
                    <span>{task.title}</span>
                    <span className="font-mono">
                      {formatHours(task.duration / 3600)}
                    </span>
                  </div>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}