import React from 'react';
import { Task } from '../types';
import { Circle, Pause, Play } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onResume: (taskId: string) => void;
  activeTaskId: string | null;
}

export function TaskList({ tasks, onComplete, onPause, onResume, activeTaskId }: TaskListProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 rounded-lg backdrop-blur-md ${
            task.status === 'completed'
              ? 'bg-green-500/10'
              : task.id === activeTaskId
              ? 'bg-white/10'
              : 'bg-red-500/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Circle
                className={`h-3 w-3 ${
                  task.status === 'completed'
                    ? 'text-green-500'
                    : task.id === activeTaskId
                    ? 'text-blue-500'
                    : 'text-red-500'
                }`}
                fill="currentColor"
              />
              <span className="text-lg">{task.title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-mono">{formatDuration(task.duration)}</span>
              {task.status !== 'completed' && (
                <div className="flex space-x-2">
                  {task.id === activeTaskId ? (
                    <button
                      onClick={() => onPause(task.id)}
                      className="p-2 rounded-md bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  ) : task.status === 'paused' && (
                    <button
                      onClick={() => onResume(task.id)}
                      className="p-2 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onComplete(task.id)}
                    className="px-3 py-1 rounded-md bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}