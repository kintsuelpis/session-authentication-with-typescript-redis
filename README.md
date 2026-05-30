# Session Authentication with TypeScript, Redis, Docker, and Nginx

A learning-focused session authentication project built with Express, TypeScript, MongoDB, and Redis.

This project demonstrates:
- cookie-based session authentication
- non-sticky sessions backed by a centralized Redis session store
- protected routes with Express middleware
- Dockerized app, MongoDB, Redis, and Nginx load balancing

## What This Project Does

- Registers users with validated credentials
- Logs users in with server-side sessions
- Stores session data in Redis instead of the app server memory
- Protects dashboard routes using session cookies
- Uses Nginx to load balance traffic across multiple app instances

## Architecture

- `MongoDB` stores user accounts
- `Redis` stores session data centrally
- `Express` handles auth, middleware, and protected routes
- `Nginx` distributes requests across `app1`, `app2`, and `app3`
- The session cookie is named `sid`

Because the session lives in Redis, any app instance can serve the request. That is what makes this a non-sticky session setup.

## Project Structure

```txt
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  schemas/
  services/
  types/
Dockerfile
docker-compose.yml
nginx.conf
```

## Main API Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /dashboard/user`

The dashboard route is protected and requires the `sid` cookie.

## Environment Variables

Create a `.env` file with values similar to these:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/auth_db
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_TTL_SECONDS=2000
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

## Docker Setup

Run the full stack with:

```bash
docker compose up --build
```

This starts:
- `mongodb`
- `redis`
- `app1`
- `app2`
- `app3`
- `nginx_lb`

### What Runs Where

- App instances listen on container port `8080`
- Nginx listens on host port `80`
- MongoDB is exposed on `27017`
- Redis is exposed on `6379`

## Session Flow

1. User submits login credentials
2. Server validates the user
3. Server creates a Redis session
4. Server sets the `sid` cookie
5. Browser sends the cookie on protected requests
6. Middleware reads the cookie and validates the Redis session
7. Dashboard data is returned only if the session is valid

## Notes

- The app is intentionally built for learning session auth concepts
- Session state is not stored in localStorage
- No JWTs are used
- Sticky sessions are not required because Redis is the shared session store

## Useful Commands

```bash
npm run build
npm start
docker compose up --build
```

