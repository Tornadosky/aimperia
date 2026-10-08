// FILE: src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';
import type {
  Profile,
  Lesson,
  LessonParticipant,
  LessonNote,
  ContactRequest,
  NewsletterSubscription,
  ParticipantRosterItem,
} from '../types/index.js';

/** Supabase generated types matching *current* DB schema */
export interface Database {
  public: {
    Tables: {
      app_user: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          role: 'teacher' | 'student' | 'pending';
          first_name: string;
          last_name: string;
        };
        Update: Partial<{
          email: string;
          role: 'teacher' | 'student' | 'pending';
          first_name: string;
          last_name: string;
        }>;
      };
      app_lesson: {
        Row: Lesson;
        Insert: {
          teacher_id: string;
          title: string;
          description?: string | null;
          invite_code: string;
          agora_channel_name: string;
          scheduled_at?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          recording_url?: string | null;
          recording_sid?: string | null; // Agora Cloud Recording session ID
          recording_resource_id?: string | null; // Agora Cloud Recording resource ID
          board_snapshot_path?: string | null;
        };
        Update: Partial<Omit<Lesson, 'id' | 'teacher_id' | 'created_at'>>;
      };
      app_lesson_participant: {
        Row: LessonParticipant;
        Insert: {
          lesson_id: string;
          user_id: string;
          joined_at?: string | null;
          left_at?: string | null;
          role_in_lesson: 'teacher' | 'student';
        };
        Update: Partial<Omit<LessonParticipant, 'lesson_id' | 'user_id'>>;
      };
      app_lesson_note: {
        Row: LessonNote;
        Insert: {
          lesson_id: string;
          note_type: 'transcript' | 'summary' | 'board_highlight';
          content?: string | null;
          image_path?: string | null;
          added_to_summary?: boolean;
        };
        Update: Partial<Omit<LessonNote, 'id' | 'lesson_id'>>;
      };
      app_contact_request: {
        Row: ContactRequest;
        Insert: Omit<ContactRequest, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ContactRequest, 'id' | 'created_at'>>;
      };
      app_newsletter_subscription: {
        Row: NewsletterSubscription;
        Insert: Omit<NewsletterSubscription, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<NewsletterSubscription, 'id' | 'created_at'>>;
      };
    };
  };
}

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
        headers: { Authorization: `Bearer ${supabaseServiceRoleKey}` },
      },
  }
);

/** Centralized error helper */
export const handleSupabaseError = (error: any, context: string): never => {
  const message = error?.message || 'Unknown database error';
  const code = error?.code || 'UNKNOWN_ERROR';
  console.error(`Supabase error in ${context}:`, {
    message,
    code,
    details: error?.details,
  });
  throw new Error(`Database error: ${message}`);
};

export const db = {
  users: {
    async create(data: Database['public']['Tables']['app_user']['Insert']) {
      const { data: user, error } = await supabase
        .from('app_user')
        .insert(data)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'users.create');
      return user!;
    },
    async findById(userId: string) {
      const { data: user, error } = await supabase
        .from('app_user')
        .select('*')
        .eq('id', userId)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'users.findById');
      return user ?? null;
    },
    async findByEmail(email: string) {
      // email exists in app_user, so query directly
      const { data: user, error } = await supabase
        .from('app_user')
        .select('*')
        .eq('email', email)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'users.findByEmail');
      return user ?? null;
    },
    async update(
      userId: string,
      data: Database['public']['Tables']['app_user']['Update']
    ) {
      const { data: user, error } = await supabase
        .from('app_user')
        .update(data)
        .eq('id', userId)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'users.update');
      return user!;
    },
  },

  lessons: {
    async create(data: Database['public']['Tables']['app_lesson']['Insert']) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .insert(data)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'lessons.create');
      return lesson!;
    },
    async findById(id: string) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'lessons.findById');
      return lesson ?? null;
    },
    async findByInviteCode(inviteCode: string) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'lessons.findByInviteCode');
      return lesson ?? null;
    },
    async update(
      id: string,
      data: Database['public']['Tables']['app_lesson']['Update']
    ) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'lessons.update');
      return lesson!;
    },
    async findWithParticipants(id: string) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .select(`*, participants:app_lesson_participant(*)`)
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'lessons.findWithParticipants');
      return lesson ?? null;
    },
    async findWithParticipantsAndNotes(id: string) {
      const { data: lesson, error } = await supabase
        .from('app_lesson')
        .select(
          `*, participants:app_lesson_participant(*), notes:app_lesson_note(*)`
        )
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'lessons.findWithParticipantsAndNotes');
      return lesson ?? null;
    },
    async findByTeacherId(
      teacherId: string,
      options: {
        status?: string | undefined;
        limit?: number;
        offset?: number;
      } = {}
    ) {
      const { status, limit = 50, offset = 0 } = options;

      let query = supabase
        .from('app_lesson')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply status filtering
      if (status === 'upcoming') {
        query = query.is('ended_at', null).is('started_at', null);
      } else if (status === 'ongoing') {
        query = query.is('ended_at', null).not('started_at', 'is', null);
      } else if (status === 'completed') {
        query = query.not('ended_at', 'is', null);
      }

      const { data: lessons, error } = await query;
      if (error) handleSupabaseError(error, 'lessons.findByTeacherId');
      return lessons || [];
    },
    async findByParticipantId(
      userId: string,
      options: {
        status?: string | undefined;
        limit?: number;
        offset?: number;
      } = {}
    ) {
      const { status, limit = 50, offset = 0 } = options;

      let query = supabase
        .from('app_lesson')
        .select(`*, participants:app_lesson_participant!inner(*)`)
        .eq('participants.user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply status filtering
      if (status === 'upcoming') {
        query = query.is('ended_at', null).is('started_at', null);
      } else if (status === 'ongoing') {
        query = query.is('ended_at', null).not('started_at', 'is', null);
      } else if (status === 'completed') {
        query = query.not('ended_at', 'is', null);
      }

      const { data: lessons, error } = await query;
      if (error) handleSupabaseError(error, 'lessons.findByParticipantId');
      return lessons || [];
    },
  },

  participants: {
    async upsert(
      data: Database['public']['Tables']['app_lesson_participant']['Insert']
    ) {
      const { data: participant, error } = await supabase
        .from('app_lesson_participant')
        .upsert(data, {
          onConflict: 'lesson_id,user_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();
      if (error) handleSupabaseError(error, 'participants.upsert');
      return participant!;
    },
    async findByLessonId(lessonId: string) {
      const { data: participants, error } = await supabase
        .from('app_lesson_participant')
        .select('*')
        .eq('lesson_id', lessonId);
      if (error) handleSupabaseError(error, 'participants.findByLessonId');
      return participants || [];
    },
    async isParticipant(lessonId: string, userId: string) {
      const { data: participant, error } = await supabase
        .from('app_lesson_participant')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'participants.isParticipant');
      return !!participant;
    },
    async updateParticipant(
      lessonId: string,
      userId: string,
      data: Database['public']['Tables']['app_lesson_participant']['Update']
    ) {
      const { data: participant, error } = await supabase
        .from('app_lesson_participant')
        .update(data)
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'participants.updateParticipant');
      return participant!;
    },
    async listWithProfiles(lessonId: string): Promise<ParticipantRosterItem[]> {
      // base: participants joined to user
      const { data: rows, error } = await supabase
        .from('app_lesson_participant')
        .select(`
          user_id,
          role_in_lesson,
          user:app_user!inner(id, first_name, last_name, display_name)
        `)
        .eq('lesson_id', lessonId);
    
      if (error) handleSupabaseError(error, 'participants.listWithProfiles');
    
      const list: ParticipantRosterItem[] = (rows ?? []).map((r: any) => ({
        userId: r.user_id,
        roleInLesson: r.role_in_lesson,
        displayName: r.user?.display_name ?? null,
        firstName: r.user?.first_name ?? null,
        lastName: r.user?.last_name ?? null,
      }));
    
      // ensure teacher is included even if not in app_lesson_participant
      const { data: lesson, error: lerr } = await supabase
        .from('app_lesson')
        .select('teacher_id')
        .eq('id', lessonId)
        .single();
      if (lerr) handleSupabaseError(lerr, 'participants.listWithProfiles.loadLesson');
    
      const teacherId = lesson?.teacher_id;
      if (teacherId && !list.some(p => p.userId === teacherId)) {
        const { data: teacher, error: terr } = await supabase
          .from('app_user')
          .select('id, first_name, last_name, display_name')
          .eq('id', teacherId)
          .single();
        if (terr) handleSupabaseError(terr, 'participants.listWithProfiles.loadTeacher');
    
        if (teacher) {
          list.unshift({
            userId: teacher.id,
            roleInLesson: 'teacher',
            displayName: teacher.display_name ?? null,
            firstName: teacher.first_name ?? null,
            lastName: teacher.last_name ?? null,
          });
        }
      }
    
      return list;
    },
  },

  notes: {
    async create(
      data: Database['public']['Tables']['app_lesson_note']['Insert']
    ) {
      const { data: note, error } = await supabase
        .from('app_lesson_note')
        .insert(data)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'notes.create');
      return note!;
    },
    async findById(id: string) {
      const { data: note, error } = await supabase
        .from('app_lesson_note')
        .select('*')
        .eq('id', id)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'notes.findById');
      return note ?? null;
    },
    async findByLessonId(lessonId: string) {
      const { data: notes, error } = await supabase
        .from('app_lesson_note')
        .select('*')
        .eq('lesson_id', lessonId);
      if (error) handleSupabaseError(error, 'notes.findByLessonId');
      return notes || [];
    },
    async findByLessonIdAndType(
      lessonId: string,
      noteType: 'transcript' | 'summary' | 'board_highlight'
    ) {
      const { data: note, error } = await supabase
        .from('app_lesson_note')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('note_type', noteType)
        .single();
      if (error && error.code !== 'PGRST116')
        handleSupabaseError(error, 'notes.findByLessonIdAndType');
      return note ?? null;
    },
    async findHighlights(lessonId: string) {
      const { data: highlights, error } = await supabase
        .from('app_lesson_note')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('note_type', 'board_highlight');
      if (error) handleSupabaseError(error, 'notes.findHighlights');
      return highlights || [];
    },
    async update(
      id: string,
      data: Database['public']['Tables']['app_lesson_note']['Update']
    ) {
      const { data: note, error } = await supabase
        .from('app_lesson_note')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'notes.update');
      return note!;
    },
    async delete(id: string) {
      const { error } = await supabase
        .from('app_lesson_note')
        .delete()
        .eq('id', id);
      if (error) handleSupabaseError(error, 'notes.delete');
    },
    async upsertTranscriptOrSummary(
      data: Database['public']['Tables']['app_lesson_note']['Insert']
    ) {
      if (data.note_type !== 'transcript' && data.note_type !== 'summary') {
        throw new Error('This method is only for transcript and summary notes');
      }
      const existing = await this.findByLessonIdAndType(
        data.lesson_id,
        data.note_type
      );
      if (existing) await this.delete(existing.id);
      return await this.create(data);
    },
  },

  // Contact request methods for the "Ask-a-Question" feature
  contact: {
    async create(data: Database['public']['Tables']['app_contact_request']['Insert']) {
      const { data: rec, error } = await supabase
        .from('app_contact_request')
        .insert(data)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'contact.create');
      return rec!;
    },
  },

  // Newsletter subscription methods for email marketing
  newsletter: {
    async upsert(email: string) {
      const { data, error } = await supabase
        .from('app_newsletter_subscription')
        .upsert({ email, subscribed: true }, { onConflict: 'email' })
        .select()
        .single();
      if (error) handleSupabaseError(error, 'newsletter.upsert');
      return data!;
    },
    async unsubscribe(email: string) {
      const { data, error } = await supabase
        .from('app_newsletter_subscription')
        .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email)
        .select()
        .single();
      if (error) handleSupabaseError(error, 'newsletter.unsubscribe');
      return data!;
    },
  },
};
