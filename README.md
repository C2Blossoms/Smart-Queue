# Smart Queue 🚀

A real-time queue management system built with a robust Monorepo architecture.
Designed for scalability natively supporting Cloud Database deployments (Neon, AWS) and containerized execution (Docker).

## 🏗️ Architecture (Monorepo)

The system is split into four distinct microservices:

- **`queue-api` (Port 3001)**: The core REST API built with Node.js and Express. It connects to **PostgreSQL** to manage ticket states and increments queue numbers automatically using **Redis**.
- **`live-board-api` (Port 3002)**: A standalone WebSocket server using Node.js. It subscribes to Redis Pub/Sub events from `queue-api` and broadcasts real-time queue transitions unconditionally to all connected browser clients.
- **`admin-web` (Port 3000)**: The Staff Dashboard built with Next.js (App Router). Connects to WebSockets to see live queue updates and handles calling/skipping/completing customer tickets.
- **`public-web` (Port 3003)**: The Customer Interface built with Next.js (App Router). Customers can request their queue tickets (selecting Pax) and the page automatically transitions to "It's Your Turn!" in real-time when called by staff.

## 🛠️ Local Development Setup

### 1. Prerequisites

- Docker Desktop (for booting local Postgres and Redis)
- Node.js (v24 recommended for Backend APIs, v20 for Frontend Webs)

### 2. Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Make sure `DATABASE_URL` is filled if you are using an external database like Neon, or leave the defaults if you intend to run databases locally via docker-compose.

### 3. Start Databases (PostgreSQL + Redis)

If you don't have separate Cloud DBs during development, spin them up using Docker Compose:

```bash
docker-compose up -d
```

### 4. Run the applications

Open 4 separate terminal windows (one for each app) and run:

```bash
cd apps/queue-api && npm install && npm run dev
cd apps/live-board-api && npm install && npm run dev
cd apps/admin-web && npm install && npm run dev
cd apps/public-web && npm install && npm run dev
```

## 🐳 Production Deployment (Docker)

All four applications contain their own production-ready `Dockerfile` built on optimal lightweight Alpine images.

**Important Note for Next.js (`admin-web` & `public-web`):**
Next.js compiles runtime environment variables specifically targeting `NEXT_PUBLIC_` _at build time_.
When building your Docker images for the frontends, you **must** supply the production API domain URLs as build arguments:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_WS_URL=wss://ws.yourdomain.com \
  -t smart-queue/public-web .
```

The Backend APIs (`queue-api`, `live-board-api`) do not require build-arguments, as they fetch environment secrets (like `DATABASE_URL` or `REDIS_URL`) gracefully at execution runtime.

## 📝 TechStacks Used

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, WebSockets (ws)
- **Data**: PostgreSQL (pg), Redis, Zod
