# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (starts Next.js dev server on localhost:3000)
- **Production build**: `npm run build` 
- **Production server**: `npm run start`
- **Linting**: `npm run lint` (ESLint with Next.js config)

## Architecture Overview

This is a Next.js 14 application for **AImperia**, an educational platform that combines video conferencing with collaborative whiteboards and AI-powered note generation.

### Core Technologies
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: CSS Modules with Ant Design components
- **Internationalization**: next-intl (English/Russian support)
- **Drawing**: TLDraw with sync capabilities
- **Video**: Agora RTC, Zoom SDK integration
- **State Management**: React Context (AuthContext)

### Key Architecture Patterns

**Route Structure (App Router)**:
- `app/(landing)/` - Marketing landing page (route group)
- `app/(auth)/signin|signup/` - Authentication pages (route group)  
- `app/home/` - Main dashboard with lesson management
- `app/meeting/[lessonId]/` - Live lesson interface with video + whiteboard
- `app/callback/` - OAuth callback handler

**Component Organization**:
- Page components in respective `app/` directories
- Shared components in `/components` directory
- Each component has co-located CSS modules (`.module.css`)
- Utility functions in `app/lib/` (auth.js, lessons.js, tldrawAPI.js, etc.)

**State Management**:
- Authentication state managed via `AuthContext` 
- Lesson data fetched and managed locally in components
- TLDraw whiteboard state synced via `@tldraw/sync`

**API Integration**:
- Backend API calls through fetch with credentials
- API base URL configured via `NEXT_PUBLIC_API_BASE_URL` environment variable
- Consistent error handling and loading states

### Internationalization Setup
- Messages stored in `/messages/en.json` and `/messages/ru.json`
- Locale detection via `accept-language` header in `i18n/request.ts`
- Components use `useTranslations()` hook from next-intl

### Key Lesson Management Features
- Teachers can create/end lessons with invite codes
- Students join lessons via invite codes  
- Real-time collaborative whiteboard during lessons
- AI-generated lesson summaries and notes
- Lesson states: upcoming, ongoing, completed

## Important Development Notes

- Uses `.js` extension for some utility files (auth.js, lessons.js) mixed with `.tsx/.ts`
- Whiteboard functionality relies heavily on TLDraw with custom sync implementation
- Video functionality supports both Agora and Zoom integrations
- All user-facing text should use translation keys, not hardcoded strings
- CSS Modules pattern used consistently with BEM-like naming
- API calls include `credentials: 'include'` for cookie-based authentication
- Loading states and error handling implemented throughout