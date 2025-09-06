'use client';

import { useState, useCallback } from 'react';
import { Category } from '../../lib/types';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: number, updates: Partial<Category>) => void;
  onDelete: (id: number) => void;
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
  '#14b8a6', '#eab308', '#dc2626', '#7c3aed', '#0891b2'
];

export default function CategoryManager({ categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = useCallback(() => {
    if (newName.trim()) {
      onAdd(newName.trim(), newColor);
      setNewName('');
      setNewColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  }, [newName, newColor, onAdd]);

  const handleEdit = useCallback((category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, { name: editName.trim(), color: editColor });
      setEditingId(null);
      setEditName('');
      setEditColor('');
    }
  }, [editingId, editName, editColor, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName('');
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

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text">Categories</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-neon text-sm"
        >
          + Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {isAdding && (
        <div className="mb-4 p-4 glass-card">
          <div className="space-y-3">
            <input
              type="text"
              className="input w-full"
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'add')}
              autoFocus
            />
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newColor === color ? 'border-white' : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewColor(color)}
                  />
                ))}
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

      {/* Categories List */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-4 text-slate-400">
            No categories yet. Create your first one!
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-3 glass-card">
              {editingId === category.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    className="input flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'edit')}
                    autoFocus
                  />
                  
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 8).map(color => (
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
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-slate-100">{category.name}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn-outline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(category.id)}
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


