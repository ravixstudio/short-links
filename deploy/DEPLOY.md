# Deployment checklist for go.innoventry.in

## DNS

1. Create an `A` or `CNAME` record:
   - Host: `go`
   - Target: load balancer or server public IP

## TLS

Use Let's Encrypt or your existing wildcard cert for `*.innoventry.in`.

## Reverse proxy

Apply [`nginx-go.innoventry.in.conf`](./nginx-go.innoventry.in.conf).

## Docker (single host)

```bash
cp .env.example .env
# edit API_KEY, IP_HASH_SALT, SHORT_LINK_BASE_URL
docker compose up -d --build
```

## Health check

```bash
curl https://go.innoventry.in/health
```

## Innoventry server

Set in `WEB-INF/config.properties`:

```properties
SHORT_LINK_SERVICE_URL=http://127.0.0.1:8002
SHORT_LINK_API_KEY=<same-as-service-API_KEY>
```

Public shortened URLs will still use `SHORT_LINK_BASE_URL` from the service env (`https://go.innoventry.in`).
