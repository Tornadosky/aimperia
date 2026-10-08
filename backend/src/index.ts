import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rawBody from 'body-parser';
import { WebSocketServer } from 'ws';
import url from 'url';
import crypto from 'crypto';
import { env } from './env.js';
import authRoutes from './routes/auth.js';
import lessonRoutes from './routes/lessons.js';
import profileRoutes from './routes/profile.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import { storeAsset, getPublicAssetUrl } from './services/assets.supabase.js';
import { makeOrLoadRoom } from './services/rooms.supabase.js';
import { unfurl } from './services/unfurl.js';

import * as presence from './services/presence.js';

// Create Express application
const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false, // Allow embedding
  })
);

// CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins for simplicity
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for transcripts
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware (before auth middleware)
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  // Log request (excluding sensitive data)
  const logData = {
    method: req.method,
    url: req.url,
    //ip: req.ip,
    //userAgent: req.get('User-Agent'),
    //timestamp: new Date().toISOString(),
  };

  // Don't log raw transcript content for security
  if (req.url.includes('/close') && req.body?.rawTranscript) {
    console.log('Request:', {
      ...logData,
      body: { ...req.body, rawTranscript: '[REDACTED]' },
    });
  } else {
    console.log('Request:', logData);
  }

  // Log response time
  res.on('finish', () => {
    console.log('Response:', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      //duration: `${Date.now() - start}ms`,
    });
  });

  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'AimperiaEd Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// File upload endpoints - handle raw binary data for Supabase storage
// PUT /uploads/:id  (raw binary)
app.put('/uploads/:id', rawBody.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate that we have data to upload
    if (!req.body || !(req.body as Buffer).length) {
      return res.status(400).json({ ok: false, error: 'No file data' });
    }
    
    // Store the asset in Supabase Storage
    await storeAsset(id, req.body as Buffer);
    
    console.log(`✅ Asset stored in Supabase Storage: ${id}`);
    const publicUrl = await getPublicAssetUrl(id, 365 * 24 * 60 * 60)
    return res.json({ ok: true, url: publicUrl })  
  } catch (e) {
    console.error('Asset storage error:', e);
    return res.status(500).json({ ok: false });
  }
});

// GET /uploads/:id - redirect to Supabase signed URL
app.get('/uploads/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    // Generate a short-lived signed URL (1 minute is plenty for a redirect)
    const signedUrl = await getPublicAssetUrl(id, 60); // 60 seconds
    
    console.log(`🔗 Redirecting to Supabase signed URL for asset: ${id}`);
    res.redirect(302, signedUrl);
  } catch (error) {
    console.error(`❌ Failed to generate signed URL for asset ${id}:`, error);
    res.status(404).send('Asset not found');
  }
});

// URL unfurling endpoint - extract metadata from URLs for rich link previews
app.get('/unfurl', async (req, res) => {
  try {
    const url = req.query['url'] as string;
    
    if (!url) {
      return res.status(400).json({ 
        error: 'Missing url parameter' 
      });
    }

    // Call the unfurl service to extract URL metadata
    const result = await unfurl(url);
    
    console.log(`🔗 URL unfurled: ${url}`);
    return res.json(result);
  } catch (error) {
    console.error('Unfurl error:', error);
    return res.status(500).json({ 
      error: 'Failed to unfurl URL' 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.issues,
      });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    // Handle Supabase errors
    if (err.code && err.code.startsWith('PGRST')) {
      return res.status(500).json({
        error: 'Database error',
        code: 'DATABASE_ERROR',
      });
    }

    // Default error response
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(env.NODE_ENV === 'development' && { details: err.message }),
    });
  }
);

// Start server
const PORT = env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// WebSocket server for tldraw collaboration
// Don't specify a path - we'll handle path validation in the connection handler
const wss = new WebSocketServer({
  server,
});


// Handle WebSocket connections
wss.on('connection', async (ws, req) => {
  console.log('🔌 WS attempt');
  const { pathname, query } = url.parse(req.url || '', true);

  // validate /connect/:roomId
  if (!pathname?.startsWith('/connect/')) {
    ws.close(1008, 'bad path');
    return;
  }
  const [, , roomId] = pathname.split('/');
  if (!roomId) {
    ws.close(1008, 'missing room ID');
    return;
  }

  const sessionId =
    (query?.['sessionId'] as string) || crypto.randomUUID();

  // 1⃣  Collect messages that arrive while the room is loading
  const queued: Buffer[] = [];
  const queueListener = (data: Buffer) => queued.push(data);
  ws.on('message', queueListener);

  // 2⃣  Load (or create) the room and hand over the socket
  const room = await makeOrLoadRoom(roomId);
  room.handleSocketConnect({ sessionId, socket: ws as any });

  // Defense in depth: track lesson for auto-close if it's not already tracked
  await presence.trackLesson(roomId);
  
  // Clear any idle timer when a user joins the whiteboard
  await presence.onJoin(roomId);
  console.log(`[presence] User joined whiteboard for lesson ${roomId}`);

  // 3⃣  Stop buffering and replay the queued frames *through the socket*
  ws.off('message', queueListener);
  for (const frame of queued) {
    ws.emit('message', frame);          // TLSocketRoom’s listener receives these
  }

  // 4⃣  House‑keeping and presence management
  ws.on('close', async () => {
    room.handleSocketClose(sessionId);
    await presence.onLeave(roomId);
    console.log(`[presence] User left whiteboard for lesson ${roomId}`);
  });
  
  ws.on('error', (err) => console.error('ws err', err));

  console.log('✅ WS connected', { roomId, sessionId });
});

console.log(
  `🔌 WebSocket server running on ws://localhost:${PORT}/connect/{roomId}`
);
console.log(`🎨 tldraw collaboration ready!`);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
