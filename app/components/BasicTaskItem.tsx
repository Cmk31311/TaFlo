'use client';

import { useState, useCallback } from 'react';

type BasicTask = { 
  id: number; 
  user_id: string; 
  title: string; 
  is_done: boolean; 
  created_at: string 
};

interface BasicTaskItemProps {
  task: BasicTask;
  onToggle: (id: number, current: boolean) => void;
  onUpdate: (id: number, updates: Partial<BasicTask>) => void;
  onDelete: (id: number) => void;
}

export default function BasicTaskItem({ task, onToggle, onUpdate, onDelete }: BasicTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = useCallback(() => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  }, [editTitle, task.title, task.id, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title);
    }
  }, [handleSave, task.title]);

  return (
    <div className="task-item">
      <div className="flex items-center gap-4 flex-1">
        <input
          type="checkbox"
          className="checkbox"
          checked={task.is_done}
          onChange={() => onToggle(task.id, task.is_done)}
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              className="input text-sm"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              autoFocus
            />
          ) : (
            <div 
              className={`transition-all duration-300 cursor-pointer ${
                task.is_done ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
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
                setEditTitle(task.title);
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
