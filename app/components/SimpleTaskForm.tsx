'use client';

import { useState, useCallback } from 'react';

interface SimpleTaskFormProps {
  onSubmit: (taskData: { title: string }) => void;
  onCancel: () => void;
}

export default function SimpleTaskForm({ onSubmit, onCancel }: SimpleTaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({ title: title.trim() });
    setTitle('');
  }, [title, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          className="input w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="btn flex-1"
        >
          Add Task
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
