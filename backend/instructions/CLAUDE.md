# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start development server with hot reload using tsx
- `npm run build` - Build TypeScript to JavaScript (outputs to `dist/`)
- `npm start` - Start production server from built files
- `npm run lint` - Run ESLint and Prettier checks
- `npm run lint:fix` - Auto-fix linting and formatting issues

### Testing
- `npm test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report (80% threshold required)

## Architecture Overview

### Core Technologies
- **Backend Framework**: Express.js 4 with TypeScript
- **Database**: Supabase (PostgreSQL) with service role authentication
- **Real-time Video**: Agora Video SDK with cloud recording
- **Audio Transcription**: OpenAI Whisper API
- **Interactive Whiteboards**: tldraw with WebSocket collaboration
- **Authentication**: JWT tokens with Supabase auth integration

### Database Schema
The application uses a custom schema with `app_*` prefixed tables:
- `app_user` - User profiles with roles (teacher/student/pending)
- `app_lesson` - Lesson management with Agora integration
- `app_lesson_participant` - Many-to-many lesson participation
- `app_lesson_note` - Transcripts, summaries, and board highlights
- `app_contact_request` - Contact form submissions
- `app_newsletter_subscription` - Email marketing subscriptions

### File Structure
```
src/
├── db/supabase.ts          # Database client and query helpers
├── env.ts                  # Environment validation with Zod
├── index.ts                # Express app setup and WebSocket server
├── middleware/auth.ts      # JWT authentication middleware
├── routes/                 # API route handlers
├── services/               # Business logic and external integrations
├── schemas/                # Zod validation schemas
├── types/                  # TypeScript type definitions
└── utils/jwt.ts           # JWT token utilities
```

### Key Services
- **Agora Services**: Video SDK token generation and cloud recording management
- **Transcription Service**: Audio download and OpenAI Whisper integration
- **Asset Management**: Supabase Storage for lesson assets and whiteboard snapshots
- **Presence Management**: Auto-close idle lessons after 10 minutes
- **WebSocket Server**: Real-time tldraw collaboration at `/connect/:roomId`

### Authentication Flow
1. Users authenticate via Supabase auth (email/password)
2. Backend generates custom JWT tokens with user role
3. Tokens are validated via middleware on protected routes
4. Service role key used for all database operations

### Lesson Recording Workflow
1. Teachers create lessons with generated Agora channels
2. Lessons auto-start recording when participants join
3. Recordings stored in configured S3 bucket via Agora Cloud Recording
4. When lessons close, audio is automatically transcribed via OpenAI
5. Transcripts stored as `app_lesson_note` records with type 'transcript'

### WebSocket Architecture
- WebSocket server runs alongside HTTP server
- Handles tldraw collaboration at `/connect/:roomId?token=jwt&sessionId=id`
- Integrates with presence system for automatic lesson cleanup
- Messages queued during room loading to prevent data loss

## Environment Configuration

Required environment variables (see `env.example`):
- Supabase: URL, service role key, JWT secret
- Agora: App ID, certificate, customer credentials for recording
- AWS S3: Credentials for Agora cloud recording storage
- OpenAI: API key for audio transcription

### Storage Buckets
Create these Supabase storage buckets:
1. `lesson-assets` (public) - Images, PDFs for whiteboards
2. `board-snapshots` (private) - tldraw whiteboard state JSON

## API Endpoints Structure

### Authentication (`/api/auth`)
- POST `/login`, `/signup`, `/refresh` - JWT-based auth

### Lessons (`/api/lessons`) 
- CRUD operations with role-based access control
- Teacher-only: create, update, close lessons
- Special endpoints: `/join` (students), `/transcribe` (manual transcription)

### File Uploads (`/uploads/:id`)
- PUT - Upload raw binary data to Supabase Storage
- GET - Redirect to signed URLs for asset access

### WebSocket (`/connect/:roomId`)
- Real-time tldraw collaboration
- Automatic presence tracking and lesson cleanup

## Development Practices

### Code Style
- Strict TypeScript configuration with comprehensive error checking
- ESLint + Prettier with error on `@typescript-eslint/no-explicit-any`
- File imports use `.js` extensions (ES modules)
- Database operations centralized in `src/db/supabase.ts`

### Error Handling
- Centralized Supabase error handling with context logging
- Global Express error handler for JWT, Zod, and database errors
- Sensitive data (transcripts) never logged

### Testing
- Vitest with 80% coverage thresholds across all metrics
- Test setup file at `tests/setup.ts`
- Coverage excludes entry points and test files

### Security
- Helmet middleware with CSP disabled for API usage
- CORS configured to allow all origins with credentials
- JWT tokens expire and require refresh
- Service role authentication for all database operations
- Asset access via signed URLs with TTL