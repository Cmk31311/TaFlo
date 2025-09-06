'use client';

import { useState, useMemo } from 'react';
import { Task, Category, Priority } from '../../lib/types';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  onToggle: (id: number, current: boolean) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  onDuplicate: (task: Task) => void;
}

export default function CalendarView({ 
  tasks, 
  categories, 
  priorities, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onDuplicate 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const tasksWithDueDates = useMemo(() => {
    return tasks.filter(task => task.due_date);
  }, [tasks]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasksWithDueDates.filter(task => {
      const taskDate = new Date(task.due_date!).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (task: Task) => {
    return task.due_date && new Date(task.due_date) < new Date() && !task.is_done;
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold gradient-text">{monthName}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="btn-outline text-sm"
            >
              ←
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="btn-outline text-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-400 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24" />;
            }

            const dayTasks = getTasksForDate(date);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={index}
                className={`h-24 p-1 border border-slate-700/50 rounded ${
                  isCurrentDay ? 'bg-blue-500/20 border-blue-500/50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded cursor-pointer truncate ${
                        task.is_done 
                          ? 'bg-green-500/20 text-green-400' 
                          : isOverdue(task)
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-600/50 text-slate-200'
                      }`}
                      onClick={() => onToggle(task.id, task.is_done)}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-400">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const weekRange = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold gradient-text">Week of {weekRange}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="btn-outline text-sm"
            >
              ←
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="btn-outline text-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isCurrentDay = isToday(date);

            return (
              <div key={index} className="min-h-[300px]">
                <div className={`text-center p-2 rounded mb-2 ${
                  isCurrentDay ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-300'
                }`}>
                  <div className="text-sm font-medium">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold">
                    {date.getDate()}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`p-2 rounded text-sm cursor-pointer ${
                        task.is_done 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/40' 
                          : isOverdue(task)
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-slate-600/50 text-slate-200 border border-slate-600/50'
                      }`}
                      onClick={() => onToggle(task.id, task.is_done)}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      {task.priority && (
                        <div className="flex items-center gap-1 mt-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: task.priority.color }}
                          />
                          <span className="text-xs">{task.priority.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setViewMode('month')}
          className={`btn-outline ${viewMode === 'month' ? 'bg-blue-500/20 text-blue-400' : ''}`}
        >
          Month View
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`btn-outline ${viewMode === 'week' ? 'bg-blue-500/20 text-blue-400' : ''}`}
        >
          Week View
        </button>
      </div>

      {/* Calendar */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  );
}


