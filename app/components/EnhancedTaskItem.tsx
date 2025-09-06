'use client';

import { useState, useCallback } from 'react';
import { Task, Category, Priority } from '../../lib/simpleTypes';

interface EnhancedTaskItemProps {
  task: Task;
  onToggle: (id: number, current: boolean) => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
  categories: Category[];
  priorities: Priority[];
}

export default function EnhancedTaskItem({ 
  task, 
  onToggle, 
  onUpdate, 
  onDelete, 
  categories, 
  priorities 
}: EnhancedTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || '',
    category_id: task.category_id,
    priority_id: task.priority_id,
    due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    estimated_time: task.estimated_time,
  });

  const [showDetails, setShowDetails] = useState(false);

  const handleSave = useCallback(() => {
    if (editData.title.trim() && editData.title.trim() !== task.title) {
      onUpdate(task.id, {
        title: editData.title.trim(),
        description: editData.description.trim() || undefined,
        category_id: editData.category_id || undefined,
        priority_id: editData.priority_id || undefined,
        due_date: editData.due_date || undefined,
        estimated_time: editData.estimated_time || undefined,
      });
    }
    setIsEditing(false);
  }, [editData, task.title, task.id, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditData({
        title: task.title,
        description: task.description || '',
        category_id: task.category_id,
        priority_id: task.priority_id,
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        estimated_time: task.estimated_time,
      });
    }
  }, [handleSave, task]);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_done;
  const category = categories.find(c => c.id === task.category_id);
  const priority = priorities.find(p => p.id === task.priority_id);

  return (
    <div className={`task-item ${isOverdue ? 'border-red-500/50' : ''}`}>
      <div className="flex items-start gap-4 flex-1">
        <input
          type="checkbox"
          className="checkbox mt-1"
          checked={task.is_done}
          onChange={() => onToggle(task.id, task.is_done)}
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                className="input text-sm"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <textarea
                className="input text-sm min-h-[60px] resize-none"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add description..."
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="input text-xs"
                  value={editData.category_id || ''}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    category_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                >
                  <option value="">No category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  className="input text-xs"
                  value={editData.priority_id || ''}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    priority_id: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                >
                  <option value="">No priority</option>
                  {priorities.map(pri => (
                    <option key={pri.id} value={pri.id}>{pri.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  className="input text-xs flex-1"
                  value={editData.due_date}
                  onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                />
                <input
                  type="number"
                  className="input text-xs w-20"
                  value={editData.estimated_time || ''}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    estimated_time: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="min"
                />
              </div>
            </div>
          ) : (
            <div>
              <div 
                className={`transition-all duration-300 cursor-pointer ${
                  task.is_done ? 'line-through text-slate-400' : 'text-slate-100'
                } ${isOverdue ? 'text-red-300' : ''}`}
                onClick={() => setIsEditing(true)}
              >
                {task.title}
              </div>
              
              {task.description && (
                <div className="text-sm text-slate-400 mt-1">
                  {task.description}
                </div>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs">
                {category && (
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {category.name}
                  </span>
                )}
                {priority && (
                  <span 
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: `${priority.color}20`, color: priority.color }}
                  >
                    {priority.name}
                  </span>
                )}
                {task.due_date && (
                  <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                    📅 {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {task.estimated_time && (
                  <span className="text-xs text-slate-400">
                    ⏱️ {task.estimated_time}m
                  </span>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs text-blue-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="btn-outline text-xs px-3 py-2 text-green-400 hover:bg-green-500/20"
              title="Save changes"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  title: task.title,
                  description: task.description || '',
                  category_id: task.category_id,
                  priority_id: task.priority_id,
                  due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
                  estimated_time: task.estimated_time,
                });
              }}
              className="btn-outline text-xs px-3 py-2 text-slate-400 hover:bg-slate-500/20"
              title="Cancel"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline text-xs px-3 py-2 text-blue-400 hover:bg-blue-500/20"
              title="Edit task"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="btn-outline text-xs px-3 py-2 text-red-400 hover:bg-red-500/20"
              title="Delete task"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
