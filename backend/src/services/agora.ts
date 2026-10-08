import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import { env } from '../env.js';

/**
 * Generate Agora RTC token for a specific channel and user
 * Used to authenticate users for video/audio communication in Agora
 *
 * @param channelName - The Agora channel name (lesson's agora_channel_name)
 * @param uid - User ID (0 for auto-assigned, or specific number)
 * @param expireTimeInSeconds - Token expiration time in seconds (default: 3600 = 1 hour)
 * @returns JWT token for Agora RTC authentication
 */
export function generateToken(
  channelName: string,
  uid: number = 0,
  expireTimeInSeconds: number = 3600
): string {
  // Calculate token expiration timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;

  // Generate token using Agora's RtcTokenBuilder
  // All participants get PUBLISHER role to enable both audio/video sending and receiving
  const token = RtcTokenBuilder.buildTokenWithUid(
    env.AGORA_APP_ID,
    env.AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    RtcRole.PUBLISHER, // PUBLISHER role (value: 1)
    privilegeExpiredTs
  );

  return token;
}

/**
 * Generate a unique Agora channel name for a lesson
 * Format: "lesson-{uuid}" for consistency and uniqueness
 *
 * @param lessonId - The lesson UUID
 * @returns Channel name in format "lesson-{uuid}"
 */
export function generateChannelName(lessonId: string): string {
  return `lesson_${lessonId.replace(/[^A-Za-z0-9]/g, '')}`;
}

/**
 * Interface for Agora token response
 * Contains all necessary data for frontend to connect to Agora
 */
export interface AgoraTokenResponse {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}
