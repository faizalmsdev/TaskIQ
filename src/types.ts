export interface Task {
  id: string;
  title: string;
  startTime: Date;
  status: 'active' | 'paused' | 'completed';
  duration: number; // in seconds
  lastUpdated: Date;
}

export interface DailySummary {
  totalTime: number;
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
}

export interface WeeklySummary {
  totalHours: number;
  dailyTasks: {
    [date: string]: Task[];
  };
}

export interface DailySummaryType {
  totalTime: number
  completedTasks: number
  totalTasks: number
  pendingTasks: number
}


export interface DateRange {
  start: Date;
  end: Date;
}