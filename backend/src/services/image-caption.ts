/**
 * Image Caption Service using OpenAI Vision
 * 
 * Automatically generates concise captions for board highlight images
 * using GPT-4o-mini vision capabilities.
 */

import OpenAI from 'openai';
import { env } from '../env.js';
import { db } from '../db/supabase.js';

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
          `Image caption attempt ${i + 1} failed, retrying in ${delayMs}ms:`,
          e
        );
        await delay(delayMs);
      }
    }
  }
  throw lastErr;
}

/**
 * Generate a concise caption for a board highlight image using OpenAI Vision
 * @param imageUrl - URL of the image to caption (public URL or data URL)
 * @param userDescription - Optional user-provided description to include
 * @returns Promise resolving to generated caption text
 */
export async function generateImageCaption(
  imageUrl: string,
  userDescription?: string
): Promise<string> {
  console.log(`🖼️ Generating caption for image: ${imageUrl.substring(0, 50)}...`);

  try {
    // Build the prompt for generating a concise caption
    const prompt = userDescription 
      ? `Generate a concise, educational caption for this board/whiteboard image. User notes: "${userDescription}". Focus on describing the educational content, diagrams, text, or key visual elements that would help students understand the lesson material.`
      : `Generate a concise, educational caption for this board/whiteboard image. Describe the educational content, diagrams, text, or key visual elements that would help students understand the lesson material.`;

    // Call OpenAI Vision API with retry logic
    const completion = await withRetry(
      () =>
        client.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.1, // Low temperature for consistent, factual descriptions
          max_tokens: 150, // Keep captions concise
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl,
                    detail: 'low', // Use low detail for faster processing and lower cost
                  },
                },
              ],
            },
          ],
        }),
      3,
      1000 // Start with 1 second delay for API calls
    );

    // Extract and validate the generated caption
    const caption = completion.choices[0]?.message?.content?.trim();
    if (!caption) {
      throw new Error('Empty caption received from OpenAI Vision');
    }

    console.log(`✅ Generated caption: "${caption}"`);
    return caption;
  } catch (error) {
    console.error('❌ Failed to generate image caption:', error);
    
    // Return a safe default caption that includes user description if provided
    const fallbackCaption = userDescription 
      ? `Board highlight: ${userDescription}`
      : 'Board highlight from lesson';
    
    console.log(`🔄 Using fallback caption: "${fallbackCaption}"`);
    return fallbackCaption;
  }
}

/**
 * Generate a caption for a board highlight with combined user description and AI analysis
 * @param imageUrl - URL of the image to caption
 * @param userDescription - Optional user-provided description
 * @returns Promise resolving to final caption combining user input and AI analysis
 */
export async function generateBoardHighlightCaption(
  imageUrl: string,
  userDescription?: string
): Promise<string> {
  try {
    // Generate AI caption
    const aiCaption = await generateImageCaption(imageUrl, userDescription);
    
    // If user provided description, combine it with AI caption
    if (userDescription && userDescription.trim()) {
      // Check if AI caption already incorporates the user description
      const userDescLower = userDescription.toLowerCase();
      const aiCaptionLower = aiCaption.toLowerCase();
      
      if (aiCaptionLower.includes(userDescLower) || userDescLower.length < 10) {
        // AI caption already includes user description or user description is very short
        return aiCaption;
      } else {
        // Combine user description with AI analysis
        return `${userDescription.trim()} - ${aiCaption}`;
      }
    }
    
    return aiCaption;
  } catch (error) {
    console.error('❌ Failed to generate board highlight caption:', error);
    
    // Return safe fallback
    return userDescription?.trim() || 'Board highlight from lesson';
  }
}

/**
 * Generate caption for a board highlight in the background and update the database
 * This is a fire-and-forget operation that doesn't block the main upload flow
 * @param noteId - The ID of the lesson note to update
 * @param imageUrl - URL of the image to caption
 * @param userDescription - Optional user-provided description
 */
export async function generateCaptionInBackground(
  noteId: string,
  imageUrl: string,
  userDescription?: string
): Promise<void> {
  try {
    console.log(`🔄 Starting background caption generation for note: ${noteId}`);
    
    // Generate the AI caption
    const aiCaption = await generateBoardHighlightCaption(imageUrl, userDescription);
    
    // Update the note with the generated caption
    await db.notes.update(noteId, { content: aiCaption });
    
    console.log(`✅ Background caption generated and saved for note: ${noteId}`);
  } catch (error) {
    console.error(`❌ Background caption generation failed for note ${noteId}:`, error);
    // Don't throw - this is fire-and-forget, failures should not propagate
  }
}