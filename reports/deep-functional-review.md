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

17. Client messages hid booking-derived threads behind an internal cap.
    - Fix: Removed the derived-thread cap and added query-param search, unread/status filters, reset, pagination, and filtered empty states on `/messages`.

18. Provider dashboard request and service sections still had hidden caps.
    - Fix: Added query-param search, pending/confirmed filters, reset, pagination, and filtered empty states for active provider requests; removed the fixed agenda/service caps and placed long lists in bounded scroll regions with explicit counts.

19. Admin verifications still received only the first eight pending providers.
    - Fix: Removed the adapter cap and added query-param search, missing-service/document filters, reset, pagination, and filtered empty states on `/admin/verifications`.

20. Discover still hid providers behind a first-page cap and Firebase collection reads had default maximum document counts.
    - Fix: Replaced the discover cap with query-param search, category filter, sort, reset, pagination, and filtered empty states; Firebase collection reads now continue through Firestore pagination unless a caller passes an explicit `maxDocs` limit.

21. Provider profiles still normalized only the first twelve Firebase service names.
    - Fix: Removed the adapter service-name cap and added query-param service search, reset, pagination, and no-result empty states on `/providers/[id]`.

22. Booking dialog service selection rendered every provider service as a select option.
    - Fix: Replaced the full service select with a bounded searchable picker, pagination, selected-state controls, filtered empty state, and mobile-safe dialog scrolling.

23. Chat thread detail rendered the full message array at once.
    - Fix: Added a bounded latest-message window, load-earlier control, visible-count copy, mobile-safe quick-reply rail, and richer thread seed data so real Firebase message histories can fit the same surface.

24. Firebase booking services were silently capped during normalization.
    - Fix: Removed the adapter cap, added full service-name metadata, compact service summaries, service-count badges, full-list search matching, bounded detail lists, and provider dashboard service metrics that use the full service array.

25. Firebase provider-slot data was fetched but not surfaced in the provider dashboard.
    - Fix: Added normalized provider availability summaries from `provider-slots`, connected them to the provider profile-health card, and added a bounded provider dashboard availability card with counts, next-slot preview, and explicit empty states for providers without matching slot docs.

26. Firebase `enterprise` and `punctuality_evalution` collections were not represented in the UI.
    - Fix: Added read-only normalization for enterprise records and punctuality evaluations, added admin routes for `/admin/enterprises` and `/admin/quality` with search/filter/pagination/mobile cards, added admin navigation links, and surfaced selected-provider punctuality summaries in the provider dashboard.

27. Firebase service records were reduced to service names in public and admin UI.
    - Fix: Added full service normalization for price, duration, pricing mode, image, category, subcategory, package/product metadata, provider linkage, and descriptions; added `/admin/services` with search/filter/pagination/mobile cards; and upgraded `/providers/[id]` service cards to use the detailed Firebase service records.

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
   - Current behavior: `/messages` derives one thread per provider from the selected demo user's bookings, then supports client-side search, filters, and pagination.
   - Needed: decide whether to add `threads`/`messages` collections or reuse an existing source not yet identified.

5. Provider dashboard uses read-derived metrics but not operational writes.
   - Current behavior: when Firebase env is configured, dashboard metrics come from normalized bookings/providers; active requests support client-side search, filters, and pagination; service and agenda lists render without hidden caps; provider-slot summaries now render in a compact availability card when the selected provider has matching slot docs.
   - Needed: accept/reject booking writes, availability edits, and provider profile updates.

6. Storage assets are only partially rendered.
   - Current Firebase Storage has provider/service assets.
   - Current behavior: provider profile images and normalized service images render where public URLs are available; `/admin/services` and `/providers/[id]` now include service image slots with safe fallbacks.
   - Needed: validate remaining user/service image paths at larger scale and decide whether private assets need signed URLs.

7. Firebase data adapters are read-only.
   - Current behavior: UI can normalize Firestore `users`, `services`, `bookings`, `reviews`, `provider-slots`, `enterprise`, and `punctuality_evalution` when a service account env is configured, then falls back to local mock data. Service records, provider-slot data, enterprise records, and punctuality evaluations now have dedicated or contextual UI surfaces.
   - Needed: validate the normalized fields against more real records and add write paths per workflow.

8. Admin list controls are still client-side over normalized reads.
   - Current behavior: large Firebase collections support query-param search, filters, and pagination after the read-only adapter normalizes records, including bookings, providers, users, and verifications.
   - Needed: backend/server-query pagination and sorting once Firebase Auth and Firestore rules are in place.

9. Client booking controls are still client-side over normalized reads.
   - Current behavior: `/bookings` filters and paginates after the read-only adapter normalizes the selected demo user's reservations.
   - Needed: authenticated Firestore queries by client, status, and date once Firebase Auth is connected.

10. Client message controls are still client-side over derived booking threads.
    - Current behavior: `/messages` filters and paginates after the read-only adapter derives conversations from bookings.
    - Needed: authenticated Firestore queries over real thread/message records once the messaging schema exists.

11. Chat thread messages are still local demo messages.
    - Current behavior: `/messages/[id]` can now fit longer message histories with a bounded latest-message window and load-earlier control, but it does not read or write a Firebase messages collection.
    - Needed: real message collection reads, send-message writes, ordering, unread updates, and authenticated participant checks once the messaging schema exists.

12. Provider request controls are still client-side over normalized reads.
    - Current behavior: `/provider` filters and paginates after the read-only adapter normalizes the selected demo provider's active reservations.
    - Needed: authenticated Firestore queries by provider, status, and date once Firebase Auth and provider write flows are connected.

13. Discover controls are still client-side over normalized provider reads.
    - Current behavior: `/discover` filters, sorts, and paginates after the read-only adapter normalizes all provider records.
    - Needed: Firestore-backed provider search/category/sort pagination once Firebase Auth, indexes, and production query rules are in place.

14. Provider service controls are still client-side over normalized reads.
    - Current behavior: `/providers/[id]` filters and paginates after the read-only adapter normalizes all service names for that provider.
    - Needed: provider-service subqueries or indexed service pagination once Firestore query rules and production indexes are in place.

15. Booking dialog still creates only a local demo reservation.
    - Current behavior: service selection now fits Firebase-sized provider catalogs, but confirmation does not persist a booking.
    - Needed: create Firestore booking writes tied to authenticated client/provider identities.

## Responsive/Data-Fit Checks

- `next build` passed with the bundled Node runtime.
- `tsc --noEmit` passed.
- `git diff --check` passed.
- Browser viewport check at `390x844` found no page-level horizontal overflow on `/discover`, `/providers/maria-nails`, `/bookings`, `/bookings/b1`, `/messages/maria-nails`, `/provider`, `/admin/users`, and `/admin/bookings`.
- Intentional horizontal overflow remains only inside scoped mobile navigation rails where the control itself scrolls.
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
- Latest client message-control smoke check found search/filter/pagination
  controls and `0` page-level horizontal overflow at `390x844` and `1280x900`
  on filtered, paginated, and no-result `/messages` URLs.
- Latest provider request-control smoke check found search/filter/page-clamp
  controls and `0` page-level horizontal overflow at `390x844` and `1280x900`
  on filtered, page-clamped, and no-result `/provider` URLs.
- Latest admin verification-control smoke check found search/filter/page-clamp
  controls and `0` page-level horizontal overflow at `390x844` and `1280x900`
  on filtered, page-clamped, and no-result `/admin/verifications` URLs.
- Latest discover-control smoke check found search/category/sort controls,
  result pagination, filtered empty states, `0` page-level horizontal overflow,
  and no overflowing elements at `390x844` and `1280x900` on `/discover`,
  `/discover?sort=rating&page=1`,
  `/discover?q=zzzz-no-provider&page=99&sort=price-asc`, and page-clamped
  `/discover?page=99`.
- Latest provider-profile service smoke check found service search,
  pagination, filtered empty states, booking/message CTAs, `0` page-level
  horizontal overflow, and no overflowing elements on a live Firebase
  `/providers/[id]` route at `390x844` and `1280x900`.
- Latest booking-dialog smoke check at `390x844` on a live Firebase provider
  found the bounded searchable service picker, selected state, pagination,
  no-result service search, confirmation CTA, mobile-safe dialog scrolling, and
  `0` page-level horizontal overflow. The only offscreen nodes detected were
  Base UI focus sentinels, not visible content.
- Latest chat-thread smoke check on `/messages/[id]` found the bounded
  latest-message window, load-earlier control, visible-count copy, quick
  replies, composer, send-and-demo-reply flow, cleared input after send, and
  `0` page-level horizontal overflow at mobile and desktop viewport overrides.
- Latest booking-service data-fit patch removed the hidden four-service
  normalization cap. Booking cards, booking detail, admin bookings, admin
  dashboard, messages, provider request cards, agenda rows, admin booking
  detail, and provider service metrics now receive compact service summaries
  plus full service-name metadata for search and bounded detail display.
- Browser smoke checks after the booking-service patch passed on `/bookings`,
  `/admin/bookings`, `/admin`, and `/provider` at mobile and desktop viewport
  overrides. All checked routes rendered role-gated content, showed
  service-count badges where available, and reported `0` page-level horizontal
  overflow.
- Provider availability smoke checks passed on `/provider` after provider login
  at `390x844` and `1280x900`: the page rendered `Disponibilidad Firebase`,
  `provider-slots` copy, `Horarios actualizados`, and the selected provider's
  `Sin horarios cargados` state with `0` page-level horizontal overflow and no
  overflowing elements. The selected demo provider was Diego Cruvelier with 13
  reservations, which currently has no matching `provider-slots` summary in the
  rendered dashboard.
- Enterprise and punctuality collection coverage now includes read-only
  Firebase normalization for `enterprise` and `punctuality_evalution`,
  dedicated admin routes, and selected-provider quality summaries. Firebase-env
  production build passed with 16 generated routes, including
  `/admin/enterprises` and `/admin/quality`.
- Browser checks passed on `/admin/enterprises`, `/admin/quality`, and
  `/provider` at `390x844` and `1280x900`: required route copy rendered,
  `pageOverflow` was `0`, and desktop had no overflowing elements. Mobile admin
  checks only reported items inside the intentional horizontal admin nav rail.
- Service collection coverage now includes read-only Firebase normalization for
  price, duration, pricing mode, images, category/subcategory, package/product
  metadata, and provider linkage. Firebase-env production build passed with 17
  generated routes, including `/admin/services`.
- Browser checks passed on `/admin/services`,
  `/admin/services?filter=package&page=1`,
  `/admin/services?q=zzzz-no-service&page=99`, and live provider route
  `/providers/R9x9I1tnNIa7iZpjlm5Oemid9qi1` at `390x844` and `1280x900`:
  service catalog copy, filters, filtered empty state, detailed Firebase
  provider service cards, package/product badges, and booking CTA rendered with
  `pageOverflow` at `0` and no overflowing elements.

## Recommended Next Step

Add Firebase Auth and real role identity next, then filter client/provider data by the authenticated user before adding writes: provider accept/reject, booking creation, review creation, then real messages.
