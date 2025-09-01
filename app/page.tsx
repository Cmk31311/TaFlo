'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from './hooks/useUser';

type Task = { id: number; user_id: string; title: string; is_done: boolean; created_at: string };

export default function Home() {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user) { setTasks([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setTasks(data as Task[]);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTask = useCallback(async () => {
    if (!user || !title.trim()) return;
    try {
      const { error } = await supabase.from('tasks').insert({ title: title.trim(), user_id: user.id });
      if (!error) { 
        setTitle(''); 
        loadTasks(); 
      } else { 
        console.error('Error adding task:', error.message); 
      }
    } catch (err) {
      console.error('Error adding task:', err);
    }
  }, [user, title, loadTasks]);

  const toggleTask = useCallback(async (id: number, current: boolean) => {
    try {
      const { error } = await supabase.from('tasks').update({ is_done: !current }).eq('id', id);
      if (!error) loadTasks();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }, [loadTasks]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTask();
  }, [addTask]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  // Memoize computed values
  const completedTasks = useMemo(() => tasks.filter(t => t.is_done).length, [tasks]);
  const totalTasks = useMemo(() => tasks.length, [tasks]);
  const isTitleEmpty = useMemo(() => !title.trim(), [title]);

  useEffect(() => { 
    loadTasks(); 
  }, [loadTasks]);

  return (
    <div className="grid place-items-center min-h-screen">
      <section className="glass w-full max-w-4xl p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-4xl font-bold tracking-tight mb-2">TaFlo</h1>
            <p className="text-slate-300 text-sm">Your futuristic task companion</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Powered by</span>
            <span className="glow-text text-sm font-mono">Supabase</span>
          </div>
        </header>

        {!user && (
          <div className="glass-card p-6 text-center">
            <p className="text-slate-300 mb-4">
              Welcome to the future of task management
            </p>
            <a 
              className="btn-neon" 
              href="/auth"
            >
              Sign In to Continue
            </a>
          </div>
        )}

        {user && (
          <>
            <div className="glass-card p-6 mb-6">
              <div className="flex gap-4">
                <input
                  className="input flex-1"
                  placeholder="Enter your next task..."
                  value={title}
                  onChange={handleTitleChange}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={addTask} 
                  className="btn"
                  disabled={isTitleEmpty}
                >
                  Add Task
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p className="text-slate-400 loading-dots">Loading tasks</p>
              </div>
            )}

            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="task-item">
                  <label className="flex items-center gap-4 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={t.is_done}
                      onChange={() => toggleTask(t.id, t.is_done)}
                    />
                    <span className={`transition-all duration-300 ${t.is_done ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {t.title}
                    </span>
                  </label>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="btn-outline text-xs px-3 py-2 opacity-70 group-hover:opacity-100 transition-all duration-300"
                    title="Delete"
                    aria-label="Delete task"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {!loading && tasks.length === 0 && (
              <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-slate-400 mb-2">No tasks yet</p>
                <p className="text-sm text-slate-500">Add your first task to get started!</p>
              </div>
            )}

            {!loading && tasks.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
