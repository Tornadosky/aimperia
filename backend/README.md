# AimperiaEd Backend

Modern Ship-Fast backend for AimperiaEd with TypeScript, Express 5, and Supabase.

## Features

- **Authentication** - JWT-based authentication with Supabase
- **Real-time Lessons** - Agora Video SDK integration for live lessons
- **Lesson Recording** - Automatic cloud recording with Agora Cloud Recording
- **Audio Transcription** - Automatic transcription of lesson recordings using OpenAI Whisper
- **Interactive Whiteboards** - tldraw integration for collaborative drawing with Supabase Storage
- **Notes & Summaries** - Lesson notes and AI-generated summaries

## Environment Variables

Copy `env.example` to `.env` and configure the following:

### Required Variables

```bash
# Basic Configuration
NODE_ENV=development
PORT=4000

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Agora Video SDK
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate

# Agora Cloud Recording (for lesson recording)
AGORA_CUSTOMER_ID=your_agora_customer_id
AGORA_CUSTOMER_SECRET=your_agora_customer_secret
AGORA_STORAGE_VENDOR=1
AGORA_STORAGE_REGION=0
AGORA_STORAGE_BUCKET=your_s3_bucket_name
AGORA_STORAGE_ACCESS_KEY=your_aws_access_key
AGORA_STORAGE_SECRET_KEY=your_aws_secret_key

# OpenAI Configuration (for audio transcription)
OPENAI_API_KEY=your_openai_api_key_here
```

## Database Setup

### Required Storage Buckets

Create the following storage buckets in your Supabase project:

1. **lesson-assets** (Public bucket)
   - Used for: Images, PDFs, and other files uploaded to whiteboards
   - Access: Public read access with signed URLs
   - Configuration: Enable public access, no file size limits

2. **board-snapshots** (Public bucket)  
   - Used for: Storing tldraw whiteboard snapshots as JSON files (e.g., `roomId.json`)
   - Access: Private bucket with service role access for read/write
   - Configuration: **Make this bucket private** (only backend service role can access)

To create these buckets:
1. Go to Storage in your Supabase dashboard
2. Create new bucket → "lesson-assets" → Make public
3. Create new bucket → "board-snapshots" → **Keep private** (for snapshots)

## Audio Transcription

The system automatically transcribes lesson recordings using OpenAI Whisper when lessons are closed.

### Automatic Transcription
- When a lesson is closed with a `recording_url`, transcription starts automatically
- Transcripts are saved as `app_lesson_note` records with `note_type='transcript'`
- Fire-and-forget implementation doesn't block lesson closure

### Manual Transcription
- **POST** `/api/lessons/:id/transcribe` - Manually trigger transcription
- Requires teacher authentication and lesson access
- Supports `force` parameter to overwrite existing transcripts
- Idempotent: won't re-transcribe unless `force: true`

### Features
- **Streaming downloads** - Efficiently handles large audio files
- **Retry logic** - Exponential backoff for both downloads and API calls
- **Error handling** - Comprehensive error handling and logging
- **Security** - Never logs transcript content, only metadata

## API Endpoints

### Lessons
- **GET** `/api/lessons` - Get all lessons for current user
- **POST** `/api/lessons` - Create a new lesson (teacher only)
- **GET** `/api/lessons/:id` - Get lesson details
- **PUT** `/api/lessons/:id` - Update lesson (teacher only)
- **POST** `/api/lessons/:id/close` - Close lesson with recording (teacher only)
- **POST** `/api/lessons/:id/transcribe` - Manually transcribe lesson (teacher only)
- **POST** `/api/lessons/join` - Join lesson by invite code (student only)
- **GET** `/api/lessons/:id/participants` - Get participant roster with names for Agora calls

### Whiteboard Assets
- **PUT** `/uploads/:id` - Upload asset (returns `{ok: true, url: "/uploads/:id"}`)
- **GET** `/uploads/:id` - Redirect to Supabase signed URL (1-minute TTL)
- **WS** `/connect/:roomId?token=jwt&sessionId=id` - WebSocket for tldraw collaboration

### Authentication
- **POST** `/api/auth/login` - Login with email/password
- **POST** `/api/auth/signup` - Register new account
- **POST** `/api/auth/refresh` - Refresh JWT token

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```
