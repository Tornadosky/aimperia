import axios from 'axios';
import { env } from '../env.js';
import * as agora from './agora.js';

/**
 * Agora Cloud Recording Service
 *
 * This service provides functions to manage Agora Cloud Recording sessions:
 * - acquireResource: Get a resource ID for the recording session
 * - startRecording: Start recording with storage configuration
 * - stopRecording: Stop recording and get the file URL
 *
 * Based on Agora Cloud Recording API v1
 * Authentication: Basic Auth with Base64-encoded Customer ID:Secret
 */

// Base URL for Agora Cloud Recording API
const AGORA_API_BASE = 'https://api.agora.io/v1/apps';

/**
 * Generate Basic Auth header for Agora API
 * Format: "Basic base64(customer_id:customer_secret)"
 */
function getAuthHeader(): string {
  const credentials = `${env.AGORA_CUSTOMER_ID}:${env.AGORA_CUSTOMER_SECRET}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}

/**
 * Create axios instance with default configuration for Agora API
 */
const agoraApi = axios.create({
  baseURL: AGORA_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Authorization: getAuthHeader(),
  },
  timeout: 30000, // 30 second timeout
});

/**
 * Interface for storage configuration
 * Used in startRecording to specify where to store the recording files
 */
interface StorageConfig {
  vendor: number; // 1 = AWS, 2 = GCP, 3 = Azure
  region: number; // Storage region code (0-5 for AWS regions: 0=us-east-1, 1=us-east-2, etc.)
  bucket: string; // Storage bucket name
  accessKey: string; // Storage access key
  secretKey: string; // Storage secret key
  fileNamePrefix: string[]; // Array of prefixes for file naming (only letters, digits, underscores, NO dashes allowed)
}

/**
 * Interface for recording configuration
 * Defines how the recording should be performed
 */
interface RecordingConfig {
  channelType: number; // 0 = live broadcast, 1 = communication (default)
  streamTypes: number; // 0 = audio only, 1 = video only, 2 = audio + video (default)
  audioProfile: number; // Audio quality: 0 = standard, 1 = high, 2 = stereo high
  videoStreamType: number; // 0 = high stream, 1 = low stream
  maxIdleTime: number; // Max idle time in seconds before auto-stop (default: 30)
  transcodingConfig: {
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    backgroundColor: string; // Hex color code
  };
}

/**
 * Acquire a resource ID for Cloud Recording
 * This must be called before starting any recording session
 *
 * @param channelName - The Agora channel name to record
 * @returns Promise<string> - The resource ID for this recording session
 */
export async function acquireResource(channelName: string): Promise<string> {
  try {
    console.log(
      `📹 Acquiring Agora recording resource for channel: ${channelName}`
    );

    const response = await agoraApi.post(
      `/${env.AGORA_APP_ID}/cloud_recording/acquire`,
      {
        cname: channelName,
        uid: '0', // Use string UID for Cloud Recording
        clientRequest: {
          resourceExpiredHour: 24, // Resource expires in 24 hours
          scene: 0, // 0 = real-time recording
        },
      }
    );

    const resourceId = response.data.resourceId;
    console.log(`✅ Successfully acquired resource ID: ${resourceId}`);

    return resourceId;
  } catch (error: any) {
    console.error('❌ Failed to acquire Agora recording resource:', {
      channel: channelName,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      `Failed to acquire recording resource: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Start Cloud Recording session
 *
 * @param resourceId - Resource ID from acquireResource()
 * @param channelName - The Agora channel name to record
 * @param lessonId - The lesson ID for file naming
 * @returns Promise<string> - The session ID (sid) for this recording
 */
export async function startRecording(
  resourceId: string,
  channelName: string,
  lessonId: string
): Promise<string> {
  try {
    console.log(`🎬 Starting Agora recording for lesson: ${lessonId}`);

    const sanitizeForAgoraPath = (s: string) => s.replace(/[^A-Za-z0-9]/g, '');

    // in startRecording(...)
    const sanitized = sanitizeForAgoraPath(lessonId);

    // Configure storage settings from environment variables
    const storageConfig: StorageConfig = {
      vendor: env.AGORA_STORAGE_VENDOR,
      region: env.AGORA_STORAGE_REGION,
      bucket: env.AGORA_STORAGE_BUCKET,
      accessKey: env.AGORA_STORAGE_ACCESS_KEY,
      secretKey: env.AGORA_STORAGE_SECRET_KEY,
      fileNamePrefix: ['lessons', sanitized], // Organize files: lessons/{lesson_id}/filename
    };

    // Debug: Log storage configuration for troubleshooting
    console.log('🔧 Agora Storage Config:', {
      vendor: storageConfig.vendor,
      region: storageConfig.region,
      bucket: storageConfig.bucket,
      accessKey: storageConfig.accessKey.substring(0, 10) + '...',
      secretKey: '***REDACTED***',
      fileNamePrefix: storageConfig.fileNamePrefix,
    });

    // Configure recording settings for audio recording (for transcription)
    const recordingConfig: RecordingConfig = {
      channelType: 1, // Communication mode (typical for tutoring)
      streamTypes: 0, // Audio only recording for transcription
      audioProfile: 1, // High quality audio for better transcription
      videoStreamType: 0, // High stream (not used for audio-only)
      maxIdleTime: 300, // 5 minutes idle time before auto-stop
      transcodingConfig: {
        width: 640,
        height: 480,
        fps: 15,
        bitrate: 500,
        backgroundColor: '#000000', // Black background
      },
    };

    const recordingToken = agora.generateToken(channelName, 0, 24 * 3600);
    console.log(`🔑 Recording token: ${recordingToken}`);

    // Try starting recording with different UIDs if needed
    let currentUid = '0';
    let sid: string;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(
          `🎬 Attempting to start recording with UID: ${currentUid} (attempt ${retryCount + 1})`
        );

        const response = await agoraApi.post(
          `/${env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/mix/start`,
          {
            cname: channelName,
            uid: currentUid, // Try different UIDs if needed
            clientRequest: {
              token: recordingToken,
              recordingConfig,
              storageConfig,
              recordingFileConfig: {
                avFileType: ['hls', 'mp4'], // Generate both HLS and MP4 files
              },
            },
          }
        );

        sid = response.data.sid;
        console.log(`📹 Recording session created with SID: ${sid}`);

        // Validate recording status immediately
        try {
          const statusQuery = await queryRecording(resourceId, sid);
          const status = statusQuery?.serverResponse?.status;

          console.log(`📊 Recording status check: ${status}`);

          // Status 4 or 5 means recording is running successfully
          if (status === 4 || status === 5) {
            console.log(
              `✅ Recording validated and running successfully with SID: ${sid}`
            );
            return sid;
          } else {
            console.warn(
              `⚠️ Recording not running properly. Status: ${status}. Will retry with different UID.`
            );

            // Try to stop the failed recording session
            try {
              await agoraApi.post(
                `/${env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
                {
                  cname: channelName,
                  uid: currentUid,
                  clientRequest: { async_stop: false },
                }
              );
              console.log(`🧹 Cleaned up failed recording session: ${sid}`);
            } catch (cleanupError) {
              console.warn(
                `⚠️ Failed to cleanup recording session ${sid}:`,
                cleanupError
              );
            }

            // Continue to retry with next UID
          }
        } catch (queryError) {
          console.warn(
            `❌ Query after start failed. Recorder may have quit:`,
            queryError
          );
          // Continue to retry with next UID
        }
      } catch (startError) {
        console.warn(
          `❌ Failed to start recording with UID ${currentUid}:`,
          startError
        );
        // Continue to retry with next UID
      }

      // Prepare for next retry
      retryCount++;
      currentUid = retryCount.toString(); // Try UIDs: '0', '1', '2'

      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying recording start with UID: ${currentUid}`);
      }
    }

    // If we get here, all retries failed
    throw new Error(
      `Failed to start recording after ${maxRetries} attempts with different UIDs`
    );
  } catch (error: any) {
    console.error('❌ Failed to start Agora recording:', {
      resourceId,
      channel: channelName,
      lesson: lessonId,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      `Failed to start recording: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Stop Cloud Recording session and get the recording file URL
 *
 * @param resourceId - Resource ID from acquireResource()
 * @param sid - Session ID from startRecording()
 * @param channelName - The Agora channel name
 * @param lessonId - The lesson ID for file path construction
 * @returns Promise<string> - The URL of the recorded file
 */
export async function stopRecording(
  resourceId: string,
  sid: string,
  channelName: string,
  _lessonId: string
): Promise<string> {
  try {
    console.log(`⏹️ Stopping Agora recording for SID: ${sid}`);

    const response = await agoraApi.post(
      `/${env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`,
      {
        cname: channelName,
        uid: '0', // Use string UID for Cloud Recording
        clientRequest: {
          async_stop: false, // Wait for recording to complete
        },
      }
    );

    // Extract the recording file information
    const fileList = response.data.serverResponse?.fileList || [];

    if (fileList.length === 0) {
      throw new Error('No recording files found in the response');
    }

    // Find the MP4 file (preferred for downloading/transcription)
    const mp4File = fileList.find((file: any) =>
      file.fileName.endsWith('.mp4')
    );
    const recordingFile = mp4File || fileList[0]; // Fallback to first file if no MP4

    // Construct the full URL to the recording file
    // Format: https://{bucket}.s3.{region}.amazonaws.com/{fileNamePrefix[0]}/{fileNamePrefix[1]}/{fileName}
    const AWS_REGION_BY_CODE: Record<number, string> = {
      0: 'us-east-1',
      1: 'us-east-2',
      2: 'us-west-1',
      3: 'us-west-2',
      4: 'eu-west-1',
      5: 'ap-southeast-1',
    };

    const regionStr =
      AWS_REGION_BY_CODE[env.AGORA_STORAGE_REGION] ?? 'us-east-1';
    const baseUrl = `https://${env.AGORA_STORAGE_BUCKET}.s3.${regionStr}.amazonaws.com`;
    const recordingUrl = `${baseUrl}/${recordingFile.fileName}`;

    console.log(`✅ Recording stopped successfully. File URL: ${recordingUrl}`);

    return recordingUrl;
  } catch (error: any) {
    console.error('❌ Failed to stop Agora recording:', {
      resourceId,
      sid,
      channel: channelName,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      `Failed to stop recording: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Query the status of a Cloud Recording session
 * Useful for monitoring ongoing recordings
 *
 * @param resourceId - Resource ID from acquireResource()
 * @param sid - Session ID from startRecording()
 * @returns Promise<any> - Recording status information
 */
export async function queryRecording(
  resourceId: string,
  sid: string
): Promise<any> {
  try {
    console.log(`📊 Querying Agora recording status for SID: ${sid}`);

    const response = await agoraApi.get(
      `/${env.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`
    );

    console.log(`✅ Recording status retrieved:`, response.data);

    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to query Agora recording:', {
      resourceId,
      sid,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error(
      `Failed to query recording: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Helper function to check if recording environment is properly configured
 * @returns boolean - True if all required environment variables are set
 */
export function isRecordingConfigured(): boolean {
  const requiredStringVars = [
    env.AGORA_CUSTOMER_ID,
    env.AGORA_CUSTOMER_SECRET,
    env.AGORA_STORAGE_BUCKET,
    env.AGORA_STORAGE_ACCESS_KEY,
    env.AGORA_STORAGE_SECRET_KEY,
  ];

  const stringVarsConfigured = requiredStringVars.every(
    variable => variable && variable.trim().length > 0
  );
  const regionConfigured =
    typeof env.AGORA_STORAGE_REGION === 'number' &&
    env.AGORA_STORAGE_REGION >= 0;

  return stringVarsConfigured && regionConfigured;
}
