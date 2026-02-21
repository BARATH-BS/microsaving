# Microsaving Setup Guide

This guide explains how to run the Microsaving NestJS service locally and via Docker. It also covers tests, linting, and the API routes.

## Prerequisites
- Node.js 18+ (recommended 22) and npm
- Docker and Docker Compose (for containerized setup)
- Git

## Manual Setup
1. Clone and install:
   - `git clone <repo-url>`
   - `cd microsaving`
   - `npm ci`
2. Run in development:
   - `npm run start:dev`
   - The app listens on `PORT` (default `5477`)
3. Run in production locally:
   - `npm run build`
   - `npm run start:prod`
4. Base URL prefix:
   - All HTTP routes are served under: `/blackrock/challenge/v1`
   - Example: `http://localhost:5477/blackrock/challenge/v1/performance`

## Docker Setup
Using Docker Compose (preferred):
1. Ensure Docker is running.
2. From the project root:
   - `docker compose up -d`
3. The service will be available at:
   - `http://localhost:5477/blackrock/challenge/v1`
4. Helpful commands:
   - View logs: `docker compose logs -f`
   - Stop and remove: `docker compose down`

Using plain Docker (optional):
1. Build: `docker build -t blk-hacking-ind-barath-bs .`
2. Run:
   - `docker run --name blk-hacking-ind-barath-bs -p 5477:5477 -e PORT=5477 -e NODE_ENV=production -d blk-hacking-ind-barath-bs`

## API Overview
All endpoints are prefixed with `/blackrock/challenge/v1`.

- `GET /` → Hello World
- `GET /performance`
- `POST /transactions/parse` (expects an array of `{ date, amount }`)
- `POST /transactions/validator`
- `POST /transactions/filter`
- `POST /returns/nps`
- `POST /returns/index`

Example request (returns):
```bash
curl -X POST http://localhost:5477/blackrock/challenge/v1/returns/nps \
  -H "Content-Type: application/json" \
  -d @payload.json
```

## Testing
The repository uses Jest with e2e tests in the `test` folder.
- Run all e2e tests:
  - `npm test`
  - Or: `node node_modules/jest/bin/jest.js --config ./test/jest-e2e.json --coverage`
- On Windows PowerShell, if npm scripts are blocked, prefer the direct `node ... jest.js` form above.

## Linting and Formatting
- Lint TypeScript: `npm run lint`
- Format code: `npm run format`
- Typecheck (no emit): `node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit`

## Environment Variables
- `PORT` (default: `5477`)
- In Docker Compose, `PORT` is set to `5477` and mapped to the host.

## Troubleshooting
- Healthcheck failing in Docker:
  - Ensure port `5477` is free and Docker Desktop is running.
  - Check logs: `docker compose logs -f`
- PowerShell blocks npm:
  - Use direct Node commands (see Testing).
- Validation errors:
  - Endpoints use a global `ValidationPipe` with `transform` and `whitelist`; ensure payloads match expected DTOs.
