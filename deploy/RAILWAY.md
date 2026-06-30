# Deploy on Railway

Railway is a good fit for this service: managed Postgres, HTTPS, custom domains, and deploy-from-GitHub.

## 1. Create project

1. Open [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select `ravixstudio/short-links`
3. Railway detects `railway.toml` and builds with the Dockerfile

## 2. Add Postgres

1. In the project → **+ New** → **Database** → **PostgreSQL**
2. Open the **short-links** service → **Variables** → **Add reference**
3. Add `DATABASE_URL` from the Postgres service (`${{Postgres.DATABASE_URL}}`)

Railway’s Postgres URL works with SSL; the app enables SSL automatically for non-local hosts in production.

## 3. Set required variables

On the **short-links** service:

| Variable | Example | Notes |
|----------|---------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Reference from Postgres plugin |
| `SHORT_LINK_BASE_URL` | `https://go.innoventry.in` | Public URL shown in shortened links |
| `API_KEY` | long random secret | Same value goes in Innoventry `SHORT_LINK_API_KEY` |
| `IP_HASH_SALT` | long random secret | For hashing visitor IPs |
| `NODE_ENV` | `production` | |
| `ALLOWED_TARGET_HOSTS` | `innoventry.in,nucleuserp.in,innoventrysoftware.com` | Optional safety |
| `DEFAULT_TTL_DAYS` | `365` | Optional |

`PORT` is set by Railway automatically — do not override it.

## 4. Custom domain

1. Service → **Settings** → **Networking** → **Custom Domain**
2. Add `go.innoventry.in`
3. Create the CNAME Railway gives you at your DNS provider
4. Set `SHORT_LINK_BASE_URL=https://go.innoventry.in`

## 5. Innoventry config

Use Railway’s **public** URL for create API (or custom domain):

```properties
SHORT_LINK_SERVICE_URL=https://go.innoventry.in
SHORT_LINK_API_KEY=<same-as-API_KEY>
```

Short links returned to users will also use `https://go.innoventry.in/{slug}` via `SHORT_LINK_BASE_URL`.

## 6. Verify

```bash
curl https://go.innoventry.in/health

curl -s -X POST https://go.innoventry.in/v1/links \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"long_url":"https://innoventry.in/rest/public/base/FileSharingService/getDocument?companyid=1&fileToDownload=test.pdf"}'
```

## CLI deploy (optional)

```bash
cd short-links
railway login
railway link
railway add --database postgres
railway variables set SHORT_LINK_BASE_URL=https://go.innoventry.in API_KEY=... IP_HASH_SALT=... NODE_ENV=production
railway up
```

## Notes

- Migrations run on every container start (`node dist/db/migrate.js` in Dockerfile CMD).
- Health check: `GET /health`
- For other clients/projects later, deploy another Railway service or reuse this one with a new `SHORT_LINK_BASE_URL` and API key per tenant.
