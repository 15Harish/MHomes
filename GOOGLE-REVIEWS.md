# Google reviews operations

Reviewed 9 October 2026.

## Policy and implementation

[Google's Places policies](https://developers.google.com/maps/documentation/places/web-service/policies) prohibit storing Places content except permitted exceptions. The [service-specific terms](https://cloud.google.com/maps-platform/terms/maps-service-terms) permit temporary coordinate storage, not a 24-hour review/rating cache. This implementation therefore stores **no settled Google review payload** in a server cache, database, filesystem, browser storage, or CDN. Responses and upstream fetches explicitly use no-store.

Instead, the server retains only a next-attempt timestamp and shares a request while it is in flight. The default interval between attempts is 24 hours. After a response completes, later callers receive the existing fallback reviews during cooldown; they do NOT receive yesterday's Google data. Google responses keep the existing API keys and add author/source links. The UI retains Google's relevance order and provides Google Maps and author attribution. Only live Google responses are labelled Google; fallback content is not attributed to Google. Existing fallback content is preserved; confirm that these are independently obtained, authorized testimonials, not stored Google content. Maintain publicly accessible Terms and Privacy documents incorporating Google's required terms/privacy references before production use.

The homepage fetches once when the section approaches view. There is no polling, focus refresh, or render-triggered refetch. All old review-page links lead to the resort's supplied Google Travel reviews URL for viewing reviews. Edit src/lib/google-review-links.ts to change that public destination. Cards show plain Google Maps attribution; individual source links are inside the full-review dialog. The local /reviews page is removed.

## Limits and monthly calls

**The timestamp is per warm runtime instance, not a global Vercel limit.** Concurrent requests in one instance share one upstream request. Cold starts, deployments, separate regions and scale-out create independent gates. Persistent failures have the same cooldown, with no automatic retries. The application cannot guarantee one request daily across Vercel without a shared atomic metadata store. No additional service/subscription was added.

Illustrations with steady demand: one continuously warm instance makes about 30 attempts in 30 days; five make about 150. One thousand separately cold-started instances can make 1,000 initial attempts. Without actual traffic/instance lifetime metrics a reliable deployment-wide monthly estimate is unavailable; worst-case attempts approach eligible endpoint requests. Requests from scripts/bots to /api/reviews also count. External Google review links make zero Places API requests from this app. Setting GOOGLE_REVIEWS_ENABLED=false makes zero upstream requests.

## Environment configuration

| Variable | Value / scope |
| --- | --- |
| GOOGLE_PLACES_API_KEY | Existing secret; server only, never NEXT_PUBLIC |
| GOOGLE_PLACE_ID | Existing place ID |
| GOOGLE_REVIEWS_MIN_INTERVAL_SECONDS | 86400 default; minimum configurable 60, invalid values use default |
| GOOGLE_REVIEWS_ENABLED | false disables Google calls; otherwise enabled |
| NEXT_PUBLIC_GOOGLE_BUSINESS_URL | Legacy API businessUrl field; frontend viewing links use src/lib/google-review-links.ts |

In Vercel Project Settings > Environment Variables, check all three scopes: Production, Preview, Development. Use production credentials only where intended; recommend GOOGLE_REVIEWS_ENABLED=false in Preview/Development except intentional live tests. Keep Production enabled if live reviews are wanted. Redeploy after changes; public URLs are embedded at build time. Locally use .env/.env.local, never commit credentials. Local key, place ID and public URL presence were verified without printing their values. Remote scopes were not verified: this workspace has no linked Vercel project or authenticated dashboard access. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

## Google Cloud cost controls

1. In the correct project, Google Maps Platform > Quotas (or APIs & Services > Places API (New) > Quotas & System Limits), lower the Place Details request quota to your acceptable rate. Inspect the limits actually offered; do not assume a daily quota exists. The documented limit is per method per project per minute. Set any offered longer-period limit too. A minute limit alone is not a small monthly spending cap. These limits apply across instances and potentially other apps sharing the project. See [Places usage and billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing).
2. Restrict the server key to Places API (New). Browser HTTP-referrer restrictions do not work for server-side requests. Configure application restrictions appropriate to your server egress; do not assume ordinary Vercel deployments have a fixed IP. Keep client keys separate.
3. Billing > Budgets & alerts: create a project-scoped budget, set actual/forecast alert thresholds and monitored recipients. **Budget alerts do not automatically stop charges.** Choose quotas conservatively; use the application kill switch if needed and redeploy. See [Google budget documentation](https://docs.cloud.google.com/billing/docs/how-to/budgets).
4. Monitor API metrics and Vercel logs. Errors log HTTP status, Google status/message, with the key redacted. A 403 may indicate restrictions/configuration/billing; 429 indicates resource/quota exhaustion. Resolve the logged cause, then restart/redeploy or wait for cooldown. Do not repeatedly force diagnostic requests.

## Verification

- node scripts/check-reviews.cjs: mocked mapping, explicit no-store, 20 concurrent callers, repeat/cooldown expiry, invalid key, 403, 429, 500, redacted logging, missing configuration, disabled mode, empty successful response and unrelated rooms endpoint.
- node scripts/check-reviews-ui.cjs: mocked Google data at 390px and 1440px; lazy single fetch, author/source links, dialog, external navigation, overflow and removed route.
- node scripts/check-reviews.cjs --live: intentional live local endpoint check; may return fallback if the instance is already cooling down. This is not evidence of a new Google error. Restart only for an intentional diagnostic; never bypass cooldown in ordinary operation.
- Production build checks compilation and generated routes. No deployment or Google Cloud quota changes are performed by these scripts.

### Verified locally

Production build passed. A fresh production-mode HTTP request to /api/reviews returned 200, source=google, five reviews and private/no-store headers. The immediate repeat returned source=fallback during cooldown. A separate Google diagnostic returned HTTP 200. The development endpoint had returned fallback; that alone does not distinguish a cooldown from a prior transient error. No live Google error is currently reproducible. Mocked error tests verify actual status/message logging. Remote Vercel environments and Google Cloud quotas still require operator verification.
