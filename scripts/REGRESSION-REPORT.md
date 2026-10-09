# MHOMES redesign regression audit

Date: 8 October 2026

## Scope and baseline

Compared the public original at https://www.mhomes.co.in/ with the redesigned local site and reviewed the reservation changes against the repository baseline. The redesigned section order, removal of the enquiry form, photo-free reviews, conditional live-review access, and new loader are intentional changes requested by the owner; they are not parity failures.

## Fixes made

- Normalized the API base URL so deployments without NEXT_PUBLIC_API_URL do not request `/api/api/...`. Existing origin-based configuration still works.
- Moved the booking-disabled return after React hooks and cleaned up its redirect timer.
- Reset applied coupons on a successful new availability search, avoiding discounts carried over from another selection.
- Validated reservation query dates, room type, and room count; malformed links no longer display invalid dates or invalid room options.
- Added 15-second timeouts to review and coupon fetches so stalled requests can recover.
- Fixed the 320px calendar overflow and capped calendar/select portal height for short screens.
- Added an accessible mobile-menu name/state and scrolling on short screens.
- Corrected a stray character in the displayed resort address and removed an unnecessary TypeScript suppression.

## Automated coverage

- Homepage room photo controls, amenities dialog, room-specific booking links, and hero search query handoff.
- Live versus fallback review access, direct fallback-route redirect, and failed review requests.
- Availability success, substitution fixture, unavailable result, and server error; loader release and scroll restoration.
- Required guest fields, CAPTCHA gating, coupon apply/remove/rejection.
- Mocked payment success, verification failure, cancellation and timeout, including the confirmation/error screens.
- Booking reminder Continue/Leave and browser Back preserving the entered form.
- Booking/payment request method, path and payload checks using synthetic guest data.
- All five public pages at 320x740, 390x844, 768x1024, 844x390, 1024x768 and 1440x900. Checked page overflow, mobile menu navigation and calendar bounds.
- Initial loader and slow request loader in normal and reduced motion: full cycles, failed-request exit, inert removal and scroll unlock.
- Actual local endpoints reject empty input with HTTP 400 before database/payment work: online bookings, coupon validation, payment order creation, verification and expiry.
- Production Next.js build and TypeScript validation passed. Targeted ESLint passed with warnings (primarily existing unused declarations and unoptimized loader image elements). The build reports the existing middleware-to-proxy deprecation.

## How to repeat

Start the local application, then run:

```powershell
node scripts/regression.cjs
node scripts/regression-responsive.cjs
node scripts/regression-loader.cjs
node scripts/regression-api.cjs
node ./node_modules/next/dist/bin/next build
```

Browser scripts accept PLAYWRIGHT_MODULE and CHROME_PATH for another machine. Defaults use the existing locally installed Playwright/Chromium. Workflow tests optionally accept TEST_BASE_URL. API validation intentionally targets localhost only. Results are written under `.next/regression/`.

## Limits

Browser execution was headless Chromium, not physical iOS Safari/Android devices. Booking and payment workflow requests were intercepted; CAPTCHA and Razorpay were simulated. No real reservations, charges, emails, or database records were created. Actual inventory accuracy, live payment settlement, webhook processing, confirmation-email delivery and third-party outages require a separate integration run with a test database and Razorpay test-mode credentials. This is a redesign regression audit, not a security or load-test certification.
