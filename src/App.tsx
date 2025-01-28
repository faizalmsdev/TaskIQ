import React, { useState, useEffect } from 'react';
import { Clock } from './components/Clock';
import { TaskList } from './components/TaskList';
import { Summary } from './components/Summary';
import { DailySummary } from './components/DailySummary';
import { TaskModal } from './components/TaskModal';
import { Task, WeeklySummary, DailySummary as DailySummaryType, DateRange } from './types';
import { Timer, ListTodo } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(),
    end: new Date(),
  });
  
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    totalHours: 0,
    dailyTasks: {},
  });

  const calculateDailySummary = (): DailySummaryType => {
    // Calculate total time including active tasks
    const totalTime = tasks.reduce((acc, task) => {
      if (task.status === 'completed' || task.status === 'active') {
        return acc + task.duration;
      }
      return acc;
    }, 0);

    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status !== 'completed').length;

    return {
      totalTime,
      completedTasks,
      pendingTasks,
      totalTasks: tasks.length,
    };
  };

  // Update weekly summary whenever tasks change
  useEffect(() => {
    const totalSeconds = tasks.reduce((acc, task) => {
      if (task.status === 'completed' || task.status === 'active') {
        return acc + task.duration;
      }
      return acc;
    }, 0);
    const totalHours = totalSeconds / 3600;
    
    // Group tasks by day
    const dailyTasks: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const day = task.startTime.toLocaleDateString('en-US', { weekday: 'long' });
      if (!dailyTasks[day]) {
        dailyTasks[day] = [];
      }
      dailyTasks[day].push(task);
    });

    setWeeklySummary({
      totalHours,
      dailyTasks,
    });
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeTaskId) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeTaskId
              ? {
                  ...task,
                  duration: task.duration + 1,
                  lastUpdated: new Date(),
                }
              : task
          )
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTaskId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      startTime: new Date(),
      status: 'active',
      duration: 0,
      lastUpdated: new Date(),
    };

    if (activeTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === activeTaskId
            ? { ...task, status: 'paused' }
            : task
        )
      );
    }

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setActiveTaskId(newTask.id);
    setNewTaskTitle('');
  };

  const handleComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'completed' }
          : task
      )
    );
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const handlePause = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'paused' }
          : task
      )
    );
    if (activeTaskId === taskId) {
      setActiveTaskId(null);
    }
  };

  const handleResume = (taskId: string) => {
    if (activeTaskId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === activeTaskId
            ? { ...task, status: 'paused' }
            : task
        )
      );
    }
    
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: 'active' }
          : task
      )
    );
    setActiveTaskId(taskId);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Clock />
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showSummary ? <ListTodo className="h-5 w-5" /> : <Timer className="h-5 w-5" />}
            <span>{showSummary ? 'View Tasks' : 'View Summary'}</span>
          </button>
        </div>

        {!showSummary ? (
          <>
            <DailySummary summary={calculateDailySummary()} />
            <div className="space-y-8">
              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter new task..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </form>

              <TaskList
                tasks={tasks}
                onComplete={handleComplete}
                onPause={handlePause}
                onResume={handleResume}
                activeTaskId={activeTaskId}
              />
            </div>
          </>
        ) : (
          <Summary
            weeklySummary={weeklySummary}
            onDateRangeChange={handleDateRangeChange}
            selectedDate={dateRange.start}
            onSelectDate={setSelectedDate}
          />
        )}
      </div>

      {selectedDate && (
        <TaskModal
          date={selectedDate}
          tasks={tasks.filter(task => {
            const taskDate = task.startTime.toLocaleDateString();
            const selectedDateStr = selectedDate.toLocaleDateString();
            return taskDate === selectedDateStr;
          })}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

export default App;