import { supabase } from '../db/supabase.js'
import { closeLessonInternal } from '../routes/lessons.js'

/** 10‑minute inactivity window (ms) */
const IDLE_TIMEOUT_MS = 10 * 60 * 1000

/** keep one timer per lesson so we can cancel it when someone rejoins */
const idleTimers = new Map<string, NodeJS.Timeout>()

/** ──────────────────────────────────────────────────────────────
 * NEW ➊  Track a freshly‑created lesson so it closes
 *        if _no participant_ turns up within 10 min.
 * call immediately after you create the app_lesson row.
 */
export function trackLesson(lessonId: string) {
  if (idleTimers.has(lessonId)) return        // already being watched

  console.log(`[presence] tracking new lesson ${lessonId} - will auto-close in ${IDLE_TIMEOUT_MS/60000} min if nobody joins`)
  const t = setTimeout(() => maybeCloseIdleLesson(lessonId), IDLE_TIMEOUT_MS)
  idleTimers.set(lessonId, t)
}

/** helper used by onLeave() and trackLesson() */
async function maybeCloseIdleLesson(lessonId: string) {
  const { count } = await supabase
    .from('app_lesson_participant')
    .select('*', { head: true, count: 'exact' })
    .eq('lesson_id', lessonId)
    .is('left_at', null)

  if ((count ?? 0) === 0) {
    await closeLesson(lessonId)
  } else {
    console.log(`[presence] lesson ${lessonId} active again, no auto‑close`)
  }
}

/** ──────────────────────────────────────────────────────────────
 *  Existing logic trimmed for clarity
 */
export async function onJoin(lessonId: string) {
  clearTimer(lessonId)
}

export async function onLeave(lessonId: string) {
  const { count } = await supabase
    .from('app_lesson_participant')
    .select('*', { head: true, count: 'exact' })
    .eq('lesson_id', lessonId)
    .is('left_at', null)

  if ((count ?? 0) === 0) {
    scheduleTimer(lessonId)
  }
}

/** internals */
function scheduleTimer(id: string) {
  clearTimer(id)
  console.log(`[presence] lesson ${id} is now empty, scheduling auto-close in ${IDLE_TIMEOUT_MS/60000} minutes`)
  const t = setTimeout(() => maybeCloseIdleLesson(id), IDLE_TIMEOUT_MS)
  idleTimers.set(id, t)
}

function clearTimer(id: string) {
  const old = idleTimers.get(id)
  if (old) { 
    clearTimeout(old)
    idleTimers.delete(id)
    console.log(`[presence] cancelled idle timer for lesson ${id} - someone joined`)
  }
}

async function closeLesson(lessonId: string) {
  console.log(`[presence] closing lesson ${lessonId} after ${IDLE_TIMEOUT_MS/60000} min idle`)
  
  try {
    // Use the shared lesson closing logic (handles recording, transcription, etc.)
    await closeLessonInternal(lessonId);
    
    // Clean up the timer
    clearTimer(lessonId);
    
    console.log(`[presence] lesson ${lessonId} successfully closed due to inactivity`)
  } catch (error) {
    console.error(`[presence] failed to close lesson ${lessonId}:`, error);
    // Still clean up the timer even if closing failed
    clearTimer(lessonId);
  }
}