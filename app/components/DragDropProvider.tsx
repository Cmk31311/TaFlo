'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { Task } from '../../lib/types';

interface DragDropContextType {
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
  handleDragStart: (task: Task) => void;
  handleDragEnd: () => void;
  handleDrop: (targetTask: Task) => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

interface DragDropProviderProps {
  children: React.ReactNode;
  onReorderTasks: (taskIds: number[]) => void;
  tasks: Task[];
}

export default function DragDropProvider({ 
  children, 
  onReorderTasks, 
  tasks 
}: DragDropProviderProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDrop = useCallback((targetTask: Task) => {
    if (!draggedTask || draggedTask.id === targetTask.id) {
      return;
    }

    const draggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex(t => t.id === targetTask.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create new array with reordered tasks
    const newTasks = [...tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);

    // Update positions and call onReorderTasks
    const reorderedIds = newTasks.map((task, index) => {
      return { ...task, position: index };
    }).map(task => task.id);

    onReorderTasks(reorderedIds);
  }, [draggedTask, tasks, onReorderTasks]);

  const value: DragDropContextType = {
    draggedTask,
    setDraggedTask,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
}


