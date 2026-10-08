import OpenAI from 'openai';
import { env } from '../env.js';
import { db } from '../db/supabase.js';
import { writeFile } from 'node:fs/promises';

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
          `Notebook generation attempt ${i + 1} failed, retrying in ${delayMs}ms:`,
          e
        );
        await delay(delayMs);
      }
    }
  }
  throw lastErr;
}

/**
 * Generate a structured notebook in Markdown format from transcript and images
 * Uses OpenAI to create educational content with specific sections
 * @param params - Configuration for notebook generation
 * @returns Promise resolving to generated Markdown content
 */

//ToDO: fix this
// Formulas don't work in Markdown if in this:
//- For Quick Quiz: Use <details><summary>Show answer</summary>Answer content</details> for each answer
export async function buildNotebookMarkdown(params: {
  transcript: string;
  images: { url: string; caption?: string | undefined; timestampSec?: number | undefined }[];
  topic?: string | undefined;
  studentLevel: string;
  difficulty: string;
  language: string;
  style: 'concise' | 'detailed';
}): Promise<string> {
  console.log(`📚 Building notebook for ${params.studentLevel} level, ${params.difficulty} difficulty`);

  // Sort images by timestamp if available, otherwise maintain original order
  const imagesSorted = [...params.images].sort(
    (a, b) => (a.timestampSec ?? 0) - (b.timestampSec ?? 0)
  );

  // Build system prompt that defines the notebook structure
  const system = `You are an expert tutor. Create a clear, well-structured SCHOOL NOTEBOOK in Markdown for students.

CRITICAL REQUIREMENTS:
- Use the requested language: ${params.language}
- Do NOT invent images. Only embed URLs provided by the user

FORMATTING RULES:
- For Diagrams & Images: Embed all provided images as ![caption](url)
- YOU MUST use this format for all formulas: $...$ - Inline Math; $$...$$ - Block Math; Markdown + KaTeX
- Make content appropriate for ${params.studentLevel} level with ${params.difficulty} difficulty
- Use ${params.style} style (concise = brief explanations, detailed = comprehensive explanations)`;

  // Build user prompt with all the context
  const user = `Topic: ${params.topic ?? 'Not specified'}
Student Level: ${params.studentLevel}
Difficulty: ${params.difficulty}
Style: ${params.style}
Language: ${params.language}

Images to embed (${imagesSorted.length} total, ordered by timestamp):
${imagesSorted.map((img, idx) => `${idx + 1}. ${img.url}${img.caption ? ` — ${img.caption}` : ''}`).join('\n')}

Transcript:
"""${params.transcript}"""

Write me a clear summary/notebook of the above transcript of a lecture.
I want it to be an ideal student summary/notebook. 
That is, the kind of summary that you imagine and think is ideal for repeating everything that was mentioned in the lecture. 
Try to make it as close to the transcript as possible.
Do NOT include too much information that was not mentioned in the transcript.`

  console.log(`User prompt: ${user}`);

  console.log(`🤖 Sending to OpenAI for notebook generation...`);

  // Generate notebook with retry logic
  const completion = await withRetry(
    () =>
      client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2, // Low temperature for consistent, structured output
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 4000, // Allow for comprehensive notebooks
      }),
    3,
    1500 // Start with 1.5 second delay for API calls
  );

  // Extract and validate the generated markdown
  const markdown = completion.choices[0]?.message?.content?.trim();
  if (!markdown) {
    throw new Error('Empty notebook content received from OpenAI');
  }

  console.log(`✅ Notebook generated successfully, ${markdown.length} characters`);
  // Save the generated notebook markdown to a local file for debugging/auditing
  // This helps with reviewing the generated content and troubleshooting issues
  try {
    // Write the markdown to notebook.txt in the project root
    await writeFile('notebook.txt', markdown, 'utf-8');
    console.log('📝 Notebook markdown saved to notebook.txt');
  } catch (err) {
    // Log any file write errors, but do not interrupt the main flow
    console.error('Failed to save notebook markdown to notebook.txt:', err);
  }
  
  return markdown;
}

/**
 * Generate notebook in the background (fire-and-forget)
 * Logs errors but doesn't throw them
 */
export async function generateNotebookInBackground(
  lessonId: string,
  params: {
    transcript: string;
    images: { url: string; caption?: string | undefined; timestampSec?: number | undefined }[];
    topic?: string | undefined;
    studentLevel: string;
    difficulty: string;
    language: string;
    style: 'concise' | 'detailed';
  }
): Promise<void> {
  try {
    console.log(`📚 Starting background notebook generation for lesson: ${lessonId}`);
    
    // Generate the notebook markdown
    const markdown = await buildNotebookMarkdown(params);
    
    // Save as summary note (replaces existing if present)
    const note = await db.notes.upsertTranscriptOrSummary({
      lesson_id: lessonId,
      note_type: 'summary',
      content: markdown,
      image_path: null,
      added_to_summary: true,
    });

    console.log(
      `✅ Background notebook generation completed for lesson ${lessonId}, note ID: ${note.id}`
    );
  } catch (error: any) {
    console.error('Background notebook generation failed:', {
      lessonId,
      error: error?.message || error,
      // Never log the actual transcript content for security
    });
    // Don't throw - this is fire-and-forget
  }
}