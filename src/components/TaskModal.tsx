import React from 'react';
import { Task } from '../types';
import { X } from 'lucide-react';

interface TaskModalProps {
  date: Date;
  tasks: Task[];
  onClose: () => void;
}

export function TaskModal({ date, tasks, onClose }: TaskModalProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">{formatDate(date)}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg ${
                task.status === 'completed'
                  ? 'bg-green-500/10'
                  : task.status === 'active'
                  ? 'bg-blue-500/10'
                  : 'bg-red-500/10'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-400">
                    Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </p>
                </div>
                <div className="font-mono">{formatDuration(task.duration)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}