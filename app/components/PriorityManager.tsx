'use client';

import { useState, useCallback } from 'react';
import { Priority } from '../../lib/types';

interface PriorityManagerProps {
  priorities: Priority[];
  onAdd: (name: string, level: number, color: string) => void;
  onUpdate: (id: number, updates: Partial<Priority>) => void;
  onDelete: (id: number) => void;
}

const PRESET_PRIORITIES = [
  { name: 'Low', level: 1, color: '#10b981' },
  { name: 'Medium', level: 2, color: '#f59e0b' },
  { name: 'High', level: 3, color: '#ef4444' },
  { name: 'Critical', level: 4, color: '#dc2626' },
];

const PRESET_COLORS = [
  '#10b981', '#f59e0b', '#ef4444', '#dc2626', '#8b5cf6',
  '#3b82f6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'
];

export default function PriorityManager({ priorities, onAdd, onUpdate, onDelete }: PriorityManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState(1);
  const [editColor, setEditColor] = useState('');

  const handleAdd = useCallback(() => {
    if (newName.trim()) {
      onAdd(newName.trim(), newLevel, newColor);
      setNewName('');
      setNewLevel(1);
      setNewColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  }, [newName, newLevel, newColor, onAdd]);

  const handleEdit = useCallback((priority: Priority) => {
    setEditingId(priority.id);
    setEditName(priority.name);
    setEditLevel(priority.level);
    setEditColor(priority.color);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, { name: editName.trim(), level: editLevel, color: editColor });
      setEditingId(null);
      setEditName('');
      setEditLevel(1);
      setEditColor('');
    }
  }, [editingId, editName, editLevel, editColor, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName('');
    setEditLevel(1);
    setEditColor('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') handleAdd();
      else handleSaveEdit();
    } else if (e.key === 'Escape') {
      if (action === 'add') {
        setIsAdding(false);
        setNewName('');
      } else {
        handleCancelEdit();
      }
    }
  }, [handleAdd, handleSaveEdit, handleCancelEdit]);

  const sortedPriorities = [...priorities].sort((a, b) => a.level - b.level);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text">Priorities</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-neon text-sm"
        >
          + Add Priority
        </button>
      </div>

      {/* Quick Add Preset Priorities */}
      {priorities.length === 0 && (
        <div className="mb-4 p-4 glass-card">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Setup</h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PRIORITIES.map(preset => (
              <button
                key={preset.name}
                onClick={() => onAdd(preset.name, preset.level, preset.color)}
                className="flex items-center gap-2 p-2 btn-outline text-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.color }}
                />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Priority Form */}
      {isAdding && (
        <div className="mb-4 p-4 glass-card">
          <div className="space-y-3">
            <input
              type="text"
              className="input w-full"
              placeholder="Priority name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'add')}
              autoFocus
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Level</label>
                <input
                  type="number"
                  className="input w-full"
                  value={newLevel}
                  onChange={(e) => setNewLevel(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm mb-1">Color</label>
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 6).map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border ${
                        newColor === color ? 'border-white' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="btn text-sm"
                disabled={!newName.trim()}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewName('');
                }}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priorities List */}
      <div className="space-y-2">
        {sortedPriorities.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            No priorities yet. Create your first one!
          </div>
        ) : (
          sortedPriorities.map(priority => (
            <div key={priority.id} className="flex items-center justify-between p-3 glass-card">
              {editingId === priority.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    className="input flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                    autoFocus
                  />
                  
                  <input
                    type="number"
                    className="input w-20"
                    value={editLevel}
                    onChange={(e) => setEditLevel(parseInt(e.target.value) || 1)}
                    min="1"
                    max="10"
                  />
                  
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 6).map(color => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full border ${
                          editColor === color ? 'border-white' : 'border-slate-600'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditColor(color)}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleSaveEdit}
                    className="btn text-sm"
                    disabled={!editName.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="btn-outline text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="text-slate-100">{priority.name}</span>
                    <span className="text-xs text-slate-400">Level {priority.level}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(priority)}
                      className="btn-outline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(priority.id)}
                      className="btn-outline text-sm text-red-400 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


