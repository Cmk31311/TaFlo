'use client';

import { useState, useCallback } from 'react';
import { Category, Priority, Task } from '../../lib/types';

interface TaskFormProps {
  onSubmit: (taskData: Partial<Task>) => void;
  categories: Category[];
  priorities: Priority[];
  defaultCategory?: Category;
  defaultPriority?: Priority;
  onCancel?: () => void;
}

export default function TaskForm({ 
  onSubmit, 
  categories, 
  priorities, 
  defaultCategory,
  defaultPriority,
  onCancel 
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(defaultCategory?.id);
  const [priorityId, setPriorityId] = useState<number | undefined>(defaultPriority?.id);
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [tags, setTags] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const taskData: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId,
      priority_id: priorityId,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      estimated_time: estimatedTime ? parseInt(estimatedTime) : undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : undefined,
      recurrence_interval: isRecurring ? recurrenceInterval : 1,
    };

    onSubmit(taskData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategoryId(defaultCategory?.id);
    setPriorityId(defaultPriority?.id);
    setDueDate('');
    setEstimatedTime('');
    setTags('');
    setIsRecurring(false);
    setRecurrencePattern('daily');
    setRecurrenceInterval(1);
  }, [
    title, description, categoryId, priorityId, dueDate, estimatedTime, tags,
    isRecurring, recurrencePattern, recurrenceInterval, onSubmit, defaultCategory, defaultPriority
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  }, [handleSubmit, onCancel]);

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <div>
        <input
          type="text"
          className="input w-full"
          placeholder="Enter your next task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          required
        />
      </div>

      <div>
        <textarea
          className="input w-full min-h-[80px] resize-none"
          placeholder="Add description (optional)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Category</label>
          <select
            className="input w-full"
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">No Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-1">Priority</label>
          <select
            className="input w-full"
            value={priorityId || ''}
            onChange={(e) => setPriorityId(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">No Priority</option>
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-400 text-sm mb-1">Due Date</label>
          <input
            type="datetime-local"
            className="input w-full"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-1">Estimated Time (minutes)</label>
          <input
            type="number"
            className="input w-full"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            placeholder="e.g., 30"
            min="1"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 text-sm mb-1">Tags</label>
        <input
          type="text"
          className="input w-full"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="work, urgent, meeting (comma-separated)"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="checkbox"
          />
          <span className="text-sm text-slate-300">Recurring Task</span>
        </label>
      </div>

      {isRecurring && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Repeat</label>
            <select
              className="input w-full"
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Every</label>
            <input
              type="number"
              className="input w-full"
              value={recurrenceInterval}
              onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
              min="1"
              max="365"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="btn flex-1"
          disabled={!title.trim()}
        >
          Add Task
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="text-xs text-slate-500 text-center">
        Press Cmd+Enter to submit, Esc to cancel
      </div>
    </form>
  );
}


