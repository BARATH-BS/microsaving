# docker build -t blk-hacking-ind-barath-bs .

# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
# Using node:22-alpine as the base image.
# Selection criteria:
#   - Alpine Linux: minimal footprint (~5 MB base), reduced attack surface,
#     and faster pulls compared to Debian/Ubuntu-based images.
#   - Node 22 LTS: matches the project's TypeScript/NestJS requirements and
#     provides long-term support with security patches.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching.
# If package files haven't changed, npm ci is skipped on rebuild.
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed to compile TS)
RUN npm ci

# Copy the application source and project config files
COPY tsconfig*.json nest-cli.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript (output → dist/)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────
# Re-use the same slim Alpine base; only production artefacts are copied,
# keeping the final image lean and free of dev tooling.
FROM node:22-alpine AS production

WORKDIR /app

# Copy dependency manifests and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from the build stage
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 5477

# Set NODE_ENV for runtime optimisations
ENV NODE_ENV=production
ENV PORT=5477

# Start the compiled NestJS application
CMD ["node", "dist/main"]
