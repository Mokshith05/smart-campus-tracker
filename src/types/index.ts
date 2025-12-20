export type IssueStatus = 'reported' | 'viewed' | 'assigned' | 'in_progress' | 'resolved' | 'rejected';
export type IssueCategory = 'electrical' | 'hostel' | 'mess_food' | 'plumber' | 'security' | 'cleaning' | 'internet_network' | 'others';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  ai_detected_category: IssueCategory | null;
  status: IssueStatus;
  priority: PriorityLevel;
  location: string | null;
  image_url: string | null;
  audio_url: string | null;
  upvote_count: number;
  is_duplicate: boolean;
  duplicate_of: string | null;
  assigned_to: string | null;
  resolution_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  profiles?: Profile;
}

export interface IssueTimeline {
  id: string;
  issue_id: string;
  status: IssueStatus;
  notes: string | null;
  admin_id: string | null;
  admin_name: string | null;
  created_at: string;
}

export interface IssueRating {
  id: string;
  issue_id: string;
  user_id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

export interface AdminReply {
  id: string;
  issue_id: string;
  admin_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: string;
  icon: string | null;
  priority: number;
  created_at: string;
}

export const STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Reported',
  viewed: 'Viewed',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  electrical: 'Electrical',
  hostel: 'Hostel',
  mess_food: 'Mess / Food',
  plumber: 'Plumber',
  security: 'Security',
  cleaning: 'Cleaning',
  internet_network: 'Internet / Network',
  others: 'Others',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

import { Zap, Building2, UtensilsCrossed, Droplets, Shield, Sparkles, Wifi, HelpCircle, LucideIcon } from 'lucide-react';

export const CATEGORY_ICONS: Record<IssueCategory, LucideIcon> = {
  electrical: Zap,
  hostel: Building2,
  mess_food: UtensilsCrossed,
  plumber: Droplets,
  security: Shield,
  cleaning: Sparkles,
  internet_network: Wifi,
  others: HelpCircle,
};
