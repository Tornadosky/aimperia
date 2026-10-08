import { Router, type Router as ExpressRouter } from 'express';
import asyncHandler from 'express-async-handler';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';
import crypto from 'crypto';
import { TLSocketRoom } from '@tldraw/sync-core';
// Note: multer would be needed for file uploads: import multer from 'multer';
import { db, supabase } from '../db/supabase.js';
import {
  authenticateToken,
  requireTeacher,
  requireStudent,
  requireLessonAccess,
} from '../middleware/auth.js';
import * as agora from '../services/agora.js';
import * as agoraRecording from '../services/agora-recording.js';
import * as tldraw from '../services/tldraw.js';
import { transcribeLessonRecording } from '../services/transcription.js';
import { buildNotebookMarkdown, generateNotebookInBackground } from '../services/notebook.js';
import { generateCaptionInBackground } from '../services/image-caption.js';
import { env } from '../env.js';
import * as presence from '../services/presence.js';
import {
  createLessonSchema,
  updateLessonSchema,
  closeLessonSchema,
  joinLessonSchema,
  lessonIdSchema,
  createLessonSummarySchema,
  updateLessonSummarySchema,
  agoraTokenRequestSchema,
  boardHighlightSchema,
  createNotebookSchema,
  type CreateLessonRequest,
  type UpdateLessonRequest,
  type CloseLessonRequest,
  type JoinLessonRequest,
  type LessonIdParams,
  type CreateLessonSummaryRequest,
  type UpdateLessonSummaryRequest,
  type AgoraTokenRequest,
  type BoardHighlightRequest,
  type CreateNotebookRequest,
} from '../schemas/lessons.js';

import { readSnapshotIfExists } from '../services/rooms.supabase.js'

const router: ExpressRouter = Router();


/**
 * Set no-cache headers to prevent caching for real-time endpoints
 */
function setNoStore(res: any) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
}

/**
 * Core lesson closing logic - reusable for both manual close and auto-close
 * @param lessonId - The lesson ID to close
 * @param boardSnapshot - Optional board snapshot path
 * @param recordingUrl - Optional recording URL override
 * @returns The closed lesson data
 */
export async function closeLessonInternal(
  lessonId: string, 
  boardSnapshot?: string | null,
  recordingUrl?: string | null
) {
  console.log(`🔒 Closing lesson: ${lessonId}`);

  // Check if lesson exists
  const lesson = await db.lessons.findById(lessonId);
  if (!lesson) {
    throw new Error(`Lesson not found: ${lessonId}`);
  }

  // Check if lesson is already closed
  if (lesson.ended_at) {
    console.log(`⚠️ Lesson ${lessonId} is already closed`);
    return lesson;
  }

  // Stop recording if active
  let finalRecordingUrl = recordingUrl;
  let recordingFileUrl: string | null = null;

  if (
    lesson.recording_sid &&
    lesson.recording_resource_id &&
    agoraRecording.isRecordingConfigured()
  ) {
    try {
      console.log(`⏹️ Stopping recording for lesson: ${lessonId}`);

      // Optional: Query recording status before stopping
      try {
        const status = await agoraRecording.queryRecording(
          lesson.recording_resource_id,
          lesson.recording_sid
        );
        console.log('📊 Recording status before stop:', status);
      } catch (queryError) {
        console.warn('⚠️ Query before stop failed:', queryError);
      }

      // Attempt to stop the recording
      try {
        recordingFileUrl = await agoraRecording.stopRecording(
          lesson.recording_resource_id,
          lesson.recording_sid,
          lesson.agora_channel_name,
          lesson.id
        );

        // Use the recording URL from Agora if no URL was provided
        finalRecordingUrl = finalRecordingUrl || recordingFileUrl;
        console.log(
          `✅ Recording stopped for lesson ${lessonId}. URL: ${finalRecordingUrl}`
        );
      } catch (stopError) {
        console.error(
          '❌ Stop recording failed, querying status again...',
          stopError
        );

        // Try to get final status after failed stop
        try {
          const finalStatus = await agoraRecording.queryRecording(
            lesson.recording_resource_id,
            lesson.recording_sid
          );
          console.log('📊 Recording status after stop error:', finalStatus);
        } catch (finalQueryError) {
          console.warn(
            '⚠️ Final query after stop error also failed:',
            finalQueryError
          );
        }

        console.warn(
          `⚠️ Recording stop failed, but lesson will still be closed. Manual cleanup may be required.`
        );
      }
    } catch (recordingError) {
      console.error(
        `❌ Failed to handle recording stop for lesson ${lessonId}:`,
        recordingError
      );
      // Continue with lesson closure even if recording operations fail
    }
  }

  // Close the lesson - write board_snapshot_path to DB
  const closedLesson = await db.lessons.update(lessonId, {
    ended_at: new Date().toISOString(),
    recording_url: finalRecordingUrl || null,
    recording_sid: null, // Clear recording IDs after stopping
    recording_resource_id: null,
    board_snapshot_path: boardSnapshot || null,
  });

  // Fire-and-forget automatic transcription after lesson is successfully closed
  if (closedLesson.recording_url) {
    transcribeLessonRecording(lessonId).catch(err =>
      console.error('Auto transcription failed', { 
        lessonId, 
        error: err?.message || err 
      })
    );
  }

  console.log(`✅ Lesson ${lessonId} successfully closed`);
  return closedLesson;
}

/**
 * Generates a unique invite code for a lesson
 * Format: subject + random numbers (e.g., "math12345678")
 * @param title - The lesson title to derive subject from
 * @returns Promise<string> - A unique invite code
 */
async function generateUniqueInviteCode(title: string): Promise<string> {
  // Extract subject from title - take first word and make it lowercase
  const firstWord = title.trim().split(' ')[0];
  const subject = (firstWord || '').toLowerCase().replace(/[^a-z]/g, '');
  const baseSubject = subject.slice(0, 8) || 'lesson'; // Limit to 8 chars, fallback to 'lesson'

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate random 8-digit number
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    const inviteCode = `${baseSubject}${randomNumber}`;

    // Check if this code already exists
    try {
      const existingLesson = await db.lessons.findByInviteCode(inviteCode);
      // If no existing lesson found, this invite code is available
      if (!existingLesson || existingLesson === null) {
        return inviteCode;
      }
      // If we reach here, the invite code is taken, continue to next attempt
    } catch (error) {
      // If there's an error checking, continue to next attempt
      console.warn('Error checking invite code uniqueness:', error);
    }

    attempts++;
  }

  // Fallback: use crypto for truly unique code
  const randomBytes = crypto.randomBytes(6).toString('hex');
  return `${baseSubject}${randomBytes}`;
}

// GET /lessons - Get all lessons for current user (teacher or student)
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user!;

    // Parse and validate query parameters
    const status = req.query['status'] as string | undefined;
    const limitParam = req.query['limit'] as string | undefined;
    const offsetParam = req.query['offset'] as string | undefined;

    // Validate status parameter
    if (status && !['upcoming', 'ongoing', 'completed'].includes(status)) {
      res.status(400).json({
        error: 'Invalid status. Must be one of: upcoming, ongoing, completed',
        code: 'INVALID_STATUS',
      });
      return;
    }

    // Parse and validate numeric parameters
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10), 1), 100)
      : 10;
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10), 0) : 0;

    try {
      let lessons;

      const options = {
        status,
        limit,
        offset,
      };

      if (user.role === 'teacher') {
        // For teachers: get lessons they created
        lessons = await db.lessons.findByTeacherId(user.sub, options);
      } else {
        // For students: get lessons they're participating in
        lessons = await db.lessons.findByParticipantId(user.sub, options);
      }

      // Transform lessons to match API response format
      const response = lessons.map((lesson: any) => ({
        id: lesson.id,
        teacherId: lesson.teacher_id,
        title: lesson.title,
        description: lesson.description,
        inviteCode: lesson.invite_code,
        agoraChannelName: lesson.agora_channel_name, // New Agora channel for video calls
        scheduledAt: lesson.scheduled_at,
        startedAt: lesson.started_at,
        endedAt: lesson.ended_at,
        recordingUrl: lesson.recording_url,
        recordingSid: lesson.recording_sid,
        recordingResourceId: lesson.recording_resource_id,
        boardSnapshot: lesson.board_snapshot_path,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
      }));

      res.json({
        lessons: response,
        pagination: {
          limit,
          offset,
          total: response.length,
          hasMore: response.length === limit, // Simple check for more results
        },
      });
    } catch (error) {
      console.error('Get lessons error:', error);
      res.status(500).json({
        error: 'Failed to fetch lessons',
        code: 'LESSONS_FETCH_ERROR',
      });
    }
  })
);

// GET /lessons/:id/status - Get minimal lesson status for polling (teacher or participant)
router.get(
  '/:id/status',
  authenticateToken,
  requireLessonAccess,
  validateRequest({ params: lessonIdSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    setNoStore(res);
    const lesson = await db.lessons.findById(id);
    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found', code: 'LESSON_NOT_FOUND' });
      return;
    }
    res.json({
      lessonId: id,
      startedAt: lesson.started_at,
      endedAt: lesson.ended_at,
      updatedAt: lesson.updated_at,
    });
  })
);

// POST /lessons - Create a new lesson (teacher only)
router.post(
  '/',
  authenticateToken,
  requireTeacher,
  validateRequest({
    body: createLessonSchema,
  }),
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      inviteCode: providedInviteCode,
      scheduledAt,
      startedAt,
      startNow,
    } = req.body as CreateLessonRequest;
    const teacherId = req.user!.sub;

    try {
      // Generate invite code if not provided
      let inviteCode = providedInviteCode;
      if (!inviteCode) {
        inviteCode = await generateUniqueInviteCode(title);
      } else {
        // Check if provided invite code is already taken
        const existingLesson = await db.lessons.findByInviteCode(inviteCode);
        if (existingLesson) {
          res.status(409).json({
            error: 'Invite code already exists',
            code: 'INVITE_CODE_TAKEN',
          });
          return;
        }
      }

      // Determine lesson start time
      let lessonStartedAt: string | null = null;
      if (startedAt) {
        // Use provided startedAt time
        lessonStartedAt = startedAt;
      } else if (startNow) {
        // Start lesson now with current time
        lessonStartedAt = new Date().toISOString();
      }
      // If neither startedAt nor startNow is provided, lesson remains unstarted (null)

      // Generate Agora channel name for this lesson
      const agoraChannelName = agora.generateChannelName(crypto.randomUUID());

      // Create the lesson first with basic data
      const lesson = await db.lessons.create({
        teacher_id: teacherId,
        title,
        description: description || null,
        invite_code: inviteCode,
        agora_channel_name: agoraChannelName, // New Agora channel for video calls
        scheduled_at: scheduledAt || null,
        started_at: lessonStartedAt, // Use calculated start time
        ended_at: null,
        recording_url: null,
        recording_sid: null,
        recording_resource_id: null,
        board_snapshot_path: null,
      });

      // Track lesson for auto-close if nobody joins
      presence.trackLesson(lesson.id);

      // Start recording if lesson is starting now (either startNow or startedAt is provided)
      if (lessonStartedAt && agoraRecording.isRecordingConfigured()) {
        try {
          console.log(
            `🎬 Starting automatic recording for lesson: ${lesson.id}`
          );

          // Acquire recording resource
          const resourceId =
            await agoraRecording.acquireResource(agoraChannelName);

          // Start recording session
          const recordingSid = await agoraRecording.startRecording(
            resourceId,
            agoraChannelName,
            lesson.id
          );

          // Update lesson with recording IDs
          await db.lessons.update(lesson.id, {
            recording_resource_id: resourceId,
            recording_sid: recordingSid,
          });

          console.log(
            `✅ Recording started for lesson ${lesson.id} with SID: ${recordingSid}`
          );
        } catch (recordingError) {
          console.error(
            `❌ Failed to start recording for lesson ${lesson.id}:`,
            recordingError
          );
          // Don't fail lesson creation if recording fails - continue without recording
        }
      } else if (lessonStartedAt && !agoraRecording.isRecordingConfigured()) {
        console.warn(
          `⚠️ Lesson ${lesson.id} is starting but recording is not configured`
        );
      }

      // Initialize empty board for the new lesson
      try {
        await tldraw.initializeEmptyBoard(lesson.id);
        console.log(`🎨 Initialized empty whiteboard for lesson: ${lesson.id}`);
      } catch (boardError) {
        console.warn(
          `⚠️ Failed to initialize board for lesson ${lesson.id}:`,
          boardError
        );
        // Don't fail lesson creation if board initialization fails
      }

      // Return the created lesson - map board_snapshot_path to boardSnapshot and include recording fields
      const response = {
        id: lesson.id,
        teacherId: lesson.teacher_id,
        title: lesson.title,
        description: lesson.description,
        inviteCode: lesson.invite_code,
        agoraChannelName: lesson.agora_channel_name,
        scheduledAt: lesson.scheduled_at,
        startedAt: lesson.started_at,
        endedAt: lesson.ended_at,
        recordingUrl: lesson.recording_url,
        recordingSid: lesson.recording_sid,
        recordingResourceId: lesson.recording_resource_id,
        boardSnapshot: lesson.board_snapshot_path,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create lesson error:', error);
      res.status(500).json({
        error: 'Failed to create lesson',
        code: 'LESSON_CREATE_ERROR',
      });
    }
  })
);

// PATCH /lessons/:id - Update a lesson (teacher only)
router.patch(
  '/:id',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
    body: updateLessonSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { title, description, scheduledAt } = req.body as UpdateLessonRequest;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only update your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson is already ended
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot update an ended lesson',
          code: 'LESSON_ALREADY_ENDED',
        });
        return;
      }

      // Update the lesson
      const updatedLesson = await db.lessons.update(id, {
        title: title || lesson.title,
        description:
          description !== undefined ? description : lesson.description,
        scheduled_at:
          scheduledAt !== undefined ? scheduledAt : lesson.scheduled_at,
      });

      // Return the updated lesson - map board_snapshot_path to boardSnapshot and include recording fields
      const response = {
        id: updatedLesson.id,
        teacherId: updatedLesson.teacher_id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        inviteCode: updatedLesson.invite_code,
        agoraChannelName: updatedLesson.agora_channel_name,
        scheduledAt: updatedLesson.scheduled_at,
        startedAt: updatedLesson.started_at,
        endedAt: updatedLesson.ended_at,
        recordingUrl: updatedLesson.recording_url,
        recordingSid: updatedLesson.recording_sid,
        recordingResourceId: updatedLesson.recording_resource_id,
        boardSnapshot: updatedLesson.board_snapshot_path,
        createdAt: updatedLesson.created_at,
        updatedAt: updatedLesson.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Update lesson error:', error);
      res.status(500).json({
        error: 'Failed to update lesson',
        code: 'LESSON_UPDATE_ERROR',
      });
    }
  })
);

// POST /lessons/:id/start - Start a lesson manually with recording (teacher only)
router.post(
  '/:id/start',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only start your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson is already started
      if (lesson.started_at) {
        res.status(400).json({
          error: 'Lesson is already started',
          code: 'LESSON_ALREADY_STARTED',
        });
        return;
      }

      // Check if lesson is already ended
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot start an ended lesson',
          code: 'LESSON_ALREADY_ENDED',
        });
        return;
      }

      const startedAt = new Date().toISOString();

      // Start the lesson
      let updatedLesson = await db.lessons.update(id, {
        started_at: startedAt,
      });

      // Start recording if configured
      if (agoraRecording.isRecordingConfigured()) {
        try {
          console.log(
            `🎬 Starting recording for manually started lesson: ${id}`
          );

          // Acquire recording resource
          const resourceId = await agoraRecording.acquireResource(
            lesson.agora_channel_name
          );

          // Start recording session
          const recordingSid = await agoraRecording.startRecording(
            resourceId,
            lesson.agora_channel_name,
            lesson.id
          );

          // Update lesson with recording IDs
          updatedLesson = await db.lessons.update(id, {
            recording_resource_id: resourceId,
            recording_sid: recordingSid,
          });

          console.log(
            `✅ Recording started for lesson ${id} with SID: ${recordingSid}`
          );
        } catch (recordingError) {
          console.error(
            `❌ Failed to start recording for lesson ${id}:`,
            recordingError
          );
          // Don't fail lesson start if recording fails
        }
      } else {
        console.warn(`⚠️ Lesson ${id} started but recording is not configured`);
      }

      // Return the updated lesson
      const response = {
        id: updatedLesson.id,
        teacherId: updatedLesson.teacher_id,
        title: updatedLesson.title,
        description: updatedLesson.description,
        inviteCode: updatedLesson.invite_code,
        agoraChannelName: updatedLesson.agora_channel_name,
        scheduledAt: updatedLesson.scheduled_at,
        startedAt: updatedLesson.started_at,
        endedAt: updatedLesson.ended_at,
        recordingUrl: updatedLesson.recording_url,
        recordingSid: updatedLesson.recording_sid,
        recordingResourceId: updatedLesson.recording_resource_id,
        boardSnapshot: updatedLesson.board_snapshot_path,
        createdAt: updatedLesson.created_at,
        updatedAt: updatedLesson.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Start lesson error:', error);
      res.status(500).json({
        error: 'Failed to start lesson',
        code: 'LESSON_START_ERROR',
      });
    }
  })
);

// POST /lessons/:id/close - Close a lesson with recording and notes (teacher only)
router.post(
  '/:id/close',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
    body: closeLessonSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { recordingUrl, boardSnapshot } = req.body as CloseLessonRequest;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only close your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson is already closed
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Lesson is already closed',
          code: 'LESSON_ALREADY_CLOSED',
        });
        return;
      }

      // Use the shared lesson closing logic
      const closedLesson = await closeLessonInternal(id, boardSnapshot, recordingUrl);

      // Return the closed lesson - map board_snapshot_path to boardSnapshot and include recording fields
      const response = {
        id: closedLesson.id,
        teacherId: closedLesson.teacher_id,
        title: closedLesson.title,
        description: closedLesson.description,
        inviteCode: closedLesson.invite_code,
        agoraChannelName: closedLesson.agora_channel_name,
        scheduledAt: closedLesson.scheduled_at,
        startedAt: closedLesson.started_at,
        endedAt: closedLesson.ended_at,
        recordingUrl: closedLesson.recording_url,
        recordingSid: closedLesson.recording_sid,
        recordingResourceId: closedLesson.recording_resource_id,
        boardSnapshot: closedLesson.board_snapshot_path,
        createdAt: closedLesson.created_at,
        updatedAt: closedLesson.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Close lesson error:', error);
      res.status(500).json({
        error: 'Failed to close lesson',
        code: 'LESSON_CLOSE_ERROR',
      });
    }
  })
);

// POST /lessons/:id/transcribe - Manually trigger transcription for a lesson (teacher only)
router.post(
  '/:id/transcribe',
  authenticateToken,
  requireTeacher,
  requireLessonAccess,
  validateRequest({ params: lessonIdSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const force = !!req.body?.force;

    console.log(
      `🎤 Manual transcription requested for lesson: ${id}, force: ${force}`
    );

    try {
      const result = await transcribeLessonRecording(id, { force });
      
      console.log(
        `✅ Transcription completed for lesson ${id}: noteId=${result.noteId}, created=${result.created}`
      );

      res.status(200).json({
        lessonId: id,
        noteId: result.noteId,
        created: result.created,
        message: result.created
          ? 'Transcription completed successfully'
          : 'Transcript already exists',
      });
    } catch (error: any) {
      console.error('Manual transcription error:', {
        lessonId: id,
        error: error?.message || error,
      });

      // Handle specific error cases
      if (error?.message?.includes('not found')) {
        res.status(404).json({
          error: 'LESSON_NOT_FOUND',
          message: 'Lesson not found',
        });
        return;
      }

      if (error?.message?.includes('No recording_url')) {
        res.status(400).json({
          error: 'NO_RECORDING_URL',
          message: 'No recording URL found for this lesson',
        });
        return;
      }

      // Generic error response
      res.status(502).json({
        error: 'TRANSCRIPTION_FAILED',
        message: error?.message ?? 'Failed to transcribe lesson recording',
      });
    }
  })
);

// POST /lessons/:id/notebook - Generate study notebook from transcript + images (teacher only)
router.post(
  '/:id/notebook',
  authenticateToken,
  requireTeacher,
  requireLessonAccess,
  validateRequest({ params: lessonIdSchema, body: createNotebookSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { 
      transcript, 
      images, 
      topic, 
      studentLevel, 
      difficulty, 
      language, 
      style 
    } = req.body as CreateNotebookRequest;

    console.log(
      `📚 Notebook generation requested for lesson: ${id}, topic: ${topic || 'N/A'}`
    );

    try {
      // Verify lesson exists and teacher owns it
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({ 
          error: 'Lesson not found', 
          code: 'LESSON_NOT_FOUND' 
        });
        return;
      }

      // Start notebook generation in background (fire-and-forget)
      generateNotebookInBackground(id, {
        transcript,
        images,
        topic,
        studentLevel,
        difficulty,
        language,
        style,
      }).catch(err => 
        console.error('Background notebook generation failed', { 
          lessonId: id, 
          error: err?.message || err 
        })
      );

      // Return immediately with accepted status
      res.status(202).json({
        message: 'Notebook generation started',
        lessonId: id,
        status: 'processing',
        estimatedCompletionTime: '30-60 seconds',
        checkEndpoint: `/api/lessons/${id}/summary`
      });
    } catch (error: any) {
      console.error('Notebook generation request failed:', {
        lessonId: id,
        error: error?.message || error,
      });

      res.status(500).json({
        error: 'NOTEBOOK_REQUEST_FAILED',
        message: 'Failed to start notebook generation',
      });
    }
  })
);

// POST /lessons/:id/notebook/sync - Synchronous notebook generation (blocking)
router.post(
  '/:id/notebook/sync',
  authenticateToken,
  requireTeacher,
  requireLessonAccess,
  validateRequest({ params: lessonIdSchema, body: createNotebookSchema }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { 
      transcript, 
      images, 
      topic, 
      studentLevel, 
      difficulty, 
      language, 
      style 
    } = req.body as CreateNotebookRequest;

    console.log(
      `📚 Synchronous notebook generation requested for lesson: ${id}, topic: ${topic || 'N/A'}`
    );

    try {
      // Verify lesson exists and teacher owns it
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({ 
          error: 'Lesson not found', 
          code: 'LESSON_NOT_FOUND' 
        });
        return;
      }

      // Generate the notebook markdown using OpenAI (blocking)
      const markdown = await buildNotebookMarkdown({
        transcript,
        images,
        topic,
        studentLevel,
        difficulty,
        language,
        style,
      });

      console.log(
        `✅ Notebook generated for lesson ${id}, ${markdown.length} characters`
      );

      // Save as summary note (replaces existing if present)
      const note = await db.notes.upsertTranscriptOrSummary({
        lesson_id: id,
        note_type: 'summary',
        content: markdown,
        image_path: null,
        added_to_summary: true,
      });

      console.log(
        `💾 Notebook saved to database with note ID: ${note.id}`
      );

      // Return success response
      res.status(201).json({
        noteId: note.id,
        lessonId: id,
        noteType: 'summary',
        language,
        length: markdown.length,
        createdAt: note.created_at,
      });
    } catch (error: any) {
      console.error('Notebook generation failed:', {
        lessonId: id,
        error: error?.message || error,
      });

      // Handle specific error cases
      if (error?.message?.includes('not found')) {
        res.status(404).json({
          error: 'LESSON_NOT_FOUND',
          message: 'Lesson not found',
        });
        return;
      }

      // Handle OpenAI-specific errors
      if (error?.status === 429) {
        res.status(502).json({
          error: 'NOTEBOOK_GENERATION_FAILED',
          message: 'OpenAI rate limit exceeded. Please try again later.',
        });
        return;
      }

      if (error?.status >= 400 && error?.status < 500) {
        res.status(502).json({
          error: 'NOTEBOOK_GENERATION_FAILED',
          message: 'OpenAI request failed. Please check your input.',
        });
        return;
      }

      // Generic error response - never leak transcript in logs
      res.status(502).json({
        error: 'NOTEBOOK_GENERATION_FAILED',
        message: error?.message ?? 'Failed to generate notebook',
      });
    }
  })
);

// POST /lessons/join - Join a lesson by invite code (student only)
router.post(
  '/join',
  authenticateToken,
  requireStudent,
  validateRequest({
    body: joinLessonSchema,
  }),
  asyncHandler(async (req, res) => {
    const { inviteCode } = req.body as JoinLessonRequest;
    const userId = req.user!.sub;
    const userRole = req.user!.role;

    console.log(
      `🎯 Student attempting to join lesson with invite code: ${inviteCode}`
    );
    console.log(
      `👤 User: ${userId}, Role: ${userRole}, Email: ${req.user!.email}`
    );

    try {
      // Check if lesson exists by invite code
      console.log(`🔍 Searching for lesson with invite code: ${inviteCode}`);
      const lesson = await db.lessons.findByInviteCode(inviteCode);

      if (!lesson) {
        console.log(`❌ Lesson not found with invite code: ${inviteCode}`);
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      console.log(
        `✅ Lesson found: ${lesson.title}, Teacher: ${lesson.teacher_id}`
      );

      // Check if lesson is already ended
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot join an ended lesson',
          code: 'LESSON_ALREADY_ENDED',
        });
        return;
      }

      // Add/update participant - ensure it's always 'student' for this endpoint
      const participant = await db.participants.upsert({
        lesson_id: lesson.id,
        user_id: userId,
        role_in_lesson: userRole === 'teacher' ? 'teacher' : 'student',
      });

      // Hook: participant joined - cancel any idle timers
      await presence.onJoin(lesson.id);

      // Return success response
      const response = {
        lessonId: participant.lesson_id,
        userId: participant.user_id,
        joinedAt: participant.joined_at,
        roleInLesson: participant.role_in_lesson,
        message: 'Successfully joined the lesson',
      };

      res.json(response);
    } catch (error) {
      console.error('Join lesson error:', error);
      res.status(500).json({
        error: 'Failed to join lesson',
        code: 'LESSON_JOIN_ERROR',
      });
    }
  })
);

// POST /lessons/:id/leave - Leave a lesson (participant)
router.post(
  '/:id/leave',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const userId = req.user!.sub;

    try {
      console.log(`👋 User ${userId} attempting to leave lesson: ${id}`);

      // Check if lesson exists
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      // Check if user is a participant
      const isParticipant = await db.participants.isParticipant(id, userId);
      if (!isParticipant) {
        res.status(403).json({
          error: 'You are not a participant in this lesson',
          code: 'NOT_PARTICIPANT',
        });
        return;
      }

      // Update participant's left_at timestamp
      const updatedParticipant = await db.participants.updateParticipant(
        id,
        userId,
        { left_at: new Date().toISOString() }
      );

      console.log(`✅ User ${userId} left lesson ${id}`);

      // Hook: participant left - check if lesson should auto-close
      await presence.onLeave(id);

      // Return success response
      const response = {
        lessonId: updatedParticipant.lesson_id,
        userId: updatedParticipant.user_id,
        leftAt: updatedParticipant.left_at,
        message: 'Successfully left the lesson',
      };

      res.json(response);
    } catch (error) {
      console.error('Leave lesson error:', error);
      res.status(500).json({
        error: 'Failed to leave lesson',
        code: 'LESSON_LEAVE_ERROR',
      });
    }
  })
);

// GET /lessons/:id - Get lesson details with participants and notes (teacher or participant)
router.get(
  '/:id',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;

    try {
      // Fetch lesson with participants and notes
      const lessonWithData = await db.lessons.findWithParticipantsAndNotes(id);

      if (!lessonWithData) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      // Return lesson data - map board_snapshot_path to boardSnapshot and include recording fields
      const response = {
        id: lessonWithData.id,
        teacherId: lessonWithData.teacher_id,
        title: lessonWithData.title,
        description: lessonWithData.description,
        inviteCode: lessonWithData.invite_code,
        agoraChannelName: lessonWithData.agora_channel_name,
        scheduledAt: lessonWithData.scheduled_at,
        startedAt: lessonWithData.started_at,
        endedAt: lessonWithData.ended_at,
        recordingUrl: lessonWithData.recording_url,
        recordingSid: lessonWithData.recording_sid,
        recordingResourceId: lessonWithData.recording_resource_id,
        boardSnapshot: lessonWithData.board_snapshot_path,
        createdAt: lessonWithData.created_at,
        updatedAt: lessonWithData.updated_at,
        participants: (lessonWithData.participants || []).map((p: any) => ({
          lessonId: p.lesson_id,
          userId: p.user_id,
          joinedAt: p.joined_at,
          leftAt: p.left_at,
          roleInLesson: p.role_in_lesson,
        })),
        notes: (lessonWithData.notes || []).map((note: any) => ({
          id: note.id,
          lessonId: note.lesson_id,
          noteType: note.note_type,
          content: note.content,
          imagePath: note.image_path,
          addedToSummary: note.added_to_summary,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        })),
      };

      res.json(response);
    } catch (error) {
      console.error('Get lesson error:', error);
      res.status(500).json({
        error: 'Failed to fetch lesson',
        code: 'LESSON_FETCH_ERROR',
      });
    }
  })
);

// GET /lessons/:id/summary - Get lesson summary with notes (teacher or participant)
router.get(
  '/:id/summary',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;

    try {
      // Fetch lesson
      const lesson = await db.lessons.findById(id);

      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      // Check if lesson has ended
      if (!lesson.ended_at) {
        res.status(400).json({
          error: 'Lesson summary is only available after the lesson has ended',
          code: 'LESSON_NOT_ENDED',
        });
        return;
      }

      // Fetch lesson notes
      const transcript = await db.notes.findByLessonIdAndType(id, 'transcript');
      const summary = await db.notes.findByLessonIdAndType(id, 'summary');
      const boardHighlights = await db.notes.findHighlights(id);

      // Return lesson summary
      const response = {
        lessonId: lesson.id,
        transcript: transcript
          ? {
              id: transcript.id,
              lessonId: transcript.lesson_id,
              noteType: transcript.note_type,
              content: transcript.content,
              imagePath: transcript.image_path,
              addedToSummary: transcript.added_to_summary,
              createdAt: transcript.created_at,
              updatedAt: transcript.updated_at,
            }
          : null,
        summary: summary
          ? {
              id: summary.id,
              lessonId: summary.lesson_id,
              noteType: summary.note_type,
              content: summary.content,
              imagePath: summary.image_path,
              addedToSummary: summary.added_to_summary,
              createdAt: summary.created_at,
              updatedAt: summary.updated_at,
            }
          : null,
        boardHighlights: boardHighlights.map((highlight: any) => ({
          id: highlight.id,
          lessonId: highlight.lesson_id,
          noteType: highlight.note_type,
          content: highlight.content,
          imagePath: highlight.image_path,
          addedToSummary: highlight.added_to_summary,
          createdAt: highlight.created_at,
          updatedAt: highlight.updated_at,
        })),
        createdAt: lesson.created_at,
        endedAt: lesson.ended_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Get lesson summary error:', error);
      res.status(500).json({
        error: 'Failed to fetch lesson summary',
        code: 'LESSON_SUMMARY_ERROR',
      });
    }
  })
);

// POST /lessons/:id/summary - Create lesson summary with images (teacher only)
router.post(
  '/:id/summary',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
    body: createLessonSummarySchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { summaryContent, images } = req.body as CreateLessonSummaryRequest;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only create summaries for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson has ended (can't create summary for ongoing lessons)
      if (!lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot create summary for a lesson that has not ended',
          code: 'LESSON_NOT_ENDED',
        });
        return;
      }

      // Check if summary already exists
      const existingSummary = await db.notes.findByLessonIdAndType(
        id,
        'summary'
      );
      if (existingSummary) {
        res.status(409).json({
          error:
            'Summary already exists for this lesson. Use PUT to update it.',
          code: 'SUMMARY_ALREADY_EXISTS',
        });
        return;
      }

      // Process images and prepare summary content
      let processedSummaryContent = summaryContent;
      if (images && images.length > 0) {
        // 1. Upload images ------------------------------------------
        const uploaded = [];
        for (const { fileName, dataUrl } of images) {
          // Extract base64 data from data URL
          const base64Data = dataUrl.split(',')[1];
          if (!base64Data) {
            throw new Error(`Invalid data URL format for image: ${fileName}`);
          }
          const buf = Buffer.from(base64Data, 'base64');
          const path = `${id}/${crypto.randomUUID()}-${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('lesson-images')
            .upload(path, buf, { upsert: true });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Failed to upload image: ${fileName}`);
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('lesson-images').getPublicUrl(path);

          uploaded.push({ placeholder: fileName, url: publicUrl });
        }

        // 2. Replace placeholders in markdown --------------------------------
        processedSummaryContent = summaryContent;
        uploaded.forEach(({ placeholder, url }) => {
          // Replace placeholder pattern {{fileName}} with actual URL
          processedSummaryContent = processedSummaryContent!.replaceAll(
            `{{${placeholder}}}`,
            url
          );
        });
      }

      // 3. Create summary note ---------------------------------------------
      const createdSummaryNote = await db.notes.create({
        lesson_id: id,
        note_type: 'summary',
        content: processedSummaryContent,
        image_path: null,
        added_to_summary: false,
      });

      // Return the created summary note
      const response = {
        id: createdSummaryNote.id,
        lessonId: createdSummaryNote.lesson_id,
        noteType: createdSummaryNote.note_type,
        content: createdSummaryNote.content,
        imagePath: createdSummaryNote.image_path,
        addedToSummary: createdSummaryNote.added_to_summary,
        createdAt: createdSummaryNote.created_at,
        updatedAt: createdSummaryNote.updated_at,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create lesson summary error:', error);
      res.status(500).json({
        error: 'Failed to create lesson summary',
        code: 'LESSON_SUMMARY_CREATE_ERROR',
      });
    }
  })
);

// PUT /lessons/:id/summary - Update lesson summary with images (teacher only)
router.put(
  '/:id/summary',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
    body: updateLessonSummarySchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { summaryContent, images } = req.body as UpdateLessonSummaryRequest;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only update summaries for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson has ended (can't edit summary of ongoing lessons)
      if (!lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot update summary for a lesson that has not ended',
          code: 'LESSON_NOT_ENDED',
        });
        return;
      }

      // Process images and prepare summary content
      let processedSummaryContent = summaryContent;
      if (images && images.length > 0) {
        // 1. Upload images ------------------------------------------
        const uploaded = [];
        for (const { fileName, dataUrl } of images) {
          // Extract base64 data from data URL
          const base64Data = dataUrl.split(',')[1];
          if (!base64Data) {
            throw new Error(`Invalid data URL format for image: ${fileName}`);
          }
          const buf = Buffer.from(base64Data, 'base64');
          const path = `${id}/${crypto.randomUUID()}-${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('lesson-images')
            .upload(path, buf, { upsert: true });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            throw new Error(`Failed to upload image: ${fileName}`);
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('lesson-images').getPublicUrl(path);

          uploaded.push({ placeholder: fileName, url: publicUrl });
        }

        // 2. Replace placeholders in markdown --------------------------------
        processedSummaryContent = summaryContent;
        uploaded.forEach(({ placeholder, url }) => {
          // Replace placeholder pattern {{fileName}} with actual URL
          processedSummaryContent = processedSummaryContent!.replaceAll(
            `{{${placeholder}}}`,
            url
          );
        });
      }

      // 3. Update summary note ---------------------------------------------
      const updatedSummaryNote = await db.notes.upsertTranscriptOrSummary({
        lesson_id: id,
        note_type: 'summary',
        content: processedSummaryContent,
        image_path: null,
        added_to_summary: false,
      });

      // Return the updated summary note
      const response = {
        id: updatedSummaryNote.id,
        lessonId: updatedSummaryNote.lesson_id,
        noteType: updatedSummaryNote.note_type,
        content: updatedSummaryNote.content,
        imagePath: updatedSummaryNote.image_path,
        addedToSummary: updatedSummaryNote.added_to_summary,
        createdAt: updatedSummaryNote.created_at,
        updatedAt: updatedSummaryNote.updated_at,
      };

      res.json(response);
    } catch (error) {
      console.error('Update lesson summary error:', error);
      res.status(500).json({
        error: 'Failed to update lesson summary',
        code: 'LESSON_SUMMARY_UPDATE_ERROR',
      });
    }
  })
);

/**
 * POST /lessons/:id/summary/image
 * Upload a single image for lesson summary and return its public URL.
 * Body: { fileName: string, dataUrl: string }
 * Returns: { url: string, fileName: string, uploadedAt: string }
 */
router.post(
  '/:id/summary/image',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
    body: z.object({
      fileName: z.string().min(1, 'File name is required'),
      dataUrl: z.string().min(1, 'Data URL is required'),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { fileName, dataUrl } = req.body;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }
      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only upload images for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Extract base64 data from data URL
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        res.status(400).json({
          error: 'Invalid data URL format',
          code: 'INVALID_DATA_URL',
        });
        return;
      }
      const buf = Buffer.from(base64Data, 'base64');
      const path = `${id}/summary/${crypto.randomUUID()}-${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(path, buf, { upsert: true });

      if (uploadError) {
        console.error('Summary image upload error:', uploadError);
        res.status(500).json({
          error: 'Failed to upload summary image',
          code: 'SUMMARY_IMAGE_UPLOAD_ERROR',
        });
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('lesson-images').getPublicUrl(path);

      res.status(201).json({
        url: publicUrl,
        fileName,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Summary image upload endpoint error:', error);
      res.status(500).json({
        error: 'Failed to upload summary image',
        code: 'SUMMARY_IMAGE_UPLOAD_ERROR',
      });
    }
  })
);


// POST /lessons/agora/token - Generate Agora RTC token for joining a lesson video call
router.post(
  '/agora/token',
  authenticateToken,
  validateRequest({
    body: agoraTokenRequestSchema,
  }),
  asyncHandler(async (req, res) => {
    const { lessonId } = req.body as AgoraTokenRequest;
    const userId = req.user!.sub;

    try {
      // Fetch lesson from database
      const lesson = await db.lessons.findById(lessonId);

      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      // Block token generation for ended lessons
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot join an ended lesson',
          code: 'LESSON_ALREADY_ENDED',
        });
        return;
      }

      // Check if user is teacher or participant
      let isParticipant = false;

      // Check if user is the teacher
      if (lesson.teacher_id === userId) {
        isParticipant = true;
      } else {
        // Check if user is a participant
        try {
          const isUserParticipant = await db.participants.isParticipant(
            lessonId,
            userId
          );
          if (isUserParticipant) {
            isParticipant = true;
          }
        } catch (error) {
          // Participant not found, continue with access denied
        }
      }

      if (!isParticipant) {
        res.status(403).json({
          error: 'Access denied. You are not a participant in this lesson.',
          code: 'ACCESS_DENIED',
        });
        return;
      }

      // Use the lesson's Agora channel name for video calls
      const channelName = lesson.agora_channel_name;

      // Generate Agora token (uid=0 for auto-assigned user ID)
      const token = agora.generateToken(channelName, 0, 3600); // 1 hour expiration

      // Return Agora connection details
      const response: agora.AgoraTokenResponse = {
        appId: env.AGORA_APP_ID,
        channelName,
        token,
        uid: 0,
      };

      res.json(response);
    } catch (error) {
      console.error('Agora token generation error:', error);
      res.status(500).json({
        error: 'Failed to generate Agora token',
        code: 'AGORA_TOKEN_ERROR',
      });
    }
  })
);

// Zod schema for asset upload (using base64 data like other endpoints)
const boardAssetUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  dataUrl: z.string().min(1, 'Data URL is required'), // "data:image/png;base64,..."
});

// GET /lessons/:id/board - Get current board snapshot
router.get(
  '/:id/board',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;

    try {
      console.log(`📋 Getting board snapshot for lesson: ${id}`);

      // Get the current board snapshot
      // const snapshot = await tldraw.getBoardSnapshot(id);
      const snapshot = await readSnapshotIfExists(id);
      if (!snapshot) {
        // Return empty board if no snapshot exists
        // Create a temporary room to get empty snapshot
        const tempRoom = new TLSocketRoom({});
        const emptySnapshot = tempRoom.getCurrentSnapshot();

        res.json({
          snapshot: emptySnapshot,
          isEmpty: true,
        });
        return;
      }

      res.json({
        snapshot,
        isEmpty: false,
      });
    } catch (error) {
      console.error('Get board snapshot error:', error);
      res.status(500).json({
        error: 'Failed to get board snapshot',
        code: 'BOARD_SNAPSHOT_ERROR',
      });
    }
  })
);

// POST /lessons/:id/board/snapshot - Manually save board snapshot
router.post(
  '/:id/board/snapshot',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { snapshot } = req.body;
    const teacherId = req.user!.sub;

    try {
      console.log(`💾 Manually saving board snapshot for lesson: ${id}`);

      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only save board snapshots for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      if (!snapshot) {
        res.status(400).json({
          error: 'Snapshot data is required',
          code: 'MISSING_SNAPSHOT',
        });
        return;
      }

      // Save the snapshot
      await tldraw.saveBoardSnapshot(id, snapshot);

      res.json({
        message: 'Board snapshot saved successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Save board snapshot error:', error);
      res.status(500).json({
        error: 'Failed to save board snapshot',
        code: 'BOARD_SNAPSHOT_SAVE_ERROR',
      });
    }
  })
);

// POST /lessons/:id/board/assets - Upload assets for board
router.post(
  '/:id/board/assets',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
    body: boardAssetUploadSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { fileName, dataUrl } = req.body;

    try {
      console.log(`📁 Uploading board asset for lesson: ${id}`);

      // Check lesson exists
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      // Extract base64 data and determine MIME type from data URL
      const base64Parts = dataUrl.split(',');
      if (base64Parts.length !== 2 || !base64Parts[1]) {
        res.status(400).json({
          error: 'Invalid data URL format',
          code: 'INVALID_DATA_URL',
        });
        return;
      }
      const base64Data = base64Parts[1];

      // Extract MIME type from data URL (e.g., "data:image/png;base64,...")
      const mimeTypeMatch = dataUrl.match(/data:([^;]+);base64,/);
      const mimeType: string =
        mimeTypeMatch && mimeTypeMatch[1]
          ? mimeTypeMatch[1]
          : 'application/octet-stream';

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload the asset
      const assetUrl = await tldraw.handleAssetUpload(
        id,
        buffer,
        fileName,
        mimeType
      );

      res.json({
        url: assetUrl,
        filename: fileName,
        size: buffer.length,
        mimeType: mimeType,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Board asset upload error:', error);
      res.status(500).json({
        error: 'Failed to upload board asset',
        code: 'BOARD_ASSET_UPLOAD_ERROR',
      });
    }
  })
);

// POST /lessons/:id/board/highlight - Upload board screenshot/highlight (teacher only)
router.post(
  '/:id/board/highlight',
  authenticateToken,
  requireTeacher,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
    body: boardHighlightSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const { dataUrl, description } = req.body as BoardHighlightRequest;
    const teacherId = req.user!.sub;

    try {
      console.log(`📸 Uploading board highlight for lesson: ${id}`);

      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }

      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only upload highlights for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if lesson has ended (can't upload highlights for ended lessons)
      if (lesson.ended_at) {
        res.status(400).json({
          error: 'Cannot upload highlights for a lesson that has ended',
          code: 'LESSON_ENDED',
        });
        return;
      }

      // Extract base64 data from data URL
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        res.status(400).json({
          error: 'Invalid data URL format',
          code: 'INVALID_DATA_URL',
        });
        return;
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename with timestamp and UUID
      const filename = `${crypto.randomUUID()}-${Date.now()}.png`;
      const path = `${id}/highlights/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(path, buffer, {
          contentType: 'image/png',
          upsert: false, // Don't overwrite existing files
        });

      if (uploadError) {
        console.error('Board highlight upload error:', uploadError);
        res.status(500).json({
          error: 'Failed to upload board highlight',
          code: 'BOARD_HIGHLIGHT_UPLOAD_ERROR',
        });
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('lesson-images').getPublicUrl(path);

      // Create lesson note entry immediately with user description (or placeholder)
      // This ensures fast response time - AI captioning happens in background
      const initialContent = description || 'Board highlight from lesson';
      const note = await db.notes.create({
        lesson_id: id,
        note_type: 'board_highlight',
        content: initialContent,
        image_path: publicUrl,
        added_to_summary: true, // Default to true as specified
      });

      // Start AI caption generation in background (fire-and-forget)
      console.log(`🔄 Starting background AI caption generation for note: ${note.id}`);
      generateCaptionInBackground(note.id, publicUrl, description).catch(error => {
        console.error('Background caption generation failed:', error);
        // Error is logged but doesn't affect the response
      });

      // Return the note details immediately for client to use
      res.status(201).json({
        id: note.id,
        url: publicUrl,
        description: note.content, // Initially user description or placeholder
        createdAt: note.created_at,
      });
    } catch (error) {
      console.error('Board highlight endpoint error:', error);
      res.status(500).json({
        error: 'Failed to process board highlight upload',
        code: 'BOARD_HIGHLIGHT_ERROR',
      });
    }
  })
);

/**
 * GET /lessons/:id/board/highlights
 * Get all board highlights for a lesson (teacher only)
 */
router.get(
  '/:id/board/highlights',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }
      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only view highlights for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Get all board_highlight notes for this lesson
      const highlights = await db.notes.findHighlights(id);

      // Sort highlights so newest are first and map to public URL list
      const response = highlights
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((highlight: any) => ({
          id: highlight.id,
          lessonId: highlight.lesson_id,
          description: highlight.content,
          url: highlight.image_path,
          createdAt: highlight.created_at,
          updatedAt: highlight.updated_at,
        }));

      res.json({ highlights: response });
    } catch (error) {
      console.error('Get board highlights error:', error);
      res.status(500).json({
        error: 'Failed to fetch board highlights',
        code: 'BOARD_HIGHLIGHTS_FETCH_ERROR',
      });
    }
  })
);

/**
 * DELETE /lessons/:id/board/highlights/:highlightId
 * Delete a board highlight from a lesson (teacher only)
 */
router.delete(
  '/:id/board/highlights/:highlightId',
  authenticateToken,
  requireTeacher,
  validateRequest({
    params: z.object({
      id: lessonIdSchema.shape.id,
      highlightId: z.string().min(1, 'Highlight ID is required'),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { id, highlightId } = req.params as { id: string; highlightId: string };
    const teacherId = req.user!.sub;

    try {
      // Check if lesson exists and belongs to the teacher
      const lesson = await db.lessons.findById(id);
      if (!lesson) {
        res.status(404).json({
          error: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        });
        return;
      }
      if (lesson.teacher_id !== teacherId) {
        res.status(403).json({
          error: 'You can only delete highlights for your own lessons',
          code: 'NOT_LESSON_OWNER',
        });
        return;
      }

      // Check if highlight exists and belongs to this lesson
      const highlight = await db.notes.findById(highlightId);
      if (!highlight || highlight.lesson_id !== id || highlight.note_type !== 'board_highlight') {
        res.status(404).json({
          error: 'Highlight not found',
          code: 'HIGHLIGHT_NOT_FOUND',
        });
        return;
      }

      // Optionally: delete image from storage if needed (not required for DB-only delete)
      // Remove highlight note from DB
      await db.notes.delete(highlightId);

      res.json({ ok: true });
    } catch (error) {
      console.error('Delete board highlight error:', error);
      res.status(500).json({
        error: 'Failed to delete board highlight',
        code: 'BOARD_HIGHLIGHT_DELETE_ERROR',
      });
    }
  })
);

// GET /lessons/:id/participants - Get participant roster with names for Agora calls
router.get(
  '/:id/participants',
  authenticateToken,
  requireLessonAccess,
  validateRequest({
    params: lessonIdSchema,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params as LessonIdParams;

    try {
      // prevent client/proxy caching
      setNoStore(res);
      // Get participants with their profile information
      const participants = await db.participants.listWithProfiles(id);
      console.log('participants', participants);
      res.json(participants);
    } catch (error) {
      console.error('Get lesson participants error:', error);
      res.status(500).json({
        error: 'Failed to fetch lesson participants',
        code: 'LESSON_PARTICIPANTS_ERROR',
      });
    }
  })
);

export default router;
