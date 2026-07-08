# Deep Functional Review

Date: 2026-07-08
Scope: Parawa clickable prototype at `http://localhost:3300`

## Review Method

- Reviewed primary routes: landing, login, discover, provider profile, bookings, messages, provider dashboard, admin bookings.
- Checked current code paths for mock data, dead controls, role routing, and Firebase integration gaps.
- Verified Firebase inventory separately: Firestore has real `users`, `services`, `bookings`, `reviews`, `provider-slots`, `enterprise`, and `punctuality_evalution`; the local app now has a read-only adapter with mock fallback.

## Findings Fixed

1. Discover search and category filters were static.
   - Fix: Added a client-side discover experience with real filtering, result count, reset, and empty state.

2. Chat input looked functional but did not send anything.
   - Fix: Added local message sending with an immediate demo provider reply.

3. Booking confirmation jumped to reservations without feedback.
   - Fix: Added a confirmation state explaining what will happen once Firebase writes are enabled.

4. Completed booking review action was decorative.
   - Fix: Added a review modal with star selection, comment field, and submitted state.

5. Landing and login account CTAs implied a real signup route that does not exist.
   - Fix: Retargeted copy and links to role-based demo login.

6. Admin booking detail action was decorative.
   - Fix: Added a booking detail modal.

7. Chat lacked product context.
   - Fix: Added conversation metadata, provider avatar, booking status, booking context card, quick replies, sent/read-style metadata, attachment affordance, and direct links to booking/provider.

8. Booking detail was missing as a first-class screen.
   - Fix: Added `/bookings/[id]` with status timeline, payment, location, notes, summary, provider link, chat link, and review action.

9. Mobile and Firebase-sized data needed stronger layout tolerance.
   - Fix: Added mobile card views for admin bookings/providers/users, horizontal scroll rails for dense navigation/filter groups, safe wrapping for provider names, services, notes, addresses, emails, booking IDs, and chat messages, plus full-width mobile action rows for booking, provider, chat, review, and admin controls.

10. Desktop tables were doing too much work on phones.
    - Fix: Kept desktop tables for admin density, but hid them on mobile behind readable cards and gave tables a stable minimum width for larger screens.

11. Firebase records needed to fit the existing UI models.
    - Fix: Added a read-only Firestore adapter for users, providers, services, bookings, reviews, provider slots, admin summaries, derived booking chats, and provider profile images with safe mock fallback.

12. Live Firebase placeholders and high-volume bookings needed safer UI handling.
    - Fix: Normalized placeholder names/policies, mapped provider service categories for filtering, replaced provider-dashboard demo fallbacks with empty states for live data, capped the client bookings first view to 24 items with total count, and promoted detail-page titles to `h1`.

13. Role sessions did not carry a stable demo identity.
    - Fix: Added a secondary mock identity cookie selected from Firebase-derived booking/provider data, then used it to filter client bookings, booking detail, client chats, and the provider dashboard.

14. Admin and discover list surfaces could over-render Firebase-sized datasets.
    - Fix: Added full admin booking rows plus bounded first pages, totals, hidden-count notices, wrapping cells, and empty states for admin bookings, providers, users, verifications, and discover results.

15. Admin first-page lists needed real controls.
    - Fix: Added query-param search, filters, reset, and pagination for admin bookings, providers, and users so large Firebase collections can be navigated without leaving the current surface.

16. Client reservations still used a capped first page.
    - Fix: Added query-param search, status filter, reset, pagination, and filtered empty states on `/bookings` so large Firebase booking sets can fit the client UI.

## Remaining Functional Gaps

1. Firebase Auth is not connected to real sessions.
   - Current behavior: role cookie demo with a Firebase-derived example identity cookie.
   - Needed: Firebase Auth sign-in, role claims/profile lookup, protected routes based on real user identity.

2. Writes are not persisted.
   - Current behavior: booking, review, and message states are local demo flows.
   - Needed: create booking, update booking status, create review, and create chat/message records.

3. Client booking ownership is not filtered by authenticated identity.
   - Current behavior: `/bookings`, booking detail, and client chats filter by a selected demo identity cookie, not a real Firebase Auth user.
   - Needed: filter bookings by authenticated client and add status/date pagination.

4. Messaging schema is unclear.
   - Current Firebase inventory did not show a clear messages collection.
   - Needed: decide whether to add `threads`/`messages` collections or reuse an existing source not yet identified.

5. Provider dashboard uses read-derived metrics but not operational writes.
   - Current behavior: when Firebase env is configured, dashboard metrics come from normalized bookings/providers; otherwise it falls back to demo data.
   - Needed: accept/reject booking writes, availability edits, and provider profile updates.

6. Storage assets are only partially rendered.
   - Current Firebase Storage has provider/service assets.
   - Needed: validate service/user image paths, render available profile images, and decide whether private assets need signed URLs.

7. Firebase data adapters are read-only.
   - Current behavior: UI can normalize Firestore `users`, `services`, `bookings`, `reviews`, and `provider-slots` when a service account env is configured, then falls back to local mock data.
   - Needed: validate the normalized fields against more real records and add write paths per workflow.

8. Admin list controls are still client-side over normalized reads.
   - Current behavior: large Firebase collections support query-param search, filters, and pagination after the read-only adapter normalizes records.
   - Needed: backend/server-query pagination and sorting once Firebase Auth and Firestore rules are in place.

9. Client booking controls are still client-side over normalized reads.
   - Current behavior: `/bookings` filters and paginates after the read-only adapter normalizes the selected demo user's reservations.
   - Needed: authenticated Firestore queries by client, status, and date once Firebase Auth is connected.

## Responsive/Data-Fit Checks

- `next build` passed with the bundled Node runtime.
- `tsc --noEmit` passed.
- `git diff --check` passed.
- Browser viewport check at `390x844` found no page-level horizontal overflow on `/discover`, `/providers/maria-nails`, `/bookings`, `/bookings/b1`, `/messages/maria-nails`, `/provider`, `/admin/users`, and `/admin/bookings`.
- Intentional horizontal overflow remains only inside scroll rails for mobile category/admin navigation.
- Live Firebase viewport check at `390x844` found no page-level horizontal overflow on `/discover`, `/bookings`, `/messages`, `/provider`, `/admin/bookings`, `/admin/providers`, and `/admin/users`.
- Live Firebase desktop check at `1280x900` found no page-level horizontal overflow on `/discover`, a live `/providers/[id]`, `/bookings`, a live `/bookings/[id]`, `/provider`, `/admin`, `/admin/bookings`, `/admin/providers`, `/admin/users`, and `/admin/verifications`.
- Normal production build and read-only Firebase-env production build passed.
- Latest data-volume smoke check found no page-level horizontal overflow at
  `390x844` on `/admin/bookings`, `/admin/providers`, `/admin/users`,
  `/admin/verifications`, and `/discover`; it also found no page-level
  horizontal overflow at `1280x900` on `/admin/bookings`, `/admin/providers`,
  `/admin/users`, and `/discover`.
- Latest admin-control smoke check found search/filter/pagination controls and
  `0` page-level horizontal overflow at `390x844` and `1280x900` on filtered
  bookings, providers, and users URLs; it also verified a no-result filtered
  users empty state.
- Latest client booking-control smoke check found search/filter/pagination
  controls and `0` page-level horizontal overflow at `390x844` and `1280x900`
  on filtered, paginated, and no-result `/bookings` URLs.

## Recommended Next Step

Add Firebase Auth and real role identity next, then filter client/provider data by the authenticated user before adding writes: provider accept/reject, booking creation, review creation, then real messages.
