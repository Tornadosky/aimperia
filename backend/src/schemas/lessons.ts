import { z } from 'zod';

// Schema for creating a lesson
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  inviteCode: z
    .string()
    .min(1, 'Invite code is required')
    .max(50, 'Invite code must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Invite code must contain only lowercase letters, numbers, and hyphens'
    )
    .optional(), // Made optional - will be auto-generated if not provided
  scheduledAt: z
    .string()
    .datetime('Scheduled time must be a valid ISO datetime')
    .optional(),
  startedAt: z
    .string()
    .datetime('Started time must be a valid ISO datetime')
    .optional(),
  startNow: z.boolean().optional(), // If true, automatically sets started_at to current time
});

// Schema for updating a lesson
export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  scheduledAt: z
    .string()
    .datetime('Scheduled time must be a valid ISO datetime')
    .optional(),
});

// Schema for closing a lesson (no content, just marks as ended)
export const closeLessonSchema = z.object({
  recordingUrl: z.string().url('Recording URL must be a valid URL').optional(),
  boardSnapshot: z.string().optional(),
});

// Schema for creating lesson summary with images
export const createLessonSummarySchema = z.object({
  summaryContent: z.string().min(1, 'Summary content is required'),
  images: z
    .array(
      z.object({
        fileName: z.string().min(1, 'File name is required'), // original name
        dataUrl: z.string().min(1, 'Data URL is required'), // "data:image/png;base64,..." OR presigned URL
      })
    )
    .optional(),
});

// Schema for attending a lesson
export const attendLessonSchema = z.object({
  // No additional fields required for attending - user ID comes from auth
});

// Schema for joining a lesson by invite code
export const joinLessonSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

// Schema for Agora token request
export const agoraTokenRequestSchema = z.object({
  lessonId: z.string().uuid('Lesson ID must be a valid UUID'),
});

// Schema for lesson ID parameter
export const lessonIdSchema = z.object({
  id: z.string().uuid('Lesson ID must be a valid UUID'),
});

// Schema for lesson note operations
export const createLessonNoteSchema = z.object({
  noteType: z.enum(['transcript', 'summary', 'board_highlight']),
  content: z.string().optional(),
  imagePath: z.string().optional(),
  addedToSummary: z.boolean().default(false),
});

export const updateLessonNoteSchema = z.object({
  content: z.string().optional(),
  imagePath: z.string().optional(),
  addedToSummary: z.boolean().optional(),
});

// Schema for updating lesson summary with images
export const updateLessonSummarySchema = z.object({
  summaryContent: z.string().min(1, 'Summary content is required'),
  images: z
    .array(
      z.object({
        fileName: z.string().min(1, 'File name is required'), // original name
        dataUrl: z.string().min(1, 'Data URL is required'), // "data:image/png;base64,..." OR presigned URL
      })
    )
    .optional(),
});

// Schema for lesson response
export const lessonResponseSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string(),
  agoraChannelName: z.string(),
  scheduledAt: z.string().nullable(),
  startedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  recordingUrl: z.string().nullable(),
  boardSnapshot: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for lesson note response
export const lessonNoteResponseSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  noteType: z.enum(['transcript', 'summary', 'board_highlight']),
  content: z.string().nullable(),
  imagePath: z.string().nullable(),
  addedToSummary: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schema for lesson participant response
export const lessonParticipantResponseSchema = z.object({
  lessonId: z.string(),
  userId: z.string(),
  joinedAt: z.string().nullable(),
  leftAt: z.string().nullable(),
  roleInLesson: z.enum(['teacher', 'student']),
});

// Schema for lesson with participants
export const lessonWithParticipantsSchema = lessonResponseSchema.extend({
  participants: z.array(lessonParticipantResponseSchema),
});

// Schema for lesson with notes
export const lessonWithNotesSchema = lessonResponseSchema.extend({
  notes: z.array(lessonNoteResponseSchema),
});

// Schema for lesson with participants and notes
export const lessonWithParticipantsAndNotesSchema = lessonResponseSchema.extend(
  {
    participants: z.array(lessonParticipantResponseSchema),
    notes: z.array(lessonNoteResponseSchema),
  }
);

// Schema for lesson summary response (transcript and summary notes)
export const lessonSummarySchema = z.object({
  lessonId: z.string(),
  transcript: lessonNoteResponseSchema.nullable(),
  summary: lessonNoteResponseSchema.nullable(),
  boardHighlights: z.array(lessonNoteResponseSchema),
  createdAt: z.string(),
  endedAt: z.string().nullable(),
});

// Validation for lesson access controls
export const lessonAccessSchema = z.object({
  lessonId: z.string().uuid('Lesson ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID'),
  role: z.enum(['teacher', 'student']),
});

// Schema for lesson filters/queries
export const lessonQuerySchema = z.object({
  teacherId: z.string().uuid().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
});

// Schema for board highlight upload (teacher only)
export const boardHighlightSchema = z.object({
  dataUrl: z.string().min(1, 'Data URL is required'),
  description: z.string().optional(),
});

// Schema for creating notebook from transcript + images
export const createNotebookSchema = z.object({
  transcript: z.string().min(50, 'Transcript must be at least 50 characters'),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional(),
        timestampSec: z.number().nonnegative().optional(),
      })
    )
    .default([]),
  topic: z.string().optional(),
  studentLevel: z
    .enum(['elementary', 'middle', 'high', 'college', 'adult'])
    .default('high'),
  difficulty: z.enum(['intro', 'standard', 'advanced']).default('standard'),
  language: z.string().default('en'),
  style: z.enum(['concise', 'detailed']).default('detailed'),
});

// Types derived from schemas
export type CreateLessonRequest = z.infer<typeof createLessonSchema>;
export type UpdateLessonRequest = z.infer<typeof updateLessonSchema>;
export type CloseLessonRequest = z.infer<typeof closeLessonSchema>;
export type AttendLessonRequest = z.infer<typeof attendLessonSchema>;
export type JoinLessonRequest = z.infer<typeof joinLessonSchema>;
export type LessonIdParams = z.infer<typeof lessonIdSchema>;
export type CreateLessonNoteRequest = z.infer<typeof createLessonNoteSchema>;
export type UpdateLessonNoteRequest = z.infer<typeof updateLessonNoteSchema>;
export type CreateLessonSummaryRequest = z.infer<
  typeof createLessonSummarySchema
>;
export type UpdateLessonSummaryRequest = z.infer<
  typeof updateLessonSummarySchema
>;
export type AgoraTokenRequest = z.infer<typeof agoraTokenRequestSchema>;
export type BoardHighlightRequest = z.infer<typeof boardHighlightSchema>;
export type CreateNotebookRequest = z.infer<typeof createNotebookSchema>;
export type LessonResponse = z.infer<typeof lessonResponseSchema>;
export type LessonNoteResponse = z.infer<typeof lessonNoteResponseSchema>;
export type LessonParticipantResponse = z.infer<
  typeof lessonParticipantResponseSchema
>;
export type LessonWithParticipants = z.infer<
  typeof lessonWithParticipantsSchema
>;
export type LessonWithNotes = z.infer<typeof lessonWithNotesSchema>;
export type LessonWithParticipantsAndNotes = z.infer<
  typeof lessonWithParticipantsAndNotesSchema
>;
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
export type LessonAccess = z.infer<typeof lessonAccessSchema>;
export type LessonQuery = z.infer<typeof lessonQuerySchema>;
