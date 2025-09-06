export interface Category {
  id: number;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Priority {
  id: number;
  name: string;
  level: number;
  color: string;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_done: boolean;
  category_id?: number;
  priority_id?: number;
  due_date?: string;
  estimated_time?: number;
  actual_time?: number;
  tags?: string[];
  position: number;
  created_at: string;
  updated_at?: string;
  // Relations
  category?: Category;
  priority?: Priority;
}

export interface TaskFilter {
  search?: string;
  category_id?: number;
  priority_id?: number;
  is_done?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
  is_overdue?: boolean;
}

export interface ViewMode {
  type: 'list' | 'kanban' | 'calendar';
  groupBy?: 'status' | 'category' | 'priority';
}
