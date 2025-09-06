'use client';

import { useMemo } from 'react';
import { Task, Category, Priority } from '../../lib/types';
import TaskItem from './TaskItem';

interface KanbanViewProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  onToggle: (id: number, current: boolean) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  onDuplicate: (task: Task) => void;
  groupBy: 'category' | 'priority' | 'status';
}

export default function KanbanView({ 
  tasks, 
  categories, 
  priorities, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  groupBy 
}: KanbanViewProps) {
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};

    if (groupBy === 'status') {
      groups['To Do'] = tasks.filter(t => !t.is_done);
      groups['In Progress'] = tasks.filter(t => !t.is_done && t.actual_time && t.actual_time > 0);
      groups['Done'] = tasks.filter(t => t.is_done);
    } else if (groupBy === 'category') {
      tasks.forEach(task => {
        const categoryName = task.category?.name || 'Uncategorized';
        if (!groups[categoryName]) {
          groups[categoryName] = [];
        }
        groups[categoryName].push(task);
      });
    } else if (groupBy === 'priority') {
      tasks.forEach(task => {
        const priorityName = task.priority?.name || 'No Priority';
        if (!groups[priorityName]) {
          groups[priorityName] = [];
        }
        groups[priorityName].push(task);
      });
    }

    return groups;
  }, [tasks, groupBy]);

  const getGroupColor = (groupName: string) => {
    if (groupBy === 'status') {
      switch (groupName) {
        case 'To Do': return '#3b82f6';
        case 'In Progress': return '#f59e0b';
        case 'Done': return '#10b981';
        default: return '#6b7280';
      }
    } else if (groupBy === 'category') {
      const category = categories.find(c => c.name === groupName);
      return category?.color || '#6b7280';
    } else if (groupBy === 'priority') {
      const priority = priorities.find(p => p.name === groupName);
      return priority?.color || '#6b7280';
    }
    return '#6b7280';
  };

  const getGroupIcon = (groupName: string) => {
    if (groupBy === 'status') {
      switch (groupName) {
        case 'To Do': return '📋';
        case 'In Progress': return '⚡';
        case 'Done': return '✅';
        default: return '📄';
      }
    } else if (groupBy === 'category') {
      return '📁';
    } else if (groupBy === 'priority') {
      return '⚡';
    }
    return '📄';
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
        <div key={groupName} className="flex-shrink-0 w-80">
          <div className="glass-card p-4">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getGroupIcon(groupName)}</span>
                <h3 
                  className="font-semibold"
                  style={{ color: getGroupColor(groupName) }}
                >
                  {groupName}
                </h3>
                <span className="text-sm text-slate-400">
                  ({groupTasks.length})
                </span>
              </div>
            </div>

            {/* Tasks in Group */}
            <div className="space-y-3 min-h-[200px]">
              {groupTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No tasks here</p>
                </div>
              ) : (
                groupTasks.map(task => (
                  <div key={task.id} className="task-item-kanban">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="checkbox mt-1"
                        checked={task.is_done}
                        onChange={() => onToggle(task.id, task.is_done)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          task.is_done ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}>
                          {task.title}
                        </div>
                        
                        {task.description && (
                          <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          {/* Priority Indicator */}
                          {task.priority && (
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: task.priority.color }}
                              title={task.priority.name}
                            />
                          )}
                          
                          {/* Due Date */}
                          {task.due_date && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              new Date(task.due_date) < new Date() && !task.is_done
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          
                          {/* Time Tracking */}
                          {task.actual_time && task.actual_time > 0 && (
                            <span className="text-xs text-slate-400">
                              {Math.floor(task.actual_time / 60)}h {task.actual_time % 60}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mt-3">
                      <button
                        onClick={() => onDuplicate(task)}
                        className="btn-outline text-xs px-2 py-1"
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="btn-outline text-xs px-2 py-1 text-red-400"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


