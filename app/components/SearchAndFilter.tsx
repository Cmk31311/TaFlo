'use client';

import { useState, useCallback } from 'react';
import { TaskFilter, Category, Priority } from '../../lib/simpleTypes';

interface SearchAndFilterProps {
  onFilterChange: (filter: TaskFilter) => void;
  categories: Category[];
  priorities: Priority[];
  currentFilter: TaskFilter;
}

export default function SearchAndFilter({ 
  onFilterChange, 
  categories, 
  priorities, 
  currentFilter 
}: SearchAndFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(currentFilter.search || '');

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    onFilterChange({
      ...currentFilter,
      search: value.trim() || undefined,
    });
  }, [currentFilter, onFilterChange]);

  const handleFilterChange = useCallback((key: keyof TaskFilter, value: unknown) => {
    onFilterChange({
      ...currentFilter,
      [key]: value,
    });
  }, [currentFilter, onFilterChange]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = Object.values(currentFilter).some(value => 
    value !== undefined && value !== '' && value !== false
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold gradient-text">Search & Filter</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-outline text-sm"
          >
            {isExpanded ? 'Less' : 'More'} Options
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-outline text-sm text-red-400 hover:bg-red-500/20"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          className="input w-full pl-10"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          🔍
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('is_done', currentFilter.is_done === false ? undefined : false)}
          className={`btn-outline text-sm ${
            currentFilter.is_done === false ? 'bg-yellow-500/20 text-yellow-400' : ''
          }`}
        >
          📋 Pending
        </button>
        <button
          onClick={() => handleFilterChange('is_done', currentFilter.is_done === true ? undefined : true)}
          className={`btn-outline text-sm ${
            currentFilter.is_done === true ? 'bg-green-500/20 text-green-400' : ''
          }`}
        >
          ✅ Completed
        </button>
        <button
          onClick={() => handleFilterChange('is_overdue', currentFilter.is_overdue ? undefined : true)}
          className={`btn-outline text-sm ${
            currentFilter.is_overdue ? 'bg-red-500/20 text-red-400' : ''
          }`}
        >
          ⚠️ Overdue
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                className="input w-full"
                value={currentFilter.category_id || ''}
                onChange={(e) => handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">All categories</option>
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
                value={currentFilter.priority_id || ''}
                onChange={(e) => handleFilterChange('priority_id', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">All priorities</option>
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
                Due Date From
              </label>
              <input
                type="date"
                className="input w-full"
                value={currentFilter.due_date_from || ''}
                onChange={(e) => handleFilterChange('due_date_from', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Due Date To
              </label>
              <input
                type="date"
                className="input w-full"
                value={currentFilter.due_date_to || ''}
                onChange={(e) => handleFilterChange('due_date_to', e.target.value || undefined)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}