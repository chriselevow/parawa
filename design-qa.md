# Design QA

- source visual truth path: unavailable; no separate source mock, screenshot, Figma frame, or reference image was provided for this navigation refactor.
- implementation screenshot path: not captured; formal visual comparison is blocked until a source visual target exists.
- viewport: current local prototype at `http://localhost:3300`, desktop route checks.
- state: refactored navigation IA and mock role-session flow for client, provider, admin, login, and landing surfaces.
- full-view comparison evidence: blocked. There is no source visual target to place beside the implementation.
- focused region comparison evidence: blocked for the same reason. Focus regions should cover header navigation, admin sidebar, provider dashboard header, and login entry controls once a visual target is available.

## Findings

- [P2] Formal visual QA cannot compare fidelity without a source visual target.
  Location: navigation refactor across `PrototypeShell`, `AdminShell`, and `LandingShell`.
  Evidence: the implementation is available locally, but no reference mock or screenshot was supplied for side-by-side comparison.
  Impact: route behavior can be verified, but visual fidelity cannot be marked passed under the Product Design QA contract.
  Fix: provide a screenshot, Figma frame, mockup, or approved source capture for the intended navigation states, then rerun visual QA.

## Patches Made Since Previous QA Pass

- Removed the cross-role workspace switcher from product surfaces.
- Scoped client navigation to `Servicios`, `Reservas`, and `Mensajes`.
- Scoped provider navigation to `Panel`, `Solicitudes`, and `Perfil`.
- Scoped admin navigation to admin-only dashboard, providers, bookings, users, and verifications.
- Removed public/admin/provider cross-role controls from admin.
- Kept `Entrar` on public landing/login surfaces only.
- Retargeted the provider public-profile preview to `/providers/maria-nails`.
- Added mock role cookie handling for `client`, `provider`, and `admin`.
- Added `proxy.ts` route guards for provider, admin, bookings, and messages.
- Added role-aware login actions with safe next-path routing.
- Added Firebase-backed demo identity selection to role login so client,
  provider, and message surfaces can filter by a stable example user before
  real Firebase Auth is connected.
- Added role-specific sign out controls that appear only when the matching mock role is active.
- Redesigned the provider dashboard into a higher-end operational surface inspired by Firebase/Cloud dashboards: status header, KPI scorecards, request queue, daily agenda, profile health, service performance, and recent activity.
- Kept provider navigation scoped to provider-only destinations while preserving the `/provider#solicitudes` and `/provider#perfil` anchors.
- Tightened the provider request-card action area after screenshot review: actions now sit in a compact horizontal row instead of a heavy vertical rail.
- Added client-side shell navigation state so provider hash anchors can mark `Solicitudes` or `Perfil` active instead of always highlighting `Panel`.
- Reduced provider nav and sign-out button sizing for narrow viewports.
- Added read-only Firebase data-fit polish after live Firestore wiring: provider dashboard now chooses the most data-rich provider while role cookies are mock-only, uses empty states instead of demo requests when live data has no active work, and keeps Firebase placeholder values like `First Last` and `noCancellationPolicy` out of visible UI.
- Updated discover filtering so Firebase providers can match every normalized service category attached to them, not only their primary category.
- Capped the first client bookings view to 24 visible reservations with a clear total count, keeping the mobile surface usable when Firebase returns hundreds of bookings.
- Promoted provider detail and booking detail titles to real `h1` elements.
- Filtered client reservations, booking detail, and chat lists by the selected
  demo identity, and filtered the provider dashboard by the selected provider
  identity.
- Added data-volume controls for Firebase-sized admin and discovery surfaces:
  full admin booking rows now feed `/admin/bookings`, while bookings,
  providers, users, and discover results render bounded first pages with total
  counts, wrapping table cells, pagination, and empty states.
- Added URL-backed admin list controls for bookings, providers, and users:
  search, filter, clear, and pagination now preserve state through query params
  and browser navigation.
- Added URL-backed client reservation controls on `/bookings`: status filter,
  search, clear, pagination, and filtered empty states replace the previous
  capped-list guidance.
- Added URL-backed client message controls on `/messages`: unread/status
  filter, search, clear, pagination, and filtered empty states now sit in front
  of all booking-derived threads instead of a hidden internal cap.
- Added URL-backed provider request controls on `/provider`: active requests
  now support search, pending/confirmed filters, clear, pagination, and
  filter-aware empty states instead of silently showing only the first six.
- Removed hidden provider dashboard caps from agenda and service performance:
  active agenda rows and provider services now render in bounded scroll regions
  with explicit counts.
- Removed the hidden Firebase cap from admin verifications: the adapter now
  returns the full pending verification queue, and `/admin/verifications`
  provides search, missing-service/document filters, clear, pagination, and
  filter-aware empty states.
- Replaced the hidden discover provider cap with URL-backed search, category
  filter, sort, clear, pagination, and filter-aware empty states; the Firebase
  collection reader now paginates through all documents unless a caller opts
  into an explicit `maxDocs` limit.
- Removed the hidden Firebase service-name cap from provider normalization and
  added URL-backed search, clear, pagination, and empty states to
  `/providers/[id]` service catalogs so public provider profiles can fit full
  Firebase service lists.
- Replaced the booking dialog's full service select with a bounded searchable
  service picker, pagination, selected-state controls, and filtered empty state;
  shared dialog content now has mobile max-height and vertical scrolling.
- Added Firebase-sized chat-thread controls on `/messages/[id]`: the thread now
  shows a bounded latest-message window with a load-earlier control,
  visible-count copy, a mobile-safe quick-reply rail, and a composer that keeps
  the local send/reply demo behavior intact.
- Removed the hidden Firebase booking-service cap: booking rows now keep full
  service-name metadata, show compact summaries with service-count badges,
  search across the complete service list, and expose full service lists in
  bounded detail areas.
- Added provider availability data-fit UI: `provider-slots` now normalize into
  provider dashboard summaries, profile-health schedule status, bounded slot
  counts, next-slot previews, and explicit no-schedule states for selected
  providers without matching slot docs.
- Added UI coverage for the remaining sampled Firebase collections:
  `enterprise` now has `/admin/enterprises` with search, filters, pagination,
  mobile cards, and desktop tables; `punctuality_evalution` now has
  `/admin/quality` plus selected-provider quality summaries on `/provider`.
- Added full Firebase service-record coverage: `/admin/services` now renders
  service price, duration, image, provider, category, package/product metadata,
  pricing mode, and descriptions with URL-backed search/filter/pagination;
  public provider profiles now render detailed service cards instead of only
  service names when Firebase service records are available.
- Extended the `Reservar` dialog to use the same detailed Firebase services:
  the picker now renders image slots, prices, duration, category, package and
  product badges, metadata search, bounded scroll, and a confirmation summary
  that preserves the chosen service details.
- Added first-class Firebase review coverage: `reviews` now normalize into
  reusable summaries, `/admin/reviews` provides search/filter/pagination with
  mobile cards and desktop tables, admin navigation includes `Reseñas`, and
  public provider profiles render real review cards instead of sample copy.
- Replaced inert provider dashboard actions with mobile-safe workflow dialogs:
  accept/reject/chat request actions, auto-order, availability, services, and
  portfolio now open contextual panels with Firebase-aware confirmation states.
- Replaced inert admin action buttons with reusable workflow dialogs:
  verifications, provider management, and user management now support
  review/approve/reject/suspend/reactivate/detail states with Firebase-aware
  confirmation copy.

## Latest Responsive/Data-Fit Evidence

- Mobile viewport `390x844`: `/discover`, `/bookings`, `/messages`, `/provider`, `/admin/bookings`, `/admin/providers`, and `/admin/users` reported `0` page-level horizontal overflow with live Firebase env.
- Desktop viewport `1280x900`: `/discover`, a live `/providers/[id]`, `/bookings`, a live `/bookings/[id]`, `/provider`, `/admin`, `/admin/bookings`, `/admin/providers`, `/admin/users`, and `/admin/verifications` reported `0` page-level horizontal overflow.
- Live Firebase provider dashboard showed `Datos Firebase activos` and no `Mock local activo`.
- Live detail checks found no visible `First Last` or `noCancellationPolicy` placeholders.
- Production builds passed both without Firebase env and with the read-only Firebase service account env.
- Admin bookings/providers/users and discover now avoid unbounded first render
  lists by showing paginated first pages with explicit counts for additional
  Firebase rows.
- New data-volume smoke checks passed at `390x844` and `1280x900` for
  `/admin/bookings`, `/admin/providers`, `/admin/users`, and `/discover`, with
  `0` page-level horizontal overflow; `/admin/verifications` also passed at
  `390x844`.
- URL-backed admin controls passed filtered/paginated smoke checks at `390x844`
  and `1280x900` for `/admin/bookings?filter=pending&q=PAR&page=1`,
  `/admin/providers?filter=verified&q=a&page=1`, and
  `/admin/users?filter=provider&q=a&page=1`; the filtered empty state also
  passed on `/admin/users?filter=client&q=zzzz-no-user&page=1`.
- URL-backed client booking controls passed at `390x844` and `1280x900` for
  `/bookings?filter=pending&q=PAR&page=1`, `/bookings?page=2`, and
  `/bookings?filter=completed&q=zzzz-no-booking&page=1`, all with `0`
  page-level horizontal overflow.
- URL-backed client message controls passed at `390x844` and `1280x900` for
  `/messages?filter=unread&page=1`, `/messages?page=2`, and
  `/messages?filter=completed&q=zzzz-no-thread&page=1`, all with `0`
  page-level horizontal overflow.
- URL-backed provider request controls passed at `390x844` and `1280x900` for
  `/provider?filter=pending&page=1`, page-clamped `/provider?page=2`, and
  `/provider?filter=accepted&q=zzzz-no-request&page=1`, all with `0`
  page-level horizontal overflow.
- URL-backed admin verification controls passed at `390x844` and `1280x900`
  for `/admin/verifications?filter=missing-services&page=1`,
  page-clamped `/admin/verifications?page=2`, and
  `/admin/verifications?filter=documents&q=zzzz-no-verification&page=1`, all
  with `0` page-level horizontal overflow.
- URL-backed discover controls passed at `390x844` and `1280x900` for
  `/discover`, `/discover?sort=rating&page=1`,
  `/discover?q=zzzz-no-provider&page=99&sort=price-asc`, and page-clamped
  `/discover?page=99`; checks found search/category/sort controls, pagination
  or filtered empty state as expected, `0` page-level horizontal overflow, and
  no overflowing elements.
- URL-backed provider service controls passed on a live Firebase provider at
  `390x844` and `1280x900` for base, no-result search, and page-clamped
  `/providers/[id]` URLs; checks found service search, pagination or filtered
  empty state as expected, booking/message CTAs, `0` page-level horizontal
  overflow, and no overflowing elements.
- Booking dialog controls passed at `390x844` on a live Firebase provider:
  opening `Reservar` showed the bounded service picker, selected state,
  pagination, confirmation CTA, and no-result search state; the dialog fit the
  viewport with vertical scrolling and `0` page-level horizontal overflow.
- Chat thread controls passed on `/messages/[id]`: mobile viewport override
  showed `Cargar 1 anteriores`, `8 de 9 visibles`, quick replies, composer, and
  `0` page-level horizontal overflow; clicking load earlier revealed the hidden
  system message, sending a test message added the local reply and cleared the
  input with `0` overflow; desktop viewport override also showed the bounded
  controls with `0` overflow.
- Booking service metadata now fits Firebase multi-service bookings without
  truncating at normalization time; affected surfaces share compact summaries,
  count badges, full-list search matching, and bounded full-list detail areas.
- Post-patch browser checks passed on `/bookings`, `/admin/bookings`,
  `/admin`, and `/provider` at mobile and desktop viewport overrides: each
  route rendered role-gated content, showed service-count badges where
  available, and reported `0` page-level horizontal overflow.
- Provider availability checks passed after provider login on `/provider` at
  `390x844` and `1280x900`: the page rendered `Disponibilidad Firebase`,
  `provider-slots` copy, `Horarios actualizados`, and the selected provider's
  `Sin horarios cargados` state with `0` page-level horizontal overflow and no
  overflowing elements. The active demo provider was Diego Cruvelier with 13
  reservations, so this pass verifies the empty-state branch for a provider
  without matching slot docs.
- Enterprise and quality checks passed at `390x844` and `1280x900` for
  `/admin/enterprises`, `/admin/quality`, and `/provider`: route copy,
  filters, cards/tables, provider quality copy, and required Firebase
  collection labels rendered; `pageOverflow` was `0` on every checked route.
  Mobile admin routes reported only expected offscreen nodes inside the scoped
  horizontal nav rail.
- Service catalog checks passed at `390x844` and `1280x900` for
  `/admin/services`, `/admin/services?filter=package&page=1`,
  `/admin/services?q=zzzz-no-service&page=99`, and live provider route
  `/providers/R9x9I1tnNIa7iZpjlm5Oemid9qi1`: full service rows/cards,
  package/product badges, filtered empty state, detailed provider service cards,
  and the `Reservar` CTA rendered with `pageOverflow` at `0` and no overflowing
  elements.
- Booking dialog checks passed on
  `/providers/R9x9I1tnNIa7iZpjlm5Oemid9qi1` at `390x844` and `1280x900`: the
  dialog rendered rich Firebase service cards with prices, package/product
  badges, search input, and confirmation CTA; measured dialog bounds stayed
  inside the actual client viewport with `pageOverflow` at `0`; the success
  state preserved selected service name, price, category, and duration.
- Review coverage checks passed on `/admin/reviews`,
  `/admin/reviews?filter=low-score&page=99&q=good`, and live provider route
  `/providers/R9x9I1tnNIa7iZpjlm5Oemid9qi1` at `390x844` and `1280x900`:
  Firebase review counts, score/comment/punctuality fields, filters, filtered
  empty state, provider review search, and admin navigation rendered with
  `pageOverflow` at `0`; the old provider sample review copy was absent.
- Provider action-dialog checks passed on `/provider` with live Firebase-derived
  demo identity at `390x844` and `1280x900`: accept, chat, availability,
  services, and portfolio dialogs opened with request/profile context, submitted
  or closed correctly, dialog and page overflow stayed at `0`, and browser error
  logs were empty.
- Admin action-dialog checks passed with live Firebase data: `/admin/users?q=Diego`
  at `390x844` opened user detail and suspension dialogs with long phone/id
  values; `/admin/verifications?q=Usuario%209TZwgH` at `390x844` opened document
  review and approval dialogs; `/admin/providers?q=Diego` at `1280x900` opened
  provider suspension. All checked dialogs and pages reported overflow `0`, and
  browser error logs were empty.

## Final Result

formal visual comparison result: blocked because no source visual target exists.

responsive/data-fit result: passed for the checked routes above.
