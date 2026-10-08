import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { supabase } from '../db/supabase.js';

// We'll keep an in-memory map of rooms and their data
interface RoomState {
  room: TLSocketRoom<any, void>;
  id: string;
  needsPersist: boolean;
}
const rooms = new Map<string, RoomState>();

// Very simple mutex using promise chaining, to avoid race conditions
// when loading rooms. In production you probably want one mutex per room
// to avoid unnecessary blocking!
let mutex = Promise.resolve<null | Error>(null);

/**
 * Read board snapshot from Supabase Storage bucket
 * @param roomId - The room ID to load snapshot for
 * @returns Promise<RoomSnapshot | undefined> - The snapshot data or undefined if not found
 */
export async function readSnapshotIfExists(roomId: string): Promise<RoomSnapshot | undefined> {
  try {
    console.log(`📖 Loading board snapshot from Supabase Storage for room: ${roomId}`);
    
    const fileName = `${roomId}.json`;
    
    // Download the snapshot file from the board-snapshots bucket
    const { data, error } = await supabase.storage
      .from('board-snapshots')
      .download(fileName);
    
    if (error) {
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log(`📭 No existing snapshot found for room: ${roomId}`);
        return undefined;
      }
      throw error;
    }

    // Convert the file data to text and parse as JSON
    const snapshotText = await data.text();
    const parsedSnapshot = JSON.parse(snapshotText);
    
    console.log(`✅ Successfully loaded snapshot for room: ${roomId}`);
    return parsedSnapshot;
  } catch (error) {
    console.error(`❌ Failed to load snapshot for room ${roomId}:`, error);
    return undefined;
  }
}

/**
 * Save board snapshot to Supabase Storage bucket
 * @param roomId - The room ID to save snapshot for
 * @param snapshot - The snapshot data to save
 */
async function saveSnapshot(roomId: string, snapshot: RoomSnapshot): Promise<void> {
  try {
    console.log(`💾 Saving board snapshot to Supabase Storage for room: ${roomId}`);
    
    const snapshotData = JSON.stringify(snapshot, null, 2); // Pretty formatted JSON
    const fileName = `${roomId}.json`;
    
    // Upload the snapshot as a JSON file to the board-snapshots bucket
    const { error } = await supabase.storage
      .from('board-snapshots')
      .upload(fileName, snapshotData, {
        contentType: 'application/json',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`❌ Failed to save snapshot to storage for room ${roomId}:`, error);
      throw new Error(`Failed to save snapshot: ${error.message}`);
    }

    console.log(`✅ Successfully saved snapshot for room: ${roomId}`);
  } catch (error) {
    console.error(`❌ Failed to save snapshot for room ${roomId}:`, error);
    throw error;
  }
}

/**
 * Create or load a room with the given ID
 * This mirrors the API from rooms.local.ts exactly
 * @param roomId - The room ID to create or load
 * @returns Promise<TLSocketRoom> - The room instance
 */
export async function makeOrLoadRoom(roomId: string): Promise<TLSocketRoom<any, void>> {
  mutex = mutex
    .then(async () => {
      if (rooms.has(roomId)) {
        const roomState = rooms.get(roomId)!;
        if (!roomState.room.isClosed()) {
          return null; // all good
        }
      }
      
      console.log(`🔄 Loading room from Supabase Storage: ${roomId}`);
      const initialSnapshot = await readSnapshotIfExists(roomId);

      const roomState: RoomState = {
        needsPersist: false,
        id: roomId,
        room: new TLSocketRoom({
          ...(initialSnapshot && { initialSnapshot }), // Only include if defined
          onSessionRemoved(room, args) {
            console.log(`👋 Client disconnected from room ${roomId}:`, args.sessionId);
            if (args.numSessionsRemaining === 0) {
              console.log(`🔒 Closing room: ${roomId}`);
              room.close();
            }
          },
          onDataChange() {
            roomState.needsPersist = true;
          },
        }),
      };
      
      rooms.set(roomId, roomState);
      console.log(`✅ Room loaded successfully: ${roomId}`);
      return null; // all good
    })
    .catch((error) => {
      // return errors as normal values to avoid stopping the mutex chain
      console.error(`❌ Error loading room ${roomId}:`, error);
      return error;
    });

  const err = await mutex;
  if (err) throw err;
  return rooms.get(roomId)!.room;
}

// Do persistence on a regular interval (every 2 seconds like the local version)
// In production you probably want a smarter system with throttling.
setInterval(() => {
  for (const roomState of rooms.values()) {
    if (roomState.needsPersist) {
      // persist room to Supabase
      roomState.needsPersist = false;
      console.log(`💾 Auto-saving snapshot for room: ${roomState.id}`);
      
      // Async save without blocking the interval
      saveSnapshot(roomState.id, roomState.room.getCurrentSnapshot())
        .catch((error) => {
          console.error(`❌ Failed to auto-save snapshot for room ${roomState.id}:`, error);
          // Reset needsPersist to true so we try again next time
          roomState.needsPersist = true;
        });
    }
    
    if (roomState.room.isClosed()) {
      console.log(`🗑️ Deleting closed room: ${roomState.id}`);
      rooms.delete(roomState.id);
    }
  }
}, 2000); // 2 seconds interval, same as local version

console.log('🔄 Supabase Storage rooms service initialized with 2s auto-save interval');