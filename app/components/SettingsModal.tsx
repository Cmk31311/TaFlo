'use client';

import { useState, useCallback } from 'react';
import { Category, Priority } from '../../lib/simpleTypes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  priorities: Priority[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: number, updates: Partial<Category>) => void;
  onDeleteCategory: (id: number) => void;
  onAddPriority: (name: string, level: number, color: string) => void;
  onUpdatePriority: (id: number, updates: Partial<Priority>) => void;
  onDeletePriority: (id: number) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  categories,
  priorities,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddPriority,
  onUpdatePriority,
  onDeletePriority,
  onExportData,
  onImportData,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'categories' | 'priorities' | 'data'>('general');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityLevel, setNewPriorityLevel] = useState(1);
  const [newPriorityColor, setNewPriorityColor] = useState('#10b981');

  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor('#3b82f6');
    }
  }, [newCategoryName, newCategoryColor, onAddCategory]);

  const handleAddPriority = useCallback(() => {
    if (newPriorityName.trim()) {
      onAddPriority(newPriorityName.trim(), newPriorityLevel, newPriorityColor);
      setNewPriorityName('');
      setNewPriorityLevel(1);
      setNewPriorityColor('#10b981');
    }
  }, [newPriorityName, newPriorityLevel, newPriorityColor, onAddPriority]);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
    }
  }, [onImportData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-slate-800/50 p-4 border-r border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold gradient-text">Settings</h2>
              <button
                onClick={onClose}
                className="btn-outline text-sm px-3 py-2"
              >
                ✕
              </button>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeTab === 'general' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                ⚙️ General
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeTab === 'categories' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                🏷️ Categories
              </button>
              <button
                onClick={() => setActiveTab('priorities')}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeTab === 'priorities' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                ⚡ Priorities
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeTab === 'data' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                💾 Data
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold gradient-text">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-slate-200 mb-2">Appearance</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Dark mode</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Glassmorphism effects</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Animations</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-slate-200 mb-2">Notifications</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Due date reminders</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" />
                        <span className="text-slate-300">Daily summary</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Task completion alerts</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-slate-200 mb-2">Behavior</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Auto-save tasks</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" />
                        <span className="text-slate-300">Confirm before deleting</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="checkbox" defaultChecked />
                        <span className="text-slate-300">Show completed tasks</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold gradient-text">Category Management</h3>
                
                {/* Add New Category */}
                <div className="glass-card p-4">
                  <h4 className="text-md font-medium text-slate-200 mb-3">Add New Category</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <input
                      type="color"
                      className="w-12 h-10 rounded border border-slate-600 bg-slate-800"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                    />
                    <button
                      onClick={handleAddCategory}
                      className="btn"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Existing Categories */}
                <div>
                  <h4 className="text-md font-medium text-slate-200 mb-3">Existing Categories</h4>
                  <div className="space-y-2">
                    {categories.length === 0 ? (
                      <p className="text-slate-400 text-sm">No categories yet. Create your first one above!</p>
                    ) : (
                      categories.map(category => (
                        <div key={category.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-slate-200">{category.name}</span>
                          </div>
                          <button
                            onClick={() => onDeleteCategory(category.id)}
                            className="btn-outline text-xs px-3 py-1 text-red-400 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'priorities' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold gradient-text">Priority Management</h3>
                
                {/* Add New Priority */}
                <div className="glass-card p-4">
                  <h4 className="text-md font-medium text-slate-200 mb-3">Add New Priority</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      className="input"
                      placeholder="Priority name"
                      value={newPriorityName}
                      onChange={(e) => setNewPriorityName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="Level (1-10)"
                      min="1"
                      max="10"
                      value={newPriorityLevel}
                      onChange={(e) => setNewPriorityLevel(parseInt(e.target.value) || 1)}
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-12 h-10 rounded border border-slate-600 bg-slate-800"
                        value={newPriorityColor}
                        onChange={(e) => setNewPriorityColor(e.target.value)}
                      />
                      <button
                        onClick={handleAddPriority}
                        className="btn flex-1"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Priorities */}
                <div>
                  <h4 className="text-md font-medium text-slate-200 mb-3">Existing Priorities</h4>
                  <div className="space-y-2">
                    {priorities.length === 0 ? (
                      <p className="text-slate-400 text-sm">No custom priorities yet. Create your first one above!</p>
                    ) : (
                      priorities.map(priority => (
                        <div key={priority.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: priority.color }}
                            />
                            <span className="text-slate-200">{priority.name}</span>
                            <span className="text-xs text-slate-400">Level {priority.level}</span>
                          </div>
                          <button
                            onClick={() => onDeletePriority(priority.id)}
                            className="btn-outline text-xs px-3 py-1 text-red-400 hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold gradient-text">Data Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export */}
                  <div className="glass-card p-4">
                    <h4 className="text-md font-medium text-slate-200 mb-3">Export Data</h4>
                    <p className="text-slate-400 text-sm mb-4">
                      Download all your tasks, categories, and priorities as a JSON file.
                    </p>
                    <button
                      onClick={onExportData}
                      className="btn w-full"
                    >
                      📤 Export All Data
                    </button>
                  </div>

                  {/* Import */}
                  <div className="glass-card p-4">
                    <h4 className="text-md font-medium text-slate-200 mb-3">Import Data</h4>
                    <p className="text-slate-400 text-sm mb-4">
                      Restore data from a previously exported JSON file.
                    </p>
                    <label className="btn-outline w-full cursor-pointer block text-center">
                      📥 Import Data
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h4 className="text-md font-medium text-slate-200 mb-3">Database Migration</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    To enable advanced features like categories, priorities, and due dates, run the database migration.
                  </p>
                  <div className="bg-slate-900/50 p-3 rounded text-xs text-slate-300 font-mono">
                    Run the SQL commands in simple-migration.sql in your Supabase dashboard
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}