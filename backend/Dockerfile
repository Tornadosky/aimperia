###############################################################################
# ⛏ 1)  Build stage – compile TypeScript into dist/
###############################################################################
FROM node:20-alpine AS build

# Create app folder
WORKDIR /app

# ① Copy lock & manifest first so “npm ci” can be cached
COPY package.json package-lock.json* ./

# ② Install all deps (including dev)
RUN npm ci

# ③ Copy *all* source files *after* deps are installed
COPY . .

# ④ Compile TS ➜ JS   (adjust if you use “pnpm build” etc.)
RUN npm run build       # produces dist/ and declaration maps

###############################################################################
# 🚀 2)  Runtime stage – slim image with prod deps only
###############################################################################
FROM node:20-alpine AS runtime

WORKDIR /app

# ① Copy manifest again and install ONLY prod deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev   # same as: npm ci --production

# ② Copy the compiled output from the build stage
COPY --from=build /app/dist ./dist

# ③ (optional) copy any static assets your app expects at runtime
# COPY --from=build /app/public ./public

###############################################################################
# 🔐 3)  Harden container
###############################################################################
# Create non-root user
RUN addgroup -g 1001 -S nodejs \
 && adduser  -S      -u 1001 nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

ENV NODE_ENV=production
EXPOSE 4000

###############################################################################
# 🏥 4)  Health-check
###############################################################################
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:4000/health', r=>process.exit(r.statusCode==200?0:1)).on('error',()=>process.exit(1))"

###############################################################################
# ▶️ 5)  Start command
###############################################################################
CMD ["node", "dist/index.js"]
