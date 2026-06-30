# Innoventry cutover from Bitly

## What changed in Innoventry

- [`UrlShortnerUtil.java`](../../Innoventry/Innoventry-Software/master/Innoventry/core/in.solpro.nucleus.base.core/src/in/solpro/nucleus/base/core/util/UrlShortnerUtil.java) now calls `shortenUrlInhouse()`
- [`DocumentService.java`](../../Innoventry/Innoventry-Software/master/Innoventry/core/in.solpro.nucleus.base.core/src/in/solpro/nucleus/base/service/core/DocumentService.java) uses the in-house shortener
- [`config.properties`](../../Innoventry/Innoventry-Software/master/Innoventry/webapps/in.solpro.nucleus.webapp.erp/src/main/webapp/WEB-INF/config.properties) uses `SHORT_LINK_*` instead of `BITLY_*`

## Manual verification (production)

1. Deploy short-link service and set DNS for `go.innoventry.in`
2. Set matching `SHORT_LINK_API_KEY` in Innoventry config
3. From Innoventry desktop app, share a document via SMS or WhatsApp
4. Confirm the message contains `https://go.innoventry.in/{slug}`
5. Open the link on a phone and confirm the PDF/document downloads
6. Revoke old Bitly API token

## Rollback

If the service is unavailable, Innoventry automatically falls back to the long URL (same as when Bitly token was missing).
