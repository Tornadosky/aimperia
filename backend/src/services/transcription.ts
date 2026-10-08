/**
 * Advanced Transcription Service with GPT-4o Transcribe
 * 
 * Features:
 * - High-quality audio processing with FFmpeg
 * - Automatic silence trimming (leading/trailing)
 * - Large file segmentation for files > 23 MB
 * - Context-aware chunked transcription with GPT-4o Transcribe
 * - Local transcript.txt logging
 * - Configurable audio bitrate and segment duration
 * 
 * Environment Variables:
 * - AIM_TRANSCRIBE_BITRATE: Audio bitrate for processing (default: 128k)
 * - AIM_SEG_SECONDS: Segment duration in seconds for large files (default: 800)
 */

import axios from 'axios';
import OpenAI, { toFile } from 'openai';
import { env } from '../env.js';
import { db } from '../db/supabase.js';
import path from 'node:path';
import fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import os from 'node:os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
// import { promisify } from 'node:util';
import { generateNotebookInBackground } from '../services/notebook.js';

// Set FFmpeg binary path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// Set FFprobe binary path
if (ffprobeStatic.path) {
  ffmpeg.setFfprobePath(ffprobeStatic.path);
}

const AIM_TRANSCRIBE_BITRATE = '128k';
const AIM_SEG_SECONDS = 800;


// Initialize OpenAI client with API key
const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

/**
 * Simple delay utility for retry logic
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 * @param fn - Function to retry
 * @param tries - Number of retry attempts
 * @param baseMs - Base delay in milliseconds
 * @returns Promise resolving to function result
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  tries = 3,
  baseMs = 750
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) {
        const delayMs = baseMs * Math.pow(2, i);
        console.warn(
          `Transcription attempt ${i + 1} failed, retrying in ${delayMs}ms:`,
          e
        );
        await delay(delayMs);
      }
    }
  }
  throw lastErr;
}

/**
 * Validate audio chunk using ffprobe to ensure it has actual audio content
 * @param audioFilePath - Path to the audio file to validate
 * @returns Promise<boolean> - true if audio is valid, false if silent/empty
 */
type FFprobeStream = {
  codec_type?: string;
  duration?: string;
  codec_name?: string;
};

type FFprobeMetadata = {
  streams?: FFprobeStream[];
};

async function validateAudioChunk(audioFilePath: string): Promise<boolean> {
  const ffprobeAsync = (input: string) =>
    new Promise<FFprobeMetadata>((resolve, reject) => {
      ffmpeg.ffprobe(input, (err: Error | null, data: unknown) => {
        if (err) return reject(err);
        resolve(data as FFprobeMetadata);
      });
    });
  
  try {
    console.log(`🔍 Validating audio chunk: ${path.basename(audioFilePath)}`);
    
    // Fast-fail on files < 1 KB
    const stats = await fsPromises.stat(audioFilePath);
    if (stats.size < 1024) {
      console.log(`❌ Audio chunk too small: ${stats.size} bytes`);
      return false;
    }
    
    // Call ffprobe via fluent-ffmpeg to get stream information
    const metadata = await ffprobeAsync(audioFilePath);
    
    // Locate the first audio stream
    const audioStreams: FFprobeStream[] = (metadata.streams ?? []).filter(
      (stream: FFprobeStream) => stream.codec_type === 'audio'
    );
    if (audioStreams.length === 0) {
      console.log(`❌ No audio stream detected in chunk`);
      return false;
    }
    
    const audioStream = audioStreams[0]!;
    const duration = parseFloat(audioStream.duration || '0');
    const codecName = audioStream.codec_name || 'unknown';
    
    // Treat the chunk as "valid" if duration >= 1.0 seconds
    if (duration < 1.0) {
      console.log(`❌ Audio chunk too short: ${duration}s (codec: ${codecName})`);
      return false;
    }
    
    console.log(`✅ Audio chunk valid: ${duration}s, codec: ${codecName}, size: ${stats.size} bytes`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to validate audio chunk:`, error);
    return false;
  }
}

/**
 * Downloads MP4, processes with FFmpeg for high-quality audio, and segments if needed
 * @param url - The recording URL to download from
 * @param lessonId - The lesson ID for temp file naming
 * @returns Object with array of processed audio file paths and temp directory path
 */
async function prepareAudioHighQuality(
  url: string,
  lessonId: string
): Promise<{ files: string[]; tempDir: string }> {
  const tempDir = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), `transcribe-${lessonId}-`)
  );

  try {
    console.log(`📁 Created temp directory: ${tempDir}`);

    // Download the MP4 file
    console.log(`⬇️ Downloading MP4 from: ${url}`);
    const response = await withRetry(
      () =>
        axios.get(url, {
          responseType: 'stream',
          maxRedirects: 5,
          timeout: 300_000, // 5 minutes
          headers: {
            'User-Agent': 'AimperiaEd-Transcription/1.0',
          },
        }),
      3,
      1000
    );

    const inputFile = path.join(tempDir, `input-${lessonId}.mp4`);
    const writer = fs.createWriteStream(inputFile);
    response.data.pipe(writer);

    // Wait for download to complete
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`✅ Downloaded MP4 to: ${inputFile}`);

    // Process with FFmpeg: drop video, trim silence, encode high-quality AAC
    const processedFile = path.join(tempDir, `processed-${lessonId}.m4a`);
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputFile)
        .noVideo() // Drop video stream
        .audioCodec('aac') // Use AAC codec
        .audioBitrate(AIM_TRANSCRIBE_BITRATE) // Configurable bitrate (default 128k)
        .audioFrequency(44100) // 44.1 kHz sample rate
        // Trim leading and trailing silence with combined filter
        .audioFilters([
          'silenceremove=start_periods=1:start_duration=0.5:start_threshold=-55dB'        
        ])
        .output(processedFile)
        .on('end', () => {
          console.log(`🎵 Audio processing completed: ${processedFile}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg processing failed:', err);
          reject(err);
        })
        .run();
    });

    // Check file size and segment if needed (24.5 MiB = ~25.6 MB)
    const stats = await fsPromises.stat(processedFile);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📏 Processed file size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 23) {
      console.log(`✂️ File too large, segmenting into ${AIM_SEG_SECONDS}s chunks...`);
      
      const segmentDir = path.join(tempDir, 'segments');
      await fsPromises.mkdir(segmentDir);
      
      // Use FFmpeg to segment the audio into fixed duration chunks
      await new Promise<void>((resolve, reject) => {
        ffmpeg(processedFile)
          .audioCodec('copy') // Copy codec during segmentation to avoid re-encoding
          .output(path.join(segmentDir, `segment-${lessonId}-%03d.m4a`))
          .outputOptions([
            '-f', 'segment',
            '-segment_time', (AIM_SEG_SECONDS).toString(),
            '-reset_timestamps', '1'
          ])
          .on('end', () => {
            console.log(`✅ Segmentation completed`);
            resolve();
          })
          .on('error', (err) => {
            console.error('❌ FFmpeg segmentation failed:', err);
            reject(err);
          })
          .run();
      });

      // Return array of segment file paths
      const segmentFiles = await fsPromises.readdir(segmentDir);
      const sortedSegments = segmentFiles
        .filter(file => file.endsWith('.m4a'))
        .sort()
        .map(file => path.join(segmentDir, file));
      
      console.log(`📦 Created ${sortedSegments.length} segments`);
      return { files: sortedSegments, tempDir };
    } else {
      // Return single file
      return { files: [processedFile], tempDir };
    }
  } catch (error) {
    // Clean up temp directory on error
    try {
      await fsPromises.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn(`⚠️ Failed to cleanup temp directory: ${cleanupError}`);
    }
    throw error;
  }
}

/**
 * Transcribe a lesson recording using OpenAI GPT-4o Transcribe
 * @param lessonId - The lesson ID to transcribe
 * @param opts - Options including force flag to override existing transcripts
 * @returns Promise with note ID, creation status, and transcription status
 */
export async function transcribeLessonRecording(
  lessonId: string,
  opts?: { force?: boolean }
): Promise<{ noteId: string; created: boolean; status?: 'success' | 'no_audio' }> {
  console.log(`🎵 Starting transcription for lesson: ${lessonId}`);

  // Load lesson and validate recording URL exists
  const lesson = await db.lessons.findById(lessonId);
  if (!lesson) {
    throw new Error(`Lesson not found: ${lessonId}`);
  }
  if (!lesson.recording_url) {
    throw new Error(`No recording_url found for lesson: ${lessonId}`);
  }

  console.log(`📝 Lesson found with recording URL: ${lesson.recording_url}`);

  // Check for existing transcript (idempotency)
  if (!opts?.force) {
    const existing = await db.notes.findByLessonIdAndType(
      lessonId,
      'transcript'
    );
    if (existing) {
      console.log(
        `📋 Transcript already exists for lesson ${lessonId}, returning existing note`
      );
      return { noteId: existing.id, created: false, status: 'success' };
    }
  }

  let tempDir: string | null = null;
  
  try {
    // Prepare high-quality audio with silence trimming and segmentation
    console.log(`🎵 Preparing high-quality audio for lesson: ${lessonId}`);
    const { files: audioFiles, tempDir: audioTempDir } = await prepareAudioHighQuality(lesson.recording_url, lessonId);
    
    // Set temp directory for cleanup
    tempDir = audioTempDir;
    
    console.log(`🎤 Transcribing ${audioFiles.length} audio chunk(s) with GPT-4o Transcribe...`);
    
    // Validate all audio chunks first to detect silent lessons
    let validChunks = 0;
    for (let i = 0; i < audioFiles.length; i++) {
      const audioFile = audioFiles[i];
      if (!audioFile) {
        console.warn(`⚠️ Skipping undefined audio file at index ${i}`);
        continue;
      }
      
      const isValid = await validateAudioChunk(audioFile);
      if (isValid) {
        validChunks++;
      }
    }
    
    // If no valid audio chunks found, return no_audio status
    if (validChunks === 0) {
      console.log(`🔇 No valid audio detected in any chunks - this appears to be a silent lesson`);
      
      // Save a note indicating no speech was detected
      const note = await db.notes.upsertTranscriptOrSummary({
        lesson_id: lessonId,
        note_type: 'transcript',
        content: 'No speech detected in this recording.',
        image_path: null,
        added_to_summary: false,
      });
      
      console.log(`💾 No-audio transcript saved to database with note ID: ${note.id}`);
      return { noteId: note.id, created: true, status: 'no_audio' };
    }
    
    // Transcribe each valid chunk and concatenate results
    let fullTranscript = '';
    const chunkTranscripts: string[] = [];
    
    for (let i = 0; i < audioFiles.length; i++) {
      const audioFile = audioFiles[i];
      if (!audioFile) {
        console.warn(`⚠️ Skipping undefined audio file at index ${i}`);
        continue;
      }
      
      // Validate chunk before processing
      const isValid = await validateAudioChunk(audioFile);
      if (!isValid) {
        console.log(`⏭️ Skipping invalid audio chunk ${i + 1}/${audioFiles.length}: ${path.basename(audioFile)}`);
        continue;
      }
      
      console.log(`🎤 Processing valid chunk ${i + 1}/${audioFiles.length}: ${path.basename(audioFile)}`);
      
      // Save a copy of the exact audio chunk being sent for logging/inspection
      try {
        const logsDir = path.join(process.cwd(), 'sent-audio', lessonId);
        await fsPromises.mkdir(logsDir, { recursive: true });
        const ext = path.extname(audioFile) || '.m4a';
        const destFile = path.join(
          logsDir,
          `lesson-${lessonId}-chunk-${String(i + 1).padStart(3, '0')}-${Date.now()}${ext}`
        );
        await fsPromises.copyFile(audioFile, destFile);
        console.log(`💾 Saved copy of audio chunk to: ${destFile}`);
      } catch (copyErr) {
        console.warn(`⚠️ Failed to save copy of audio chunk for logging:`, copyErr);
      }

      // Convert file to File object for OpenAI
      const fileBuffer = await fsPromises.readFile(audioFile);
      const file = await toFile(fileBuffer, path.basename(audioFile), {
        type: 'audio/mp4',
      });
      
      // Set prompt for context continuity
      let prompt = '';
      if (i === 0) {
        // For first chunk, use lesson title and description as context
        const contextParts = [];
        if (lesson.title) {
          contextParts.push(`Lesson title: ${lesson.title}`);
        }
        if (lesson.description) {
          contextParts.push(`Lesson description: ${lesson.description}`);
        }
        if (contextParts.length > 0) {
          prompt = contextParts.join('. ');
          console.log(`📝 Using lesson context for first chunk: "${prompt}"`);
        }
      } else if (fullTranscript.length > 0) {
        // For subsequent chunks, use last 600 chars of previous transcript for continuity
        prompt = fullTranscript.slice(-600);
        console.log(`📝 Using context prompt from previous chunks (${prompt.length} chars)`);
      }
      
      // Call OpenAI GPT-4o Transcribe API with retry logic
      const requestParams: any = {
        model: 'gpt-4o-transcribe',
        file: file,
        response_format: 'text',
      };
      
      // Only add prompt if it's not empty
      if (prompt && prompt.trim()) {
        requestParams.prompt = prompt;
      }
      
      const transcription = await withRetry(
        () => client.audio.transcriptions.create(requestParams),
        3,
        2000 // Start with 2 second delay for API calls
      );
      
      // Extract transcribed text (response_format: 'text' returns string directly)
      const chunkText = typeof transcription === 'string' ? transcription : (transcription as any).text || '';
      
      if (!chunkText.trim()) {
        console.warn(`⚠️ Empty transcription received for chunk ${i + 1}`);
        continue;
      }
      
      console.log(`✅ Chunk ${i + 1} transcribed: ${chunkText.length} characters`);
      chunkTranscripts.push(chunkText.trim());
    }
    
    // Concatenate all chunks with blank lines between them
    fullTranscript = chunkTranscripts.join('\n\n');
    
    if (!fullTranscript.trim()) {
      throw new Error('No transcription content received from any audio chunks');
    }
    
    console.log(`✅ Full transcription completed: ${fullTranscript.length} characters total`);
    
    // Write transcript to local transcript.txt file in working directory
    const transcriptPath = path.join(process.cwd(), 'transcript.txt');
    await fsPromises.writeFile(transcriptPath, fullTranscript, 'utf8');
    console.log(`📄 Transcript saved to local file: ${transcriptPath}`);

    // Save transcript to database
    const note = await db.notes.upsertTranscriptOrSummary({
      lesson_id: lessonId,
      note_type: 'transcript',
      content: fullTranscript,
      image_path: null,
      added_to_summary: false,
    });

    console.log(
      `💾 Transcript saved to database with note ID: ${note.id}`
    );

    // Get board highlights and generate notebook in background
    const boardHighlights = await db.notes.findHighlights(lesson.id);
    const images = boardHighlights.map((h) => ({
      url: h.image_path,
      caption: h.content ?? '',
    }));

    generateNotebookInBackground(lesson.id, {
      transcript: fullTranscript,
      images,
      topic: lesson.title,
      studentLevel: 'high',
      difficulty: 'standard',
      language: 'ru',
      style: 'detailed',
    });

    return { noteId: note.id, created: true, status: 'success' };
  } catch (error) {
    console.error(
      `❌ Transcription failed for lesson ${lessonId}:`,
      error
    );
    // Re-throw with more context
    throw new Error(
      `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned up temporary directory: ${tempDir}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to cleanup temp directory: ${cleanupError}`);
      }
    }
  }
} 