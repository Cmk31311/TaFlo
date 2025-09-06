'use client';

import { useState, useCallback } from 'react';
import { Task, Category, Priority } from '../../lib/types';
import { useTimeTracking } from '../hooks/useTimeTracking';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, current: boolean) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  onDuplicate: (task: Task) => void;
  categories: Category[];
  priorities: Priority[];
}

export default function TaskItem({ 
  task, 
  onToggle, 
  onUpdate, 
  onDelete, 
  onDuplicate,
  categories,
  priorities 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [showDetails, setShowDetails] = useState(false);
  
  const { activeEntry, startTimer, stopTimer } = useTimeTracking(task.id);
  const isTimerActive = activeEntry?.task_id === task.id;

  const handleSave = useCallback(() => {
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  }, [task.id, editTitle, editDescription, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
      setEditDescription(task.description || '');
    }
  }, [handleSave, task.title, task.description]);

  const handleTimerToggle = useCallback(() => {
    if (isTimerActive && activeEntry) {
      stopTimer(activeEntry.id);
    } else {
      startTimer(task.id, `Working on: ${task.title}`);
    }
  }, [isTimerActive, activeEntry, startTimer, stopTimer, task.id, task.title]);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_done;
  const selectedCategory = categories.find(c => c.id === task.category_id);
  const selectedPriority = priorities.find(p => p.id === task.priority_id);

  return (
    <div className={`task-item ${isOverdue ? 'overdue' : ''} ${task.is_done ? 'completed' : ''}`}>
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          className="checkbox"
          checked={task.is_done}
          onChange={() => onToggle(task.id, task.is_done)}
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                className="input text-sm"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                autoFocus
              />
              <textarea
                className="input text-sm min-h-[60px] resize-none"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add description..."
              />
            </div>
          ) : (
            <div>
              <div 
                className={`transition-all duration-300 cursor-pointer ${
                  task.is_done ? 'line-through text-slate-400' : 'text-slate-100'
                }`}
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </div>
              {task.description && (
                <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                  {task.description}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Category Badge */}
          {selectedCategory && (
            <span 
              className="px-2 py-1 text-xs rounded-full"
              style={{ 
                backgroundColor: `${selectedCategory.color}20`,
                color: selectedCategory.color,
                border: `1px solid ${selectedCategory.color}40`
              }}
            >
              {selectedCategory.name}
            </span>
          )}

          {/* Priority Indicator */}
          {selectedPriority && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedPriority.color }}
              title={selectedPriority.name}
            />
          )}

          {/* Due Date */}
          {task.due_date && (
            <span className={`text-xs px-2 py-1 rounded ${
              isOverdue 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
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

      <div className="flex items-center gap-2">
        {/* Timer Button */}
        <button
          onClick={handleTimerToggle}
          className={`btn-outline text-xs px-3 py-2 ${
            isTimerActive ? 'bg-green-500/20 text-green-400 border-green-500/40' : ''
          }`}
          title={isTimerActive ? 'Stop timer' : 'Start timer'}
        >
          {isTimerActive ? '⏹️' : '⏱️'}
        </button>

        {/* Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-outline text-xs px-3 py-2"
          title="Show details"
        >
          {showDetails ? '▲' : '▼'}
        </button>

        {/* Duplicate Button */}
        <button
          onClick={() => onDuplicate(task)}
          className="btn-outline text-xs px-3 py-2"
          title="Duplicate task"
        >
          📋
        </button>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(task.id)}
          className="btn-outline text-xs px-3 py-2 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 p-4 glass-card">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-slate-400 mb-1">Category</label>
              <select
                className="input text-sm"
                value={task.category_id || ''}
                onChange={(e) => onUpdate(task.id, { 
                  category_id: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Priority</label>
              <select
                className="input text-sm"
                value={task.priority_id || ''}
                onChange={(e) => onUpdate(task.id, { 
                  priority_id: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              >
                <option value="">No Priority</option>
                {priorities.map(pri => (
                  <option key={pri.id} value={pri.id}>
                    {pri.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Due Date</label>
              <input
                type="datetime-local"
                className="input text-sm"
                value={task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => onUpdate(task.id, { 
                  due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                })}
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Estimated Time (minutes)</label>
              <input
                type="number"
                className="input text-sm"
                value={task.estimated_time || ''}
                onChange={(e) => onUpdate(task.id, { 
                  estimated_time: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="e.g., 30"
              />
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mt-4">
              <label className="block text-slate-400 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


