import React from 'react';
import { DailySummary as DailySummaryType } from '../types';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface DailySummaryProps {
  summary: DailySummaryType;
}

export function DailySummary({ summary }: DailySummaryProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="p-4 rounded-lg backdrop-blur-md bg-white/10 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-blue-500/20">
          <Clock className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <div className="text-sm text-gray-300">Total Time Today</div>
          <div className="text-2xl font-semibold">{formatTime(summary.totalTime)}</div>
        </div>
      </div>

      <div className="p-4 rounded-lg backdrop-blur-md bg-white/10 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-green-500/20">
          <CheckCircle2 className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <div className="text-sm text-gray-300">Completed Tasks</div>
          <div className="text-2xl font-semibold">
            {summary.completedTasks} / {summary.totalTasks}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg backdrop-blur-md bg-white/10 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-yellow-500/20">
          <ListTodo className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <div className="text-sm text-gray-300">Pending Tasks</div>
          <div className="text-2xl font-semibold">{summary.pendingTasks}</div>
        </div>
      </div>
    </div>
  );
}