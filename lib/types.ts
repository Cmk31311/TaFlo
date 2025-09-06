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
  completed_at?: string;
  estimated_time?: number; // in minutes
  actual_time?: number; // in minutes
  is_recurring: boolean;
  recurrence_pattern?: string; // daily, weekly, monthly
  recurrence_interval: number;
  parent_task_id?: number;
  position: number;
  tags: string[];
  attachments: Attachment[];
  created_at: string;
  updated_at?: string;
  // Joined data
  category?: Category;
  priority?: Priority;
  subtasks?: Task[];
  time_entries?: TimeEntry[];
  comments?: Comment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in minutes
  description?: string;
  created_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSettings {
  id: number;
  user_id: string;
  theme: 'dark' | 'light';
  default_category_id?: number;
  default_priority_id?: number;
  notifications_enabled: boolean;
  email_digest: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TaskFilter {
  search?: string;
  category_id?: number;
  priority_id?: number;
  is_done?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
  has_attachments?: boolean;
  is_overdue?: boolean;
}

export interface TaskSort {
  field: 'title' | 'created_at' | 'due_date' | 'priority' | 'position';
  direction: 'asc' | 'desc';
}

export interface ViewMode {
  type: 'list' | 'kanban' | 'calendar';
  groupBy?: 'category' | 'priority' | 'due_date' | 'status';
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  endDate?: string;
  occurrences?: number;
}

export interface TaskTemplate {
  id: number;
  name: string;
  title: string;
  description?: string;
  category_id?: number;
  priority_id?: number;
  estimated_time?: number;
  tags: string[];
  user_id: string;
  created_at: string;
}

export interface ProductivityStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  overdue_tasks: number;
  tasks_this_week: number;
  completed_this_week: number;
  average_completion_time: number;
  most_productive_category: string;
  time_tracked_today: number;
  time_tracked_this_week: number;
}

export interface NotificationSettings {
  email_digest: boolean;
  due_date_reminders: boolean;
  overdue_notifications: boolean;
  completion_celebrations: boolean;
  weekly_reports: boolean;
}


