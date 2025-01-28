import React, { useState } from 'react';
import { WeeklySummary, Task, DateRange } from '../types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface SummaryProps {
  weeklySummary: WeeklySummary;
  onDateRangeChange: (range: DateRange) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function Summary({ weeklySummary, onDateRangeChange, selectedDate, onSelectDate }: SummaryProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatHours = (hours: number) => {
    return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: viewMode === 'year' ? 'numeric' : undefined,
      day: viewMode === 'week' ? 'numeric' : undefined,
    }).format(date);
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
    onDateRangeChange(calculateDateRange(newDate));
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
    onDateRangeChange(calculateDateRange(newDate));
  };

  const calculateDateRange = (date: Date): DateRange => {
    const start = new Date(date);
    const end = new Date(date);

    switch (viewMode) {
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(end.getDate() + (6 - end.getDay()));
        break;
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'year':
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }

    return { start, end };
  };

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
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((mode) => (
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
      </div>

      <div className="p-6 rounded-lg backdrop-blur-md bg-white/10">
        <div className="text-4xl font-light">
          {formatHours(weeklySummary.totalHours)} / 48h
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full mt-4">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: `${(weeklySummary.totalHours / 48) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(weeklySummary.dailyTasks).length === 0 ? (
          <div className="text-center p-8 rounded-lg backdrop-blur-md bg-white/10">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-300">No tasks found for this period</p>
            <p className="text-sm text-gray-400 mt-2">Add some tasks to see them here</p>
          </div>
        ) : (
          Object.entries(weeklySummary.dailyTasks).map(([date, tasks]) => (
            <button
              key={date}
              onClick={() => {
                const taskDate = tasks[0]?.startTime || new Date();
                onSelectDate(taskDate);
              }}
              className="w-full p-4 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors text-left"
            >
              <h3 className="text-lg font-medium mb-3">{date}</h3>
              {tasks.length > 0 ? (
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
              ) : (
                <p className="text-gray-400">No tasks for this day</p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}