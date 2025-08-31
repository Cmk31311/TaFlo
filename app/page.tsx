'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // from app/page → ../lib
import { useUser } from './hooks/useUser';

type Task = { id: number; user_id: string; title: string; is_done: boolean; created_at: string };

export default function Home() {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    if (!user) { setTasks([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }

  async function addTask() {
    if (!user) return;
    const newTitle = title.trim();
    if (!newTitle) return;
    const { error } = await supabase.from('tasks').insert({
      title: newTitle,
      user_id: user.id, // required for RLS
    });
    if (!error) { setTitle(''); loadTasks(); } else { alert(error.message); }
  }

  async function toggleTask(id: number, current: boolean) {
    const { error } = await supabase.from('tasks').update({ is_done: !current }).eq('id', id);
    if (!error) loadTasks();
  }

  async function deleteTask(id: number) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) loadTasks();
  }

  useEffect(() => { loadTasks(); }, [user?.id]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your tasks</h1>

      {!user && (
        <p className="text-gray-700">
          Please <a className="underline" href="/auth">sign in</a> to manage tasks.
        </p>
      )}

      {user && (
        <>
          <div className="flex gap-2 mb-4">
            <input
              className="border rounded p-2 flex-1"
              placeholder="New task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              className="bg-black text-white rounded px-4 disabled:opacity-50"
              disabled={!title.trim()}
            >
              Add
            </button>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading…</p>}

          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="border p-3 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.is_done}
                    onChange={() => toggleTask(t.id, t.is_done)}
                    className="w-4 h-4"
                  />
                  <span className={t.is_done ? 'line-through text-gray-500' : ''}>{t.title}</span>
                </div>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {!loading && tasks.length === 0 && (
            <p className="text-sm text-gray-600 mt-2">No tasks yet — add your first one!</p>
          )}
        </>
      )}
    </div>
  );
}
