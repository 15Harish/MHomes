# Static guest reviews

Updated 11 October 2026. Google Places review fetching has been removed.

The five reviews supplied in screenshots are stored in src/lib/guest-reviews.ts. Edit that file to update the reviewer names, ratings and text. Relative dates were omitted because these snapshots do not update automatically. Avatar initials are used; no reviewer photo downloads are needed.

The homepage renders this content directly, without calling /api/reviews. The existing /api/reviews endpoint returns the same static data for compatibility, with source="static" and the existing response fields. It makes no outbound requests. Other API routes are unchanged.

The moving cards, full-review dialog, and View all reviews Google Travel link remain. The frontend viewing destination is src/lib/google-review-links.ts. No live-data or relevance-order claims are shown for static content.

Google Places API calls for this feature: **zero per month**, regardless of visitors or device. There is no cooldown or Google review cache. GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, GOOGLE_REVIEWS_ENABLED and GOOGLE_REVIEWS_MIN_INTERVAL_SECONDS are no longer used by this integration. You can remove those variables from Vercel if no other project uses them. NEXT_PUBLIC_GOOGLE_BUSINESS_URL no longer controls these viewing links. Redeploy to activate the change in production.

Checks: node scripts/check-reviews.cjs verifies static content, repeated requests with no outbound fetches, and the unrelated rooms route. node scripts/check-reviews-ui.cjs verifies all five reviews, no review/API calls, dialog text, reloads, the Google viewing link and no overflow at mobile/desktop widths.
