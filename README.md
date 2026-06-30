# Short-Link Service (Ravix Studio)

Standalone URL shortener replacing Bitly for Ravix Studio document sharing.

## Quick start (local)

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run dev
```

Create a link:

```bash
curl -s -X POST http://localhost:8002/v1/links \
  -H "Authorization: Bearer change-me-in-production" \
  -H "Content-Type: application/json" \
  -d '{"long_url":"https://innoventry.in/rest/public/base/FileSharingService/getDocument?companyid=1&fileToDownload=test.pdf"}'
```

Redirect:

```bash
curl -I http://localhost:8002/{slug}
```

## Production deploy

1. Set env vars from `.env.example` (strong `API_KEY` and `IP_HASH_SALT`).
2. `docker compose up -d` or deploy the Docker image to ECS/VM.
3. Configure DNS: `go.innoventry.in` -> load balancer/server.
4. Apply nginx config in `deploy/nginx-go.innoventry.in.conf` with TLS.
5. Point Innoventry `SHORT_LINK_SERVICE_URL` to internal create endpoint; public links use `SHORT_LINK_BASE_URL`.

## Innoventry Java config

```properties
SHORT_LINK_SERVICE_URL=http://short-links:8002
SHORT_LINK_API_KEY=<same-as-API_KEY>
```

Returned links use `SHORT_LINK_BASE_URL` (`https://go.innoventry.in/{slug}`).

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/links` | Bearer token | Create short link (Bitly v4 compatible `link` field) |
| GET | `/{slug}` | Public | 302 redirect + analytics counters |
| GET | `/health` | Public | Health check |

## Analytics fields

`short_links` tracks `click_count`, `first_accessed_at`, `last_accessed_at`, `last_referrer`, `last_user_agent`, `last_ip_hash`, `unique_visitor_count`, plus optional `source`, `created_by`, and `metadata` JSON.
