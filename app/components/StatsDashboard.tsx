'use client';

import { useMemo } from 'react';
import { Task, Category, Priority } from '../../lib/types';

interface StatsDashboardProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
}

export default function StatsDashboard({ tasks, categories, priorities }: StatsDashboardProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_done).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      !t.is_done
    ).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Time tracking stats
    const totalTimeTracked = tasks.reduce((sum, task) => sum + (task.actual_time || 0), 0);
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimated_time || 0), 0);
    
    // Category stats
    const categoryStats = categories.map(category => {
      const categoryTasks = tasks.filter(t => t.category_id === category.id);
      const completedInCategory = categoryTasks.filter(t => t.is_done).length;
      return {
        category,
        total: categoryTasks.length,
        completed: completedInCategory,
        completionRate: categoryTasks.length > 0 ? Math.round((completedInCategory / categoryTasks.length) * 100) : 0,
      };
    }).filter(stat => stat.total > 0);

    // Priority stats
    const priorityStats = priorities.map(priority => {
      const priorityTasks = tasks.filter(t => t.priority_id === priority.id);
      const completedInPriority = priorityTasks.filter(t => t.is_done).length;
      return {
        priority,
        total: priorityTasks.length,
        completed: completedInPriority,
        completionRate: priorityTasks.length > 0 ? Math.round((completedInPriority / priorityTasks.length) * 100) : 0,
      };
    }).filter(stat => stat.total > 0);

    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentTasks = tasks.filter(t => new Date(t.created_at) > weekAgo);
    const recentCompleted = tasks.filter(t => 
      t.completed_at && new Date(t.completed_at) > weekAgo
    );

    // Weekly progress data for chart
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTasks = tasks.filter(t => {
        const taskDate = new Date(t.created_at);
        return taskDate >= dayStart && taskDate <= dayEnd;
      });
      
      const dayCompleted = tasks.filter(t => {
        if (!t.completed_at) return false;
        const completedDate = new Date(t.completed_at);
        return completedDate >= dayStart && completedDate <= dayEnd;
      });

      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: dayTasks.length,
        completed: dayCompleted.length,
      });
    }

    return {
      total,
      completed,
      pending,
      overdue,
      completionRate,
      totalTimeTracked,
      totalEstimatedTime,
      categoryStats,
      priorityStats,
      recentTasks: recentTasks.length,
      recentCompleted: recentCompleted.length,
      weeklyData,
    };
  }, [tasks, categories, priorities]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    if (rate >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getCompletionBg = (rate: number) => {
    if (rate >= 80) return 'from-green-500 to-emerald-500';
    if (rate >= 60) return 'from-yellow-500 to-orange-500';
    if (rate >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">Productivity Dashboard</h2>
        <p className="text-slate-400">Track your progress and stay on top of your goals</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-sm text-slate-400">Total Tasks</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {stats.total === 0 ? 'No tasks yet' : `${stats.pending} pending`}
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                <div className="text-sm text-slate-400">Completed</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {stats.total > 0 ? `${stats.completionRate}% completion rate` : 'Start adding tasks'}
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-sm text-slate-400">Pending</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {stats.pending > 0 ? 'Tasks to complete' : 'All caught up!'}
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
                <div className="text-sm text-slate-400">Overdue</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {stats.overdue > 0 ? 'Needs attention' : 'All on time!'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-100">Completion Rate</h3>
            <div className={`text-2xl font-bold ${getCompletionColor(stats.completionRate)}`}>
              {stats.completionRate}%
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-4 mb-4">
              <div 
                className={`bg-gradient-to-r ${getCompletionBg(stats.completionRate)} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${Math.max(stats.completionRate, 5)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-slate-400">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Time Tracking</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <span className="text-blue-400">⏱️</span>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Time Tracked</div>
                  <div className="text-xl font-bold text-blue-400">
                    {formatTime(stats.totalTimeTracked)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <span className="text-purple-400">📊</span>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Estimated Time</div>
                  <div className="text-xl font-bold text-purple-400">
                    {formatTime(stats.totalEstimatedTime)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Weekly Activity</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end h-32">
            {stats.weeklyData.map((day, index) => {
              const maxTasks = Math.max(...stats.weeklyData.map(d => d.tasks), 1);
              const height = (day.tasks / maxTasks) * 100;
              const completedHeight = day.tasks > 0 ? (day.completed / day.tasks) * height : 0;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="w-full bg-slate-700/50 rounded-t-lg relative h-24 flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${completedHeight}%` }}
                      />
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{day.day}</div>
                  <div className="text-xs text-slate-500">{day.tasks}</div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-400">Tasks Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-slate-400">Tasks Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category & Priority Breakdown */}
      {(stats.categoryStats.length > 0 || stats.priorityStats.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          {stats.categoryStats.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-6">By Category</h3>
              <div className="space-y-4">
                {stats.categoryStats.map(({ category, total, completed, completionRate }) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-slate-300 font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-400">
                        {completed}/{total}
                      </div>
                      <div className={`text-sm font-medium ${getCompletionColor(completionRate)}`}>
                        {completionRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Breakdown */}
          {stats.priorityStats.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-6">By Priority</h3>
              <div className="space-y-4">
                {stats.priorityStats.map(({ priority, total, completed, completionRate }) => (
                  <div key={priority.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-slate-300 font-medium">{priority.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-slate-400">
                        {completed}/{total}
                      </div>
                      <div className={`text-sm font-medium ${getCompletionColor(completionRate)}`}>
                        {completionRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivational Message */}
      {stats.total === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">Ready to Get Started?</h3>
          <p className="text-slate-400 mb-4">
            Create your first task and watch your productivity soar!
          </p>
          <div className="text-sm text-slate-500">
            Your dashboard will come alive with insights and progress tracking
          </div>
        </div>
      )}
    </div>
  );
}


