'use client';

import { useState, useCallback, useMemo } from 'react';
import { useUser } from './hooks/useUser';
import { useTasksSimple } from './hooks/useTasksSimple';
import { useCategories } from './hooks/useCategories';
import { usePriorities } from './hooks/usePriorities';
import { TaskFilter, ViewMode } from '../lib/simpleTypes';

// Components
import EnhancedTaskItem from './components/EnhancedTaskItem';
import BasicTaskItem from './components/BasicTaskItem';
import EnhancedTaskForm from './components/EnhancedTaskForm';
import SimpleTaskForm from './components/SimpleTaskForm';
import SearchAndFilter from './components/SearchAndFilter';

export default function Home() {
  const user = useUser();
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>({});
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'list' });
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Debug logging
  console.log('Current user:', user);
  console.log('User type:', typeof user);
  console.log('User is null?', user === null);

  // Data hooks
  const { 
    tasks, 
    loading, 
    stats, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTask
  } = useTasksSimple(currentFilter);

  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory 
  } = useCategories();

  const { 
    priorities, 
    addPriority, 
    updatePriority, 
    deletePriority 
  } = usePriorities();

  // Task form handlers
  const handleAddTask = useCallback(async (taskData: any) => {
    try {
      const result = await addTask(taskData);
      if (result) {
        setShowTaskForm(false);
      }
      return result;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  }, [addTask]);


  // View mode handlers
  const handleViewModeChange = useCallback((type: 'list' | 'kanban' | 'calendar', groupBy?: string) => {
    setViewMode({ type, groupBy: groupBy as any });
  }, []);

  // Simple stats display
  const statsDisplay = useMemo(() => (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 gradient-text">Quick Stats</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-slate-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{Math.round(stats.completionRate)}%</div>
          <div className="text-sm text-slate-400">Complete</div>
        </div>
      </div>
    </div>
  ), [stats]);

  // Always show the dashboard - no authentication required for development

  return (
    <div className="min-h-screen" style={{ transform: 'translateZ(0)', willChange: 'scroll-position' }}>
      <section className="w-full max-w-7xl mx-auto p-6 space-y-6" style={{ transform: 'translateZ(0)' }}>
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-4xl font-bold tracking-tight mb-2">TaFlo</h1>
            <p className="text-slate-300 text-sm">Your futuristic task companion</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Settings button removed */}
          </div>
        </header>

        {/* Quick Add Task - Always Visible */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Quick Add Task</h3>
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="btn-neon text-sm"
            >
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>
          
          {showTaskForm ? (
            categories.length > 0 || priorities.length > 0 ? (
              <EnhancedTaskForm
                onSubmit={handleAddTask}
                categories={categories}
                priorities={priorities}
                onCancel={() => setShowTaskForm(false)}
              />
            ) : (
              <SimpleTaskForm
                onSubmit={handleAddTask}
                onCancel={() => setShowTaskForm(false)}
              />
            )
          ) : (
            <div className="flex gap-3">
                <input
                type="text"
                  className="input flex-1"
                placeholder="What needs to be done?"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const title = e.currentTarget.value.trim();
                    e.currentTarget.value = '';
                    try {
                      await handleAddTask({ title });
                    } catch (error) {
                      console.error('Error adding quick task:', error);
                    }
                  }
                }}
                />
                <button 
                onClick={async () => {
                  const input = document.querySelector('input[placeholder="What needs to be done?"]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const title = input.value.trim();
                    input.value = '';
                    try {
                      await handleAddTask({ title });
                    } catch (error) {
                      console.error('Error adding task:', error);
                    }
                  }
                }}
                  className="btn"
                >
                  Add Task
                </button>
              </div>
          )}
            </div>

        {/* Search and Filter */}
        <SearchAndFilter
          onFilterChange={setCurrentFilter}
          categories={categories}
          priorities={priorities}
          currentFilter={currentFilter}
        />

        {/* Stats Display */}
        {statsDisplay}

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`btn-outline ${viewMode.type === 'list' ? 'bg-blue-500/20 text-blue-400' : ''}`}
          >
            📋 List View
          </button>
          <button
            onClick={() => handleViewModeChange('kanban', 'status')}
            className={`btn-outline ${viewMode.type === 'kanban' ? 'bg-blue-500/20 text-blue-400' : ''}`}
          >
            📊 Kanban View
          </button>
                  <button
            onClick={() => handleViewModeChange('calendar')}
            className={`btn-outline ${viewMode.type === 'calendar' ? 'bg-blue-500/20 text-blue-400' : ''}`}
          >
            📅 Calendar View
                  </button>
                </div>

        {/* Tasks Display */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400 loading-dots">Loading tasks</p>
            </div>
        ) : tasks.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-slate-400 mb-2">No tasks yet</p>
                <p className="text-sm text-slate-500">Add your first task to get started!</p>
              </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              categories.length > 0 || priorities.length > 0 ? (
                <EnhancedTaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  categories={categories}
                  priorities={priorities}
                />
              ) : (
                <BasicTaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              )
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
