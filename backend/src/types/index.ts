// Database table types based on current Supabase schema (app_* tables)
export interface Profile {
  id: string; // References auth.users(id)
  role: 'teacher' | 'student' | 'pending';
  first_name: string;
  last_name: string;
  display_name: string; // Generated field (first_name + ' ' + last_name)
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  invite_code: string;
  agora_channel_name: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  recording_url: string | null;
  recording_sid: string | null; // Agora Cloud Recording session ID
  recording_resource_id: string | null; // Agora Cloud Recording resource ID
  board_snapshot_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonParticipant {
  lesson_id: string;
  user_id: string;
  joined_at: string | null;
  left_at: string | null;
  role_in_lesson: 'teacher' | 'student';
}

export interface LessonNote {
  id: string;
  lesson_id: string;
  note_type: 'transcript' | 'summary' | 'board_highlight';
  content: string | null;
  image_path: string | null;
  added_to_summary: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types for API responses
export interface LessonWithParticipants extends Lesson {
  participants: LessonParticipant[];
}

export interface LessonWithNotes extends Lesson {
  notes: LessonNote[];
}

export interface LessonWithParticipantsAndNotes extends Lesson {
  participants: LessonParticipant[];
  notes: LessonNote[];
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile: Profile;
}

// JWT payload type
export interface JwtPayload {
  sub: string; // user_id
  email: string;
  role: 'teacher' | 'student' | 'pending';
  iat: number;
  exp: number;
}

// Request types for Express middleware
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

// API Error types
export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

// Role-based access control
export type UserRole = 'teacher' | 'student' | 'pending';

// Lesson note types
export type LessonNoteType = 'transcript' | 'summary' | 'board_highlight';

// Supabase Auth types
export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseUser;
}

// Contact request interface for the "Ask-a-Question" feature
export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  created_at: string;
}

// Newsletter subscription interface for email marketing
export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  created_at: string;
  unsubscribed_at: string | null;
}

// Participant roster interface for displaying names in Agora calls
export interface ParticipantRosterItem {
  userId: string;
  roleInLesson: 'teacher' | 'student';
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}

// Legacy type aliases for backward compatibility (now just aliases to the main types)
export type AppUser = Profile;
export type AppLesson = Lesson;
export type AppLessonParticipant = LessonParticipant;
export type AppLessonNote = LessonNote;
