'use client';

import { useState, useCallback } from 'react';
import { Category, Priority, Task } from '../../lib/simpleTypes';

interface EnhancedTaskFormProps {
  onSubmit: (taskData: Partial<Task>) => void;
  categories: Category[];
  priorities: Priority[];
  onCancel: () => void;
  initialData?: Partial<Task>;
}

export default function EnhancedTaskForm({ 
  onSubmit, 
  categories, 
  priorities, 
  onCancel, 
  initialData 
}: EnhancedTaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    category_id: undefined,
    priority_id: undefined,
    due_date: '',
    estimated_time: undefined,
    tags: [],
    ...initialData
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      due_date: formData.due_date || undefined,
      estimated_time: formData.estimated_time || undefined,
      tags: formData.tags?.length ? formData.tags : undefined,
    };

    onSubmit(submitData);
  }, [formData, onSubmit]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          className="input w-full"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="What needs to be done?"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          className="input w-full min-h-[80px] resize-none"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add more details..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            className="input w-full"
            value={formData.category_id || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              category_id: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Priority
          </label>
          <select
            className="input w-full"
            value={formData.priority_id || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              priority_id: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
          >
            <option value="">Select priority</option>
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Due Date
          </label>
          <input
            type="datetime-local"
            className="input w-full"
            value={formData.due_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Estimated Time (minutes)
          </label>
          <input
            type="number"
            className="input w-full"
            value={formData.estimated_time || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              estimated_time: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            placeholder="e.g., 30"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="input flex-1"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addTag}
            className="btn-outline"
          >
            Add
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-400 hover:text-blue-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="btn flex-1"
        >
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
