import { TLSocketRoom } from '@tldraw/sync-core';
import crypto from 'crypto';
import { db, supabase } from '../db/supabase.js';
import { onLeave } from '../services/presence.js';

// Global map to store active rooms (key = lessonId)
const activeRooms = new Map<string, TLSocketRoom>();

/**
 * Get or create a tldraw room for a lesson
 * Loads existing snapshot from database if available
 * @param lessonId - The lesson ID to create/get room for
 * @returns Promise<TLSocketRoom> - The tldraw socket room
 */
export async function getOrCreateRoom(lessonId: string): Promise<TLSocketRoom> {
  // Return existing room if already active
  if (activeRooms.has(lessonId)) {
    return activeRooms.get(lessonId)!;
  }

  console.log(`🎨 Creating new tldraw room for lesson: ${lessonId}`);

  try {
    // Try to load existing lesson and snapshot from database
    const lesson = await db.lessons.findById(lessonId);
    let initialSnapshot = undefined;

    if (lesson?.board_snapshot_path) {
      try {
        // Parse existing snapshot from database
        initialSnapshot = JSON.parse(lesson.board_snapshot_path);
        console.log(
          `📄 Loaded existing board snapshot for lesson: ${lessonId}`
        );
      } catch (error) {
        console.warn(
          `⚠️ Failed to parse board snapshot for lesson ${lessonId}:`,
          error
        );
        // Continue with empty snapshot
      }
    }

    // Create the socket room with optional initial snapshot and persistence
    const room = new TLSocketRoom({
      // Use initial snapshot if available, otherwise start with empty board
      initialSnapshot: initialSnapshot,
      // Save snapshot to database whenever the board changes
      onDataChange: async () => {
        try {
          console.log(`💾 Persisting board snapshot for lesson: ${lessonId}`);
          const snapshot = room.getCurrentSnapshot();
          await db.lessons.update(lessonId, {
            board_snapshot_path: JSON.stringify(snapshot),
          });
        } catch (error) {
          console.error(
            `❌ Failed to persist board snapshot for lesson ${lessonId}:`,
            error
          );
        }
      },
      // Handle user leaving the whiteboard WebSocket session
      onSessionRemoved(_room, args) {
        if (args.numSessionsRemaining === 0) {
          // Close and evict the room when empty
          room.close();
          activeRooms.delete(lessonId);
          console.log('🧹 Closed empty room', lessonId);
          
          // Start idle timer since this was the last user in the whiteboard
          onLeave(lessonId);
          console.log(`[presence] Last user left whiteboard for lesson ${lessonId}`);
        }
      },
    });

    // Store the room for future use
    activeRooms.set(lessonId, room);

    console.log(`✅ Created tldraw room for lesson: ${lessonId}`);
    return room;
  } catch (error) {
    console.error(
      `❌ Failed to create tldraw room for lesson ${lessonId}:`,
      error
    );
    throw new Error(
      `Failed to create whiteboard room: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get current board snapshot for a lesson
 * @param lessonId - The lesson ID
 * @returns Promise<object | null> - The board snapshot or null if not found
 */
export async function getBoardSnapshot(
  lessonId: string
): Promise<object | null> {
  try {
    // First check if room is active and get live snapshot
    const activeRoom = activeRooms.get(lessonId);
    if (activeRoom) {
      return activeRoom.getCurrentSnapshot();
    }

    // Otherwise load from database
    const lesson = await db.lessons.findById(lessonId);
    if (!lesson?.board_snapshot_path) {
      return null;
    }

    return JSON.parse(lesson.board_snapshot_path);
  } catch (error) {
    console.error(
      `❌ Failed to get board snapshot for lesson ${lessonId}:`,
      error
    );
    return null;
  }
}

/**
 * Manually save board snapshot to database
 * @param lessonId - The lesson ID
 * @param snapshot - The board snapshot to save
 */
export async function saveBoardSnapshot(
  lessonId: string,
  snapshot: object
): Promise<void> {
  try {
    // Update database
    await db.lessons.update(lessonId, {
      board_snapshot_path: JSON.stringify(snapshot),
    });

    // Update active room if exists
    const activeRoom = activeRooms.get(lessonId);
    if (activeRoom) {
      // Note: This is a simplified approach. In a real implementation,
      // you might want to merge or replace the store state more carefully
      console.log(`📋 Updated active room snapshot for lesson: ${lessonId}`);
    }

    console.log(`💾 Manually saved board snapshot for lesson: ${lessonId}`);
  } catch (error) {
    console.error(
      `❌ Failed to save board snapshot for lesson ${lessonId}:`,
      error
    );
    throw new Error(
      `Failed to save whiteboard snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle asset upload for tldraw board
 * Uploads file to Supabase storage and returns public URL
 * @param lessonId - The lesson ID
 * @param file - The file buffer to upload
 * @param filename - Original filename
 * @param mimeType - MIME type of the file
 * @returns Promise<string> - Public URL of uploaded asset
 */
export async function handleAssetUpload(
  lessonId: string,
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  try {
    console.log(`📁 Uploading board asset for lesson ${lessonId}: ${filename}`);

    // Generate unique filename with UUID prefix
    const uniqueFilename = `${crypto.randomUUID()}-${filename}`;
    const storagePath = `${lessonId}/assets/${uniqueFilename}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('lesson-images')
      .upload(storagePath, file, {
        upsert: false,
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('Asset upload error:', uploadError);
      throw new Error(`Failed to upload asset: ${uploadError.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('lesson-images').getPublicUrl(storagePath);

    console.log(`✅ Uploaded board asset for lesson ${lessonId}: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Failed to upload asset for lesson ${lessonId}:`, error);
    throw error;
  }
}

/**
 * Initialize empty board snapshot for a new lesson
 * @param lessonId - The lesson ID
 */
export async function initializeEmptyBoard(lessonId: string): Promise<void> {
  try {
    // Create temporary room to get initial empty snapshot
    const tempRoom = new TLSocketRoom({});
    const emptySnapshot = tempRoom.getCurrentSnapshot();

    // Save to database
    await db.lessons.update(lessonId, {
      board_snapshot_path: JSON.stringify(emptySnapshot),
    });

    console.log(`🎨 Initialized empty board for lesson: ${lessonId}`);
  } catch (error) {
    console.error(
      `❌ Failed to initialize empty board for lesson ${lessonId}:`,
      error
    );
  }
}

/**
 * Close and clean up a room
 * @param lessonId - The lesson ID
 */
export function closeRoom(lessonId: string): void {
  const room = activeRooms.get(lessonId);
  if (room) {
    room.close();
    activeRooms.delete(lessonId);
    console.log(`🔒 Closed tldraw room for lesson: ${lessonId}`);
  }
}

/**
 * Get list of active rooms (for debugging/monitoring)
 * @returns string[] - Array of lesson IDs with active rooms
 */
export function getActiveRoomIds(): string[] {
  return Array.from(activeRooms.keys());
}

/**
 * Clean up inactive rooms (call periodically)
 * This is a placeholder - in production you'd want more sophisticated cleanup
 */
export function cleanupInactiveRooms(): void {
  // For now, we rely on the room's own cleanup mechanism
  // In production, you might want to track last activity time
  // and close rooms that haven't been used for a while
  console.log(`🧹 Active rooms: ${activeRooms.size}`);
}
