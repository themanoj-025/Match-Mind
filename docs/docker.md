# Match-Mind — Docker Guide

## Quick start

```bash
cp .env.example .env
docker compose up -d
```

Starts PostgreSQL (`:5432`), Redis (`:6379`), and the Node/TypeScript
backend (`:3001`). The backend image is built from `backend/Dockerfile`
(multi-stage, non-root `nodejs` user).

## Services

| Service    | Purpose           | Port   |
| ---------- | ----------------- | ------ |
| `postgres` | Relational DB     | `5432` |
| `redis`    | Cache / queue     | `6379` |
| `app`      | Node API (Prisma) | `3001` |

## Environment

Key vars: `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB`,
`DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `PORT`.

## Tests

```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit
```

## Troubleshooting

| Symptom             | Fix                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| API crash-loops     | DB/Redis must be healthy first (`depends_on: service_healthy`); check `docker compose logs app` |
| Prisma schema drift | Run migrations before starting the app                                                          |
| Port conflicts      | Adjust `ports` per service                                                                      |
