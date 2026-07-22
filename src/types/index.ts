export type UserRole = 'crew' | 'admin' | 'super_admin';
export type StateCode = 'NSW' | 'VIC' | 'WA' | 'QLD' | 'Office';

export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  state: StateCode | null;
  role: UserRole;
  phone: string | null;
  photo_url: string | null;
  active: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
}

export type ModuleKey = 'business' | 'crew' | 'team_online_tracker' | 'more';

export interface ModulePermission {
  id: string;
  user_id: string;
  module_key: ModuleKey;
  can_access: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface TenderOutstandingItem {
  id: string;
  tender_id: string;
  item_name: string;
  owner: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export type TenderStatus = 'pending' | 'submitted' | 'won' | 'lost' | 'no_works';

export interface Tender {
  id: string;
  tender_number: string | null;
  client: string;
  project_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  state: 'NSW' | 'VIC' | 'WA' | 'QLD' | null;
  quoted_value: number | null;
  revised_value: number | null;
  due_date: string | null;
  submission_date: string | null;
  status: TenderStatus;
  notes: string | null;
  procore_link: string | null;
  onedrive_folder_link: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  outstanding_items?: TenderOutstandingItem[];
}

export interface WipProject {
  id: string;
  job_number: string | null;
  project_name: string;
  client: string;
  state: 'NSW' | 'VIC' | 'WA' | 'QLD';
  quoted_value: number | null;
  invoiced_to_date: number;
  actual_spend: number;
  start_date: string | null;
  planned_completion_date: string | null;
  actual_completion_date: string | null;
  current_stage: string | null;
  completion_percentage: number;
  related_tender_id: string | null;
  project_manager: string | null;
  procore_link: string | null;
  onedrive_folder_link: string | null;
  planned_headcount: number | null;
  contract_start_date: string | null;
  created_at: string;
  updated_at: string;
}

export type VariationStatus = 'submitted' | 'approved' | 'rejected' | 'completed';

export interface Variation {
  id: string;
  variation_number: string | null;
  project_id: string | null;
  unmatched_project_name: string | null;
  description: string;
  cost_impact: number | null;
  time_impact_days: number | null;
  status: VariationStatus;
  submitted_date: string | null;
  approved_date: string | null;
  completed_date: string | null;
  client_sign_off: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: StateCode;
  description: string | null;
  created_at: string;
}

export type CommunityType = 'inductions' | 'general' | 'job' | 'custom';

export interface Community {
  id: string;
  channel_id: string;
  name: string;
  description: string | null;
  community_type: CommunityType;
  job_id: string | null;
  created_by: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'text' | 'photo' | 'document' | 'video';

export interface Message {
  id: string;
  community_id: string;
  user_id: string;
  content: string | null;
  message_type: MessageType;
  media_urls: string[];
  mentions: string[];
  reply_to: string | null;
  edited_at: string | null;
  pinned: boolean;
  created_at: string;
  sender?: AppUser;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string[];
  created_by: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  event_type: 'meeting' | 'deadline' | 'site_visit' | 'event';
  attendees: string[];
  recurring: boolean;
  recurrence_pattern: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnlineStatus {
  id: string;
  user_id: string;
  is_online: boolean;
  current_activity: string | null;
  current_project_id: string | null;
  last_active_at: string;
  updated_at: string;
}
